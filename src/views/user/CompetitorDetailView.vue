<template>
  <div class="competitor-detail-page">
    <TopNav />

    <main class="detail-page-content">
      <div v-if="item" class="detail-layout-shell">
        <button class="back-button" type="button" aria-label="返回友商动态列表" @click="goBack">
          <LeftOutlined />
        </button>

        <div class="detail-columns">
          <section class="source-card" aria-label="友商信息原文">
            <div v-if="!frameLoaded" class="frame-loading">
              <LoadingOutlined spin />
              <span>正在加载友商原文网页</span>
            </div>

            <button v-if="item.sourceUrl" class="open-original" type="button" @click="openOriginal">
              新窗口打开原文 <ExportOutlined />
            </button>

            <iframe
              v-if="item.sourceUrl"
              :key="item.id"
              class="source-frame"
              :src="iframeSrc"
              :title="`${item.title}原文`"
              sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts"
              referrerpolicy="no-referrer-when-downgrade"
              @load="frameLoaded = true"
            />

            <div v-else class="source-empty">
              <h2>{{ item.title }}</h2>
              <p>{{ item.content || '暂无原文内容' }}</p>
            </div>
          </section>

          <aside class="analysis-card" aria-label="智能友商分析">
            <header class="analysis-header">
              <span class="ai-badge">AI<sup>+</sup></span>
              <h1>智能友商分析</h1>
            </header>

            <div class="analysis-scroll">
              <section class="analysis-section overview-section">
                <h2><AppstoreOutlined /> 概览</h2>
                <div class="analysis-content-box overview-box">
                  <p>{{ overview }}</p>
                </div>
              </section>

              <section class="analysis-section core-section">
                <h2><AimOutlined /> 核心要点（与企业相关）</h2>
                <div class="analysis-content-box core-box">
                  <h3>{{ item.competitorName }}竞争动态分析</h3>
                  <ul>
                    <li v-for="point in analysisPoints" :key="point">{{ point }}</li>
                  </ul>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>

      <a-result v-else status="404" title="未找到该友商动态" sub-title="这条信息可能已被移除或链接已失效">
        <template #extra>
          <a-button type="primary" @click="goBack">返回友商动态</a-button>
        </template>
      </a-result>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AimOutlined,
  AppstoreOutlined,
  ExportOutlined,
  LeftOutlined,
  LoadingOutlined
} from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'
import { competitorRecords } from '@/data/competitorRecords'

const route = useRoute()
const router = useRouter()
const frameLoaded = ref(false)

const item = computed(() => competitorRecords.find((record) => record.id === route.params.id))
const iframeSrc = computed(() => {
  if (!item.value?.sourceUrl) return ''

  const params = new URLSearchParams({
    url: item.value.sourceUrl,
    title: item.value.title || '',
    summary: item.value.content || '',
    source: item.value.competitorName || item.value.channel || '',
    date: item.value.publishDate || '',
    view: 'full-article-v2'
  })
  return `/industry-source?${params.toString()}`
})

const overview = computed(() => item.value?.content || '该动态暂未生成内容概览。')

const analysisPoints = computed(() => {
  const raw = String(item.value?.analysis || '')
    .replace(/^【核心要点】/, '')
    .replace(/\s+/g, ' ')
    .trim()
  const points = raw
    .split(/(?=[①②③④⑤⑥⑦⑧⑨⑩])/)
    .map((point) => point.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]/, '').replace(/[；。]\s*$/, '').trim())
    .filter(Boolean)

  return points.length ? points : ['该动态暂未生成企业关联分析。']
})

const goBack = () => {
  router.push({ name: 'CompetitorList' })
}

const openOriginal = () => {
  if (!item.value?.sourceUrl) return
  window.open(item.value.sourceUrl, '_blank', 'noopener,noreferrer')
}

watch(() => route.params.id, () => {
  frameLoaded.value = false
})
</script>

<style scoped>
.competitor-detail-page {
  height: 100vh;
  padding-top: 64px;
  overflow: hidden;
  background: #f2f4f7;
}

