<template>
  <a-layout-header class="admin-header">
    <div class="header-left">
      <component :is="CollapsedIcon" class="trigger" @click="$emit('toggle')" />
      <span class="page-title">{{ currentTitle }}</span>
    </div>
    <div class="header-right">
      <a-dropdown>
        <div class="user-info">
          <a-avatar style="background: #1677ff">管</a-avatar>
          <span>管理员</span>
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item key="logout" @click="handleLogout">
              <LogoutOutlined /> 退出登录            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </a-layout-header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

defineProps({ collapsed: Boolean })
defineEmits(['toggle'])

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const CollapsedIcon = computed(() =>
  route.name === 'Dashboard' && route.path === '/admin'
    ? MenuUnfoldOutlined
    : MenuFoldOutlined
)

const titleMap = {
  AdminDashboard: '数据统计',
  AdminAccounts: '企业账号管理',
  AdminReports: '报告记录管理',
}

const currentTitle = computed(() => titleMap[route.name] || '')

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  color: #666;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f5f5f5;
}

.user-info span {
  font-size: 14px;
  color: #333;
}
</style>
