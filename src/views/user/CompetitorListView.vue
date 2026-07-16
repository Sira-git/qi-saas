<template>
  <div class="competitor-list-page">
    <TopNav />

    <main class="page-content">
      <div class="page-container">
        <header class="page-header">
          <h1>友商动态</h1>
          <span class="count-badge">共 {{ displayCount }} 条</span>
        </header>

        <section class="filter-bar" aria-label="友商动态筛选">
          <a-select
            v-model:value="selectedCompetitor"
            class="competitor-select"
            :options="competitorOptions"
          />
          <a-select
            v-model:value="selectedBusinessField"
            class="business-select"
            :options="businessFieldOptions"
            placeholder="选择业务领域"
            allow-clear
          />
          <a-input-search
            v-model:value="searchKeyword"
            class="keyword-search"
            placeholder="搜索友商关键词"
            enter-button
            allow-clear
          />
        </section>

        <section v-if="paginatedCompetitors.length" class="competitor-list" aria-live="polite">
          <article v-for="item in paginatedCompetitors" :key="item.id" class="competitor-card">
            <div class="competitor-card-header">
              <span class="competitor-name">{{ item.competitorName }}</span>
              <span class="business-tag" :style="getTagStyle(item.businessField)">
                {{ item.businessField }}
              </span>
            </div>

            <h2 class="competitor-title">{{ item.title }}</h2>
            <p class="competitor-content" :title="item.content">{{ item.content }}</p>

            <footer class="competitor-footer">
              <time class="publish-date" :datetime="item.sortDate">
                <CalendarOutlined />{{ item.publishDate }}
              </time>
              <button class="detail-link" type="button" @click="viewDetail(item)">
                查看详情 <ArrowRightOutlined />
              </button>
            </footer>
          </article>
        </section>

        <a-empty v-else class="empty-state" description="暂无符合条件的友商动态" />

        <div v-if="filteredCompetitors.length > pageSize" class="pagination-wrap">
          <a-pagination
            v-model:current="currentPage"
            v-model:page-size="pageSize"
            :total="filteredCompetitors.length"
            :page-size-options="['10', '20', '30']"
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
import { useRouter } from 'vue-router'
import { ArrowRightOutlined, CalendarOutlined } from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'
import {
  competitorNames,
  competitorRecords,
  competitorReportedTotal,
  configuredBusinessFields
} from '@/data/competitorRecords'

const ALL_COMPETITORS = '全部友商'
const router = useRouter()

const selectedCompetitor = ref(ALL_COMPETITORS)
const selectedBusinessField = ref(undefined)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const competitorOptions = [
  { label: ALL_COMPETITORS, value: ALL_COMPETITORS },
  ...competitorNames.map((name) => ({ label: name, value: name }))
]

const businessFieldOptions = configuredBusinessFields.map((field) => ({
  label: field,
  value: field
}))

const filteredCompetitors = computed(() => {
  const keyword = searchKeyword.value.trim().toLocaleLowerCase('zh-CN')

  return competitorRecords.filter((item) => {
    const matchesCompetitor = selectedCompetitor.value === ALL_COMPETITORS
      || item.competitorName === selectedCompetitor.value
    const matchesField = !selectedBusinessField.value
      || item.businessField === selectedBusinessField.value
    const searchableText = `${item.competitorName} ${item.title} ${item.content}`.toLocaleLowerCase('zh-CN')
    const matchesKeyword = !keyword || searchableText.includes(keyword)

    return matchesCompetitor && matchesField && matchesKeyword
  })
})

const hasActiveFilters = computed(() => selectedCompetitor.value !== ALL_COMPETITORS
  || Boolean(selectedBusinessField.value)
  || Boolean(searchKeyword.value.trim()))

const displayCount = computed(() => hasActiveFilters.value
  ? filteredCompetitors.value.length
  : competitorReportedTotal)

const paginatedCompetitors = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredCompetitors.value.slice(start, start + pageSize.value)
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

const viewDetail = (item) => {
  router.push({ name: 'CompetitorDetail', params: { id: item.id } })
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

watch([selectedCompetitor, selectedBusinessField, searchKeyword], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.competitor-list-page {
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

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 12px;
  color: #d48806;
  font-size: 13px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 16px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}

.competitor-select,
.business-select {
  width: 200px;
  flex: 0 0 200px;
}

.keyword-search {
  width: min(680px, calc(100% - 428px));
}

.competitor-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.competitor-card {
  padding: 24px 28px 22px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.competitor-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.competitor-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 24px;
  margin-bottom: 12px;
}

.competitor-name {
  color: #ff4d8d;
  font-size: 14px;
  font-weight: 600;
}

.business-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  font-size: 12px;
  line-height: 22px;
  border: 1px solid;
  border-radius: 5px;
}

.competitor-title {
  margin: 0 0 12px;
  color: #222b3a;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.competitor-content {
  display: -webkit-box;
  margin: 0 0 20px;
  overflow: hidden;
  color: #687386;
  font-size: 14px;
  line-height: 24px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.competitor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #edf0f4;
}

.publish-date {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #8b95a5;
  font-size: 13px;
}

.detail-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 0;
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
  margin-top: 48px;
  padding: 60px 20px;
  background: #fff;
  border-radius: 12px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 28px 0 0;
}

@media (max-width: 900px) {
  .page-container {
    width: min(100% - 32px, 1480px);
  }

  .filter-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .competitor-select,
  .business-select,
  .keyword-search {
    width: 100%;
    flex-basis: auto;
  }

  .competitor-card {
    padding: 20px;
  }
}
</style>
