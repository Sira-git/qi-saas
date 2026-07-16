<template>
  <div class="bid-list-page">
    <TopNav />

    <main class="page-content">
      <div class="page-container">
        <header class="list-toolbar">
          <div class="data-tabs" role="tablist" aria-label="标讯数据类型">
            <button
              type="button"
              class="data-tab"
              :class="{ active: activeTab === 'tender' }"
              :aria-selected="activeTab === 'tender'"
              role="tab"
              @click="switchTab('tender')"
            >
              招标数据
            </button>
            <span class="tab-divider" aria-hidden="true" />
            <button
              type="button"
              class="data-tab"
              :class="{ active: activeTab === 'award' }"
              :aria-selected="activeTab === 'award'"
              role="tab"
              @click="switchTab('award')"
            >
              中标数据
            </button>
          </div>

          <button
            type="button"
            class="sort-control"
            :title="`当前${sortMode === 'time' ? '按时间从近到远' : sortLabel}展示，点击切换金额排序`"
            @click="toggleAmountSort"
          >
            <span>共{{ bidReportedTotal }}条</span>
            <i aria-hidden="true" />
            <span>{{ sortLabel }}</span>
            <SwapOutlined />
          </button>
        </header>

        <section class="filter-bar" :aria-label="`${activeTabName}筛选`">
          <a-select
            v-model:value="selectedRegion"
            class="region-select"
            :options="regionOptions"
          />
          <a-select
            v-model:value="selectedBusinessField"
            class="business-select"
            :options="businessFieldOptions"
            placeholder="选择业务领域"
            allow-clear
          />
          <a-select
            v-if="activeTab === 'award'"
            v-model:value="selectedCompetitor"
            class="competitor-select"
            :options="competitorOptions"
            placeholder="选择友商"
            show-search
            allow-clear
            :filter-option="filterSelectOption"
          />
          <a-range-picker
            v-model:value="dateRange"
            class="date-range"
            value-format="YYYY-MM-DD"
            :placeholder="['开始日期', '结束日期']"
            allow-clear
          />
          <a-input-search
            v-model:value="searchKeyword"
            class="project-search"
            placeholder="搜索项目名称"
            enter-button
            allow-clear
          />
        </section>

        <section v-if="paginatedRecords.length" class="bid-list" aria-live="polite">
          <article v-for="item in paginatedRecords" :key="item.id" class="bid-card">
            <div class="bid-card-top">
              <span class="business-tag" :style="getTagStyle(item.businessField)">
                {{ item.businessField }}
              </span>
              <div class="amount-block">
                <span>{{ activeTab === 'tender' ? '招标预算' : '中标金额' }}</span>
                <strong>{{ formatBidAmount(activeTab === 'tender' ? item.tenderBudget : item.awardedAmount) }}</strong>
              </div>
            </div>

            <h2 class="bid-title">{{ item.title }}</h2>

            <div class="bid-meta">
              <span>
                <BankOutlined />
                {{ activeTab === 'tender' ? (item.tenderer || '招标单位待定') : (item.awardedCompany || '中标单位待定') }}
              </span>
              <span><EnvironmentOutlined />{{ item.regionLabel }}</span>
              <span>
                <CalendarOutlined />
                {{ activeTab === 'tender' ? formatTenderPeriod(item) : (item.awardDate || '中标时间待定') }}
              </span>
            </div>

            <footer class="bid-footer">
              <span
                v-if="activeTab === 'tender'"
                class="bid-status"
                :class="getTenderStatus(item).className"
              >
                {{ getTenderStatus(item).label }}
              </span>
              <span v-else class="footer-spacer" />
              <button type="button" class="detail-link" @click="viewDetail(item)">
                查看详情 <ArrowRightOutlined />
              </button>
            </footer>
          </article>
        </section>

        <a-empty v-else class="empty-state" :description="`暂无符合条件的${activeTabName}`" />

        <div v-if="filteredRecords.length > pageSize" class="pagination-wrap">
          <a-pagination
            v-model:current="currentPage"
            v-model:page-size="pageSize"
            :total="filteredRecords.length"
            :page-size-options="['10', '20', '50']"
            show-size-changer
            show-quick-jumper
            @show-size-change="handlePageSizeChange"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowRightOutlined,
  BankOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  SwapOutlined
} from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'
import {
  awardRecords,
  awardedCompanies,
  bidBusinessFields,
  bidRegions,
  bidReportedTotal,
  formatBidAmount,
  tenderRecords
} from '@/data/bidRecords'

