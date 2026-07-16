<template>
  <div class="dashboard-page">
    <!-- 时间筛选 + 刷新按钮-->
    <div class="filter-bar">
      <span class="filter-label">数据统计</span>
      <a-radio-group v-model:value="timeRange" button-style="solid" @change="fetchData">
        <a-radio-button value="7">7 日</a-radio-button>
        <a-radio-button value="30">30 日</a-radio-button>
        <a-radio-button value="custom">自定义</a-radio-button>
      </a-radio-group>
      <a-range-picker
        v-if="timeRange === 'custom'"
        v-model:value="customRange"
        class="custom-picker"
        @change="fetchData"
      />
      <a-button type="primary" @click="fetchData" style="margin-left: 16px">
        <ReloadOutlined /> 刷新
      </a-button>
    </div>

    <!-- 企业账户统计 -->
    <a-row :gutter="16" class="stat-row">
      <a-col :span="6">
        <div class="stat-card">
          <div class="stat-icon blue"><UsergroupAddOutlined /></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalEnterprise }}</div>
            <div class="stat-label">总注册企业</div>
          </div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="stat-card">
          <div class="stat-icon green"><UserAddOutlined /></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.todayNew }}</div>
            <div class="stat-label">今日新增</div>
          </div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="stat-card">
          <div class="stat-icon purple"><TeamOutlined /></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="stat-card">
          <div class="stat-icon orange"><StopOutlined /></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.disabledAccounts }}</div>
            <div class="stat-label">禁用账号</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 报告生成统计 -->
    <a-row :gutter="16" class="stat-row">
      <a-col :span="6">
        <div class="stat-card">
          <div class="stat-icon blue"><FileTextOutlined /></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalReports }}</div>
            <div class="stat-label">总报告数</div>
          </div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="stat-card">
          <div class="stat-icon cyan"><FolderOutlined /></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.weeklyReports }}</div>
            <div class="stat-label">本周新增</div>
          </div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="stat-card">
          <div class="stat-icon red"><WarningOutlined /></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.abnormalReports }}</div>
            <div class="stat-label">异常报告</div>
          </div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="stat-card">
          <div class="stat-icon gray"><PieChartOutlined /></div>
          <div class="stat-info">
            <div class="stat-value">{{ reportRatio }}</div>
            <div class="stat-label">日报/周报/月报</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 趋势图表 -->
    <a-row :gutter="16" class="chart-row">
      <a-col :span="12">
        <a-card title="企业账户趋势" :bordered="false">
          <div ref="enterpriseChartRef" class="chart-container"></div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="报告生成趋势" :bordered="false">
          <div ref="reportChartRef" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import * as echarts from 'echarts'
import {
  UsergroupAddOutlined,
  UserAddOutlined,
  TeamOutlined,
  StopOutlined,
  FileTextOutlined,
  FolderOutlined,
  WarningOutlined,
  PieChartOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue'
import axios from 'axios'

const timeRange = ref('7')
const customRange = ref(null)

const stats = ref({
  totalEnterprise: 128,
  todayNew: 3,
  activeUsers: 56,
  disabledAccounts: 4,
  totalReports: 892,
  weeklyReports: 45,
  abnormalReports: 3,
})

const reportRatio = ref('64 / 28 / 8')

const enterpriseChartRef = ref(null)
const reportChartRef = ref(null)
let enterpriseChart = null
let reportChart = null

const getMockDays = () => {
  const days = timeRange.value === '7' ? 7 : timeRange.value === '30' ? 30 : 14
  return days
}

const initEnterpriseChart = () => {
  if (!enterpriseChartRef.value) return
  enterpriseChart = echarts.init(enterpriseChartRef.value)
  const days = getMockDays()
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return `${d.getMonth() + 1}/${d.getDate()}`
  })
  const data = dates.map(() => Math.floor(Math.random() * 20 + 100))

  enterpriseChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 16, top: 16, bottom: 32 },
    xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: '#e8e8e8' } }, axisLabel: { fontSize: 11, color: '#999' } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { fontSize: 11 } },
    series: [{ data, type: 'line', smooth: true, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(22,119,255,0.3)' }, { offset: 1, color: 'rgba(22,119,255,0.02)' }]) }, lineStyle: { color: '#1677ff', width: 2 }, itemStyle: { color: '#1677ff' } }],
  })
}

const initReportChart = () => {
  if (!reportChartRef.value) return
  reportChart = echarts.init(reportChartRef.value)
  const days = getMockDays()
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return `${d.getMonth() + 1}/${d.getDate()}`
  })
  const daily = dates.map(() => Math.floor(Math.random() * 30 + 5))

  reportChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['日报生成'], top: 0, right: 0 },
    grid: { left: 40, right: 16, top: 32, bottom: 32 },
    xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: '#e8e8e8' } }, axisLabel: { fontSize: 11, color: '#999' } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { fontSize: 11 } },
    series: [{ name: '日报生成', data: daily, type: 'bar', barWidth: 16, itemStyle: { color: '#1677ff', borderRadius: [4, 4, 0, 0] } }],
  })
}

const fetchData = async () => {
  // TODO: 实际使用时取消注释
  // const res = await axios.get('http://localhost:3002/api/admin/stats', { params: { timeRange: timeRange.value } })
  // stats.value = res.data.data
  
  // Mock 数据更新
  stats.value = {
    totalEnterprise: 128 + Math.floor(Math.random() * 5),
    todayNew: 3 + Math.floor(Math.random() * 3),
    activeUsers: 56 + Math.floor(Math.random() * 5),
    disabledAccounts: 4,
    totalReports: 892 + Math.floor(Math.random() * 10),
    weeklyReports: 45 + Math.floor(Math.random() * 5),
    abnormalReports: 3,
  }
  
  reportRatio.value = `${64 + Math.floor(Math.random() * 5)} / ${28 + Math.floor(Math.random() * 3)} / ${8}`
  
  // 重新初始化图表
  initEnterpriseChart()
  initReportChart()
  
  message.success('数据已刷新')
}

const handleResize = () => {
  enterpriseChart?.resize()
  reportChart?.resize()
}

onMounted(() => {
  initEnterpriseChart()
  initReportChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  enterpriseChart?.dispose()
  reportChart?.dispose()
})
</script>

<style scoped>
.dashboard-page { max-width: 1400px; }

.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.filter-label {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
}

.custom-picker { width: 280px; }

.stat-row { margin-bottom: 16px; }

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.stat-icon.blue { background: rgba(22,119,255,0.1); color: #1677ff; }
.stat-icon.green { background: rgba(34,197,94,0.1); color: #22c55e; }
.stat-icon.purple { background: rgba(139,92,246,0.1); color: #8b5cf6; }
.stat-icon.orange { background: rgba(250,139,48,0.1); color: #fa8c30; }
.stat-icon.cyan { background: rgba(6,182,212,0.1); color: #06b6d4; }
.stat-icon.red { background: rgba(239,68,68,0.1); color: #ef4444; }
.stat-icon.gray { background: rgba(107,114,128,0.1); color: #6b7280; }

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}

.chart-row { margin-bottom: 16px; }

.chart-container {
  width: 100%;
  height: 280px;
}
</style>
