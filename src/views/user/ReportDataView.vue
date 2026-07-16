<template>
  <div class="report-data-page">
    <TopNav />

    <main class="page-shell">
      <header class="page-heading">
        <button type="button" class="back-button" aria-label="返回报告列表" @click="router.push('/report/list')">
          <ArrowLeftOutlined />
        </button>
        <div>
          <h1>{{ pageTitle }}</h1>
          <p v-if="report">
            数据周期：{{ period.start || '—' }} 至 {{ period.end || '—' }}
          </p>
        </div>
      </header>

      <section v-if="report" class="data-panel">
        <nav class="source-tabs" aria-label="报告数据来源">
          <button
            v-for="tab in sourceTabs"
            :key="tab.value"
            type="button"
            :class="{ active: activeSource === tab.value }"
            @click="selectSource(tab.value)"
          >
            {{ tab.label }}（{{ tab.count }}）
          </button>
        </nav>

        <div class="data-content">
          <nav class="business-tabs" aria-label="业务领域筛选">
            <button
              v-for="field in businessTabs"
              :key="field.value || 'all'"
              type="button"
              :class="{ active: businessFilter === field.value }"
              @click="businessFilter = field.value"
            >
              {{ field.label }}（{{ field.count }}）
            </button>
          </nav>

          <div class="filter-bar">
            <a-input-search
              v-model:value="keyword"
              allow-clear
              enter-button
              placeholder="搜索标题、来源关键词"
              aria-label="搜索周期数据"
            />
          </div>

          <section v-if="pageItems.length" class="data-list" aria-live="polite">
            <article v-for="item in pageItems" :key="item.id" class="data-card">
              <div class="card-heading">
                <div class="tag-list">
                  <span
                    v-for="field in item.businessFields.slice(0, 4)"
                    :key="field"
                    class="business-tag"
                    :style="getTagStyle(field)"
                  >
                    {{ field }}
                  </span>
                </div>
                <span class="included-tag">报告已收录</span>
              </div>

              <h2>{{ item.title }}</h2>

              <footer class="card-footer">
                <div class="data-meta">
                  <span v-if="item.competitorName"><TeamOutlined />友商：{{ item.competitorName }}</span>
                  <span><FileTextOutlined />{{ sourceLabel }}：{{ item.source }}</span>
                  <span v-if="item.region && activeSource === 'policy'"><EnvironmentOutlined />地区：{{ item.region }}</span>
                  <span><CalendarOutlined />发布时间：{{ item.publishDate || '—' }}</span>
                </div>
                <button type="button" class="detail-link" @click="viewDetail(item)">
                  查看详情 <ArrowRightOutlined />
                </button>
              </footer>
            </article>
          </section>

          <div v-else class="empty-state">
            <InboxOutlined />
            <p>当前条件下暂无数据</p>
            <a-button @click="resetFilters">重置筛选</a-button>
          </div>

          <footer v-if="filteredItems.length" class="pagination-row">
            <span>共 {{ filteredItems.length }} 条记录</span>
            <a-pagination
              v-model:current="currentPage"
              :total="filteredItems.length"
              :page-size="pageSize"
              :show-size-changer="false"
              show-quick-jumper
            />
          </footer>
        </div>
      </section>

      <section v-else class="not-found-state">
        <InboxOutlined />
        <h2>未找到该报告的数据记录</h2>
        <p>请返回报告列表后重新进入。</p>
        <a-button type="primary" @click="router.push('/report/list')">返回报告列表</a-button>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  InboxOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'
import { loadManualReports } from '@/utils/manualReports.js'
import { getReportDataListTitle, presetReports, resolveReportPeriod } from '@/data/reportRecords.js'
import { getReportPeriodItems, reportBusinessFields } from '@/data/reportPeriodData.js'

const route = useRoute()
const router = useRouter()
const pageSize = 10
const sourceTypes = ['policy', 'industry', 'competitor']
const passedReport = window.history.state?.report

const report = computed(() => {
  const id = String(route.params.id || '')
  if (String(passedReport?.id || '') === id) return passedReport
  return loadManualReports().find(item => String(item.id) === id)
    || presetReports.find(item => String(item.id) === id)
    || null
})

