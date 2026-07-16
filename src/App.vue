<template>
  <div id="app">
    <!-- 管理端使用 Ant Design 布局 -->
    <a-config-provider :theme="{
      token: {
        colorPrimary: '#1677ff',
        colorBgContainer: '#ffffff',
        colorBgElevated: '#ffffff',
        colorText: '#1a202c',
        colorTextSecondary: '#64748b',
        borderRadius: 8,
        fontFamily: '-apple-system, BlinkMacSystemFont, PingFang SC, Microsoft YaHei, sans-serif',
      }
    }">
      <!-- 管理端路由 -->
      <template v-if="isAdminRoute">
        <a-layout class="admin-layout">
          <AdminSidebar />
          <a-layout>
            <AdminHeader />
            <a-layout-content class="admin-content">
              <router-view />
            </a-layout-content>
          </a-layout>
        </a-layout>
      </template>

      <!-- 用户端路由 -->
      <template v-else>
        <router-view :key="route.fullPath" />
      </template>
    </a-config-provider>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>

<style>
#app {
  min-height: 100vh;
}

/* 管理端布局 */
.admin-layout {
  min-height: 100vh;
}

.admin-content {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}
</style>