.detail-page-content {
  height: calc(100vh - 64px);
  padding: 32px 34px 34px;
}

.detail-layout-shell {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 18px;
  width: min(1460px, 100%);
  height: 100%;
  min-height: 0;
  margin: 0 auto;
}

.back-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-top: 2px;
  color: #5f6b7a;
  font-size: 18px;
  background: #fff;
  border: 0;
  border-radius: 50%;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.1);
  cursor: pointer;
  transition: color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.back-button:hover {
  color: #1677ff;
  box-shadow: 0 6px 18px rgba(22, 119, 255, 0.16);
  transform: translateX(-2px);
}

.detail-columns {
  display: grid;
  grid-template-columns: minmax(0, 1.48fr) minmax(390px, 1fr);
  gap: 16px;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.source-card,
.analysis-card {
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  background: #fff;
  border: 1px solid #eaedf2;
  border-radius: 10px;
}

.source-card {
  position: relative;
}

.source-frame {
  display: block;
  width: 100%;
  height: 100%;
  background: #fff;
  border: 0;
}

.frame-loading {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #8090a4;
  font-size: 14px;
  background: #fff;
}

.open-original {
  position: absolute;
  top: 12px;
  right: 22px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 11px;
  color: #fff;
  font-size: 12px;
  background: rgba(12, 55, 95, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 5px;
  cursor: pointer;
  backdrop-filter: blur(5px);
}

.open-original:hover {
  background: rgba(12, 55, 95, 0.92);
}

.source-empty {
  height: 100%;
  padding: 42px;
  overflow-y: auto;
  color: #344054;
  font-size: 15px;
  line-height: 2;
}

.source-empty h2 {
  margin: 0 0 24px;
  color: #202938;
  font-size: 24px;
  line-height: 1.5;
}

.source-empty p {
  margin: 0;
  white-space: pre-wrap;
}

.analysis-card {
  display: flex;
  flex-direction: column;
}

.analysis-header {
  display: flex;
  flex: 0 0 58px;
  align-items: center;
  gap: 11px;
  padding: 0 18px;
  border-bottom: 1px solid #edf0f4;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(145deg, #2388ff, #075fff);
  border-radius: 7px;
}

.ai-badge sup {
  position: relative;
  top: -5px;
  margin-left: 1px;
  font-size: 10px;
}

.analysis-header h1 {
  margin: 0;
  color: #202938;
  font-size: 18px;
  font-weight: 600;
}

.analysis-scroll {
  flex: 1;
  min-height: 0;
  padding: 15px 16px 22px;
  overflow-y: auto;
  scrollbar-color: #d9e0ea transparent;
  scrollbar-width: thin;
}

.analysis-section + .analysis-section {
  margin-top: 16px;
}

.analysis-section h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  color: #1677ff;
  font-size: 15px;
  font-weight: 600;
  line-height: 24px;
}

.analysis-content-box {
  color: #344054;
  font-size: 14px;
  line-height: 1.86;
  background: #f7f8fa;
  border-radius: 8px;
}

.overview-box {
  padding: 14px 16px;
}

.overview-box p {
  margin: 0;
  text-align: justify;
}

.core-box {
  padding: 13px 15px 16px;
}

.core-box h3 {
  margin: 0 0 7px;
  color: #273142;
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
}

.core-box ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.core-box li {
  position: relative;
  margin: 0;
  padding-left: 15px;
  text-align: justify;
}

.core-box li + li {
  margin-top: 7px;
}

.core-box li::before {
  position: absolute;
  top: 0;
  left: 1px;
  color: #566579;
  content: '·';
  font-weight: 700;
}

@media (max-width: 1100px) {
  .competitor-detail-page {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .detail-page-content {
    height: auto;
    padding: 22px 20px 32px;
  }

  .detail-layout-shell {
    grid-template-columns: 42px minmax(0, 1fr);
    height: auto;
  }

  .detail-columns {
    grid-template-columns: 1fr;
    height: auto;
  }

  .source-card,
  .analysis-card {
    height: 720px;
  }
}
</style>
