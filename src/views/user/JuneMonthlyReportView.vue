<template>
  <div class="june-report-page">
    <main class="report-shell">
      <section class="report-header-card">
        <div class="report-summary-row">
          <img :src="monthlyReportIcon" alt="月报图标" class="report-icon" />
          <div class="report-heading">
            <h1>{{ report.title }}</h1>
            <p>2026年6月（2026.06.01—2026.06.30）</p>
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
              <a :href="activeTabConfig.path" class="action-button" download>
                <DownloadOutlined />
              </a>
            </a-tooltip>
          </div>
        </div>

        <nav class="report-tabs" aria-label="月报内容导航">
          <button
            v-for="tab in reportTabs"
            :key="tab.value"
            type="button"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </nav>
      </section>

      <section class="report-content" :aria-label="activeTabConfig.label">
        <iframe
          :key="activeTab"
          ref="iframeRef"
          :src="activeTabConfig.path"
          :title="`${activeTabConfig.label}报告内容`"
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
import { monthlyReportIcon } from '@/data/reportTypeIcons.js'
import { presetReports } from '@/data/reportRecords.js'
import {
  isReportFavorited,
  removeReportFavorite,
  saveReportFavorite,
} from '@/utils/reportFavorites.js'

const report = presetReports.find((item) => item.id === 'monthly_2026_06')
const reportTabs = [
  {
    value: 'market',
    label: '市场洞察',
    path: '/report-content/2026-06/market-insight.html',
  },
  {
    value: 'policy',
    label: '政策速递',
    path: '/report-content/2026-06/policy-express.html',
  },
  {
    value: 'industry',
    label: '行业动态',
    path: '/report-content/2026-06/industry-dynamics.html',
  },
  {
    value: 'competitor',
    label: '友商动态',
    path: '/report-content/2026-06/competitor-dynamics.html',
  },
]

const activeTab = ref('market')
const activeTabConfig = computed(() => (
  reportTabs.find((tab) => tab.value === activeTab.value) || reportTabs[0]
))
const favorited = ref(isReportFavorited(report.id))
const iframeRef = ref(null)
const iframeHeight = ref(900)
let frameObserver = null

const updateFrameHeight = () => {
  const frameDocument = iframeRef.value?.contentDocument
  if (!frameDocument) return
  const bodyHeight = frameDocument.body?.scrollHeight || 0
  const documentHeight = frameDocument.documentElement?.scrollHeight || 0
  iframeHeight.value = Math.max(720, bodyHeight, documentHeight)
}

const handleFrameLoad = () => {
  frameObserver?.disconnect()
  frameObserver = null

  nextTick(() => {
    updateFrameHeight()
    const frameDocument = iframeRef.value?.contentDocument
    if (!frameDocument || typeof ResizeObserver === 'undefined') return

    frameObserver = new ResizeObserver(updateFrameHeight)
    if (frameDocument.documentElement) frameObserver.observe(frameDocument.documentElement)
    if (frameDocument.body) frameObserver.observe(frameDocument.body)
    frameDocument.addEventListener('click', updateFrameHeight)
  })
}

const toggleFavorite = () => {
  if (favorited.value) {
    removeReportFavorite(report.id)
    favorited.value = false
    message.success('已取消收藏')
    return
  }

  saveReportFavorite(report)
  favorited.value = true
  message.success('已收藏')
}

watch(activeTab, () => {
  frameObserver?.disconnect()
  frameObserver = null
  iframeHeight.value = 900
})

onBeforeUnmount(() => {
  frameObserver?.disconnect()
})
</script>

<style scoped>
.june-report-page {
  min-height: 100vh;
  background: #f3f5f8;
  color: #1f2329;
}

.report-shell {
  width: min(1280px, calc(100% - 48px));
  margin: 0 auto;
  padding: 24px 0 56px;
}

.report-header-card {
  overflow: hidden;
  border-radius: 12px 12px 0 0;
  background: #fff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
}

.report-summary-row {
  min-height: 112px;
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
  .report-shell {
    width: min(100% - 24px, 1280px);
    padding-top: 12px;
  }

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
