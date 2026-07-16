<template>
  <div class="report-list-page">
    <TopNav />

    <main class="report-shell">
      <header class="page-heading">
        <div class="heading-left">
          <button type="button" class="back-button" aria-label="返回" @click="router.back()">
            <LeftOutlined />
          </button>
          <h1>报告列表</h1>
        </div>
        <router-link to="/report/generate" class="generate-button">
          <PlusOutlined /> 生成新报告
        </router-link>
      </header>

      <section class="filter-panel">
        <div class="filter-fields">
          <a-input
            v-model:value="searchForm.keyword"
            allow-clear
            placeholder="请输入报告名称"
            @press-enter="handleSearch"
          >
            <template #prefix><SearchOutlined /></template>
          </a-input>
          <a-range-picker
            v-model:value="searchForm.dateRange"
            :placeholder="['开始日期', '结束日期']"
          />
        </div>

        <div class="filter-actions-row">
          <div class="segmented-group" aria-label="报告类型">
            <button
              v-for="option in typeOptions"
              :key="option.value"
              type="button"
              :class="{ active: searchForm.type === option.value }"
              @click="setTypeFilter(option.value)"
            >
              {{ option.label }}
            </button>
          </div>

          <div class="segmented-group" aria-label="报告状态">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              type="button"
              :class="{ active: searchForm.status === option.value }"
              @click="setStatusFilter(option.value)"
            >
              {{ option.label }}
            </button>
          </div>

          <div class="filter-buttons">
            <a-button type="primary" @click="handleSearch">
              <SearchOutlined /> 检索
            </a-button>
            <a-button @click="handleReset"><ReloadOutlined /> 重置</a-button>
          </div>
        </div>
      </section>

      <section v-if="reports.length" class="report-list">
        <article
          v-for="report in reports"
          :key="report.id"
          class="report-card"
          :class="{ generating: report.status === 'generating', abnormal: report.status === 'abnormal' }"
          @click="report.status !== 'generating' && viewReport(report)"
        >
          <div class="report-card-top">
            <img
              v-if="getReportTypeIconAsset(report.type)"
              :src="getReportTypeIconAsset(report.type)"
              :alt="`${getTypeShortLabel(report.type)}报图标`"
              class="report-type-image"
            />
            <div v-else class="report-type-icon">
              <div class="calendar-sheet">
                <strong>{{ getTypeShortLabel(report.type) }}</strong>
              </div>
            </div>

            <div class="report-main">
              <h2>{{ report.title }}</h2>
              <p>{{ getPeriodText(report) }}</p>

              <div class="report-stats">
                <button
                  type="button"
                  class="report-stat-link"
                  :disabled="report.status === 'generating'"
                  :aria-label="`查看${report.policyCount || 0}条政策数据`"
                  @click.stop="viewReportData(report, 'policy')"
                >
                  <FileTextOutlined /> 政策：<strong>{{ report.policyCount || 0 }}</strong>条
                </button>
                <button
                  type="button"
                  class="report-stat-link"
                  :disabled="report.status === 'generating'"
                  :aria-label="`查看${report.industryCount || 0}条行业数据`"
                  @click.stop="viewReportData(report, 'industry')"
                >
                  <BarChartOutlined /> 行业：<strong>{{ report.industryCount || 0 }}</strong>条
                </button>
                <button
                  type="button"
                  class="report-stat-link"
                  :disabled="report.status === 'generating'"
                  :aria-label="`查看${report.competitorCount || 0}条友商数据`"
                  @click.stop="viewReportData(report, 'competitor')"
                >
                  <HeartOutlined /> 友商：<strong>{{ report.competitorCount || 0 }}</strong>条
                </button>
              </div>
            </div>

            <a-tag :color="getStatusColor(report.status)" class="status-tag">
              {{ getStatusLabel(report.status) }}
            </a-tag>
          </div>

          <div class="report-card-footer">
            <div class="report-meta">
              <span><ClockCircleOutlined /> {{ formatTime(report.created_at) }}</span>
              <span><UserOutlined /> {{ report.creator || '系统' }}</span>
            </div>

            <div class="card-actions" @click.stop>
              <a-tooltip :title="report.status === 'generating' ? '生成中无法收藏' : '收藏'">
                <button
                  type="button"
                  class="action-button"
                  :disabled="report.status === 'generating'"
                  @click="toggleFavorite(report)"
                >
                  <StarFilled v-if="report.favorited" class="favorited-icon" />
                  <StarOutlined v-else />
                </button>
              </a-tooltip>
              <a-tooltip :title="report.status === 'generating' ? '生成中无法下载' : '下载'">
                <button type="button" class="action-button" :disabled="report.status === 'generating'">
                  <DownloadOutlined />
                </button>
              </a-tooltip>
              <a-tooltip :title="report.status === 'generating' ? '报告生成中' : '查看详情'">
                <button
                  type="button"
                  class="action-button primary"
                  :disabled="report.status === 'generating'"
                  @click="viewReport(report)"
                >
                  <RightOutlined />
                </button>
              </a-tooltip>
            </div>
          </div>
        </article>
      </section>

      <section v-else class="empty-state">
        <FileTextOutlined />
        <p>暂无符合条件的报告</p>
        <a-button @click="handleReset">重置筛选</a-button>
      </section>

      <footer v-if="total > pageSize" class="pagination-row">
        <a-pagination
          v-model:current="page"
          :total="total"
          :page-size="pageSize"
          :show-size-changer="false"
          show-quick-jumper
          @change="fetchReports"
        />
      </footer>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  BarChartOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  FileTextOutlined,
  HeartOutlined,
  LeftOutlined,
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  StarFilled,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'
import { loadManualReports } from '@/utils/manualReports.js'
import {
  loadReportFavorites,
  removeReportFavorite,
  saveReportFavorite,
} from '@/utils/reportFavorites.js'
import { halfYearReportIcon, monthlyReportIcon } from '@/data/reportTypeIcons.js'
import { annualReportIcon } from '@/data/annualReportIcon.js'
import { presetReports } from '@/data/reportRecords.js'

