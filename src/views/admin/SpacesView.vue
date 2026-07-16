<template>
  <div class="spaces-page">
    <!-- 检索区 + 按钮 -->
    <div class="list-toolbar">
      <div class="toolbar-left">
        <a-button type="primary" @click="openAddModal">新增企业空间</a-button>
        <a-button :disabled="!selectedRowKeys.length" @click="batchAction('disable')">批量禁用</a-button>
        <a-button :disabled="!selectedRowKeys.length" danger @click="batchAction('delete')">批量删除</a-button>
      </div>
      <div class="toolbar-right">
        <a-input v-model:value="searchName" placeholder="空间名称" style="width: 180px" @pressEnter="fetchData" />
        <a-select v-model:value="searchIndustry" placeholder="行业" style="width: 140px" allow-clear :options="industryOptions" @change="fetchData" />
        <a-select v-model:value="searchPackage" placeholder="套餐" style="width: 120px" allow-clear :options="packageOptions" @change="fetchData" />
        <a-select v-model:value="searchStatus" placeholder="状态" style="width: 120px" allow-clear :options="statusOptions" @change="fetchData" />
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
      :row-selection="{ selectedRowKeys, onChange: (keys) => selectedRowKeys = keys }"
      @change="handleTableChange"
      class="spaces-table"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <a @click="openDrawer(record)">{{ record.name }}</a>
        </template>
        <template v-else-if="column.key === 'mainAccount'">
          <span>{{ record.mainAccountName }}<br/><small style="color: #999">{{ record.mainAccountPhone }}</small></span>
        </template>
        <template v-else-if="column.key === 'package'">
          <a-tag :color="record.package === 'advanced' ? 'purple' : record.package === 'intermediate' ? 'blue' : 'default'">
            {{ packageText(record.package) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === 'normal' ? 'green' : 'red'">
            {{ record.status === 'normal' ? '正常' : '禁用' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'subAccountCount'">
          <a @click="viewSubAccounts(record)">{{ record.subAccountCount }} 个</a>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button size="small" @click="openDrawer(record)">查看</a-button>
            <a-button size="small" type="primary" @click="openEditModal(record)">编辑</a-button>
            <a-button size="small" @click="viewSubAccounts(record)">子账号</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 侧滑抽屉 -->
    <a-drawer v-model:open="drawerVisible" title="企业空间详情" :width="480" placement="right">
      <a-descriptions :column="1" bordered v-if="currentSpace">
        <a-descriptions-item label="空间名称">{{ currentSpace.name }}</a-descriptions-item>
        <a-descriptions-item label="所属行业">{{ currentSpace.industry }}</a-descriptions-item>
        <a-descriptions-item label="经营区域">{{ (currentSpace.regions || []).join(',') }}</a-descriptions-item>
        <a-descriptions-item label="主账号">{{ currentSpace.mainAccountName }}</a-descriptions-item>
        <a-descriptions-item label="主账号手机">{{ currentSpace.mainAccountPhone }}</a-descriptions-item>
        <a-descriptions-item label="套餐">
          <a-tag :color="currentSpace.package === 'advanced' ? 'purple' : currentSpace.package === 'intermediate' ? 'blue' : 'default'">
            {{ packageText(currentSpace.package) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="子账号数">
          <a @click="viewSubAccounts(currentSpace)">{{ currentSpace.subAccountCount }} / {{ currentSpace.packageLimit }}</a>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="currentSpace.status === 'normal' ? 'green' : 'red'">{{ currentSpace.status === 'normal' ? '正常' : '禁用' }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ currentSpace.created_at }}</a-descriptions-item>
      </a-descriptions>
      <div class="drawer-actions">
        <a-button @click="openEditModal(currentSpace)">编辑</a-button>
        <a-button @click="viewSubAccounts(currentSpace)">查看子账号</a-button>
      </div>
    </a-drawer>

    <!-- 新增/编辑弹窗 -->
    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑企业空间' : '新增企业空间'" @ok="saveModal" :width="640" :confirm-loading="saving">
      <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="空间名称 *" :rules="[{ required: true, message: '请输入空间名称' }]">
          <a-input v-model:value="form.name" placeholder="请输入企业名称" />
        </a-form-item>
        <a-form-item label="所属行业 *">
          <a-select v-model:value="form.industry" :options="industryOptions" placeholder="请选择行业" />
        </a-form-item>
        <a-form-item label="经营区域">
          <a-select v-model:value="form.regions" mode="multiple" :options="regionOptions" placeholder="请选择经营区域" />
        </a-form-item>
        <a-form-item label="主账号" v-if="!isEdit">
          <a-select v-model:value="form.mainAccountId" :options="mainAccountOptions" placeholder="请选择主账号" />
        </a-form-item>
        <a-form-item label="套餐" v-if="!isEdit">
          <a-select v-model:value="form.package" :options="packageOptions" placeholder="请选择套餐" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="form.status" :options="statusOptions" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import axios from 'axios'

const route = useRoute()

const loading = ref(false)
const saving = ref(false)
const data = ref([])
const page = ref(1)
const total = ref(0)
const selectedRowKeys = ref([])

const searchName = ref('')
const searchIndustry = ref(null)
const searchPackage = ref(null)
const searchStatus = ref(null)
const searchMainAccount = ref(null)

const drawerVisible = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const currentSpace = ref(null)

const form = reactive({ id: '', name: '', industry: null, regions: [], mainAccountId: null, package: 'basic', status: 'normal' })

const columns = [
  { title: '空间名称', key: 'name', dataIndex: 'name', ellipsis: true, width: 200 },
  { title: '行业', key: 'industry', dataIndex: 'industry', width: 100 },
  { title: '主账号', key: 'mainAccount', dataIndex: 'mainAccount', width: 180 },
  { title: '套餐', key: 'package', dataIndex: 'package', width: 100 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 90 },
  { title: '子账号数', key: 'subAccountCount', dataIndex: 'subAccountCount', width: 100, align: 'center' },
  { title: '创建时间', key: 'created_at', dataIndex: 'created_at', width: 170 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' },
]

const industryOptions = [
  { value: '互联网', label: '互联网' },
  { value: '制造业', label: '制造业' },
  { value: '金融', label: '金融' },
  { value: '医疗健康', label: '医疗健康' },
  { value: '教育', label: '教育' },
  { value: '零售', label: '零售' },
]

const regionOptions = [
  { value: '北京', label: '北京' },
  { value: '上海', label: '上海' },
  { value: '广东', label: '广东' },
  { value: '浙江', label: '浙江' },
  { value: '江苏', label: '江苏' },
  { value: '全国', label: '全国' },
]

const packageOptions = [
  { value: 'basic', label: '基础版' },
  { value: 'intermediate', label: '进阶版' },
  { value: 'advanced', label: '高级版' },
]

const statusOptions = [
  { value: 'normal', label: '正常' },
  { value: 'disabled', label: '禁用' },
]

const mainAccountOptions = [
  { value: 'main1', label: '13800138000' },
  { value: 'main2', label: 'zhangsan@example.com' },
  { value: 'main3', label: 'lisi@example.com' },
]

const packageText = (pkg) => {
  if (pkg === 'advanced') return '高级版'
  if (pkg === 'intermediate') return '进阶版'
  return '基础版'
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: 20 }
    if (searchName.value) params.name = searchName.value
    if (searchIndustry.value) params.industry = searchIndustry.value
    if (searchPackage.value) params.package = searchPackage.value
    if (searchStatus.value) params.status = searchStatus.value
    if (searchMainAccount.value) params.mainAccountId = searchMainAccount.value
    
    // TODO: 实际使用时取消注释
    // const res = await axios.get('http://localhost:3002/api/admin/spaces', { params })
    // data.value = res.data.data
    // total.value = res.data.total
    
    // Mock 数据
    data.value = [
      { id: '1', name: '大汉软件股份有限公司', industry: '软件', regions: ['江苏', '全国'], mainAccountId: 'main1', mainAccountName: '13800138000', mainAccountPhone: '13800138000', package: 'advanced', status: 'normal', subAccountCount: 15, packageLimit: 50, created_at: '2026-01-15 10:30' },
      { id: '2', name: '创新科技有限公司', industry: '互联网', regions: ['北京', '上海'], mainAccountId: 'main2', mainAccountName: 'zhangsan@example.com', mainAccountPhone: '13900139000', package: 'intermediate', status: 'normal', subAccountCount: 8, packageLimit: 10, created_at: '2026-02-20 14:20' },
      { id: '3', name: '未来制造企业', industry: '制造业', regions: ['广东'], mainAccountId: 'main3', mainAccountName: 'lisi@example.com', mainAccountPhone: '13700137000', package: 'basic', status: 'disabled', subAccountCount: 3, packageLimit: 3, created_at: '2026-03-10 09:15' },
    ]
    
    // 如果有主账号筛选参数，过滤数据
    if (searchMainAccount.value) {
      data.value = data.value.filter(item => item.mainAccountId === searchMainAccount.value)
    }
    
    total.value = data.value.length
    selectedRowKeys.value = []
  } catch (e) {
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
  searchIndustry.value = null
  searchPackage.value = null
  searchStatus.value = null
  fetchData()
}

const openDrawer = async (record) => {
  currentSpace.value = record
  drawerVisible.value = true
}

const openAddModal = () => {
  isEdit.value = false
  Object.assign(form, { id: '', name: '', industry: null, regions: [], mainAccountId: null, package: 'basic', status: 'normal' })
  modalVisible.value = true
}

const openEditModal = (record) => {
  isEdit.value = true
  Object.assign(form, {
    id: record.id,
    name: record.name,
    industry: record.industry,
    regions: record.regions || [],
    mainAccountId: record.mainAccountId,
    package: record.package,
    status: record.status
  })
  drawerVisible.value = false
  modalVisible.value = true
}

const saveModal = async () => {
  if (!form.name) {
    message.warning('请输入空间名称')
    return
  }
  if (!form.industry) {
    message.warning('请选择行业')
    return
  }
  
  saving.value = true
  try {
    // TODO: 实际使用时取消注释
    // if (isEdit.value) {
    //   await axios.put(`http://localhost:3002/api/admin/spaces/${form.id}`, form)
    // } else {
    //   await axios.post('http://localhost:3002/api/admin/spaces', form)
    // }
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 800))
    
    message.success(isEdit.value ? '更新成功' : '创建成功')
    modalVisible.value = false
    fetchData()
  } catch (e) {
    console.error(e)
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

const batchAction = async (action) => {
  if (!selectedRowKeys.value.length) return
  
  const actionText = action === 'disable' ? '禁用' : '删除'
  if (!window.confirm(`确定要${actionText}选中的 ${selectedRowKeys.value.length} 个企业空间吗？`)) return
  
  try {
    // TODO: 实际使用时取消注释
    // await axios.post('http://localhost:3002/api/admin/spaces/batch', { ids: selectedRowKeys.value, action })
    
    // 模拟操作
    await new Promise(resolve => setTimeout(resolve, 800))
    
    message.success(`${actionText}成功`)
    selectedRowKeys.value = []
    fetchData()
  } catch (e) {
    console.error(e)
    message.error('操作失败')
  }
}

const viewSubAccounts = (record) => {
  // TODO: 跳转到子账号管理页面，并筛选该空间
  message.info(`查看 ${record.name} 的子账号列表`)
}

onMounted(() => {
  // 检查是否有主账号筛选参数
  if (route.query.mainAccountId) {
    searchMainAccount.value = route.query.mainAccountId
    // 找到对应的主账号名称用于显示
    const mainAccountId = route.query.mainAccountId
    const mockMainAccounts = {
      'main1': '13800138000',
      'main2': 'zhangsan@example.com',
      'main3': 'lisi@example.com'
    }
    if (mockMainAccounts[mainAccountId]) {
      message.success(`已筛选主账号 ${mockMainAccounts[mainAccountId]} 创建的企业空间`)
    }
  }
  fetchData()
})
</script>

<style scoped>
.spaces-page { background: transparent; }

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-left { display: flex; gap: 8px; }
.toolbar-right { display: flex; gap: 8px; align-items: center; }

.drawer-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}
</style>
