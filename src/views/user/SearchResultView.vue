<template>
  <div class="search-result-page">
    <TopNav />
    <div class="page-container">
      <!-- 搜索框 -->
      <div class="page-header">
        <div class="header-inner">
          <button class="back-btn" @click="handleBack">返回</button>
          <div class="search-wrapper">
            <a-input
              v-model:value="searchQuery"
              placeholder="搜索政策、行业动态，或直接提问"
              size="large"
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
      </div>

      <!-- AI 回答 -->
      <div v-if="hasSearched && aiAnswerData" class="ai-section">
        <div class="ai-card">
          <div class="ai-header">
            <span class="ai-badge"><StarOutlined /> AI 智能概览</span>
            <a-button type="text" @click="showAI = !showAI">
              {{ showAI ? '收起' : '展开' }}
              <span :style="{transform: showAI ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'inline-block', transition: 'transform 0.3s'}">▼</span>
            </a-button>
          </div>
          <div class="ai-content" :style="{maxHeight: showAI ? '200px' : '0', overflow: showAI ? 'auto' : 'hidden', transition: 'max-height 0.3s ease, overflow 0.3s ease'}">
            <div class="ai-text-scroll">
              <!-- 流式输出内容 -->
              <div class="ai-text" v-html="renderedAnswer"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选 Tab -->
      <div v-if="results.length > 0" class="filter-tabs">
        <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
          <a-tab-pane key="all" :tab="`全部 (${results.length})`"></a-tab-pane>
          <a-tab-pane key="policy" :tab="`政策 (${policyCount})`"></a-tab-pane>
          <a-tab-pane key="industry" :tab="`行业 (${industryCount})`"></a-tab-pane>
          <a-tab-pane key="competitor" :tab="`友商 (${competitorCount})`"></a-tab-pane>
          <a-tab-pane key="bid" :tab="`中标 (${bidCount})`"></a-tab-pane>
        </a-tabs>
      </div>

      <!-- 结果列表 -->
      <div v-if="results.length > 0" class="results-list">
        <div class="result-item" v-for="(item, i) in filteredResults" :key="i">
          <div class="result-type"><component :is="getIcon(item.type)" /> {{ getType(item.type) }}</div>
          <router-link :to="item.url" class="result-title">{{ item.title }}</router-link>
          <div class="result-snippet">{{ item.snippet }}</div>
          <div class="result-meta">
            <span>{{ item.source }}</span>
            <span>{{ item.date }}</span>
          </div>
        </div>
      </div>

      <!-- 加载/无结果 -->
      <div v-if="isLoading && !aiAnswerData" class="loading"><a-spin tip="搜索中..." :size="large" /></div>
      <div v-else-if="hasSearched && results.length === 0" class="empty">
        <p>暂无结果，试试换个关键词？</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SearchOutlined, ReloadOutlined, StarOutlined, FileOutlined, ApartmentOutlined, RadarChartOutlined, TrophyOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const isLoading = ref(false)
const hasSearched = ref(false)
const showAI = ref(true)
const activeTab = ref('all')
const aiAnswerData = ref(null)
const results = ref([])
const streamText = ref('')
const isStreaming = ref(false)

// 返回上一页
const handleBack = () => {
  router.back()
}

const filteredResults = computed(() => activeTab.value === 'all' ? results.value : results.value.filter(r => r.type === activeTab.value))
const policyCount = computed(() => results.value.filter(r => r.type === 'policy').length)
const industryCount = computed(() => results.value.filter(r => r.type === 'industry').length)
const competitorCount = computed(() => results.value.filter(r => r.type === 'competitor').length)
const bidCount = computed(() => results.value.filter(r => r.type === 'bid').length)

const renderedAnswer = computed(() => {
  if (isStreaming.value && streamText.value === '') {
    // 刚开始流式输出时，显示思考中提示
    return '<div class="thinking">正在思考中...</div>'
  }
  if (isStreaming.value) {
    // 流式输出中
    const text = streamText.value
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
  }
  // 输出完成
  const text = aiAnswerData.value?.text || ''
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
})