const router = useRouter()
const page = ref(1)
const pageSize = 10
const total = ref(0)
const reports = ref([])

const searchForm = ref({
  keyword: '',
  type: '',
  status: '',
  dateRange: null,
})

const typeOptions = [
  { value: '', label: '全部类型' },
  { value: 'monthly', label: '月报' },
  { value: 'halfYear', label: '半年报' },
  { value: 'annual', label: '年报' },
]

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'generating', label: '生成中' },
  { value: 'normal', label: '正常' },
  { value: 'abnormal', label: '异常' },
]

const getTypeShortLabel = (type) => ({
  monthly: '月',
  halfYear: '半年',
  annual: '年',
}[type] || '报')

const getReportTypeIconAsset = (type) => ({
  monthly: monthlyReportIcon,
  halfYear: halfYearReportIcon,
  annual: annualReportIcon,
}[type] || '')

const getStatusLabel = (status) => ({
  generating: '生成中',
  normal: '正常',
  abnormal: '异常',
}[status] || '正常')

const getStatusColor = (status) => ({
  generating: 'processing',
  normal: 'default',
  abnormal: 'error',
}[status] || 'default')

const getPeriodText = (report) => report.period_date || '报告周期未设置'
const formatTime = (time) => dayjs(time).format('YYYY-MM-DD HH:mm')

const setTypeFilter = (type) => {
  searchForm.value.type = type
  page.value = 1
  fetchReports()
}

const setStatusFilter = (status) => {
  searchForm.value.status = status
  page.value = 1
  fetchReports()
}

const handleSearch = () => {
  page.value = 1
  fetchReports()
}

const handleReset = () => {
  searchForm.value = {
    keyword: '',
    type: '',
    status: '',
    dateRange: null,
  }
  page.value = 1
  fetchReports()
}

