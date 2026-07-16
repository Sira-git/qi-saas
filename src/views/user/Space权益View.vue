<template>
  <div class="space-benefit-page">
    <!-- 统一顶部导航 -->
    <TopNav />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-container header-inner">
        <button class="back-btn" @click="router.back()">
          <ArrowLeftOutlined /> 返回
        </button>
        <h1>权益管理</h1>
        <div style="width: 100px"></div>
      </div>
    </div>

    <div class="page-container">
      <!-- 当前套餐信息 -->
      <div class="current-package-card">
        <div class="package-header">
          <div class="package-info">
            <div class="package-name">
              <h2>{{ getPackageName(space.package) }}</h2>
              <a-tag :color="getPackageColor(space.package)" size="large">
                {{ space.package === 'free' ? '长期有效' : '订阅中' }}
              </a-tag>
            </div>
            <div class="package-price">
              <span class="price">{{ getPackagePrice(space.package) }}</span>
              <span class="price-unit">/ {{ space.package === 'free' ? '永久' : billingCycle === 'monthly' ? '月' : '年' }}</span>
            </div>
          </div>
          <div class="package-status">
            <div class="status-item">
              <span class="label">到期时间</span>
              <span class="value" :class="{ 'warning': isExpiringSoon }">
                <ClockCircleOutlined />
                {{ space.expireDate || '长期有效' }}
              </span>
            </div>
            <div class="status-item" v-if="space.package !== 'free'">
              <span class="label">自动续费</span>
              <span class="value">
                <a-switch v-model:checked="autoRenew" size="small" @change="toggleAutoRenew" />
                {{ autoRenew ? '已开启' : '已关闭' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 权益用量 -->
        <div class="benefit-usage">
          <div class="usage-item">
            <div class="usage-header">
              <TeamOutlined class="usage-icon" />
              <span class="usage-label">子账号</span>
            </div>
            <div class="usage-bar">
              <div class="usage-info">
                <span class="usage-value">{{ space.subAccountsCount }} / {{ space.maxAccounts }}</span>
                <span class="usage-tip">个</span>
              </div>
              <a-progress 
                :percent="(space.subAccountsCount / space.maxAccounts) * 100" 
                :stroke-color="getProgressColor(space.subAccountsCount, space.maxAccounts)"
                :show-info="false"
                size="small"
              />
            </div>
          </div>

          <div class="usage-item">
            <div class="usage-header">
              <TrophyOutlined class="usage-icon" />
              <span class="usage-label">竞品监控</span>
            </div>
            <div class="usage-bar">
              <div class="usage-info">
                <span class="usage-value">{{ competitorCount }} / {{ getCompetitorLimit(space.package) }}</span>
                <span class="usage-tip">个</span>
              </div>
              <a-progress 
                :percent="(competitorCount / getCompetitorLimit(space.package)) * 100" 
                :stroke-color="getProgressColor(competitorCount, getCompetitorLimit(space.package))"
                :show-info="false"
                size="small"
              />
            </div>
          </div>

          <div class="usage-item">
            <div class="usage-header">
              <BellOutlined class="usage-icon" />
              <span class="usage-label">政策订阅</span>
            </div>
            <div class="usage-bar">
              <div class="usage-info">
                <span class="usage-value">{{ subscriptionCount }} / {{ getSubscriptionLimit(space.package) }}</span>
                <span class="usage-tip">条</span>
              </div>
              <a-progress 
                :percent="(subscriptionCount / getSubscriptionLimit(space.package)) * 100" 
                :stroke-color="getProgressColor(subscriptionCount, getSubscriptionLimit(space.package))"
                :show-info="false"
                size="small"
              />
            </div>
          </div>
        </div>

        <!-- 功能权益列表 -->
        <div class="feature-list">
          <div class="feature-title">功能权益</div>
          <div class="feature-grid">
            <div 
              v-for="feature in getFeatures(space.package)" 
              :key="feature"
              class="feature-item"
              :class="{ disabled: !feature }"
            >
              <CheckCircleOutlined v-if="feature" class="feature-icon" />
              <CloseCircleOutlined v-else class="feature-icon disabled" />
              <span>{{ feature || '不支持' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button 
          v-if="space.package !== 'free'" 
          type="primary" 
          size="large"
          @click="handleRenew"
          :disabled="isExpired"
        >
          <ShopOutlined /> 续费
        </a-button>
        <a-button 
          type="primary" 
          size="large"
          @click="handleUpgrade"
        >
          <RocketOutlined /> 
          {{ space.package === 'free' ? '升级套餐' : '变更套餐' }}
        </a-button>
      </div>

      <!-- 订阅记录 -->
      <div class="subscription-history">
        <h3 class="section-title">订阅记录</h3>
        <a-table
          :columns="historyColumns"
          :data-source="subscriptionHistory"
          :pagination="false"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'package'">
              <a-tag :color="getPackageColor(record.package)">
                {{ getPackageName(record.package) }}
              </a-tag>
            </template>
            <template v-if="column.key === 'billingCycle'">
              {{ record.billingCycle === 'monthly' ? '月付' : '年付' }}
            </template>
            <template v-if="column.key === 'amount'">
              ¥{{ record.amount }}
            </template>
            <template v-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 套餐调整弹窗 -->
    <a-modal v-model:open="upgradeVisible" title="选择套餐" width="800px" :footer="null">
      <div class="upgrade-content">
        <div class="current-package-tip">
          <a-alert 
            v-if="space.package !== 'free'"
            message="降级需等到期后重新订阅，升级立即生效并补差价"
            type="info"
            show-icon
            style="margin-bottom: 16px"
          />
          <a-alert 
            v-else
            message="升级立即生效，按剩余天数补差价"
            type="info"
            show-icon
            style="margin-bottom: 16px"
          />
        </div>

        <div class="package-wrapper">
          <div class="package-grid">
            <label class="package-option" :class="{ selected: selectedPackage === 'free' }" @click="selectedPackage = 'free'">
              <input type="radio" name="package" value="free" v-model="selectedPackage" :disabled="space.package === 'free'" />
              <div class="package-card">
                <div class="package-header-card">
                  <h4>免费版</h4>
                  <span class="price">¥0</span>
                </div>
                <ul class="package-features">
                  <li><CheckCircleOutlined /> 1 个子账号（仅 1 个月）</li>
                  <li><CheckCircleOutlined /> 3 个竞品监控</li>
                  <li><CheckCircleOutlined /> 3 条政策订阅</li>
                  <li><CheckCircleOutlined /> 基础功能</li>
                </ul>
                <div class="package-desc">适合个人或小团队试用</div>
              </div>
            </label>

            <label class="package-option" :class="{ selected: selectedPackage === 'basic' }" @click="selectedPackage = 'basic'">
              <input type="radio" name="package" value="basic" v-model="selectedPackage" />
              <div class="package-card">
                <div class="package-header-card">
                  <h4>基础版</h4>
                  <div class="price-wrapper">
                    <span class="price">¥399</span>
                    <span class="price-unit">/月</span>
                  </div>
                </div>
                <ul class="package-features">
                  <li><CheckCircleOutlined /> 3 个子账号</li>
                  <li><CheckCircleOutlined /> 10 个竞品监控</li>
                  <li><CheckCircleOutlined /> 10 条政策订阅</li>
                  <li><CheckCircleOutlined /> 基础预警功能</li>
                </ul>
                <div class="package-desc">适合小型企业日常使用</div>
              </div>
            </label>

            <label class="package-option" :class="{ selected: selectedPackage === 'advanced' }" @click="selectedPackage = 'advanced'">
              <input type="radio" name="package" value="advanced" v-model="selectedPackage" />
              <div class="package-card">
                <div class="package-header-card">
                  <h4>高级版</h4>
                  <div class="price-wrapper">
                    <span class="price">¥899</span>
                    <span class="price-unit">/月</span>
                  </div>
                </div>
                <ul class="package-features">
                  <li><CheckCircleOutlined /> 10 个子账号</li>
                  <li><CheckCircleOutlined /> 50 个竞品监控</li>
                  <li><CheckCircleOutlined /> 50 条政策订阅</li>
                  <li><CheckCircleOutlined /> 高级预警 + 智能分析</li>
                </ul>
                <div class="package-desc">适合中大型企业深度使用</div>
              </div>
            </label>
          </div>
        </div>

        <!-- 付费周期选择 -->
        <div class="billing-cycle-selector" v-if="selectedPackage !== 'free'">
          <div class="cycle-label">付费周期</div>
          <div class="cycle-options">
            <label class="cycle-option" :class="{ selected: billingCycle === 'monthly' }" @click="billingCycle = 'monthly'">
              <input type="radio" name="billingCycle" value="monthly" v-model="billingCycle" />
              <span>月付</span>
            </label>
            <label class="cycle-option" :class="{ selected: billingCycle === 'yearly' }" @click="billingCycle = 'yearly'">
              <input type="radio" name="billingCycle" value="yearly" v-model="billingCycle" />
              <span>年付 <span class="discount">省 2 个月</span></span>
            </label>
          </div>
        </div>

        <!-- 价格明细 -->
        <div class="price-detail" v-if="selectedPackage !== 'free'">
          <div class="detail-row">
            <span>套餐价格</span>
            <span>¥{{ selectedPackage === 'basic' ? (billingCycle === 'monthly' ? '399' : '3990') : (billingCycle === 'monthly' ? '899' : '8990') }}</span>
          </div>
          <div class="detail-row" v-if="space.package !== 'free' && selectedPackage !== space.package">
            <span>补差价</span>
            <span class="price-diff">¥{{ priceDiff }}</span>
          </div>
          <div class="detail-row total">
            <span>应付金额</span>
            <span class="total-price">¥{{ totalPrice }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div style="display: flex; gap: 12px; justify-content: flex-end">
          <a-button @click="upgradeVisible = false">取消</a-button>
          <a-button 
            type="primary" 
            @click="confirmUpgrade"
            :disabled="selectedPackage === space.package"
          >
            {{ selectedPackage === 'free' ? '降级' : '确认变更' }}
          </a-button>
        </div>
      </template>
    </a-modal>

    <!-- 续费弹窗 -->
    <a-modal v-model:open="renewVisible" title="续费套餐" width="600px" :footer="null">
      <div class="renew-content">
        <div class="current-package-info">
          <div class="package-name">{{ getPackageName(space.package) }}</div>
          <div class="expire-info">
            当前到期时间：{{ space.expireDate }}
          </div>
        </div>

        <div class="billing-cycle-selector">
          <div class="cycle-label">续费周期</div>
          <div class="cycle-options">
            <label class="cycle-option" :class="{ selected: renewCycle === 'monthly' }" @click="renewCycle = 'monthly'">
              <input type="radio" name="renewCycle" value="monthly" v-model="renewCycle" />
              <span>月付</span>
            </label>
            <label class="cycle-option" :class="{ selected: renewCycle === 'yearly' }" @click="renewCycle = 'yearly'">
              <input type="radio" name="renewCycle" value="yearly" v-model="renewCycle" />
              <span>年付 <span class="discount">省 2 个月</span></span>
            </label>
          </div>
        </div>

        <div class="price-detail">
          <div class="detail-row">
            <span>续费价格</span>
            <span>¥{{ space.package === 'basic' ? (renewCycle === 'monthly' ? '399' : '3990') : (renewCycle === 'monthly' ? '899' : '8990') }}</span>
          </div>
          <div class="detail-row total">
            <span>应付金额</span>
            <span class="total-price">¥{{ renewPrice }}</span>
          </div>
        </div>

        <a-alert 
          message="续费后到期时间将顺延相应周期"
          type="info"
          show-icon
          style="margin-top: 16px"
        />
      </div>

      <template #footer>
        <div style="display: flex; gap: 12px; justify-content: flex-end">
          <a-button @click="renewVisible = false">取消</a-button>
          <a-button type="primary" @click="confirmRenew">确认续费</a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { 
  ArrowLeftOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShopOutlined,
  RocketOutlined,
  BuildOutlined
} from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'

const router = useRouter()
const route = useRoute()

// 当前空间信息
const space = ref({
  id: '1',
  name: '大汉软件股份有限公司',
  industry: '软件',
  package: 'advanced',
  subAccountsCount: 3,
  maxAccounts: 10,
  expireDate: '2026-12-31',
})

// 自动续费
const autoRenew = ref(false)

// 用量数据
const competitorCount = ref(5)
const subscriptionCount = ref(3)

// 套餐调整
const upgradeVisible = ref(false)
const selectedPackage = ref('free')
const billingCycle = ref('monthly')

// 续费
const renewVisible = ref(false)
const renewCycle = ref('monthly')

// 订阅记录
const subscriptionHistory = ref([
  {
    id: 1,
    package: 'advanced',
    billingCycle: 'monthly',
    amount: 899,
    startDate: '2025-12-31',
    endDate: '2026-12-31',
    status: 'active'
  },
  {
    id: 2,
    package: 'basic',
    billingCycle: 'monthly',
    amount: 399,
    startDate: '2025-06-30',
    endDate: '2025-12-30',
    status: 'expired'
  }
])

const historyColumns = [
  { title: '套餐', dataIndex: 'package', key: 'package', width: 120 },
  { title: '周期', dataIndex: 'billingCycle', key: 'billingCycle', width: 80 },
  { title: '金额', dataIndex: 'amount', key: 'amount', width: 100 },
  { title: '开始日期', dataIndex: 'startDate', key: 'startDate', width: 120 },
  { title: '结束日期', dataIndex: 'endDate', key: 'endDate', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 }
]

// 计算属性
const isExpired = computed(() => {
  if (!space.value.expireDate) return false
  return new Date(space.value.expireDate) < new Date()
})

const isExpiringSoon = computed(() => {
  if (!space.value.expireDate) return false
  const daysLeft = (new Date(space.value.expireDate) - new Date()) / (1000 * 60 * 60 * 24)
  return daysLeft <= 30 && daysLeft > 0
})

const priceDiff = computed(() => {
  if (selectedPackage.value === space.value.package) return 0
  
  const prices = {
    free: 0,
    basic: billingCycle.value === 'monthly' ? 399 : 3990,
    advanced: billingCycle.value === 'monthly' ? 899 : 8990
  }
  
  const currentPrice = prices[space.value.package]
  const newPrice = prices[selectedPackage.value]
  
  // 按剩余天数比例计算补差价
  if (space.value.expireDate) {
    const daysLeft = (new Date(space.value.expireDate) - new Date()) / (1000 * 60 * 60 * 24)
    const daysInMonth = 30
    const remainingRatio = Math.max(0, daysLeft / daysInMonth)
    const diff = (newPrice - currentPrice) * remainingRatio
    return Math.round(diff)
  }
  
  return newPrice - currentPrice
})

const totalPrice = computed(() => {
  return Math.abs(priceDiff.value)
})

const renewPrice = computed(() => {
  const prices = {
    basic: { monthly: 399, yearly: 3990 },
    advanced: { monthly: 899, yearly: 8990 }
  }
  return prices[space.value.package]?.[renewCycle.value] || 0
})

// 辅助函数
const getPackageName = (pkg) => {
  const names = { free: '免费版', basic: '基础版', advanced: '高级版' }
  return names[pkg] || pkg
}

const getPackageColor = (pkg) => {
  const colors = { free: 'default', basic: 'green', advanced: 'blue' }
  return colors[pkg] || 'default'
}

const getPackagePrice = (pkg) => {
  const prices = { free: '¥0', basic: '¥399', advanced: '¥899' }
  return prices[pkg] || pkg
}

const getCompetitorLimit = (pkg) => {
  const limits = { free: 3, basic: 10, advanced: 50 }
  return limits[pkg] || 0
}

const getSubscriptionLimit = (pkg) => {
  const limits = { free: 3, basic: 10, advanced: 50 }
  return limits[pkg] || 0
}

const getFeatures = (pkg) => {
  const features = {
    free: ['基础功能', '1 个子账号（仅 1 个月）', '3 个竞品监控', '3 条政策订阅', null, null],
    basic: ['基础功能', '3 个子账号', '10 个竞品监控', '10 条政策订阅', '基础预警', null],
    advanced: ['基础功能', '10 个子账号', '50 个竞品监控', '50 条政策订阅', '高级预警', '智能分析']
  }
  return features[pkg] || []
}

const getProgressColor = (current, max) => {
  const ratio = current / max
  if (ratio >= 0.9) return '#ff4d4f'
  if (ratio >= 0.7) return '#faad14'
  return '#1677ff'
}

const getStatusColor = (status) => {
  const colors = { active: 'blue', expired: 'default', cancelled: 'red' }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = { active: '生效中', expired: '已过期', cancelled: '已取消' }
  return texts[status] || status
}

const toggleAutoRenew = (checked) => {
  message.success(checked ? '已开启自动续费' : '已关闭自动续费')
}

const handleUpgrade = () => {
  selectedPackage.value = space.value.package
  billingCycle.value = 'monthly'
  upgradeVisible.value = true
}

const handleRenew = () => {
  if (isExpired.value) {
    message.warning('套餐已过期，请重新订阅')
    return
  }
  renewCycle.value = 'monthly'
  renewVisible.value = true
}

const confirmUpgrade = () => {
  if (selectedPackage.value === 'free' && space.value.package !== 'free') {
    Modal.confirm({
      title: '确认降级',
      content: '降级将在当前套餐到期后生效，期间仍可享受当前套餐权益',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        applyUpgrade()
      }
    })
  } else {
    applyUpgrade()
  }
}

const applyUpgrade = () => {
  space.value.package = selectedPackage.value
  
  // 更新限额
  const limits = {
    free: { accounts: 1, competitors: 3, subscriptions: 3 },
    basic: { accounts: 3, competitors: 10, subscriptions: 10 },
    advanced: { accounts: 10, competitors: 50, subscriptions: 50 }
  }
  
  const limit = limits[selectedPackage.value]
  space.value.maxAccounts = limit.accounts
  
  // 更新到期时间
  if (selectedPackage.value !== 'free') {
    const expireDate = new Date(space.value.expireDate || new Date())
    if (billingCycle.value === 'monthly') {
      expireDate.setMonth(expireDate.getMonth() + 1)
    } else {
      expireDate.setFullYear(expireDate.getFullYear() + 1)
    }
    space.value.expireDate = expireDate.toISOString().split('T')[0]
  }
  
  // 添加订阅记录
  subscriptionHistory.value.unshift({
    id: Date.now(),
    package: selectedPackage.value,
    billingCycle: billingCycle.value,
    amount: totalPrice.value,
    startDate: new Date().toISOString().split('T')[0],
    endDate: space.value.expireDate,
    status: 'active'
  })
  
  message.success('套餐变更成功')
  upgradeVisible.value = false
}

const confirmRenew = () => {
  const expireDate = new Date(space.value.expireDate || new Date())
  if (renewCycle.value === 'monthly') {
    expireDate.setMonth(expireDate.getMonth() + 1)
  } else {
    expireDate.setFullYear(expireDate.getFullYear() + 1)
  }
  space.value.expireDate = expireDate.toISOString().split('T')[0]
  
  // 添加订阅记录
  subscriptionHistory.value.unshift({
    id: Date.now(),
    package: space.value.package,
    billingCycle: renewCycle.value,
    amount: renewPrice.value,
    startDate: new Date().toISOString().split('T')[0],
    endDate: space.value.expireDate,
    status: 'active'
  })
  
  message.success('续费成功')
  renewVisible.value = false
}

onMounted(() => {
  // 加载空间信息
  const spaceId = route.params.id || '1'
  // TODO: 从 API 加载数据
})
</script>

<style scoped>
.space-benefit-page {
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
  padding: 24px;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
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
  color: #1677ff;
}

/* 当前套餐卡片 */
.current-package-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.package-name {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.package-name h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
}

.package-price {
  margin-top: 8px;
}

.price {
  font-size: 36px;
  font-weight: 700;
  color: #1677ff;
}

.price-unit {
  font-size: 14px;
  color: #8c8c8c;
  margin-left: 4px;
}

.package-status {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-item .label {
  font-size: 13px;
  color: #8c8c8c;
}

.status-item .value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #1a202c;
  font-weight: 500;
}

.status-item .value.warning {
  color: #fa8c16;
}

/* 权益用量 */
.benefit-usage {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.usage-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.usage-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.usage-icon {
  font-size: 18px;
  color: #1677ff;
}

.usage-label {
  font-size: 14px;
  font-weight: 500;
  color: #1a202c;
}

.usage-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.usage-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.usage-value {
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
}

.usage-tip {
  font-size: 13px;
  color: #8c8c8c;
}

/* 功能权益列表 */
.feature-list {
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 16px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8faff;
  border-radius: 8px;
  font-size: 14px;
  color: #1a202c;
}

.feature-item.disabled {
  background: #f5f5f5;
  color: #8c8c8c;
}

.feature-icon {
  font-size: 16px;
  color: #52c41a;
}

.feature-icon.disabled {
  color: #d9d9d9;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

/* 订阅记录 */
.subscription-history {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 16px;
}

/* 套餐调整弹窗 */
.upgrade-content {
  padding: 8px 0;
}

.current-package-tip {
  margin-bottom: 20px;
}

.package-wrapper {
  margin-bottom: 20px;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.package-option {
  position: relative;
  cursor: pointer;
}

.package-option input[type="radio"] {
  position: absolute;
  opacity: 0;
}

.package-card {
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s;
}

.package-option:hover .package-card {
  border-color: #1677ff;
}

.package-option.selected .package-card {
  border-color: #1677ff;
  background: rgba(22, 119, 255, 0.02);
}

.package-option input[type="radio"]:disabled + .package-card {
  opacity: 0.6;
  cursor: not-allowed;
}

.package-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.package-header-card h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

.package-header-card .price {
  font-size: 24px;
  font-weight: 700;
  color: #1677ff;
}

.price-wrapper {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-wrapper .price-unit {
  font-size: 13px;
  color: #8c8c8c;
}

.package-features {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
}

.package-features li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: #64748b;
}

.package-features li .anticon {
  color: #52c41a;
}

.package-desc {
  font-size: 13px;
  color: #8c8c8c;
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

/* 付费周期选择 */
.billing-cycle-selector {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8faff;
  border-radius: 8px;
}

.cycle-label {
  font-size: 14px;
  font-weight: 500;
  color: #1a202c;
  margin-bottom: 12px;
}

.cycle-options {
  display: flex;
  gap: 12px;
}

.cycle-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;
  transition: all 0.2s;
}

.cycle-option input[type="radio"] {
  display: none;
}

.cycle-option:hover {
  border-color: #1677ff;
  color: #1677ff;
}

.cycle-option.selected {
  border-color: #1677ff;
  background: rgba(22, 119, 255, 0.02);
  color: #1677ff;
}

.cycle-option .discount {
  margin-left: 6px;
  font-size: 12px;
  color: #52c41a;
}

/* 价格明细 */
.price-detail {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #64748b;
}

.detail-row.total {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #d9d9d9;
  font-weight: 600;
  color: #1a202c;
}

.price-diff {
  color: #fa8c16;
}

.total-price {
  font-size: 20px;
  color: #1677ff;
}

/* 续费弹窗 */
.renew-content {
  padding: 8px 0;
}

.current-package-info {
  padding: 16px;
  background: #f8faff;
  border-radius: 8px;
  margin-bottom: 16px;
}

.package-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
}

.expire-info {
  font-size: 14px;
  color: #8c8c8c;
}
</style>
