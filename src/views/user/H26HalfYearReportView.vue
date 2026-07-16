<template>
  <div class="h26-report-page">
    <main class="report-shell">
      <section class="report-header-card">
        <div class="report-summary-row">
          <img :src="halfYearReportIcon" alt="半年报图标" class="report-icon" />
          <div class="report-heading">
            <h1>{{ report.title }}</h1>
            <p>2026年上半年（2026.01.01—2026.06.30）</p>
          </div>

          <div class="report-actions">
            <a-tooltip :title="favorited ? '取消收藏' : '收藏报告'">
              <button
                type="button"
                class="action-button"
                :class="{ favorited }"
                @click="toggleFavorite"
              >
                <StarFilled v-if="favorited" />
                <StarOutlined v-else />
              </button>
            </a-tooltip>
            <a-tooltip title="下载当前内容">
              <a :href="activeFramePath" class="action-button" download>
                <DownloadOutlined />
              </a>
            </a-tooltip>
          </div>
        </div>

        <nav class="report-tabs" aria-label="年报内容导航">
          <button
            v-for="tab in reportTabs"
            :key="tab.value"
            type="button"
            :class="{ active: activeTab === tab.value }"
            @click="selectReportTab(tab.value)"
          >
            {{ tab.label }}
          </button>
        </nav>
      </section>

      <section class="report-content" :aria-label="activeFrameLabel">
        <iframe
          :key="activeFramePath"
          ref="iframeRef"
          :src="activeFramePath"
          :title="activeFrameTitle"
          class="report-content-frame"
          :style="{ height: `${iframeHeight}px` }"
          @load="handleFrameLoad"
        />
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  DownloadOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons-vue'
import { halfYearReportIcon } from '@/data/reportTypeIcons.js'
import { presetReports } from '@/data/reportRecords.js'
import {
  isReportFavorited,
  removeReportFavorite,
  saveReportFavorite,
} from '@/utils/reportFavorites.js'

const report = presetReports.find((item) => item.id === 'halfyear_2026_h1')
const reportTabs = [
  {
    value: 'one-network',
    label: '一网通办',
    path: '/report-content/H26-2026/report-一网通办.html',
    dataPath: '/report-content/H26-2026/data-一网通办.html',
  },
  {
    value: 'collaboration',
    label: '一网协同',
    path: '/report-content/H26-2026/report-一网协同.html',
    dataPath: '/report-content/H26-2026/data-一网协同.html',
  },
  {
    value: 'ai',
    label: '人工智能',
    path: '/report-content/H26-2026/report-人工智能.html',
    dataPath: '/report-content/H26-2026/data-人工智能.html',
  },
  {
    value: 'portal',
    label: '门户网站',
    path: '/report-content/H26-2026/report-门户网站.html',
    dataPath: '/report-content/H26-2026/data-门户网站.html',
  },
  {
    value: 'data',
    label: '数据要素',
    path: '/report-content/H26-2026/report-数据要素.html',
    dataPath: '/report-content/H26-2026/data-数据要素.html',
  },
  {
    value: 'market',
    label: '市场监管',
    path: '/report-content/H26-2026/report-市场监管.html',
    dataPath: '/report-content/H26-2026/data-市场监管.html',
  },
]

const H26_CONTENT_ROOT = '/report-content/H26-2026/'
const activeTab = ref('one-network')
const activeTabConfig = computed(() => (
  reportTabs.find((tab) => tab.value === activeTab.value)
))
const isDataView = ref(false)
const activeDataPath = ref('')
const activeFramePath = computed(() => (
  isDataView.value && activeDataPath.value ? activeDataPath.value : activeTabConfig.value.path
))
const activeFrameLabel = computed(() => (
  isDataView.value ? `${activeTabConfig.value.label}来源数据` : activeTabConfig.value.label
))
const activeFrameTitle = computed(() => (
  isDataView.value
    ? `${activeTabConfig.value.label}原始数据列表`
    : `${activeTabConfig.value.label}报告内容`
))

const iframeRef = ref(null)
const iframeHeight = ref(600)
const frameObserver = ref(null)
const removeFrameClickListener = ref(null)

const normalizeH26Path = (href) => {
  if (!href) return ''
  if (href.startsWith('/')) return href
  if (/^https?:\/\//i.test(href)) {
    try {
      const parsed = new URL(href)
      return `${parsed.pathname}${parsed.search}`
    } catch {
      return href
    }
  }
  return `${H26_CONTENT_ROOT}${href.replace(/^\.\//, '')}`
}

const buildDataPath = (sourceType = 'policy') => {
  const query = new URLSearchParams({
    type: sourceType,
    domain: activeTabConfig.value.label,
    start: '2026-01',
    end: '2026-06',
  })
  return `${activeTabConfig.value.dataPath}?${query.toString()}`
}

const openDataView = (sourceType = 'policy') => {
  activeDataPath.value = buildDataPath(sourceType)
  isDataView.value = true
  iframeHeight.value = 720
}

const openDataViewFromHref = (href) => {
  activeDataPath.value = normalizeH26Path(href)
  isDataView.value = true
  iframeHeight.value = 720
}