const viewReport = (report) => {
  if (report.status === 'generating') return
  if (report.id === 'monthly_2026_06' || report.id === 'halfyear_2026_h1') {
    const target = router.resolve(`/report/${report.id}`)
    window.open(target.href, '_blank', 'noopener,noreferrer')
    return
  }
  router.push(`/report/${report.id}`)
}

const viewReportData = (report, source) => {
  if (report.status === 'generating') return
  router.push({
    name: 'ReportData',
    params: { id: report.id },
    query: { source },
  })
}

const toggleFavorite = (report) => {
  if (report.status === 'generating') return
  if (report.favorited) {
    removeReportFavorite(report.id)
    report.favorited = false
    message.success('已取消收藏')
    return
  }

  if (saveReportFavorite(report)) {
    report.favorited = true
    message.success('已收藏')
  }
}

const fetchReports = () => {
  const favoriteIds = new Set(loadReportFavorites().map((report) => String(report.id)))
  const allReports = [...loadManualReports(), ...presetReports]
    .map((report) => ({
      ...report,
      favorited: favoriteIds.has(String(report.id)),
    }))
    .sort((left, right) => {
      // 固定顺序：半年报 > 月报 > 其他类型
      if (left.type === 'halfYear' && right.type !== 'halfYear') return -1
      if (right.type === 'halfYear' && left.type !== 'halfYear') return 1
      // 同类型按 created_at 降序
      return String(right.created_at).localeCompare(String(left.created_at))
    })

  let filtered = allReports
  const keyword = searchForm.value.keyword.trim().toLowerCase()

  if (keyword) {
    filtered = filtered.filter((report) => report.title.toLowerCase().includes(keyword))
  }

  if (searchForm.value.type) {
    filtered = filtered.filter((report) => report.type === searchForm.value.type)
  }

  if (searchForm.value.status) {
    filtered = filtered.filter((report) => report.status === searchForm.value.status)
  }

  if (searchForm.value.dateRange?.length === 2) {
    const start = dayjs(searchForm.value.dateRange[0]).startOf('day').valueOf()
    const end = dayjs(searchForm.value.dateRange[1]).endOf('day').valueOf()
    filtered = filtered.filter((report) => {
      const createdAt = dayjs(report.created_at).valueOf()
      return createdAt >= start && createdAt <= end
    })
  }

  total.value = filtered.length
  const startIndex = (page.value - 1) * pageSize
  reports.value = filtered.slice(startIndex, startIndex + pageSize)
}

onMounted(fetchReports)
</script>

<style scoped>
.report-list-page {
  min-height: 100vh;
  padding-top: 64px;
  background: #f3f5f8;
  color: #1f2329;
}

.report-shell {
  width: min(1200px, calc(100% - 48px));
  margin: 0 auto;
  padding: 18px 0 56px;
}

.page-heading {
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.heading-left {
  display: flex;
  align-items: center;
  gap: 22px;
}

.heading-left h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.back-button {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #fff;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  cursor: pointer;
}

.generate-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 20px;
  border-radius: 6px;
  background: #1677ff;
  color: #fff;
  font-size: 14px;
  text-decoration: none;
  box-shadow: 0 3px 8px rgba(22, 119, 255, 0.18);
}

.generate-button:hover {
  background: #4096ff;
  color: #fff;
}

.filter-panel {
  margin-bottom: 18px;
  padding: 16px 18px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.045);
}

.filter-fields {
  display: grid;
  grid-template-columns: 360px 300px;
  gap: 12px;
  margin-bottom: 12px;
}

.filter-actions-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.segmented-group {
  display: inline-flex;
  align-items: center;
}

.segmented-group button {
  min-width: 64px;
  height: 32px;
  padding: 0 15px;
  border: 1px solid #d9dce1;
  border-right: 0;
  background: #fff;
  color: #59616b;
  font-size: 13px;
  cursor: pointer;
}