const router = useRouter()
const route = useRoute()
const activeTab = ref(route.query.tab === 'award' ? 'award' : 'tender')
const selectedRegion = ref('')
const selectedBusinessField = ref(undefined)
const selectedCompetitor = ref(undefined)
const dateRange = ref([])
const searchKeyword = ref('')
const sortMode = ref('time')
const currentPage = ref(1)
const pageSize = ref(10)

const activeTabName = computed(() => activeTab.value === 'tender' ? '招标数据' : '中标数据')
const activeRecords = computed(() => activeTab.value === 'tender' ? tenderRecords : awardRecords)
const sortLabel = computed(() => sortMode.value === 'amount-asc' ? '按金额从低到高' : '按金额从高到低')

const regionOptions = [
  { label: '全部区域', value: '' },
  ...bidRegions.map((region) => ({ label: region, value: region }))
]

const businessFieldOptions = bidBusinessFields.map((field) => ({
  label: field,
  value: field
}))

const competitorOptions = awardedCompanies.map((name) => ({
  label: name,
  value: name
}))

const filterSelectOption = (input, option) => String(option?.label || '')
  .toLocaleLowerCase('zh-CN')
  .includes(String(input || '').toLocaleLowerCase('zh-CN'))

const filteredRecords = computed(() => {
  const keyword = searchKeyword.value.trim().toLocaleLowerCase('zh-CN')
  const [startDate, endDate] = dateRange.value || []

  const filtered = activeRecords.value.filter((item) => {
    const recordDate = activeTab.value === 'tender' ? item.startDate : item.awardDate
    const matchesRegion = !selectedRegion.value || item.province === selectedRegion.value
    const matchesBusiness = !selectedBusinessField.value || item.businessField === selectedBusinessField.value
    const matchesCompetitor = activeTab.value !== 'award'
      || !selectedCompetitor.value
      || item.awardedCompany === selectedCompetitor.value
    const matchesDate = (!startDate || (recordDate && recordDate >= startDate))
      && (!endDate || (recordDate && recordDate <= endDate))
    const matchesKeyword = !keyword || item.title.toLocaleLowerCase('zh-CN').includes(keyword)

    return matchesRegion && matchesBusiness && matchesCompetitor && matchesDate && matchesKeyword
  })

  return [...filtered].sort((left, right) => {
    if (sortMode.value === 'time') {
      const leftDate = activeTab.value === 'tender' ? left.startDate : left.awardDate
      const rightDate = activeTab.value === 'tender' ? right.startDate : right.awardDate
      return String(rightDate || '').localeCompare(String(leftDate || '')) || left.sourceIndex - right.sourceIndex
    }

    const leftAmount = activeTab.value === 'tender' ? left.tenderBudget : left.awardedAmount
    const rightAmount = activeTab.value === 'tender' ? right.tenderBudget : right.awardedAmount
    if (!Number.isFinite(leftAmount) && !Number.isFinite(rightAmount)) return left.sourceIndex - right.sourceIndex
    if (!Number.isFinite(leftAmount)) return 1
    if (!Number.isFinite(rightAmount)) return -1
    return sortMode.value === 'amount-asc' ? leftAmount - rightAmount : rightAmount - leftAmount
  })
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRecords.value.slice(start, start + pageSize.value)
})

const tagColors = {
  一网通办: { color: '#1677ff', borderColor: '#91caff', background: '#e6f4ff' },
  一网协同: { color: '#595959', borderColor: '#d9d9d9', background: '#fafafa' },
  人工智能: { color: '#52c41a', borderColor: '#95de64', background: '#f6ffed' },
  市场监管: { color: '#eb2f96', borderColor: '#ffadd2', background: '#fff0f6' },
  数据要素: { color: '#fa8c16', borderColor: '#ffd591', background: '#fff7e6' },
  门户网站: { color: '#13a8a8', borderColor: '#87e8de', background: '#e6fffb' },
  其他: { color: '#64748b', borderColor: '#cbd5e1', background: '#f8fafc' }
}

const getTagStyle = (field) => tagColors[field] || tagColors.其他

const getTenderStatus = (item) => {
  if (!item.deadline) return { label: '报名中', className: 'open' }
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return item.deadline < today
    ? { label: '已结束', className: 'closed' }
    : { label: '报名中', className: 'open' }
}

const formatTenderPeriod = (item) => {
  if (item.startDate && item.deadline) return `${item.startDate} - ${item.deadline}`
  return item.startDate || item.deadline || '时间待定'
}

