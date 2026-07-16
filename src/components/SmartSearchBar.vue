<template>
  <div class="smart-search-bar">
    <div class="search-glow"></div>
    <div class="search-input-container">
      <a-input
        v-model:value="searchQuery"
        placeholder="搜索政策、行业动态，或直接提问（如：'最近有哪些利好政策？'）"
        size="large"
        allow-clear
        @pressEnter="handleSearch"
      >
        <template #suffix>
          <a-button 
            type="primary" 
            class="ai-search-btn"
            @click="handleSearch"
            :loading="isLoading"
          >
            <span class="ai-icon"><SearchOutlined /></span>
            AI 搜问
          </a-button>
        </template>
      </a-input>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const searchQuery = ref('')
const isLoading = ref(false)

const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    message.warning('请输入搜索内容')
    return
  }

  isLoading.value = true

  setTimeout(() => {
    isLoading.value = false
    router.push({
      path: '/search',
      query: {
        q: searchQuery.value,
        aiMode: true
      }
    })
  }, 600)
}
</script>

<style scoped>
.smart-search-bar {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.search-input-container {
  position: relative;
}

.search-input-container .ant-input {
  padding-right: 160px;
  border-radius: 28px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(22, 119, 255, 0.2);
  box-shadow: 
    0 4px 16px rgba(22, 119, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.search-input-container .ant-input:hover {
  border-color: rgba(22, 119, 255, 0.4);
  box-shadow: 
    0 6px 24px rgba(22, 119, 255, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  /* 移除 transform，避免跳动 */
}

.search-input-container .ant-input:focus {
  border-color: #1677ff;
  box-shadow: 
    0 8px 32px rgba(22, 119, 255, 0.18),
    0 0 0 4px rgba(22, 119, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  background: rgba(255, 255, 255, 1);
}

.search-input-container .ant-input::placeholder {
  color: #8c9cb5;
  font-style: italic;
}

/* AI 搜问按钮 - 灰底风格 */
.ai-search-btn {
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  padding: 0 24px;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  color: #595959;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.ai-search-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  transition: left 0.5s;
}

.ai-search-btn:hover {
  background: #fff;
  border-color: #1677ff;
  color: #1677ff;
  box-shadow: 0 4px 16px rgba(22, 119, 255, 0.15);
}

.ai-search-btn:hover::before {
  left: 100%;
}

.ai-search-btn:active {
  background: #e6e6e6;
}

.ai-search-btn.loading {
  background: #f0f0f0;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.ai-icon {
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  transition: color 0.3s;
}

.ai-search-btn:hover .ai-icon {
  color: #1677ff;
}
</style>
