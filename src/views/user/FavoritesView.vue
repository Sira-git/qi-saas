<template>
  <div class="favorites-page">
    <TopNav />

    <main class="favorites-shell">
      <header class="page-heading">
        <div class="heading-left">
          <button type="button" class="back-button" aria-label="返回" @click="router.back()">
            <LeftOutlined />
          </button>
          <h1>我的收藏</h1>
        </div>
        <router-link to="/report/list" class="all-reports-button">
          查看所有报告
        </router-link>
      </header>

      <section class="stats-panel" aria-label="收藏报告统计">
        <div class="stat-card">
          <div class="stat-icon total-icon"><StarOutlined /></div>
          <div>
            <strong>{{ favorites.length }}</strong>
            <span>已收藏报告</span>
          </div>
        </div>
        <div class="stat-card">
          <img :src="monthlyReportIcon" alt="月报图标" class="stat-image" />
          <div>
            <strong>{{ monthlyCount }}</strong>
            <span>月报</span>
          </div>
        </div>
        <div class="stat-card">
          <img :src="halfYearReportIcon" alt="半年报图标" class="stat-image" />
          <div>
            <strong>{{ halfYearCount }}</strong>
            <span>半年报</span>
          </div>
        </div>
        <div class="stat-card">
          <img :src="annualReportIcon" alt="年报图标" class="stat-image" />
          <div>
            <strong>{{ annualCount }}</strong>
            <span>年报</span>
          </div>
        </div>
      </section>

      <section class="favorites-content">
        <nav class="filter-tabs" aria-label="收藏报告类型">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            type="button"
            :class="{ active: currentFilter === option.value }"
            @click="currentFilter = option.value"
          >
            {{ option.label }}
            <span>{{ getFilterCount(option.value) }}</span>
          </button>
        </nav>

        <div v-if="filteredFavorites.length" class="report-list">
          <article
            v-for="report in filteredFavorites"
            :key="report.id"
            class="report-card"
            @click="viewReport(report)"
          >
            <div class="report-card-top">
              <img
                :src="getReportTypeIconAsset(report.type)"
                :alt="`${getReportTypeLabel(report.type)}图标`"
                class="report-type-image"
              />

              <div class="report-main">
                <div class="report-title-row">
                  <h2>{{ report.title }}</h2>
                  <a-tag color="gold" class="favorite-tag">
                    <StarFilled /> 已收藏
                  </a-tag>
                </div>
                <p>{{ report.period_date || '报告周期未设置' }}</p>

                <div class="report-stats">
                  <span><FileTextOutlined /> 政策：{{ getReportCount(report, 'policy') }}条</span>
                  <span><BarChartOutlined /> 行业：{{ getReportCount(report, 'industry') }}条</span>
                  <span><HeartOutlined /> 友商：{{ getReportCount(report, 'competitor') }}条</span>
                </div>
              </div>
            </div>

            <div class="report-card-footer">
              <div class="report-meta">
                <span><ClockCircleOutlined /> 收藏于 {{ formatTime(report.favorite_time) }}</span>
                <span><UserOutlined /> {{ report.creator || '系统' }}</span>
              </div>

              <div class="card-actions" @click.stop>
                <a-tooltip title="取消收藏">
                  <button type="button" class="action-button favorite" @click="unfavorite(report)">
                    <StarFilled />
                  </button>
                </a-tooltip>
                <a-tooltip title="查看详情">
                  <button type="button" class="action-button primary" @click="viewReport(report)">
                    <RightOutlined />
                  </button>
                </a-tooltip>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <StarOutlined />
          <h2>{{ favorites.length ? `暂无收藏的${getFilterLabel(currentFilter)}` : '暂无收藏报告' }}</h2>
          <p>{{ favorites.length ? '切换其他报告类型查看' : '在报告列表点击收藏后，报告会展示在这里' }}</p>
          <router-link v-if="!favorites.length" to="/report/list" class="empty-button">
            去查看报告
          </router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  BarChartOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  HeartOutlined,
  LeftOutlined,
  RightOutlined,
  StarFilled,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'
import { halfYearReportIcon, monthlyReportIcon } from '@/data/reportTypeIcons.js'
import { annualReportIcon } from '@/data/annualReportIcon.js'
import { loadReportFavorites, removeReportFavorite } from '@/utils/reportFavorites.js'

const router = useRouter()
const currentFilter = ref('all')
const favorites = ref([])

const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'monthly', label: '月报' },
  { value: 'halfYear', label: '半年报' },
  { value: 'annual', label: '年报' },
]

const filteredFavorites = computed(() => {
  if (currentFilter.value === 'all') return favorites.value
  return favorites.value.filter((report) => report.type === currentFilter.value)
})

const monthlyCount = computed(() => favorites.value.filter((report) => report.type === 'monthly').length)
const halfYearCount = computed(() => favorites.value.filter((report) => report.type === 'halfYear').length)
const annualCount = computed(() => favorites.value.filter((report) => report.type === 'annual').length)

const getFilterCount = (type) => {
  if (type === 'all') return favorites.value.length
  return favorites.value.filter((report) => report.type === type).length
}

