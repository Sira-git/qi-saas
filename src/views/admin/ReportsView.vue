<template>
  <div class="reports-page">
    <!-- 检索区 -->
    <div class="list-toolbar">
      <div class="toolbar-right">
        <a-input v-model:value="searchName" placeholder="企业名称" style="width: 160px" @pressEnter="fetchData" />
        <a-select v-model:value="searchType" placeholder="报告类型" style="width: 120px" allow-clear :options="typeOptions" @change="fetchData" />
        <a-select v-model:value="searchStatus" placeholder="状态" style="width: 120px" allow-clear :options="statusOptions" @change="fetchData" />
        <a-range-picker v-model:value="dateRange" @change="fetchData" style="width: 280px" />
        <a-button @click="resetSearch">重置</a-button>
        <a-button type="primary" @click="fetchData">检索</a-button>
      </div>
    </div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      :pagination="{ current: page, pageSize: 20, total, showSizeChanger: false }"
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'enterprise_name'">
          <a @click="$router.push(`/admin/reports/${record.id}`)">{{ record.enterprise_name }}</a>
        </template>
        <template v-else-if="column.key === 'type'">
          {{ typeName(record.type) }}
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === 'normal' ? 'green' : 'red'" :icon="record.status === 'abnormal' ? 'exclamation' : ''">
            {{ record.status === 'normal' ? '正常' : '异常' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button size="small" type="primary" @click="viewReport(record)">查看</a-button>
          <a-button v-if="record.status === 'abnormal'" size="small" @click="regenerateReport(record.id)">重新生成</a-button>
        </template>
      </template>
    </a-table>

    <!-- 报告详情弹窗 -->
    <a-modal v-model:open="detailVisible" title="报告详情" :width="800" :footer="null">
      <div v-if="currentReport">
        <a-descriptions :column="2" bordered style="margin-bottom:20px">
          <a-descriptions-item label="企业名称">{{ currentReport.enterprise_name }}</a-descriptions-item>
          <a-descriptions-item label="报告类型">{{ typeName(currentReport.type) }}</a-descriptions-item>
          <a-descriptions-item label="报告周期">{{ currentReport.period_date }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="currentReport.status === 'normal' ? 'green' : 'red'">{{ currentReport.status === 'normal' ? '正常' : '异常' }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="生成时间" :span="2">{{ currentReport.created_at }}</a-descriptions-item>
        </a-descriptions>
        <div class="report-preview" v-if="currentReport.data">
          <h4>报告预览（点击模块查看详情）</h4>
          <div class="module-tags">
            <span v-for="m in ['市场机会', '政策分析', '行业分析', '竞品分析', '中标数据']" :key="m" class="module-tag">{{ m }}</span>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import axios from 'axios'

const loading = ref(false)
const data = ref([])
const page = ref(1)
const total = ref(0)

const searchName = ref('')
const searchType = ref(null)
const searchStatus = ref(null)
const dateRange = ref(null)

const detailVisible = ref(false)
const currentReport = ref(null)

const columns = [
  { title: '企业名称', key: 'enterprise_name', dataIndex: 'enterprise_name', width: 200, ellipsis: true },
  { title: '行业', key: 'industry', dataIndex: 'industry', width: 100 },
  { title: '报告类型', key: 'type', dataIndex: 'type', width: 90 },
  { title: '报告周期', key: 'period_date', dataIndex: 'period_date', width: 120 },
  { title: '生成时间', key: 'created_at', dataIndex: 'created_at', width: 170 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 90 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' },
]

const typeOptions = [
  { value: 'daily', label: '日报' },
  { value: 'weekly', label: '周报' },
  { value: 'monthly', label: '月报' },
]

const statusOptions = [
  { value: 'normal', label: '正常' },
  { value: 'abnormal', label: '异常' },
]

const typeName = (t) => {
  if (t === 'daily') return '日报'
  if (t === 'weekly') return '周报'
  return '月报'
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: 20 }
    if (searchName.value) params.enterpriseName = searchName.value
    if (searchType.value) params.type = searchType.value
    if (searchStatus.value) params.status = searchStatus.value
    if (dateRange.value?.[0]) params.startDate = dateRange.value[0].format('YYYY-MM-DD')
    if (dateRange.value?.[1]) params.endDate = dateRange.value[1].format('YYYY-MM-DD')
    
    // TODO: 实际使用时取消注释
    // const res = await axios.get('http://localhost:3002/api/admin/reports', { params })
    // data.value = res.data.data
    // total.value = res.data.total
    
    // Mock 数据演示
    data.value = [
      { id: '1', enterprise_name: '大汉软件股份有限公司', industry: '软件', type: 'weekly', period_date: '2026-04-22~2026-04-28', created_at: '2026-04-28 09:00', status: 'normal' },
      { id: '2', enterprise_name: '创新科技有限公司', industry: '互联网', type: 'daily', period_date: '2026-04-28', created_at: '2026-04-28 09:00', status: 'normal' },
      { id: '3', enterprise_name: '未来制造企业', industry: '制造业', type: 'monthly', period_date: '2026-04', created_at: '2026-04-30 10:00', status: 'abnormal' },
    ]
    total.value = 3
  } catch (e) {
    console.error(e)
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag) => {
  page.value = pag.current
  fetchData()
}

const resetSearch = () => {
  searchName.value = ''
  searchType.value = null
  searchStatus.value = null
  dateRange.value = null
  fetchData()
}

const viewReport = async (record) => {
  // TODO: 实际使用时取消注释
  // const res = await axios.get(`http://localhost:3002/api/admin/reports/${record.id}`)
  // currentReport.value = res.data.data
  
  // Mock 数据
  currentReport.value = record
  detailVisible.value = true
}

const regenerateReport = async (id) => {
  if (!window.confirm('确定要重新生成该报告吗？')) return
  
  try {
    // TODO: 实际使用时取消注释
    // await axios.post(`http://localhost:3002/api/admin/reports/${id}/regenerate`)
    
    // 模拟操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    message.success('报告已重新生成')
    fetchData()
  } catch (e) {
    console.error(e)
    message.error('操作失败')
  }
}

onMounted(fetchData)
</script>

<style scoped>
.reports-page { background: transparent; }

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.report-preview h4 { margin-bottom: 12px; }
.module-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.module-tag { background: rgba(22,119,255,0.1); color: #69b1ff; padding: 4px 12px; border-radius: 100px; font-size: 13px; }
</style>
