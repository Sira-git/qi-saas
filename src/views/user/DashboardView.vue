<template>
  <div class="dashboard-page">
    <!-- 统一顶部导航 -->
    <TopNav />

    <!-- 主内容区 -->
    <div class="main-content">
      <div class="page-container">
        <!-- 欢迎语 -->
        <div class="welcome-section">
          <div class="welcome-left">
            <h1 class="welcome-title">
              <span class="greeting-prefix">{{ greetingPrefix }}</span>，
              <span class="greeting-user">{{ userName }}</span>，
              <span class="greeting-suffix">欢迎回来！</span>
            </h1>
            <p class="welcome-subtitle">新的一天，从这里掌握竞争情报与监控动态</p>
          </div>
          <div class="welcome-right">
            <div class="compact-search">
              <a-input
                v-model:value="searchQuery"
                placeholder="输入关键词，回车检索情报、报告、监..."
                size="large"
                allow-clear
                @pressEnter="handleSearch"
              >
                <template #prefix>
                  <SearchOutlined class="search-icon" />
                </template>
              </a-input>
            </div>
          </div>
        </div>

        <!-- 统计概览 -->
        <div class="stats-overview">
          <div class="stats-container">
            <div class="stat-item clickable" @click="router.push('/report/list')">
              <div class="stat-icon blue"><FileOutlined /></div>
              <div class="stat-info">
                <div class="stat-value">{{ yearReports }}</div>
                <div class="stat-label">本年报告</div>
              </div>
            </div>
            <div class="stat-item clickable" @click="router.push('/space')">
              <div class="stat-icon orange"><UsergroupAddOutlined /></div>
              <div class="stat-info">
                <div class="stat-value">{{ subAccounts }}</div>
                <div class="stat-label">子账号数量</div>
              </div>
            </div>
            <div class="stat-item clickable" @click="router.push('/space/configure')">
              <div class="stat-icon red"><StarOutlined /></div>
              <div class="stat-info">
                <div class="stat-value">{{ policySubscriptions }}</div>
                <div class="stat-label">政策订阅策略</div>
              </div>
            </div>
            <div class="stat-item clickable" @click="router.push('/report/industry-list')">
              <div class="stat-icon green"><RiseOutlined /></div>
              <div class="stat-info">
                <div class="stat-value">{{ industrySources }}</div>
                <div class="stat-label">行业信源</div>
              </div>
            </div>
            <div class="stat-item clickable" @click="router.push('/report/competitor-list')">
              <div class="stat-icon purple"><TrophyOutlined /></div>
              <div class="stat-info">
                <div class="stat-value">{{ competitors }}</div>
                <div class="stat-label">友商数量</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷入口 -->
        <div class="quick-actions">
          <h3 class="section-title"><AppstoreOutlined class="section-icon" /> 快捷入口</h3>
          <div class="action-grid">
            <router-link to="/report/settings" class="action-card">
              <div class="action-icon"><PlusCircleOutlined /></div>
              <div class="action-text">生成报告</div>
            </router-link>
            <router-link to="/favorites" class="action-card">
              <div class="action-icon"><StarOutlined /></div>
              <div class="action-text">我的收藏</div>
            </router-link>
            <router-link to="/report/list" class="action-card">
              <div class="action-icon"><FileTextOutlined /></div>
              <div class="action-text">全部报告</div>
            </router-link>
            <router-link to="/space" class="action-card">
              <div class="action-icon"><AppstoreAddOutlined /></div>
              <div class="action-text">企业空间</div>
            </router-link>
          </div>
        </div>

        <!-- 最新报告 -->
        <div class="latest-reports">
          <div class="section-header">
            <h3 class="section-title"><FileOutlined class="section-icon" /> 最新报告</h3>
          </div>
          <div class="reports-list">
            <div v-for="report in latestReports" :key="report.id" class="report-card">
              <div class="report-main">
                <div class="report-type-icon" :class="report.type">
                  <span class="report-calendar-sheet">
                    <i class="calendar-ring calendar-ring-left" aria-hidden="true"></i>
                    <i class="calendar-ring calendar-ring-right" aria-hidden="true"></i>
                    <span class="report-icon-label">{{ report.iconLabel }}</span>
                  </span>
                </div>
                <div class="report-info">
                  <div class="report-title">{{ report.title }}</div>
                  <div class="report-meta">{{ report.periodLabel }}（{{ report.periodRange }}）</div>
                </div>
              </div>
              <router-link
                :to="`/report/${report.id}`"
                class="view-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                查看 <RightOutlined />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import SmartSearchBar from '@/components/SmartSearchBar.vue'
