<template>
  <div class="register-page">
    <!-- 内容容器 - 1200px 居中 -->
    <div class="register-container">
      <!-- 左侧：平台特点展示 -->
      <div class="register-left">
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

      <!-- 右侧：注册表单 -->
    <div class="register-right">
      <div class="right-content">
        <div class="register-header">
          <h2 class="register-title">免费注册企情察</h2>
        </div>

        <a-form layout="vertical" @finish="handleRegister">
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
          
          <a-form-item 
            label="密码" 
            name="password" 
            :rules="[
              { required: true, message: '请设置密码' },
              { min: 8, message: '密码至少 8 位' }
            ]"
          >
            <a-input-password 
              v-model:value="form.password" 
              placeholder="请设置密码（8 位以上）" 
              size="large"
            />
          </a-form-item>
          
          <a-form-item 
            label="姓名" 
            name="name" 
            :rules="[{ required: true, message: '请输入姓名' }]"
          >
            <a-input 
              v-model:value="form.name" 
              placeholder="请输入您的姓名" 
              size="large" 
            />
          </a-form-item>
          
          <a-form-item 
            label="企业名称" 
            name="companyName" 
            :rules="[{ required: true, message: '请输入企业名称' }]"
          >
            <a-input 
              v-model:value="form.companyName" 
              placeholder="请输入企业全称" 
              size="large" 
            />
          </a-form-item>
          
          <a-form-item>
            <a-checkbox v-model:checked="form.agree" name="agree">
              我已阅读并同意：
              <a href="#">《企情察服务协议》</a>、
              <a href="#">《隐私政策》</a>
            </a-checkbox>
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
              注册并创建企业空间
            </a-button>
          </a-form-item>
        </a-form>

        <div class="register-footer">
          <span>已有账号？</span>
          <router-link to="/login">立即登录</router-link>
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
import axios from 'axios'

const router = useRouter()
const loading = ref(false)
const countdown = ref(0)
const form = reactive({ 
  phone: '', 
  code: '', 
  password: '',
  name: '',
  companyName: '',
  agree: false
})

const handleRegister = async () => {
  if (!form.phone || form.phone.length !== 11) {
    message.warning('请输入正确的手机号')
    return
  }
  if (!form.code || form.code.length < 4) {
    message.warning('请输入验证码')
    return
  }
  if (!form.password || form.password.length < 8) {
    message.warning('密码至少 8 位')
    return
  }
  if (!form.name || form.name.trim().length === 0) {
    message.warning('请输入姓名')
    return
  }
  if (!form.companyName || form.companyName.trim().length === 0) {
    message.warning('请输入企业名称')
    return
  }
  if (!form.agree) {
    message.warning('请先同意服务协议和隐私政策')
    return
  }

  loading.value = true
  try {
    const response = await axios.post('/api/auth/register', {
      phone: form.phone,
      code: form.code,
      password: form.password,
      name: form.name.trim(),
      companyName: form.companyName.trim()
    })

    if (response.data.success) {
      message.success('注册成功，企业空间已创建，即将跳转到工作台')
      setTimeout(() => {
        router.push('/workspace')
      }, 1500)
    } else {
      throw new Error(response.data.message || '注册失败')
    }
  } catch (e) {
    console.error('注册失败:', e)
    message.error(e.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const sendCode = () => {
  if (!form.phone || form.phone.length !== 11) {
    message.warning('请先输入正确的手机号')
    return
  }
  message.success(`验证码已发送到 ${form.phone}`)
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
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8faff;
  padding: 40px;
}

/* 内容容器 - 固定宽度 1200px */
.register-container {
  width: 1200px;
  max-width: 100%;
  display: flex;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* 左侧区域 */
.register-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 50px;
  background: #f0f5ff;
  position: relative;
  overflow: hidden;
}

.register-left::before {
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
  max-width: 600px;
  color: #1a202c;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
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
  margin-bottom: 28px;
}

.gradient-text {
  background: linear-gradient(135deg, #1677ff 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.features-section {
  margin-bottom: 28px;
}

.feature-item {
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
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
  padding-top: 20px;
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
.register-right {
  width: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 50px;
  background: #ffffff;
}

.right-content {
  width: 100%;
  max-width: 400px;
}

.register-header {
  margin-bottom: 24px;
}

.register-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
  line-height: 1.4;
}

.register-subtitle {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

.register-subtitle a {
  color: #1677ff;
  text-decoration: none;
}

.register-subtitle a:hover {
  text-decoration: underline;
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

.register-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #64748b;
}

.register-footer a {
  color: #1677ff;
  text-decoration: none;
  font-weight: 500;
}

.register-footer a:hover {
  text-decoration: underline;
}

/* 表单样式 - Ant Design Vue 4.x */
:deep(.ant-input-outlined) {
  height: 40px !important;
  border-radius: 8px !important;
  font-size: 14px !important;
}

:deep(.ant-input-outlined .ant-input) {
  border: 1px solid #d9d9d9 !important;
}

:deep(.ant-input-affix-wrapper) {
  height: 40px !important;
  border-radius: 8px !important;
  font-size: 14px !important;
}

:deep(.ant-input-affix-wrapper .ant-input) {
  border: none !important;
  box-shadow: none !important;
}

:deep(.ant-input::placeholder) {
  font-size: 13px !important;
  color: #9ca3af !important;
}

:deep(.ant-select) {
  width: 100% !important;
}

:deep(.ant-select-selector) {
  height: 40px !important;
  border-radius: 8px !important;
  border: 1px solid #d9d9d9 !important;
}

:deep(.ant-select-selection-placeholder) {
  font-size: 13px !important;
  color: #9ca3af !important;
  opacity: 1 !important;
  display: block !important;
  position: absolute !important;
  left: 12px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  line-height: 40px !important;
}

:deep(.ant-select-selection-item) {
  color: #1a202c !important;
  font-size: 14px !important;
  line-height: 40px !important;
}

:deep(.ant-select) {
  width: 100% !important;
}

:deep(.ant-select-selector) {
  height: 44px !important;
  border-radius: 8px !important;
  border: 1px solid #d9d9d9 !important;
}

:deep(.ant-select-selection-placeholder) {
  font-size: 13px !important;
  color: #9ca3af !important;
}

:deep(.ant-select-focused .ant-select-selector) {
  border-color: #1677ff !important;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1) !important;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500 !important;
  color: #374151 !important;
  font-size: 14px !important;
}

:deep(.ant-checkbox-wrapper) {
  font-size: 13px !important;
  color: #64748b !important;
}

:deep(.ant-checkbox-wrapper a) {
  color: #1677ff !important;
}

:deep(.ant-btn) {
  font-size: 14px !important;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .register-left {
    display: none;
  }
  
  .register-right {
    width: 100%;
  }
}
</style>
