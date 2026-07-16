<template>
  <div class="invite-page">
    <!-- 顶部导航 -->
    <div class="top-bar">
      <div class="top-bar-inner">
        <div class="logo" @click="router.push('/')">
          <svg class="logo-icon" viewBox="0 0 40 40" fill="none">
            <circle cx="18" cy="18" r="10" stroke="#4096ff" stroke-width="3" fill="none" />
            <line x1="25" y1="25" x2="32" y2="32" stroke="#4096ff" stroke-width="3" stroke-linecap="round" />
            <circle cx="18" cy="18" r="4" fill="#4096ff" opacity="0.3" />
          </svg>
          <span class="logo-text">企情察</span>
        </div>
      </div>
    </div>

    <!-- 步骤指示器 -->
    <div class="steps-bar">
      <div class="step-item" :class="{ active: currentStep >= 1, done: currentStep > 1 }">
        <span class="step-num">1</span>
        <span class="step-label">确认邀请</span>
      </div>
      <div class="step-line" :class="{ done: currentStep > 1 }"></div>
      <div class="step-item" :class="{ active: currentStep >= 2, done: currentStep > 2 }">
        <span class="step-num">2</span>
        <span class="step-label">基本信息</span>
      </div>
      <div class="step-line" :class="{ done: currentStep > 2 }"></div>
      <div class="step-item" :class="{ active: currentStep >= 3 }">
        <span class="step-num">3</span>
        <span class="step-label">加入成功</span>
      </div>
    </div>

    <div class="invite-container">
      <!-- 步骤1：确认邀请信息 -->
      <div v-if="currentStep === 1" class="invite-card">
        <div class="invite-header">
          <div class="invite-icon">
            <TeamOutlined />
          </div>
          <h1>加入企业空间</h1>
          <p class="invite-subtitle">您收到了一份企业空间邀请</p>
        </div>

        <div class="invite-info">
          <div class="info-row">
            <span class="info-label">邀请企业</span>
            <span class="info-value">{{ inviteInfo.companyName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">邀请角色</span>
            <a-tag :color="inviteInfo.role === 'space-admin' ? 'blue' : 'default'">
              {{ inviteInfo.role === 'space-admin' ? '企业空间管理员' : '普通子账号' }}
            </a-tag>
          </div>
        </div>

        <div v-if="userStore.isLoggedIn" class="logged-in-info">
          <a-alert
            message="您已登录"
            :description="`将以 ${userStore.currentEnterprise?.name || '当前账号'} 的身份加入。`"
            type="success"
            show-icon
          />
        </div>
        <div v-else class="not-logged-info">
          <a-alert
            message="您尚未登录"
            description="请填写以下信息完成注册并加入企业空间"
            type="info"
            show-icon
          />
        </div>

        <div class="invite-actions">
          <a-button size="large" @click="goBack" class="btn-back">取消</a-button>
          <a-button type="primary" size="large" @click="nextStep">
            确认加入
          </a-button>
        </div>
      </div>

      <!-- 步骤2：填写基本信息 -->
      <div v-if="currentStep === 2" class="invite-card">
        <div class="invite-header">
          <div class="invite-icon">
            <UserOutlined />
          </div>
          <h1>基本信息</h1>
          <p class="invite-subtitle">帮助您更好地融入团队</p>
        </div>

        <a-form ref="infoFormRef" :model="infoForm" layout="vertical">
          <a-form-item label="姓名" name="name" :rules="[{ required: true, message: '请输入您的姓名' }]">
            <a-input v-model:value="infoForm.name" placeholder="请输入您的姓名" size="large">
              <template #prefix><UserOutlined /></template>
            </a-input>
          </a-form-item>

          <a-divider style="margin: 24px 0">账号设置</a-divider>

          <a-form-item label="手机号" name="phone" :rules="[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
          ]">
            <a-input v-model:value="infoForm.phone" placeholder="请输入手机号" size="large">
              <template #prefix><MobileOutlined /></template>
            </a-input>
          </a-form-item>

          <a-form-item label="登录密码" name="password" :rules="[
            { required: true, message: '请设置登录密码' },
            { min: 6, max: 20, message: '密码长度为 6-20 位' }
          ]">
            <a-input-password v-model:value="infoForm.password" placeholder="请设置登录密码（6-20位）" size="large">
              <template #prefix><LockOutlined /></template>
            </a-input-password>
          </a-form-item>

          <a-form-item label="确认密码" name="confirmPassword" :rules="[
            { required: true, message: '请再次输入密码' },
            { validator: validateConfirmPassword }
          ]">
            <a-input-password v-model:value="infoForm.confirmPassword" placeholder="请再次输入密码" size="large">
              <template #prefix><LockOutlined /></template>
            </a-input-password>
          </a-form-item>
        </a-form>

        <div class="invite-actions">
          <a-button size="large" @click="currentStep = 1" class="btn-back">返回</a-button>
          <a-button type="primary" size="large" :loading="submitting" @click="handleSubmit">
            确认加入
          </a-button>
        </div>
      </div>

      <!-- 步骤3：成功 -->
      <div v-if="currentStep === 3" class="invite-card success-card">
        <div class="success-icon">
          <CheckCircleOutlined />
        </div>
        <h1>加入成功！</h1>
        <p class="success-desc">您已成功加入 <strong>{{ inviteInfo.companyName }}</strong></p>
        <div class="success-summary">
          <div class="summary-row">
            <span class="summary-label">角色</span>
            <a-tag :color="inviteInfo.role === 'space-admin' ? 'blue' : 'default'">
              {{ inviteInfo.role === 'space-admin' ? '企业空间管理员' : '普通子账号' }}
            </a-tag>
          </div>
          <div class="summary-row">
            <span class="summary-label">姓名</span>
            <span>{{ infoForm.name }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">手机号</span>
            <span>{{ infoForm.phone }}</span>
          </div>
        </div>
        <div class="invite-actions">
          <a-button type="primary" size="large" @click="goToDashboard">进入工作台</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  MobileOutlined,
  MailOutlined,
  HomeOutlined,
  IdcardOutlined,
  LockOutlined,
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const currentStep = ref(1)
const submitting = ref(false)
const infoFormRef = ref(null)

const infoForm = reactive({
  name: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const token = computed(() => route.query.token || route.params.token || '')
const spaceId = computed(() => route.query.space || '')
const inviteRole = computed(() => route.query.role || 'sub-account')

const inviteInfo = reactive({
  companyName: '大汉软件股份有限公司',
  role: 'sub-account',
})

const validateConfirmPassword = (rule, value) => {
  if (!value) {
    return Promise.reject('请再次输入密码')
  }
  if (value !== infoForm.password) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

onMounted(() => {
  inviteInfo.role = inviteRole.value
  if (token.value) {
    console.log('邀请 token:', token.value)
    // TODO: 验证 token 有效性并获取企业信息
  }
})

const goBack = () => {
  router.back()
}

const nextStep = () => {
  currentStep.value = 2
}

const handleSubmit = async () => {
  try {
    await infoFormRef.value.validateFields()
  } catch {
    return
  }

  submitting.value = true

  try {
    // TODO: 调用后端注册/登录 API
    // if (!userStore.isLoggedIn) {
    //   await axios.post('/api/auth/register', {
    //     phone: infoForm.phone,
    //     password: infoForm.password,
    //   })
    // }
    
    // TODO: 调用后端 API 加入企业空间
    // await axios.post(`/api/space/${spaceId.value}/join`, {
    //   token: token.value,
    //   name: infoForm.name,
    //   department: infoForm.department,
    //   position: infoForm.position,
    // })

    setTimeout(() => {
      message.success('加入成功！')
      submitting.value = false
      currentStep.value = 3
    }, 1500)
  } catch (error) {
    submitting.value = false
    message.error(error.message || '加入失败')
  }
}

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.invite-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f5ff 0%, #f5f7ff 100%);
  position: relative;
}

.top-bar {
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.top-bar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-icon {
  width: 36px;
  height: 36px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
}

.steps-bar {
  max-width: 520px;
  margin: 0 auto;
  padding: 32px 24px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

.step-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  background: #e5e7eb;
  color: #9ca3af;
  transition: all 0.3s;
}

.step-item.active .step-num {
  background: #4096ff;
  color: #fff;
  box-shadow: 0 2px 8px rgba(64, 150, 255, 0.3);
}

.step-item.done .step-num {
  background: #52c41a;
  color: #fff;
}

.step-label {
  font-size: 12px;
  color: #9ca3af;
  transition: all 0.3s;
  white-space: nowrap;
}

.step-item.active .step-label {
  color: #4096ff;
  font-weight: 500;
}

.step-item.done .step-label {
  color: #52c41a;
}

.step-line {
  width: 40px;
  height: 2px;
  background: #e5e7eb;
  transition: all 0.3s;
}

.step-line.done {
  background: #52c41a;
}

.invite-container {
  max-width: 520px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}

.invite-card {
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.invite-header {
  text-align: center;
  margin-bottom: 32px;
}

.invite-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4096ff 0%, #5b8def 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.invite-icon .anticon {
  font-size: 32px;
  color: #fff;
}

.invite-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
}

.invite-subtitle {
  font-size: 14px;
  color: #64748b;
}

.invite-info {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.info-row:not(:last-child) {
  border-bottom: 1px solid #eee;
}

.info-label {
  font-size: 14px;
  color: #64748b;
}

.info-value {
  font-size: 14px;
  color: #1a202c;
  font-weight: 500;
}

.logged-in-info,
.not-logged-info {
  margin-bottom: 24px;
}

.invite-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.invite-actions .ant-btn {
  flex: 1;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
}

.btn-back {
  border: 1px solid #d9d9d9;
  color: #64748b;
}

.success-card {
  text-align: center;
}

.success-icon {
  font-size: 72px;
  color: #52c41a;
  margin-bottom: 24px;
}

.success-card h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 12px;
}

.success-desc {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 24px;
}

.success-desc strong {
  color: #1a202c;
}

.success-summary {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 8px;
  text-align: left;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.summary-row:not(:last-child) {
  border-bottom: 1px solid #eee;
}

.summary-label {
  font-size: 14px;
  color: #64748b;
}

@media (max-width: 640px) {
  .steps-bar {
    padding: 20px 16px 0;
  }

  .step-line {
    width: 20px;
  }

  .step-label {
    font-size: 10px;
  }

  .invite-container {
    padding: 20px 16px 40px;
  }

  .invite-card {
    padding: 32px 24px;
  }
}
</style>