const pageTitle = computed(() => report.value ? getReportDataListTitle(report.value) : '报告数据列表')
const period = computed(() => resolveReportPeriod(report.value))
const reportItems = computed(() => getReportPeriodItems(report.value))
const requestedSource = sourceTypes.includes(String(route.query.source)) ? String(route.query.source) : 'policy'
const activeSource = ref(requestedSource)
const businessFilter = ref('')
const keyword = ref('')
const currentPage = ref(1)

const sourceTabs = computed(() => [
  { value: 'policy', label: '政策列表', count: reportItems.value.filter(item => item.sourceType === 'policy').length },
  { value: 'industry', label: '行业信息列表', count: reportItems.value.filter(item => item.sourceType === 'industry').length },
  { value: 'competitor', label: '友商信息列表', count: reportItems.value.filter(item => item.sourceType === 'competitor').length },
])

const sourceItems = computed(() => reportItems.value.filter(item => item.sourceType === activeSource.value))
const sourceLabel = computed(() => ({ policy: '发文单位', industry: '来源', competitor: '来源' }[activeSource.value]))

const businessTabs = computed(() => {
  const configuredTabs = reportBusinessFields.map(field => ({
    value: field,
    label: field,
    count: sourceItems.value.filter(item => item.businessFields.includes(field)).length,
  }))
  const otherCount = sourceItems.value.filter(item => !item.businessFields.some(field => reportBusinessFields.includes(field))).length
  return [
    { value: '', label: '全部', count: sourceItems.value.length },
    ...configuredTabs,
    ...(otherCount ? [{ value: '其他', label: '其他', count: otherCount }] : []),
  ]
})

const filteredItems = computed(() => {
  const normalizedKeyword = keyword.value.trim().toLocaleLowerCase('zh-CN')
  return sourceItems.value.filter(item => {
    const matchesBusiness = !businessFilter.value
      || (businessFilter.value === '其他'
        ? !item.businessFields.some(field => reportBusinessFields.includes(field))
        : item.businessFields.includes(businessFilter.value))
    const searchableText = `${item.title} ${item.source} ${item.competitorName || ''}`.toLocaleLowerCase('zh-CN')
    return matchesBusiness && (!normalizedKeyword || searchableText.includes(normalizedKeyword))
  })
})

const pageItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredItems.value.slice(start, start + pageSize)
})

const tagStyles = {
  一网通办: { color: '#1677ff', borderColor: '#91caff', background: '#e6f4ff' },
  一网协同: { color: '#722ed1', borderColor: '#d3adf7', background: '#f9f0ff' },
  人工智能: { color: '#52c41a', borderColor: '#b7eb8f', background: '#f6ffed' },
  市场监管: { color: '#eb2f96', borderColor: '#ffadd2', background: '#fff0f6' },
  数据要素: { color: '#fa8c16', borderColor: '#ffd591', background: '#fff7e6' },
  门户网站: { color: '#13a8a8', borderColor: '#87e8de', background: '#e6fffb' },
}

const getTagStyle = field => tagStyles[field] || {
  color: '#64748b',
  borderColor: '#cbd5e1',
  background: '#f8fafc',
}

const selectSource = source => {
  activeSource.value = source
  router.replace({ query: { ...route.query, source } })
}

const resetFilters = () => {
  businessFilter.value = ''
  keyword.value = ''
  currentPage.value = 1
}

const viewDetail = item => {
  if (item.sourceType === 'policy') {
    router.push({ name: 'PolicyDetail', params: { id: item.originalId }, state: { policy: item.raw } })
    return
  }
  if (item.sourceType === 'industry') {
    router.push({ name: 'IndustryDetail', params: { id: item.originalId } })
    return
  }
  router.push({ name: 'CompetitorDetail', params: { id: item.originalId } })
}

watch([activeSource, businessFilter, keyword], () => {
  currentPage.value = 1
})

watch(() => filteredItems.value.length, total => {
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  if (currentPage.value > lastPage) currentPage.value = lastPage
})
</script>

<style scoped>
.report-data-page {
  min-height: 100vh;
  padding-top: 64px;
  background: #f3f5f8;
  color: #1f2329;
}

.page-shell {
  width: min(1480px, calc(100% - 64px));
  margin: 0 auto;
  padding: 24px 0 56px;
}

.page-heading {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}

