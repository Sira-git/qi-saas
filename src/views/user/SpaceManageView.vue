<template>
  <div class="space-manage-page">
    <!-- 统一顶部导航 -->
    <TopNav />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-container header-inner">
        <button class="back-btn" @click="router.push('/dashboard')">
          <ArrowLeftOutlined /> 返回
        </button>
        <h1>企业空间管理</h1>
        <router-link to="/space/create" class="btn-primary small-btn">
          创建新空间
        </router-link>
      </div>
    </div>

    <div class="page-container">
      <!-- 空间卡片列表 -->
      <div class="space-grid">
        <div
          v-for="space in spaces"
          :key="space.id"
          class="space-card"
          :class="{ current: space.id === currentSpaceId }"
        >
          <div v-if="space.id === currentSpaceId" class="current-badge">
            当前空间
          </div>

          <div class="space-info">
            <div class="space-header">
              <h3 class="space-name">{{ space.name }}</h3>
              <a-tag :color="getPackageColor(space.package)">
                {{ getPackageName(space.package) }}
              </a-tag>
            </div>
            <div class="space-meta">
              <span class="meta-item">
                <BuildOutlined /> {{ space.industry }}
              </span>
              <span class="meta-item">
                <TeamOutlined /> {{ space.subAccountsCount }}/{{ space.maxAccounts }} 子账号
              </span>
              <span class="meta-item">
                <ClockCircleOutlined /> 到期：{{ space.expireDate || '长期有效' }}
              </span>
            </div>
          </div>

          <div class="space-actions">
            <a-button size="small" @click="handleConfigure(space)">
              <SettingOutlined /> 配置
            </a-button>
            <a-button size="small" @click="handleManageSubAccounts(space)">
              <TeamOutlined /> 子账号
            </a-button>
            <a-button size="small" @click="handleUpgrade(space)">
              <BuildOutlined /> 权益
            </a-button>
            <a-button
              v-if="space.id !== currentSpaceId"
              size="small"
              danger
              @click="handleDelete(space)"
            >
              <DeleteOutlined /> 删除
            </a-button>
          </div>
        </div>
      </div>

      <a-empty v-if="spaces.length === 0" description="暂无企业空间">
        <a-button type="primary" @click="router.push('/space/create')">
          创建空间
        </a-button>
      </a-empty>
    </div>

    <!-- 套餐调整弹窗 -->
    <a-modal v-model:open="upgradeVisible" title="调整套餐" width="700px" :footer="null">
      <div class="upgrade-content">
        <div class="current-package">
          <h4>当前套餐：{{ getPackageName(currentSpace?.package) }}</h4>
          <p class="package-desc">{{ getPackageDesc(currentSpace?.package) }}</p>
        </div>

        <div class="package-wrapper">
          <div class="package-grid">
            <label class="package-option" @click="selectedPackage = 'free'">
              <input type="radio" name="upgrade-package" :checked="selectedPackage === 'free'" style="display: none;" />
              <div class="package-card">
                <div class="package-name">免费版</div>
                <div class="package-price">¥0<span>/月</span></div>
                <ul class="package-features">
                  <li>1 个子账号（仅 1 个月）（仅 1 个月）</li>
                  <li>3 个竞品监控</li>
                  <li>基础功能</li>
                </ul>
              </div>
            </label>
            <label class="package-option" @click="selectedPackage = 'basic'">
              <input type="radio" name="upgrade-package" :checked="selectedPackage === 'basic'" style="display: none;" />
              <div class="package-card">
                <div class="package-name">基础版</div>
                <div class="package-price">¥399<span>/月</span></div>
                <ul class="package-features">
                  <li>3 个子账号</li>
                  <li>10 个竞品监控</li>
                  <li>基础预警功能</li>
                </ul>
              </div>
            </label>
            <label class="package-option" @click="selectedPackage = 'advanced'">
              <input type="radio" name="upgrade-package" :checked="selectedPackage === 'advanced'" style="display: none;" />
              <div class="package-card">
                <div class="package-name">高级版</div>
                <div class="package-price">¥899<span>/月</span></div>
                <ul class="package-features">
                  <li>10 个子账号</li>
                  <li>50 个竞品监控</li>
                  <li>高级预警 + 智能分析</li>
                </ul>
              </div>
            </label>
          </div>
        </div>

        <div class="upgrade-actions">
          <a-space>
            <a-button @click="upgradeVisible = false">取消</a-button>
            <a-button type="primary" @click="confirmUpgrade" :disabled="selectedPackage === currentSpace?.package">
              {{ selectedPackage === 'free' ? '降级' : selectedPackage === 'advanced' ? '升级' : '确认调整' }}
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  BuildOutlined,
  TeamOutlined,
  SettingOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'

const router = useRouter()
const currentSpaceId = ref('1')
const upgradeVisible = ref(false)
const currentSpace = ref(null)
const selectedPackage = ref('free')

