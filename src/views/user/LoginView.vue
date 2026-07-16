<template>
  <div class="login-page">
    <!-- 内容容器 - 1200px 居中 -->
    <div class="login-container">
      <!-- 左侧：平台特点展示 -->
      <div class="login-left">
        <div class="left-content">
          <div class="logo-section">
            <SearchOutlined class="logo-icon" />
            <span class="logo-text">企情察</span>
          </div>
          
          <h1 class="main-title">
            <span class="gradient-text">AI 时代</span> 的企业情报平台
          </h1>
          
          <div class="features-section">
            <div class="feature-item">
              <div class="feature-icon">
                <BarChartOutlined />
              </div>
              <div class="feature-info">
                <h3>智能报告生成</h3>
                <p>一键生成日报、周报、月报，自动整合五大维度数据，告别繁琐的手工整理</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <FileTextOutlined />
              </div>
              <div class="feature-info">
                <h3>政策追踪分析</h3>
                <p>实时跟踪适配企业的政策内容，解读政策要点及对企业的影哬，抢占先机</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <LineChartOutlined />
              </div>
              <div class="feature-info">
                <h3>竞品动态监测</h3>
                <p>持续追踪竞品动向，分析竞争格局，量化差距，助力企业保持竞争优势</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <TrophyOutlined />
              </div>
              <div class="feature-info">
                <h3>中标数据洞察</h3>
                <p>全面掌握市场中标信息，发现商机，提升中标率</p>
              </div>
            </div>
          </div>
          
          <div class="stats-section">
            <div class="stat-item">
              <div class="stat-value">1000+</div>
              <div class="stat-label">服务客户</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">50 万+</div>
              <div class="stat-label">数据覆盖</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">99.9%</div>
              <div class="stat-label">数据准确率</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：登录表单 -->
      <div class="login-right">
        <div class="right-content">
          <div class="login-header">
            <h2 class="login-title">欢迎回来</h2>
          </div>

          <a-form layout="vertical" @submit.prevent="handleLogin">
            <a-form-item 
              label="手机号" 
              name="phone" 
              :rules="[{ required: true, message: '请输入手机号' }]"
            >
              <a-input 
                v-model:value="form.phone" 
                placeholder="请输入手机号" 
                size="large"
                maxlength="11"
              />
            </a-form-item>
            
            <a-form-item 
              label="验证码" 
              name="code" 
              :rules="[{ required: true, message: '请输入验证码' }]"
            >
              <div class="code-row">
                <a-input 
                  v-model:value="form.code" 
                  placeholder="请输入验证码" 
                  size="large" 
                  class="code-input" 
                  maxlength="6"
                />
                <a-button 
                  size="large" 
                  class="code-btn" 
                  :disabled="countdown > 0" 
                  @click="sendCode"
                >
                  {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                </a-button>
              </div>
            </a-form-item>
            
            <a-form-item>
              <a-button 
                type="primary" 
                html-type="submit" 
                size="large" 
                block 
                :loading="loading"
                class="submit-btn"
              >
                登录
              </a-button>
            </a-form-item>
          </a-form>

          <div class="login-footer">
            <span>还没有账号？</span>
            <router-link to="/register">立即注册</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { 
  SearchOutlined, 
  BarChartOutlined, 
  FileTextOutlined, 
  LineChartOutlined,
  TrophyOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const countdown = ref(0)
const form = reactive({ phone: '13800138000', code: '123456' })

const handleLogin = async () => {
  loading.value = true
  
  try {
    // 简单验证
    if (!form.phone || form.phone.length !== 11) {
      message.warning('请输入正确的手机号')
      return
    }
    if (!form.code || form.code.length < 4) {
      message.warning('请输入验证码')
      return
    }

    // Mock 登录成功
    const mockUser = {
      id: 'user_001',
      phone: form.phone,
      name: '杨蕾',
    }
    
    const mockEnterprise = {
      id: 'ent_001',
      name: '大汉软件股份有限公司',
      package: 'premium',
    }
    
    localStorage.setItem('qi_token', 'mock_token_' + Date.now())
    localStorage.setItem('qi_user', JSON.stringify(mockUser))
    localStorage.setItem('qi_enterprise', JSON.stringify(mockEnterprise))

    userStore.$patch({
      token: 'mock_token_' + Date.now(),
      userInfo: mockUser,
      currentEnterprise: mockEnterprise,
    })

    message.success('登录成功！')
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
  } catch (e) {
    console.error('登录失败:', e)
    message.error(e.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const sendCode = () => {
  if (!form.phone || form.phone.length !== 11) {
    message.warning('请先输入正确的手机号')
    return
  }
  message.success(`验证码已发送至 ${form.phone}`)
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8faff;
  padding: 40px;
}

/* 内容容器 - 1200px 居中 */
.login-container {
  width: 1200px;
  max-width: 100%;
  display: flex;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* 左侧区域 */
.login-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 50px;
  background: #f0f5ff;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(22, 119, 255, 0.04) 0%, transparent 70%);
  animation: float 20s infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(30px, 30px) rotate(180deg); }
}

.left-content {
  position: relative;
  z-index: 1;
  max-width: 500px;
  color: #1a202c;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 36px;
}

.logo-icon {
  font-size: 32px;
  color: #1677ff;
}

.logo-text {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
}

.main-title {
  font-size: 36px;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 40px;
}

.gradient-text {
  background: linear-gradient(135deg, #1677ff 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.features-section {
  margin-bottom: 40px;
}

.feature-item {
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e6f0ff;
  border-radius: 10px;
  font-size: 20px;
  color: #1677ff;
  flex-shrink: 0;
}

.feature-info h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
}

.feature-info p {
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.stats-section {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 28px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(0, 0, 0, 0.08);
}

/* 右侧区域 */
.login-right {
  width: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 50px;
  background: #ffffff;
}

.right-content {
  width: 100%;
  max-width: 400px;
}

.login-header {
  margin-bottom: 24px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
  line-height: 1.4;
}

.code-row {
  display: flex;
  gap: 12px;
}

.code-input {
  flex: 1;
}

.code-btn {
  min-width: 130px;
}

.submit-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background: #1677ff;
  margin-top: 8px;
}

.submit-btn:hover {
  background: #4096ff;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #64748b;
}

.login-footer a {
  color: #1677ff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.login-footer a:hover {
  text-decoration: underline;
}

/* 表单样式统一 */
:deep(.ant-input) {
  height: 44px !important;
  border-radius: 8px !important;
  font-size: 14px !important;
}

:deep(.ant-input-affix-wrapper) {
  height: 44px !important;
  border-radius: 8px !important;
}

:deep(.ant-btn) {
  height: 44px !important;
  border-radius: 8px !important;
  font-size: 14px !important;
}

:deep(.ant-form-item-label > label) {
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #1a202c !important;
}

:deep(.ant-input::placeholder) {
  color: #9ca3af !important;
  font-size: 13px !important;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .login-left {
    display: none;
  }
  
  .login-right {
    width: 100%;
  }
}
</style>