const mockData = {
  policy: { 
    text: '根据您的需求，**共找到 3 项相关政策**，主要集中在**人工智能**领域：\n\n1. **《高新技术企业认定管理办法》** - 科技部发布\n2. **《新一代人工智能发展规划》** - 重点支持大模型研发\n3. **《数字经济促进法》** - 公开征求意见\n\n💡 **核心影响**：政策红利持续释放，预计未来 3 个月相关企业将获得更多税收优惠。', 
    stats: [] 
  },
  industry: { 
    text: '本周**行业动态监测**显示，软件行业整体呈现**增长态势**：\n\n- **市场规模**：达到 2.1 万亿元，同比增长 15.3%\n- **重点热点**：人工智能、云计算、网络安全\n- **主要趋势**：企业数字化转型加速\n\n📊 **数据亮点**：新增企业 1,234 家，融资事件 45 起。', 
    stats: [] 
  },
  competitor: { 
    text: '本周**友商动态监测**覆盖 12 家主要竞争对手：\n\n**重点动态**：\n1. **华为云**：发布盘古大模型 3.0\n2. **阿里云**：推出企业级 AI 助手\n3. **腾讯云**：与 50 家伙伴达成合作\n\n**风险提示**：2 家友商发布降价策略（降幅 10-15%）。', 
    stats: [] 
  },
  default: { 
    text: '收到您的提问！正在分析**全量数据**（政策、行业、友商、中标）：\n\n📊 **综合概览**：\n- **政策环境**：本周发布 3 项政策，整体利好\n- **行业动态**：市场规模 2.1 万亿，增长 15.3%\n- **友商动态**：监测 12 家企业，2 家降价预警\n\n💡 **建议**：查看详细政策原文，关注降价友商动态。', 
    stats: [] 
  }
}

const mockResults = [
  { type:'policy', title:'关于印发《高新技术企业认定管理办法》的通知', snippet:'为进一步规范高新技术企业认定工作，提高认定质量，现印发本办法，请遵照执行。', source:'科技部', date:'2026-05-06', url:'/policy/1' },
  { type:'policy', title:'新一代人工智能发展规划实施细则', snippet:'为贯彻落实《新一代人工智能发展规划》，制定本实施细则，重点支持大模型技术研发。', source:'科技部', date:'2026-05-05', url:'/policy/2' },
  { type:'industry', title:'2026 年 4 月软件行业月度报告', snippet:'本月软件行业市场规模达到 2.1 万亿元，同比增长 15.3%，人工智能领域增长最快。', source:'工信部', date:'2026-05-04', url:'/industry/1' },
  { type:'competitor', title:'华为云发布盘古大模型 3.0', snippet:'华为云正式推出盘古大模型 3.0 版本，在自然语言处理和图像识别方面实现重大突破。', source:'华为云', date:'2026-05-03', url:'/competitor/1' },
  { type:'bid', title:'某市智慧城市建设项目招标公告', snippet:'某市发布智慧城市建设项目招标公告，预算金额 3.2 亿元，主要建设数据中心和物联网平台。', source:'政府采购网', date:'2026-05-02', url:'/bid/1' }
]

const getIcon = t => ({policy:FileOutlined,industry:ApartmentOutlined,competitor:RadarChartOutlined,bid:TrophyOutlined}[t] || FileOutlined)
const getType = t => ({policy:'政策',industry:'行业',competitor:'友商',bid:'中标'}[t] || '其他')

const streamAnswer = async (fullText) => {
  // 先显示思考状态
  streamText.value = '<span class="thinking">💭 正在思考中...</span>'
  isStreaming.value = true
  
  // 等待 2 秒思考时间
  await new Promise(r => setTimeout(r, 2000))
  
  // 开始流式输出
  streamText.value = ''
  const chars = fullText.split('')
  for (let i = 0; i < chars.length; i++) {
    streamText.value += chars[i]
    await nextTick()
    await new Promise(r => setTimeout(r, 15))
  }
  
  isStreaming.value = false
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  isLoading.value = true
  hasSearched.value = true
  showAI.value = true
  aiAnswerData.value = null
  results.value = []
  streamText.value = ''
  isStreaming.value = false
  
  await new Promise(r => setTimeout(r, 600))
  
  const intent = /政策 | 文件 | 通知/.test(searchQuery.value) ? 'policy' : 
                 /行业 | 市场 | 趋势/.test(searchQuery.value) ? 'industry' : 
                 /友商 | 竞争 | 对手/.test(searchQuery.value) ? 'competitor' : 'default'
  
  // 先设置数据，让容器显示
  aiAnswerData.value = mockData[intent]
  results.value = mockResults
  isLoading.value = false
  
  // 立即开始流式输出
  await streamAnswer(aiAnswerData.value.text)
}

