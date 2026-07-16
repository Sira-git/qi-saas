<template>
  <div class="notification-page bg-light">
    <div class="page-header">
      <div class="page-container header-inner">
        <button class="back-btn" @click="$router.back()">
          <ArrowLeftOutlined /> 返回
        </button>
        <h1>消息通知</h1>
        <div class="header-actions">
          <button class="mark-read-btn" @click="markAllAsRead" v-if="unreadCount > 0">
            全部已读
          </button>
          <router-link to="/settings/notification" class="settings-link">
            <SettingOutlined />
          </router-link>
        </div>
      </div>
    </div>

    <div class="page-container content-area">
      <!-- 消息分类标签 -->
      <div class="tabs">
        <button 
          class="tab" 
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          全部
          <span class="badge" v-if="totalCount > 0">{{ totalCount }}</span>
        </button>
        <button 
          class="tab" 
          :class="{ active: activeTab === 'report' }"
          @click="activeTab = 'report'"
        >
          报告提醒
          <span class="badge" v-if="reportCount > 0">{{ reportCount }}</span>
        </button>
        <button 
          class="tab" 
          :class="{ active: activeTab === 'system' }"
          @click="activeTab = 'system'"
        >
          系统通知
          <span class="badge" v-if="systemCount > 0">{{ systemCount }}</span>
        </button>
      </div>

      <!-- 消息列表 -->
      <div class="notification-list">
        <div 
          v-for="msg in filteredMessages" 
          :key="msg.id" 
          class="notification-item"
          :class="{ unread: !msg.read, report: msg.type === 'report' }"
          @click="handleClick(msg)"
        >
          <div class="notification-icon">
            <BarChartOutlined v-if="msg.type === 'report'" class="type-icon report" />
            <BellOutlined v-else-if="msg.type === 'system'" class="type-icon system" />
            <MailOutlined v-else class="type-icon message" />
          </div>
          
          <div class="notification-content">
            <div class="notification-title">{{ msg.title }}</div>
            <div class="notification-desc">{{ msg.description }}</div>
            <div class="notification-meta">
              <span class="time">{{ formatTime(msg.createdAt) }}</span>
              <span class="status" v-if="msg.read">已读</span>
            </div>
          </div>

          <div class="notification-action" v-if="!msg.read">
            <span class="unread-dot"></span>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredMessages.length === 0" class="empty-state">
          <div class="empty-icon">
            <BellOutlined style="font-size: 48px; color: #d9d9d9;" />
          </div>
          <div class="empty-text">暂无消息</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { 
  BarChartOutlined, 
  BellOutlined, 
  SettingOutlined,
  MailOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const activeTab = ref('all')

// 消息数据（2026年月报/半年报 + 系统通知）- 按时间从新到旧排序
const messages = ref([
  // 报告提醒：半年报（最新）
  {
    id: 1,
    type: 'report',
    title: '半年报生成完成',
    description: '您的2026年上半年情报检测报告已生成，点击查看详情',
    read: false,
    createdAt: new Date('2026-07-03'),
    link: 'http://172.16.11.108:5176/report/halfyear_2026_h1'
  },
  // 报告提醒：月报（从新到旧）
  {
    id: 2,
    type: 'report',
    title: '月报生成完成',
    description: '您的2026年6月企业情报月报已生成，点击查看详情',
    read: false,
    createdAt: new Date('2026-07-03'),
    link: 'http://172.16.11.108:5176/report/monthly_2026_06'
  },
  {
    id: 3,
    type: 'report',
    title: '月报生成完成',
    description: '您的2026年5月企业情报月报已生成，点击查看详情',
    read: true,
    createdAt: new Date('2026-06-03'),
    link: 'http://172.16.11.108:5176/report/monthly_2026_05'
  },
  {
    id: 4,
    type: 'report',
    title: '月报生成完成',
    description: '您的2026年4月企业情报月报已生成，点击查看详情',
    read: true,
    createdAt: new Date('2026-05-03'),
    link: 'http://172.16.11.108:5176/report/monthly_2026_04'
  },
  {
    id: 5,
    type: 'report',
    title: '月报生成完成',
    description: '您的2026年3月企业情报月报已生成，点击查看详情',
    read: true,
    createdAt: new Date('2026-04-03'),
    link: 'http://172.16.11.108:5176/report/monthly_2026_03'
  },
  {
    id: 6,
    type: 'report',
    title: '月报生成完成',
    description: '您的2026年2月企业情报月报已生成，点击查看详情',
    read: true,
    createdAt: new Date('2026-03-03'),
    link: 'http://172.16.11.108:5176/report/monthly_2026_02'
  },
  {
    id: 7,
    type: 'report',
    title: '月报生成完成',
    description: '您的2026年1月企业情报月报已生成，点击查看详情',
    read: true,
    createdAt: new Date('2026-02-03'),
    link: 'http://172.16.11.108:5176/report/monthly_2026_01'
  },
  // 系统通知
  {
    id: 8,
    type: 'system',
    title: '系统升级通知',
    description: '系统将于今晚 22:00 进行例行维护，预计 30 分钟',
    read: true,
    createdAt: new Date(Date.now() - 86400000),
    link: null
  },
  {
    id: 9,
    type: 'system',
    title: '功能更新提醒',
    description: '新增竞品动态监测功能，欢迎体验',
    read: true,
    createdAt: new Date(Date.now() - 259200000),
    link: null
  }
])

const filteredMessages = computed(() => {
  if (activeTab.value === 'all') return messages.value
  return messages.value.filter(msg => msg.type === activeTab.value)
})

const totalCount = computed(() => messages.value.length)
const reportCount = computed(() => messages.value.filter(m => m.type === 'report').length)
const systemCount = computed(() => messages.value.filter(m => m.type === 'system').length)
const unreadCount = computed(() => messages.value.filter(m => !m.read).length)

const formatTime = (date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  // For older dates, show formatted date string
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}年${m}月${day}日`
}

const handleClick = (msg) => {
  if (!msg.read) {
    msg.read = true
  }
  if (msg.link) {
    // 打开新页面，使用完整 URL
    window.open(msg.link, '_blank')
  } else {
    message.info('暂无详情')
  }
}

const markAllAsRead = () => {
  messages.value.forEach(msg => msg.read = true)
  message.success('已全部标记为已读')
  
  // 通知 TopNav 更新徽章
  window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { count: 0 } }))
}
</script>

<style scoped>
.notification-page {
  min-height: 100vh;
}

.page-header {
  background: #ffffff;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.header-inner h1 {
  font-size: 18px;
  font-weight: 600;
  flex: 1;
  text-align: center;
}

.back-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.back-btn:hover {
  color: #4096ff;
}

.back-btn .anticon {
  font-size: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mark-read-btn {
  background: rgba(22, 119, 255, 0.1);
  color: #1677ff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.mark-read-btn:hover {
  background: rgba(22, 119, 255, 0.2);
}

.settings-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  text-decoration: none;
  color: #64748b;
  transition: all 0.2s;
}

.settings-link:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1a202c;
}

.content-area {
  padding: 24px 0;
  max-width: 800px;
  margin: 0 auto;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding: 0 40px;
}

.tab {
  flex: 1;
  padding: 10px 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tab:hover {
  border-color: rgba(22, 119, 255, 0.3);
  color: #1a202c;
}

.tab.active {
  background: #1677ff;
  border-color: #1677ff;
  color: #ffffff;
}

.badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.notification-item:hover {
  border-color: rgba(22, 119, 255, 0.3);
  box-shadow: 0 2px 12px rgba(22, 119, 255, 0.08);
  transform: translateY(-1px);
}

.notification-item.unread {
  /* 已读和未读均为白色背景，不做高亮处理 */
}

.notification-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(22, 119, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.notification-item.report .notification-icon {
  background: rgba(22, 119, 255, 0.1);
}

.type-icon {
  font-size: 20px;
}

.type-icon.report {
  color: #1677ff;
}

.type-icon.system {
  color: #fa8c16;
}

.type-icon.message {
  color: #52c41a;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 6px;
}

.notification-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;
}

.notification-meta .status {
  color: #94a3b8;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #1677ff;
  border-radius: 50%;
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .tabs {
    padding: 0 16px;
  }
  
  .notification-item {
    padding: 14px 16px;
  }
}
</style>