const switchTab = (tab) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  selectedCompetitor.value = undefined
  sortMode.value = 'time'
}

const toggleAmountSort = () => {
  sortMode.value = sortMode.value === 'amount-desc' ? 'amount-asc' : 'amount-desc'
}

const viewDetail = (item) => {
  router.push({
    name: 'BidDetail',
    params: { type: item.recordType, id: item.id }
  })
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

watch(
  [activeTab, selectedRegion, selectedBusinessField, selectedCompetitor, dateRange, searchKeyword, sortMode],
  () => { currentPage.value = 1 }
)
</script>

<style scoped>
.bid-list-page {
  min-height: 100vh;
  padding-top: 64px;
  background: #f3f5f8;
}

.page-content {
  padding: 28px 0 48px;
}

.page-container {
  width: min(1480px, calc(100% - 64px));
  margin: 0 auto;
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
}

.data-tabs {
  display: flex;
  align-items: center;
  gap: 20px;
}

.data-tab {
  padding: 0;
  color: #1f2937;
  font-size: 21px;
  font-weight: 600;
  line-height: 32px;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.data-tab:hover,
.data-tab.active {
  color: #1677ff;
}

.tab-divider {
  width: 1px;
  height: 28px;
  background: #d9dce1;
}

.sort-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 4px 12px;
  color: #eb2f96;
  font-size: 13px;
  line-height: 22px;
  background: #fff0f6;
  border: 1px solid #ffadd2;
  border-radius: 18px;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.sort-control:hover {
  background: #ffe6f1;
  box-shadow: 0 3px 10px rgba(235, 47, 150, 0.12);
}

.sort-control i {
  width: 1px;
  height: 14px;
  background: #ffadd2;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.region-select {
  width: 150px;
  flex: 0 0 150px;
}

.business-select {
  width: 175px;
  flex: 0 0 175px;
}

.competitor-select {
  width: 190px;
  flex: 0 0 190px;
}

.date-range {
  width: 320px;
  flex: 0 0 320px;
}

.project-search {
  min-width: 200px;
  flex: 1 1 auto;
}

.bid-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.bid-card {
  min-height: 190px;
  padding: 24px 26px 20px;
  background: #fff;
  border: 1px solid #e2e5e9;
  border-radius: 12px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.bid-card:hover {
  border-color: #c9d1dc;
  box-shadow: 0 7px 20px rgba(15, 23, 42, 0.06);
  transform: translateY(-1px);
}

.bid-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  min-height: 26px;
}

.business-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 11px;
  font-size: 12px;
  line-height: 22px;
  border: 1px solid;
  border-radius: 13px;
}

.amount-block {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  color: #eb2f96;
  white-space: nowrap;
}

.amount-block span {
  font-size: 13px;
}

.amount-block strong {
  font-size: 16px;
  font-weight: 600;
}

.bid-title {
  max-width: calc(100% - 240px);
  margin: 11px 0 10px;
  color: #252b35;
  font-size: 17px;
  font-weight: 600;
  line-height: 25px;
}

.bid-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 20px;
  color: #707782;
  font-size: 13px;
  line-height: 22px;
}

.bid-meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.bid-meta :deep(.anticon) {
  color: #8b95a3;
}

.bid-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 17px;
  padding-top: 14px;
  border-top: 1px dashed #eceff3;
}

.bid-status {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 12px;
  font-size: 12px;
  border-radius: 13px;
}

.bid-status.open {
  color: #1677ff;
  background: #e6f4ff;
}

.bid-status.closed {
  color: #8c8c8c;
  background: #f5f5f5;
}

.footer-spacer {
  height: 24px;
}

.detail-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  color: #1677ff;
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.detail-link:hover {
  color: #0958d9;
}

.empty-state {
  padding: 90px 20px;
  background: #fff;
  border: 1px solid #e2e5e9;
  border-radius: 12px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 1100px) {
  .page-container {
    width: calc(100% - 40px);
  }

  .filter-bar {
    flex-wrap: wrap;
  }

  .project-search {
    min-width: 320px;
  }
}

@media (max-width: 720px) {
  .page-container {
    width: calc(100% - 28px);
  }

  .list-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .sort-control,
  .region-select,
  .business-select,
  .competitor-select,
  .date-range,
  .project-search {
    width: 100%;
    min-width: 0;
    flex-basis: 100%;
  }

  .bid-card {
    padding: 20px;
  }

  .bid-title {
    max-width: 100%;
  }

  .bid-card-top {
    flex-wrap: wrap;
  }
}
</style>
