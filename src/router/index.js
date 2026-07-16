import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 用户端路由
const userRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/user/HomeView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/user/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/user/SearchResultView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/user/RegisterView.vue'),
  },
  {
    path: '/invite',
    name: 'InviteJoin',
    component: () => import('@/views/user/InviteJoinView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/invite/:token',
    name: 'InviteJoinToken',
    component: () => import('@/views/user/InviteJoinView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/report/settings',
    name: 'ReportSettings',
    component: () => import('@/views/user/ReportSettingsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/report/generate',
    name: 'ReportGenerate',
    component: () => import('@/views/user/ReportGenerateView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/report/list',
    name: 'ReportList',
    component: () => import('@/views/user/ReportListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/report/:id/data',
    name: 'ReportData',
    component: () => import('@/views/user/ReportDataView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/report/monthly_2026_06',
    name: 'JuneMonthlyReport',
    component: () => import('@/views/user/JuneMonthlyReportView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/report/halfyear_2026_h1',
    name: 'H26HalfYearReport',
    component: () => import('@/views/user/H26HalfYearReportView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/report/:id',
    name: 'ReportDetail',
    component: () => import('@/views/user/ReportDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/report/policy-list',
    name: 'PolicyList',
    component: () => import('@/views/user/PolicyListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/policy/:id',
    name: 'PolicyDetail',
    component: () => import('@/views/user/PolicyDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/report/industry-list',
    name: 'IndustryList',
    component: () => import('@/views/user/IndustryListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/report/industry-list/:id',
    name: 'IndustryDetail',
    component: () => import('@/views/user/IndustryDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/report/competitor-list',
    name: 'CompetitorList',
    component: () => import('@/views/user/CompetitorListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/report/competitor-list/:id',
    name: 'CompetitorDetail',
    component: () => import('@/views/user/CompetitorDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/report/bid-list',
    name: 'BidList',
    component: () => import('@/views/user/BidListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/report/bid-list/:type/:id',
    name: 'BidDetail',
    component: () => import('@/views/user/BidDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/user/FavoritesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settings/notification',
    name: 'NotificationSettings',
    component: () => import('@/views/user/NotificationSettingsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/notifications',
    name: 'NotificationList',
    component: () => import('@/views/user/NotificationListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/space',
    name: 'SpaceManage',
    component: () => import('@/views/user/SpaceManageView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/space/create',
    name: 'SpaceCreate',
    component: () => import('@/views/user/SpaceCreateView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/enterprise/profile',
    name: 'EnterpriseProfile',
    component: () => import('@/views/user/CompanyProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/space/:id/configure',
    name: 'SpaceConfigure',
    component: () => import('@/views/user/EnterpriseProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/space/:id/sub-accounts',
    name: 'SpaceSubAccounts',
    component: () => import('@/views/user/SubAccountManageView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/space/:id/benefits',
    name: 'SpaceBenefits',
    component: () => import('@/views/user/SpaceBenefitView.vue'),
    meta: { requiresAuth: true },
  },
]

// 管理端路由
const adminRoutes = [
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/DashboardView.vue'),
    meta: { requiresAuth: false }, // 开发阶段开放访问
  },
  {
    path: '/admin/accounts',
    name: 'AdminAccounts',
    component: () => import('@/views/admin/AccountsView.vue'),
    meta: { requiresAuth: false }, // 开发阶段开放访问
  },
  {
    path: '/admin/spaces',
    name: 'AdminSpaces',
    component: () => import('@/views/admin/SpacesView.vue'),
    meta: { requiresAuth: false }, // 开发阶段开放访问
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: () => import('@/views/admin/ReportsView.vue'),
    meta: { requiresAuth: false }, // 开发阶段开放访问
  },
]

const routes = [...userRoutes, ...adminRoutes]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 管理端路由不需要权限检查（开发阶段）
  if (to.path.startsWith('/admin')) {
    next()
    return
  }

  // 开发阶段：跳过认证检查
  if (false && to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (false && to.meta.isAdmin && !userStore.isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router