import {
  SearchOutlined, BellOutlined, UserOutlined, PlusCircleOutlined,
  SettingOutlined, StarOutlined, FileTextOutlined,
  AppstoreAddOutlined, FileOutlined, TagOutlined, UsergroupAddOutlined,
  AppstoreOutlined, TeamOutlined,
  RiseOutlined, TrophyOutlined, RightOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import TopNav from '@/components/TopNav.vue'

const router = useRouter()
const userStore = useUserStore()

const currentEntId = ref('')
// 直接在 Dashboard 中维护当前企业状态，确保响应式
const currentEnterprise = ref(null)

// 动态问候语前缀
const greetingPrefix = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  else if (hour < 9) return '早上好'
  else if (hour < 12) return '上午好'
  else if (hour < 14) return '中午好'
  else if (hour < 18) return '下午好'
  else if (hour < 22) return '晚上好'
  else return '夜深了'
})

const userName = '杨蕾'

// 顶部搜索
const searchQuery = ref('')
const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    message.warning('请输入搜索内容')
    return
  }
  router.push({
    path: '/search',
    query: { q: searchQuery.value }
  })
}

// Mock 企业列表
const mockEnterprises = [
  { id: 'ent_001', name: '大汉软件股份有限公司' },
  { id: 'ent_002', name: '创新科技有限公司' },
]

userStore.enterprises = mockEnterprises

// 初始化当前企业
if (userStore.currentEnterprise) {
  currentEnterprise.value = userStore.currentEnterprise
  currentEntId.value = userStore.currentEnterprise.id
} else {
  currentEntId.value = 'ent_001'
  currentEnterprise.value = mockEnterprises[0]
  userStore.currentEnterprise = mockEnterprises[0]
}

// 企业切换处理
const handleEnterpriseChange = (value) => {
  currentEntId.value = value
  const enterprise = mockEnterprises.find(e => e.id === value)
  if (enterprise) {
    currentEnterprise.value = enterprise
    userStore.currentEnterprise = enterprise
    message.success(`已切换到：${enterprise.name}`)
  }
}

// 监听企业切换事件
const handleEnterpriseChanged = (event) => {
  const { enterpriseId } = event.detail
  const enterprise = mockEnterprises.find(e => e.id === enterpriseId)
  if (enterprise) {
    currentEntId.value = enterpriseId
    currentEnterprise.value = enterprise
    userStore.currentEnterprise = enterprise
  }
}

// 监听 TopNav 的企业切换事件
window.addEventListener('enterpriseChanged', handleEnterpriseChanged)

// 清理监听器
onBeforeUnmount(() => {
  window.removeEventListener('enterpriseChanged', handleEnterpriseChanged)
})

// 统计数据
const yearReports = ref(7)        // 本年报告总数
const subAccounts = ref(2)        // 子账号数量
const policySubscriptions = ref(3) // 政策订阅策略数
const industrySources = ref(15)   // 行业信源数
const competitors = ref(15)       // 友商数量

// 报告按生成时间倒序排列，工作台仅展示最新 3 个（半年报优先）
const reportRecords = [
  {
    id: 'halfyear_2026_h1',
    title: '大汉软件股份有限公司2026年上半年情报检测报告',
    type: 'half-year',
    iconLabel: '半年',
    periodLabel: '2026年上半年',
    periodRange: '2026.01.01—2026.06.30',
    createdAt: '2026-07-03 01:04'
  },
  {
    id: 'monthly_2026_06',
    title: '大汉软件股份有限公司2026年6月情报检测报告',
    type: 'monthly',
    iconLabel: '月',
    periodLabel: '2026年6月',
    periodRange: '2026.06.01—2026.06.30',
    createdAt: '2026-07-03 01:04'
  },
  {
    id: 'mock_report_2026_05_month',
    title: '大汉软件股份有限公司2026年5月情报检测报告',
    type: 'monthly',
    iconLabel: '月',
    periodLabel: '2026年5月',
    periodRange: '2026.05.01—2026.05.31',
    createdAt: '2026-06-03 01:04'
  }
]

