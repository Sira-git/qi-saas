<template>
  <a-layout-sider
    v-model:collapsed="collapsed"
    :trigger="null"
    collapsible
    theme="light"
    class="admin-sider"
    :width="220"
  >
    <div class="sider-logo" @click="goToHome">
      <svg class="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="10" stroke="#4096ff" stroke-width="3" fill="none"/>
        <line x1="25" y1="25" x2="32" y2="32" stroke="#4096ff" stroke-width="3" stroke-linecap="round"/>
        <circle cx="18" cy="18" r="4" fill="#4096ff" opacity="0.3"/>
      </svg>
      <span v-show="!collapsed" class="logo-text">企情察</span>
    </div>

    <a-menu
      v-model:selectedKeys="selectedKeys"
      mode="inline"
      theme="light"
      @click="handleMenuClick"
    >
      <a-menu-item key="Dashboard">
        <template #icon><DashboardOutlined /></template>
        <span>数据统计</span>
      </a-menu-item>
      <a-menu-item key="MainAccounts">
        <template #icon><TeamOutlined /></template>
        <span>账号管理</span>
      </a-menu-item>
      <a-menu-item key="Spaces">
        <template #icon><AppstoreOutlined /></template>
        <span>企业空间管理</span>
      </a-menu-item>
      <a-menu-item key="Reports">
        <template #icon><FileTextOutlined /></template>
        <span>报告记录管理</span>
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  DashboardOutlined,
  TeamOutlined,
  AppstoreOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
const selectedKeys = ref([route.name])

// 返回首页
const goToHome = () => {
  router.push('/')
}

const menuRouteMap = {
  Dashboard: '/admin',
  MainAccounts: '/admin/accounts',
  Spaces: '/admin/spaces',
  Reports: '/admin/reports',
}

const handleMenuClick = ({ key }) => {
  const path = menuRouteMap[key]
  if (path) router.push(path)
}
</script>

<style scoped>
.admin-sider {
  background: #fff !important;
  border-right: 1px solid #f0f0f0;
  min-height: 100vh;
}

.sider-logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 18px;
  font-weight: 700;
  color: #1677ff;
  cursor: pointer;
  transition: background 0.2s;
}

.sider-logo:hover {
  background: #f5f5f5;
}

.logo-icon {
  width: 36px;
  height: 36px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #181818;
}
</style>