const handleTabChange = k => activeTab.value = k

onMounted(() => {
  const q = route.query.q
  if (q) {
    searchQuery.value = q
    handleSearch()
  }
})
</script>

<style scoped>
.search-result-page { min-height: 100vh; background: #f5f5f5; }
.page-container { max-width: 1200px; margin: 0 auto; padding: 24px 16px; padding-top: 80px; }
.page-header {
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 16px auto 24px auto;
  background: transparent;
  padding: 0;
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 1200px;
  background: #ffffff;
  padding: 16px 24px 16px 24px;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.back-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 15px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:hover {
  color: #1677ff;
  background: rgba(22,119,255,0.06);
}

.search-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
}

.search-wrapper .ant-input-affix-wrapper {
  width: 800px !important;
}

.search-wrapper .ant-input {
  width: 800px !important;
  padding-right: 160px;
  border-radius: 28px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 2px solid rgba(22, 119, 255, 0.2);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.search-wrapper .ant-input:hover {
  border-color: rgba(22, 119, 255, 0.4);
}

.search-wrapper .ant-input:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 4px rgba(22, 119, 255, 0.1);
}

/* AI 搜问按钮 - 灰底风格 */
.ai-search-btn {
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  padding: 0 20px;
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  color: #595959;
  display: flex;
  align-items: center;
  gap: 6px;
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
  font-size: 14px; /* 缩小图标 */
  display: inline-flex;
  align-items: center;
  transition: color 0.3s;
}

.ai-search-btn:hover .ai-icon {
  color: #1677ff;
}
.ai-section { margin-bottom: 24px; }
.ai-card { background: #fff; border-radius: 12px; border: 1px solid #e8e8e8; overflow: hidden; }
.ai-header { display: flex; justify-content: space-between; padding: 12px 20px; background: linear-gradient(135deg, #f0f7ff, #e6f4ff); border-bottom: 1px solid #e8e8e8; }
.ai-badge { font-weight: 600; color: #1677ff; font-size: 14px; display: flex; align-items: center; gap: 6px; }
.ai-content { padding: 20px; position: relative; }
.ai-text-scroll { padding-right: 8px; min-height: 60px; }
.ai-text-scroll::-webkit-scrollbar { width: 6px; }
.ai-text-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
.ai-text-scroll::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
.ai-text-scroll::-webkit-scrollbar-thumb:hover { background: #a1a1a1; }
.ai-text { font-size: 15px; line-height: 1.8; color: #1a202c; }
.ai-text strong { font-weight: 600; }
.thinking { color: #64748b; font-style: italic; display: flex; align-items: center; gap: 8px; }
.thinking::before { content: '⏳'; animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* 骨架屏动画 */
.skeleton { animation: pulse 1.5s ease-in-out infinite; }
.skeleton-line { height: 14px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); margin-bottom: 12px; border-radius: 4px; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

.filter-tabs { margin-bottom: 16px; background: #fff; padding: 12px; border-radius: 8px; }
.results-list { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.result-item { padding: 16px; border: 1px solid #f0f0f0; border-radius: 8px; margin-bottom: 12px; transition: all 0.2s; }
.result-item:hover { border-color: #1677ff; box-shadow: 0 2px 8px rgba(22,119,255,0.08); }
.result-type { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; padding: 4px 8px; background: #f0f7ff; color: #1677ff; border-radius: 4px; margin-bottom: 8px; }
.result-title { font-size: 16px; font-weight: 600; color: #1677ff; text-decoration: none; display: block; margin-bottom: 8px; }
.result-title:hover { text-decoration: underline; }
.result-snippet { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 8px; }
.result-meta { font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; }
.loading, .empty { text-align: center; padding: 60px; color: #64748b; }
</style>