// 固定顺序：半年报优先于月报
const latestReports = computed(() => [...reportRecords]
  .sort((left, right) => {
    // 半年报始终排在前面
    if (left.type === 'half-year' && right.type !== 'half-year') return -1
    if (right.type === 'half-year' && left.type !== 'half-year') return 1
    // 同类型按时间倒序
    return right.createdAt.localeCompare(left.createdAt)
  })
  .slice(0, 3))

onMounted(() => {
  // 默认选中第一个企业（大汉软件股份有限公司）
  if (userStore.enterprises && userStore.enterprises.length > 0) {
    currentEntId.value = userStore.enterprises[0].id
    currentEnterprise.value = userStore.enterprises[0]
    userStore.currentEnterprise = userStore.enterprises[0]
  }
})

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: #f5f7ff;
  padding-top: 64px; /* 为固定导航留出空间 */
}

.main-content {
  padding: 24px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 24px;
}

.welcome-left {
  flex: 1;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.greeting-prefix,
.greeting-user {
  color: #1677ff;
}

.welcome-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.welcome-right {
  flex-shrink: 0;
  width: 360px;
}

.compact-search .ant-input {
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding-left: 36px;
}

.compact-search .ant-input:hover {
  border-color: #1677ff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.1);
}

.compact-search .ant-input:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.1);
}

.search-icon {
  color: #9ca3af;
  font-size: 16px;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 32px;
}

.search-container {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.search-header {
  margin-bottom: 20px;
}

.search-desc {
  font-size: 14px;
  color: #64748b;
  margin: 6px 0 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 18px;
  color: #1677ff;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.view-more {
  font-size: 14px;
  color: #1677ff;
  text-decoration: none;
}

/* 快捷入口 */
.quick-actions {
  margin-bottom: 32px;
}

.action-grid {
  display: flex;
  flex-direction: row;
  gap: 16px;
  width: 100%;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%);
  border: 1px solid rgba(22, 119, 255, 0.1);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  flex: 1;
}

.action-card:hover {
  border-color: #1677ff;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.12);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 32px;
  color: #1677ff;
  margin-bottom: 8px;
}

.action-text {
  font-size: 14px;
  font-weight: 500;
  color: #1a202c;
}

/* 统计概览 */
.stats-overview {
  margin-bottom: 32px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 32px 32px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

.stat-item:hover {
  background: #f0f5ff;
  transform: translateY(-2px);
}

.stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 32px;
  background: #e5e7eb;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-icon.blue {
  background: #e6f4ff;
  color: #1677ff;
}

.stat-icon.green {
  background: #f6ffed;
  color: #52c41a;
}

.stat-icon.orange {
  background: #fff7e6;
  color: #fa8c16;
}

.stat-icon.purple {
  background: #f9f0ff;
  color: #722ed1;
}

.stat-icon.red {
  background: #fff1f0;
  color: #f5222d;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #1a202c;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

/* 最新报告 */
.latest-reports {
  margin-bottom: 32px;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.report-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 96px;
  padding: 18px 24px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.report-main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.report-type-icon {
  position: relative;
  display: flex;
  flex: 0 0 46px;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  background: #2379f5;
  border-radius: 10px;
}

.report-calendar-sheet {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: #fff;
  border-radius: 4px;
  transform: translate(-50%, -43%);
}

.calendar-ring {
  position: absolute;
  top: -5px;
  width: 4px;
  height: 9px;
  background: #fff;
  border: 1px solid #2379f5;
  border-radius: 3px;
}

.calendar-ring-left {
  left: 5px;
}

.calendar-ring-right {
  right: 5px;
}

.report-icon-label {
  color: #2379f5;
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}

.report-type-icon.half-year .report-icon-label {
  font-size: 11px;
}

.report-info {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.report-title {
  overflow: hidden;
  color: #1a202c;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-meta {
  font-size: 13px;
  color: #64748b;
}

.view-btn {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 5px;
  margin-left: 20px;
  font-size: 14px;
  color: #1677ff;
  text-decoration: none;
}

@media (max-width: 768px) {
  .action-grid,
  .modules-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .welcome-right {
    width: 100%;
  }
}
</style>