const showReportView = () => {
  isDataView.value = false
  activeDataPath.value = ''
  iframeHeight.value = 720
}

const selectReportTab = (tabValue) => {
  activeTab.value = tabValue
  showReportView()
}

const cleanupFrameBindings = () => {
  frameObserver.value?.disconnect()
  frameObserver.value = null
  removeFrameClickListener.value?.()
  removeFrameClickListener.value = null
}

const bindFrameInteractions = (doc) => {
  const handleClick = (event) => {
    const target = event.target
    const sourceTag = target?.closest?.('.source-tag')
    if (sourceTag) {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation?.()
      openDataView(sourceTag.getAttribute('data-source') || 'policy')
      return
    }

    const anchor = target?.closest?.('a[href]')
    if (!anchor) return

    const href = anchor.getAttribute('href') || ''
    if (href.includes('data-') && href.includes('.html')) {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation?.()
      openDataViewFromHref(href)
      return
    }

    if (href.startsWith('report-') && href.endsWith('.html')) {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation?.()
      showReportView()
    }
  }

  doc.addEventListener('click', handleClick, true)
  removeFrameClickListener.value = () => {
    doc.removeEventListener('click', handleClick, true)
  }
}

const watchFrameSize = (doc) => {
  if (!doc.body) return
  frameObserver.value = new ResizeObserver(() => {
    updateFrameHeight(doc)
  })
  frameObserver.value.observe(doc.body)
}

const updateFrameHeight = (doc) => {
  const height = Math.max(
    doc.body.scrollHeight,
    doc.documentElement.scrollHeight,
  )
  iframeHeight.value = Math.max(height + 2, 600)
}

const handleFrameLoad = async () => {
  await nextTick()
  cleanupFrameBindings()
  try {
    const doc = iframeRef.value?.contentDocument
    if (doc) {
      updateFrameHeight(doc)
      bindFrameInteractions(doc)
      watchFrameSize(doc)
    }
  } catch {
    // cross-origin fallback
  }
}

const favorited = ref(isReportFavorited(report.id))

const toggleFavorite = () => {
  if (favorited.value) {
    removeReportFavorite(report.id)
    favorited.value = false
    message.success('已取消收藏')
  } else {
    saveReportFavorite({
      id: report.id,
      title: report.title,
      type: report.type,
      period_date: report.period_date,
    })
    favorited.value = true
    message.success('已收藏报告')
  }
}

watch(activeTab, () => {
  showReportView()
})

onBeforeUnmount(() => {
  cleanupFrameBindings()
})
</script>

<style scoped>
.h26-report-page {
  min-height: 100vh;
  background: #f0f2f5;
}

.report-shell {
  width: min(100% - 24px, 1280px);
  margin: 0 auto;
  padding-top: 24px;
}

.report-header-card {
  background: white;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.report-summary-row {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 22px 24px 18px;
}

.report-icon {
  width: 50px;
  height: 50px;
  display: block;
  border-radius: 9px;
  object-fit: cover;
}

.report-heading h1 {
  margin: 0 0 8px;
  color: #24282f;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
}

.report-heading p {
  margin: 0;
  color: #8a9099;
  font-size: 14px;
}

.report-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid #d9dce1;
  border-radius: 8px;
  background: #fff;
  color: #4b5563;
  font-size: 16px;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.action-button:hover {
  border-color: #91caff;
  color: #1677ff;
}

.action-button.favorited {
  border-color: #ffd666;
  background: #fffbe6;
  color: #faad14;
}

.report-tabs {
  display: flex;
  align-items: center;
  gap: 28px;
  height: 56px;
  padding: 0 24px;
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
}

.report-tabs button {
  position: relative;
  align-self: stretch;
  min-width: 92px;
  padding: 0 10px;
  border: 0;
  background: transparent;
  color: #5f6670;
  font-size: 15px;
  cursor: pointer;
}

.report-tabs button::after {
  position: absolute;
  right: 8px;
  bottom: 0;
  left: 8px;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: transparent;
  content: '';
}

.report-tabs button:hover,
.report-tabs button.active {
  color: #1677ff;
}

.report-tabs button.active {
  font-weight: 600;
}

.report-tabs button.active::after {
  background: #1677ff;
}

.report-content {
  overflow: hidden;
  border-radius: 0 0 12px 12px;
  background: #f0f2f5;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
}

.report-content-frame {
  width: 100%;
  min-height: 720px;
  display: block;
  border: 0;
  background: #f0f2f5;
}

@media (max-width: 720px) {
  .report-summary-row {
    grid-template-columns: 48px minmax(0, 1fr);
    padding: 18px 16px;
  }

  .report-icon {
    width: 44px;
    height: 44px;
  }

  .report-heading h1 {
    font-size: 17px;
  }

  .report-actions {
    grid-column: 2;
  }

  .report-tabs {
    gap: 6px;
    padding: 0 8px;
    overflow-x: auto;
  }

  .report-tabs button {
    min-width: 82px;
  }
}
</style>
