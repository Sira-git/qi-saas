<template>
  <div class="space-create-page">
    <!-- 统一顶部导航 -->
    <TopNav />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-container header-inner">
        <button class="back-btn" @click="router.push('/space')">
          <ArrowLeftOutlined /> 返回
        </button>
        <h1>创建企业空间</h1>
        <div class="header-placeholder"></div>
      </div>
    </div>

    <div class="page-container">
      <!-- 企业名称 -->
      <div class="form-card">
        <h2 class="section-title">基本信息</h2>
        <a-form ref="formRef" :model="form" layout="vertical" @finish="handleCreate">
          <a-form-item label="企业名称" name="name" :rules="[{ required: true, message: '请输入企业名称' }]">
            <a-input v-model:value="form.name" placeholder="请输入企业名称" />
          </a-form-item>
        </a-form>
      </div>

      <!-- 选择套餐 -->
      <div class="form-card">
        <h2 class="section-title">选择套餐</h2>
        <div class="package-wrapper">
          <div class="package-grid">
            <label
              v-for="pkg in packages"
              :key="pkg.value"
              class="package-option"
              :class="{ active: form.package === pkg.value }"
              @click="form.package = pkg.value"
            >
              <div class="package-card">
                <div class="package-header">
                  <div class="package-name">{{ pkg.name }}</div>
                  <div class="package-price">¥{{ pkg.price }}<span>/月</span></div>
                </div>
                <ul class="package-features">
                  <li v-for="feature in pkg.features" :key="feature">{{ feature }}</li>
                </ul>
              </div>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <a-button @click="router.push('/space')">取 消</a-button>
          <a-button type="primary" :loading="creating" @click="handleCreate">确认创建</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'

const router = useRouter()
const formRef = ref(null)
const creating = ref(false)

const form = ref({
  name: '',
  package: 'free',
})

const packages = [
  {
    value: 'free',
    name: '免费版',
    price: 0,
    features: ['1 个子账号（仅 1 个月）（仅 1 个月）', '3 个竞品监控', '基础功能'],
  },
  {
    value: 'basic',
    name: '基础版',
    price: 399,
    features: ['3 个子账号', '10 个竞品监控', '基础预警功能'],
  },
  {
    value: 'advanced',
    name: '高级版',
    price: 899,
    features: ['10 个子账号', '50 个竞品监控', '高级预警 + 智能分析'],
  },
]

const handleCreate = () => {
  if (!form.value.name.trim()) {
    message.warning('请输入企业名称')
    return
  }
  creating.value = true
  setTimeout(() => {
    message.success(`「${form.value.name}」创建成功！`)
    creating.value = false
    router.push('/space')
  }, 800)
}
</script>

<style scoped>
.space-create-page {
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  position: relative;
}

.header-inner h1 {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.header-placeholder {
  width: 60px;
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

.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin: 24px 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1a202c;
}

/* 套餐卡片 */
.package-wrapper {
  margin-bottom: 24px;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.package-option {
  cursor: pointer;
  display: block;
}

.package-card {
  padding: 24px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.package-option.active .package-card {
  border-color: #4096ff;
  background: #f0f5ff;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.2);
}

.package-option:not(.active):hover .package-card {
  border-color: #d9d9d9;
}

.package-header {
  margin-bottom: 16px;
}

.package-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
}

.package-price {
  font-size: 28px;
  font-weight: 700;
  color: #4096ff;
}

.package-price span {
  font-size: 14px;
  font-weight: 400;
  color: #64748b;
}

.package-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.package-features li {
  padding: 6px 0;
  color: #64748b;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.package-features li::before {
  content: '✓';
  color: #4096ff;
  font-weight: 700;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .package-grid {
    grid-template-columns: 1fr;
  }
}
</style>