const spaces = ref([
  {
    id: '1',
    name: '大汉软件股份有限公司',
    industry: '软件',
    package: 'advanced',
    subAccountsCount: 3,
    maxAccounts: 10,
    expireDate: '2026-12-31',
  },
  {
    id: '2',
    name: '创新科技有限公司',
    industry: '互联网',
    package: 'basic',
    subAccountsCount: 1,
    maxAccounts: 3,
    expireDate: '2026-06-30',
  },
  {
    id: '3',
    name: '创业科技有限公司',
    industry: '人工智能',
    package: 'free',
    subAccountsCount: 0,
    maxAccounts: 1,
    expireDate: null, // 免费版长期有效
  },
])

const handleConfigure = (space) => {
  router.push(`/space/${space.id}/configure`)
}

const handleManageSubAccounts = (space) => {
  router.push(`/space/${space.id}/sub-accounts`)
}

const handleUpgrade = (space) => {
  router.push(`/space/${space.id}/benefits`)
}

const handleDelete = (space) => {
  if (space.id === currentSpaceId.value) {
    message.warning('不能删除当前空间')
    return
  }
  
  // 检查是否可以删除（免费版或已过期）
  const canDelete = space.package === 'free' || (space.expireDate && new Date(space.expireDate) < new Date())
  
  if (!canDelete) {
    message.warning('付费套餐且未到期的空间暂不支持删除，请先降级为免费版或等待到期')
    return
  }
  
  Modal.confirm({
    title: '确认删除',
    content: `确认删除「${space.name}」？删除后不可恢复。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      const index = spaces.value.findIndex(s => s.id === space.id)
      if (index > -1) {
        spaces.value.splice(index, 1)
        message.success('已删除')
      }
    }
  })
}

// 套餐相关辅助函数
const getPackageName = (pkg) => {
  const names = { free: '免费版', basic: '基础版', advanced: '高级版' }
  return names[pkg] || pkg
}

const getPackageColor = (pkg) => {
  const colors = { free: 'default', basic: 'green', advanced: 'blue' }
  return colors[pkg] || 'default'
}

const getPackageDesc = (pkg) => {
  const descs = {
    free: '适合个人或小团队试用',
    basic: '适合小型企业日常使用',
    advanced: '适合中大型企业深度使用'
  }
  return descs[pkg] || ''
}

const confirmUpgrade = () => {
  if (!currentSpace.value) return
  
  const oldPackage = getPackageName(currentSpace.value.package)
  const newPackage = getPackageName(selectedPackage.value)
  
  // 更新本地数据
  const space = spaces.value.find(s => s.id === currentSpace.value.id)
  if (space) {
    space.package = selectedPackage.value
    // 更新子账号限额
    const limits = { free: 1, basic: 3, advanced: 10 }
    space.maxAccounts = limits[selectedPackage.value]
    space.subAccountsCount = Math.min(space.subAccountsCount, space.maxAccounts)
  }
  
  message.success(`套餐已从"${oldPackage}"调整为"${newPackage}"`)
  upgradeVisible.value = false
}
</script>

<style scoped>
.space-manage-page {
  min-height: 100vh;
  background: #f5f7ff;
  padding-top: 64px;
}

/* 页面头部 */
.page-header {
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 64px;
  z-index: 50;
}

.page-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.header-inner h1 {
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f5f5f5;
  color: #4096ff;
}

.btn-primary {
  background: #4096ff;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #1677ff;
}

/* 空间卡片 */
.space-grid {
  display: grid;
  gap: 20px;
  padding: 24px 0;
}

.space-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 2px solid transparent;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
  position: relative;
}

.space-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.space-card.current {
  border-color: #1677ff;
}

.current-badge {
  position: absolute;
  top: -10px;
  right: 24px;
  background: #1677ff;
  color: #fff;
  padding: 2px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.space-info {
  margin-bottom: 16px;
}

.space-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.space-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.space-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #8c8c8c;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.space-actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 套餐调整弹窗 */
.upgrade-content {
  padding: 8px 0;
}

.current-package {
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.current-package h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1a202c;
}

.package-desc {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.package-wrapper {
  width: 100%;
}

.package-grid {
  display: flex;
  flex-direction: row;
  gap: 24px;
  width: 100%;
}

.package-option {
  position: relative;
  flex: 1 !important;
  border: none !important;
  background: transparent !important;
  margin: 0 !important;
  padding: 0 !important;
  cursor: pointer;
}

.package-option .package-card {
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;
  padding: 24px;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
}

/* 选中状态 */
.package-option:has(input:checked) .package-card {
  border-color: #1677ff !important;
  background: #f0f5ff !important;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.15);
}

.package-option:hover .package-card {
  border-color: #4096ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.package-card .package-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1a202c;
}

.package-card .package-price {
  font-size: 28px;
  font-weight: 700;
  color: #1677ff;
  margin-bottom: 16px;
}

.package-card .package-price span {
  font-size: 14px;
  font-weight: 400;
  color: #8c8c8c;
}

.package-card .package-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.package-card .package-features li {
  padding: 4px 0;
  font-size: 14px;
  color: #595959;
}

.package-card .package-features li::before {
  content: '✓';
  color: #52c41a;
  margin-right: 8px;
}

.upgrade-actions {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}
</style>