const getFilterLabel = (type) => ({
  monthly: '月报',
  halfYear: '半年报',
  annual: '年报',
}[type] || '报告')

const getReportTypeLabel = (type) => getFilterLabel(type)

const getReportTypeIconAsset = (type) => ({
  monthly: monthlyReportIcon,
  halfYear: halfYearReportIcon,
  annual: annualReportIcon,
}[type] || monthlyReportIcon)

const getReportCount = (report, field) => (
  report[`${field}Count`] ?? report[`${field}_count`] ?? 0
)

const formatTime = (time) => dayjs(time).format('YYYY-MM-DD HH:mm')

const refreshFavorites = () => {
  favorites.value = loadReportFavorites()
    .sort((left, right) => String(right.favorite_time).localeCompare(String(left.favorite_time)))
}

const viewReport = (report) => {
  if (report.id === 'monthly_2026_06') {
    const target = router.resolve(`/report/${report.id}`)
    window.open(target.href, '_blank', 'noopener,noreferrer')
    return
  }
  router.push(`/report/${report.id}`)
}

const unfavorite = (report) => {
  removeReportFavorite(report.id)
  refreshFavorites()
  message.success('已取消收藏')
}

onMounted(refreshFavorites)
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  padding-top: 64px;
  background: #f3f5f8;
  color: #1f2329;
}

.favorites-shell {
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

.all-reports-button,
.empty-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 20px;
  border-radius: 6px;
  background: #1677ff;
  color: #fff;
  font-size: 14px;
  text-decoration: none;
  box-shadow: 0 3px 8px rgba(22, 119, 255, 0.18);
}

.all-reports-button:hover,
.empty-button:hover {
  background: #4096ff;
  color: #fff;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 18px;
  padding: 22px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.045);
}

.stat-card {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 9px;
  background: linear-gradient(135deg, #f7f9ff 0%, #fff 100%);
}

.stat-icon,
.stat-image {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  border-radius: 9px;
}

.stat-image {
  display: block;
  object-fit: cover;
}

.stat-icon {
  display: grid;
  place-items: center;
  font-size: 25px;
}

.total-icon {
  background: #eaf2ff;
  color: #1677ff;
}

.stat-card strong,
.stat-card span {
  display: block;
}

.stat-card strong {
  margin-bottom: 5px;
  color: #1f2329;
  font-size: 25px;
  line-height: 1;
}

.stat-card span {
  color: #7b8490;
  font-size: 13px;
}

.favorites-content {
  min-height: 430px;
  padding: 0 22px 22px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.045);
}

.filter-tabs {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 70px;
  border-bottom: 1px solid #edf0f3;
}

.filter-tabs button {
  min-width: 92px;
  height: 38px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: #68717d;
  font-size: 14px;
  cursor: pointer;
}

.filter-tabs button span {
  margin-left: 4px;
  color: #9aa1aa;
}

.filter-tabs button:hover {
  background: #f5f8ff;
  color: #1677ff;
}

.filter-tabs button.active {
  border-color: #1677ff;
  background: #1677ff;
  color: #fff;
  font-weight: 500;
}

.filter-tabs button.active span {
  color: #fff;
}

.report-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 18px;
}

.report-card {
  padding: 20px 22px 14px;
  border: 1px solid #edf0f3;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.report-card:hover {
  border-color: #91caff;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
}

.report-card-top {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}

.report-type-image {
  width: 46px;
  height: 46px;
  display: block;
  border-radius: 8px;
  object-fit: cover;
}

.report-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
}

.report-main h2 {
  margin: 0;
  color: #24282f;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.45;
}

.favorite-tag {
  margin: 0;
}

.report-main > p {
  margin: 5px 0 0;
  color: #8a9099;
  font-size: 13px;
}

.report-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 16px;
  color: #858c96;
  font-size: 13px;
}

.report-stats span,
.report-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
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

.action-button:hover {
  color: #1677ff;
  border-color: #91caff;
}

.action-button.favorite {
  color: #faad14;
}

.action-button.primary {
  border-color: #1677ff;
  background: #1677ff;
  color: #fff;
}

.empty-state {
  min-height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9aa1aa;
}

.empty-state > :first-child {
  margin-bottom: 14px;
  font-size: 46px;
  color: #b7bec8;
}

.empty-state h2 {
  margin: 0 0 8px;
  color: #6f7782;
  font-size: 17px;
  font-weight: 500;
}

.empty-state p {
  margin: 0 0 20px;
  font-size: 13px;
}

@media (max-width: 900px) {
  .stats-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .favorites-shell {
    width: min(100% - 24px, 1200px);
  }

  .heading-left {
    gap: 12px;
  }

  .stats-panel {
    grid-template-columns: 1fr;
    padding: 14px;
  }

  .favorites-content {
    padding: 0 14px 14px;
  }

  .filter-tabs {
    overflow-x: auto;
  }

  .filter-tabs button {
    min-width: 78px;
  }

  .report-card {
    padding: 16px 14px 12px;
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