.page-heading h1 {
  margin: 0 0 5px;
  font-size: 22px;
  font-weight: 600;
}

.page-heading p {
  margin: 0;
  color: #8a9099;
  font-size: 13px;
}

.back-button {
  width: 42px;
  height: 42px;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #fff;
  color: #64748b;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.1);
  cursor: pointer;
}

.data-panel {
  min-height: 680px;
}

.source-tabs {
  display: inline-flex;
  align-items: flex-end;
  gap: 8px;
}

.source-tabs button {
  min-width: 148px;
  padding: 14px 20px;
  border: 1px solid transparent;
  border-radius: 8px 8px 0 0;
  background: #e9edf2;
  color: #5d646e;
  font-size: 14px;
  cursor: pointer;
}

.source-tabs button.active {
  color: #1677ff;
  border-color: #e6e9ed;
  border-bottom-color: #fff;
  background: #fff;
  font-weight: 500;
  box-shadow: 0 -2px 8px rgba(15, 23, 42, 0.035);
}

.data-content {
  min-height: 660px;
  padding-bottom: 24px;
  border-radius: 0 12px 12px 12px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
}

.business-tabs {
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 0 30px;
  padding: 0 4px;
  overflow: visible;
  border-bottom: 1px solid #dfe4ea;
}

.business-tabs button {
  position: relative;
  min-width: 112px;
  padding: 16px 8px 17px;
  border: 0;
  background: transparent;
  color: #5f6670;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
}

.business-tabs button::after {
  position: absolute;
  right: 12%;
  bottom: -1px;
  left: 12%;
  height: 2px;
  border-radius: 2px;
  background: transparent;
  content: '';
}

.business-tabs button.active {
  color: #1677ff;
  font-weight: 500;
}

.business-tabs button.active::after {
  background: #1677ff;
}

.filter-bar {
  display: flex;
  justify-content: flex-end;
  margin: 0 30px;
  padding: 18px 0;
  border-bottom: 1px solid #e8ebef;
}

.filter-bar :deep(.ant-input-search) {
  width: min(500px, 100%);
}

.data-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 30px 0;
}

.data-card {
  padding: 18px 22px 15px;
  border: 1px solid #e5e8ec;
  border-radius: 10px;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.data-card:hover {
  border-color: #cfe0ff;
  box-shadow: 0 5px 16px rgba(15, 23, 42, 0.05);
}

.card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.business-tag,
.included-tag {
  display: inline-flex;
  align-items: center;
  height: 25px;
  padding: 0 10px;
  border: 1px solid;
  border-radius: 5px;
  font-size: 12px;
}

.included-tag {
  flex: 0 0 auto;
  color: #7b8490;
  border-color: #d9dde3;
  background: #fafafa;
}

.data-card h2 {
  margin: 12px 0 15px;
  color: #272b32;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.55;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-top: 13px;
  border-top: 1px solid #edf0f3;
}

.data-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 25px;
  color: #858d98;
  font-size: 13px;
}

.data-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.detail-link {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 5px;
  padding: 5px 0;
  border: 0;
  background: transparent;
  color: #1677ff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.detail-link:hover {
  color: #0958d9;
}

.empty-state,
.not-found-state {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #9aa1aa;
}

.not-found-state {
  border-radius: 12px;
  background: #fff;
}

.empty-state > :first-child,
.not-found-state > :first-child {
  font-size: 42px;
}

.empty-state p,
.not-found-state h2,
.not-found-state p {
  margin: 0;
}

.pagination-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  margin: 0 30px;
  padding-top: 24px;
  color: #8a9099;
  font-size: 13px;
}

@media (max-width: 900px) {
  .page-shell {
    width: min(100% - 32px, 1480px);
  }

  .source-tabs {
    display: flex;
  }

  .source-tabs button {
    min-width: 0;
    flex: 1;
    padding-inline: 10px;
  }

  .business-tabs {
    overflow-x: auto;
    overflow-y: hidden;
  }

  .card-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .page-heading {
    align-items: flex-start;
  }

  .page-heading h1 {
    font-size: 18px;
  }

  .business-tabs,
  .filter-bar,
  .pagination-row {
    margin-inline: 16px;
  }

  .data-list {
    padding-inline: 16px;
  }

  .source-tabs button {
    font-size: 12px;
  }
}
</style>