.segmented-group button:first-child {
  border-radius: 5px 0 0 5px;
}

.segmented-group button:last-child {
  border-right: 1px solid #d9dce1;
  border-radius: 0 5px 5px 0;
}

.segmented-group button.active {
  position: relative;
  z-index: 1;
  color: #1677ff;
  border-color: #1677ff;
  border-right: 1px solid #1677ff;
  font-weight: 500;
}

.segmented-group button.active + button {
  border-left-color: #1677ff;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.filter-buttons :deep(.ant-btn) {
  min-width: 76px;
}

.report-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.report-card {
  padding: 20px 22px 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.report-card:hover {
  border-color: #d6e4ff;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
}

.report-card.generating {
  background: #eef5ff;
  cursor: default;
}

.report-card.abnormal {
  background: #fffaf0;
}

.report-card-top {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;
}

.report-type-icon {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #1677ff;
  color: #fff;
}

.report-type-image {
  width: 46px;
  height: 46px;
  display: block;
  border-radius: 8px;
  object-fit: cover;
}

.calendar-sheet {
  position: relative;
  width: 28px;
  height: 25px;
  display: grid;
  place-items: center;
  margin-top: 4px;
  border-radius: 4px;
  background: #fff;
}

.calendar-sheet::before {
  position: absolute;
  top: -5px;
  left: 6px;
  width: 4px;
  height: 9px;
  border-radius: 3px;
  background: #fff;
  box-shadow: 12px 0 0 #fff;
  content: '';
}

.calendar-sheet strong {
  position: relative;
  z-index: 1;
  margin-top: 2px;
  color: #1677ff;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
}

.report-main h2 {
  margin: 0 0 5px;
  color: #24282f;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.45;
}

.report-main p {
  margin: 0;
  color: #8a9099;
  font-size: 13px;
}

.status-tag {
  margin: 0;
}

.report-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 16px;
  color: #858c96;
  font-size: 13px;
}

.report-stat-link,
.report-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.report-stat-link {
  padding: 2px 0;
  border: 0;
  background: transparent;
  color: #858c96;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s;
}

.report-stat-link strong {
  color: #1677ff;
  font-weight: 600;
}

.report-stat-link:hover:not(:disabled) {
  color: #1677ff;
}

.report-stat-link:hover:not(:disabled) strong {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.report-stat-link:focus-visible {
  border-radius: 3px;
  outline: 2px solid #91caff;
  outline-offset: 3px;
}

.report-stat-link:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.report-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #edf0f3;
}

.report-meta {
  display: flex;
  gap: 26px;
  color: #969da7;
  font-size: 12px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid #d9dce1;
  border-radius: 7px;
  background: #fff;
  color: #59616b;
  cursor: pointer;
}

.action-button:hover:not(:disabled) {
  color: #1677ff;
  border-color: #91caff;
}

.action-button.primary {
  border-color: #1677ff;
  background: #1677ff;
  color: #fff;
}

.action-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.favorited-icon {
  color: #faad14;
}

.empty-state {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 10px;
  background: #fff;
  color: #9aa1aa;
}

.empty-state > :first-child {
  font-size: 42px;
}

.empty-state p {
  margin: 0;
}

.pagination-row {
  display: flex;
  justify-content: center;
  padding-top: 24px;
}

@media (max-width: 900px) {
  .filter-fields {
    grid-template-columns: 1fr 1fr;
  }

  .filter-actions-row {
    flex-wrap: wrap;
  }

  .filter-buttons {
    margin-left: 0;
  }
}

@media (max-width: 640px) {
  .report-shell {
    width: min(100% - 24px, 1200px);
  }

  .filter-fields {
    grid-template-columns: 1fr;
  }

  .segmented-group {
    max-width: 100%;
    overflow-x: auto;
  }

  .report-card-top {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .status-tag {
    grid-column: 2;
    justify-self: start;
  }

  .report-card-footer {
    align-items: flex-start;
    gap: 12px;
  }

  .report-meta {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
