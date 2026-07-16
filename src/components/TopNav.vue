<template>
  <nav class="top-nav">
    <div class="nav-container">
      <div class="nav-left">
        <div class="nav-logo">
          <svg class="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="10" stroke="#4096ff" stroke-width="3" fill="none"/>
            <line x1="25" y1="25" x2="32" y2="32" stroke="#4096ff" stroke-width="3" stroke-linecap="round"/>
            <circle cx="18" cy="18" r="4" fill="#4096ff" opacity="0.3"/>
          </svg>
          <span class="logo-text" @click="goToHome">企情察</span>
        </div>
        <div class="nav-menu">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path" 
            class="nav-link"
            :class="{ active: isActive(item.path) }"
          >
            {{ item.name }}
          </router-link>
        </div>
      </div>
      <div class="nav-right">
        <a-select 
          v-model:value="currentEntId" 
          style="width: 200px; margin-right: 16px;"
          @change="handleEnterpriseChange"
        >
          <a-select-option v-for="ent in enterprises" :key="ent.id" :value="ent.id">
            {{ ent.name }}
          </a-select-option>
        </a-select>
        
        <span class="nav-icon" @click="$router.push('/notifications')" style="cursor: pointer;">
          <BellOutlined class="icon" />
        </span>
        
        <a-dropdown>
          <div class="user-avatar">
            <UserOutlined />
            <span>杨蕾</span>
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item key="space" @click="$router.push('/space')">企业空间管理</a-menu-item>
              <a-menu-item key="profile" @click="goToEnterpriseProfile">企业信息配置</a-menu-item>
              <a-menu-divider />
              <a-menu-item key="logout" @click="handleLogout">退出登录</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BellOutlined, UserOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()

// 未读数（从 store 或 API 获取，这里用 mock）
const unreadCount = ref(3)

// 监听未读数更新事件
const handleNotificationsUpdated = (event) => {
  unreadCount.value = event.detail.count
}

onMounted(() => {
  window.addEventListener('notifications-updated', handleNotificationsUpdated)
})

onUnmounted(() => {
  window.removeEventListener('notifications-updated', handleNotificationsUpdated)
})

// 菜单配置 - 登录后可见的菜单
const menuItems = [
  { name: '工作台', path: '/dashboard' },
  { name: '政策速递', path: '/report/policy-list' },
  { name: '行业动态', path: '/report/industry-list' },
  { name: '友商动态', path: '/report/competitor-list' },
  { name: '标讯数据', path: '/report/bid-list' }
]

// 跳转到首页（未登录展示页）
const goToHome = () => {
  router.push('/')
}

// 判断当前路径是否匹配
const isActive = (path) => {
  // 精确匹配
  if (route.path === path) return true
  // 对于列表页，如果当前路由是以该路径开头（包含查询参数），也认为是激活状态
  if (path !== '/' && route.path.startsWith(path)) return true
  return false
}

// 企业选择 - 与 Dashboard 中的 mockEnterprises 保持一致
const currentEntId = ref('ent_001')
const enterprises = ref([
  { id: 'ent_001', name: '大汉软件股份有限公司' },
  { id: 'ent_002', name: '创新科技有限公司' }
])

const handleEnterpriseChange = (val) => {
  console.log('切换企业:', val)
  // 触发自定义事件，通知其他组件企业已切换
  window.dispatchEvent(new CustomEvent('enterpriseChanged', { detail: { enterpriseId: val } }))
}

const handleLogout = () => {
  console.log('退出登录')
  // TODO: 实现退出登录逻辑
  // router.push('/login')
}

const goToEnterpriseProfile = () => {
  // 从当前路由参数动态获取空间 ID
  const pathSegments = route.path.split('/')
  // 匹配 /space/:id/... 格式
  if (pathSegments[1] === 'space' && pathSegments[2]) {
    router.push(`/space/${pathSegments[2]}/configure`)
    return
  }
  // 兜底：使用当前企业的空间 ID（从 enterprises 数据映射）
  const ent = enterprises.value.find(e => e.id === currentEntId.value)
  if (ent) {
    // 空间 ID 映射：ent_001 -> zGMRSoz8tXV4MlCLuw9SG（大汉软件）
    const spaceIdMap = {
      'ent_001': 'zGMRSoz8tXV4MlCLuw9SG',
      'ent_002': 'default-space-id'
    }
    const spaceId = spaceIdMap[currentEntId.value] || 'zGMRSoz8tXV4MlCLuw9SG'
    router.push(`/space/${spaceId}/configure`)
  }
}
</script>

<style scoped>
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.nav-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #181818;
  cursor: pointer;
  transition: color 0.2s;
}

.logo-text:hover {
  color: #4096ff;
}

.nav-menu {
  display: flex;
  gap: 24px;
  margin-left: 32px;
  padding-left: 24px;
  border-left: 1px solid #e8e8e8;
}

.nav-link {
  color: #181818;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 0;
  transition: all 0.2s;
  position: relative;
}

.nav-link:hover {
  color: #4096ff;
}

.nav-link.active {
  color: #4096ff;
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #4096ff;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-icon {
  cursor: pointer;
  font-size: 18px;
  color: #181818;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  color: #181818;
}

.user-avatar:hover {
  background: #f5f5f5;
}

.user-avatar .icon {
  font-size: 18px;
}

.user-avatar span {
  font-size: 14px;
  color: #1a202c;
}
</style>
