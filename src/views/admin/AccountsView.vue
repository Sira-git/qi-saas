<template>
  <div class="accounts-page">
    <!-- Tab 切换 -->
    <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
      <!-- 主账号 Tab -->
      <a-tab-pane key="main" tab="主账号列表">
        <div class="list-toolbar">
          <div class="toolbar-left">
            <a-button type="primary" @click="openAddMainModal">新增主账号</a-button>
            <a-button :disabled="!selectedRowKeys.length" @click="batchAction('disable')">批量禁用</a-button>
            <a-button :disabled="!selectedRowKeys.length" danger @click="batchAction('delete')">批量删除</a-button>
          </div>
          <div class="toolbar-right">
            <a-input v-model:value="searchMainName" placeholder="手机号/邮箱" style="width: 180px" @pressEnter="fetchData" />
            <a-button @click="resetSearch">重置</a-button>
            <a-button type="primary" @click="fetchData">检索</a-button>
          </div>
        </div>

        <!-- 主账号表格 -->
        <a-table
          :columns="mainColumns"
          :data-source="mainData"
          :loading="loading"
          :pagination="{ current: page, pageSize: 20, total, showSizeChanger: false }"
          row-key="id"
          :row-selection="{ selectedRowKeys, onChange: (keys) => selectedRowKeys = keys }"
          @change="handleTableChange"
          class="accounts-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <a @click="openMainDrawer(record)">{{ record.name }}</a>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="record.status === 'normal' ? 'green' : 'red'">
                {{ record.status === 'normal' ? '正常' : '禁用' }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'spaceCount'">
              <a @click="viewMainSpaces(record)">{{ record.spaceCount }} 个</a>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button size="small" @click="openMainDrawer(record)">查看</a-button>
                <a-button size="small" type="primary" @click="openEditMainModal(record)">编辑</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-tab-pane>

      <!-- 子账号 Tab -->
      <a-tab-pane key="sub" tab="子账号列表">
        <div class="list-toolbar">
          <div class="toolbar-left">
            <a-button type="primary" @click="openAddSubModal">创建子账号</a-button>
            <a-button type="default" @click="openInviteModal">发送邀请</a-button>
            <a-button :disabled="!selectedRowKeys.length" danger @click="batchAction('delete')">批量删除</a-button>
          </div>
          <div class="toolbar-right">
            <a-input v-model:value="searchSubEmail" placeholder="邮箱" style="width: 180px" @pressEnter="fetchData" />
            <a-select v-model:value="searchSubSpace" placeholder="企业空间" style="width: 160px" allow-clear :options="spaceOptions" @change="fetchData" />
            <a-select v-model:value="searchSubRole" placeholder="角色" style="width: 120px" allow-clear :options="roleOptions" @change="fetchData" />
            <a-button @click="resetSearch">重置</a-button>
            <a-button type="primary" @click="fetchData">检索</a-button>
          </div>
        </div>

        <!-- 子账号表格 -->
        <a-table
          :columns="subColumns"
          :data-source="subData"
          :loading="loading"
          :pagination="{ current: page, pageSize: 20, total, showSizeChanger: false }"
          row-key="id"
          :row-selection="{ selectedRowKeys, onChange: (keys) => selectedRowKeys = keys }"
          @change="handleTableChange"
          class="accounts-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === 'active' ? 'green' : 'orange'">
                {{ record.status === 'active' ? '已激活' : '待激活' }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'role'">
              <a-tag :color="record.role === 'admin' ? 'blue' : 'default'">
                {{ record.role === 'admin' ? '空间管理员' : '普通子账号' }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button size="small" @click="openSubDrawer(record)">查看</a-button>
                <a-button size="small" @click="resetSubPassword(record)">重置密码</a-button>
                <a-button size="small" danger @click="deleteSubAccount(record)">删除</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>

    <!-- 侧滑抽屉 -->
    <a-drawer v-model:open="drawerVisible" :title="activeTab === 'main' ? '主账号详情' : '子账号详情'" :width="480" placement="right">
      <a-descriptions :column="1" bordered v-if="currentMainAccount && activeTab === 'main'">
        <a-descriptions-item label="手机号/邮箱">{{ currentMainAccount.name }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ currentMainAccount.phone }}</a-descriptions-item>
        <a-descriptions-item label="邮箱">{{ currentMainAccount.email }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="currentMainAccount.status === 'normal' ? 'green' : 'red'">
            {{ currentMainAccount.status === 'normal' ? '正常' : '禁用' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建空间数">{{ currentMainAccount.spaceCount }}</a-descriptions-item>
        <a-descriptions-item label="注册时间">{{ currentMainAccount.created_at }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions :column="1" bordered v-if="currentSubAccount && activeTab === 'sub'">
        <a-descriptions-item label="邮箱">{{ currentSubAccount.email }}</a-descriptions-item>
        <a-descriptions-item label="所属企业空间">{{ currentSubAccount.spaceName }}</a-descriptions-item>
        <a-descriptions-item label="角色">
          <a-tag :color="currentSubAccount.role === 'admin' ? 'blue' : 'default'">
            {{ currentSubAccount.role === 'admin' ? '空间管理员' : '普通子账号' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="currentSubAccount.status === 'active' ? 'green' : 'orange'">
            {{ currentSubAccount.status === 'active' ? '已激活' : '待激活' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ currentSubAccount.created_at }}</a-descriptions-item>
      </a-descriptions>

      <div class="drawer-actions">
        <a-button v-if="activeTab === 'main'" @click="resetMainPassword(currentMainAccount?.id)">重置密码</a-button>
        <a-button v-if="activeTab === 'sub'" @click="resetSubPassword(currentSubAccount)">重置密码</a-button>
        <a-button type="primary" v-if="activeTab === 'main'" @click="openEditMainModal(currentMainAccount)">编辑</a-button>
      </div>
    </a-drawer>

    <!-- 主账号企业空间列表抽屉 -->
    <a-drawer v-model:open="mainSpacesDrawerVisible" title="企业空间列表" :width="720" placement="right">
      <div v-if="currentMainAccount" style="margin-bottom: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
        <div style="font-weight: 600; margin-bottom: 8px;">{{ currentMainAccount.name }}</div>
        <div style="color: #666; font-size: 14px;">共 {{ mainSpacesData.length }} 个企业空间</div>
      </div>

      <a-table
        :columns="mainSpaceColumns"
        :data-source="mainSpacesData"
        :pagination="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a @click="viewSpaceDetail(record)">{{ record.name }}</a>
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
        </template>
      </a-table>
    </a-drawer>

    <!-- 新增/编辑主账号弹窗 -->
    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑主账号' : '新增主账号'" @ok="saveMainModal" :width="640" :confirm-loading="saving">
      <a-form :model="mainForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="手机号 *" :rules="[{ required: true, message: '请输入手机号' }]">
          <a-input v-model:value="mainForm.phone" placeholder="请输入手机号" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="mainForm.email" placeholder="请输入邮箱（选填）" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="mainForm.status" :options="statusOptions" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 新增/编辑子账号弹窗 -->
    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑子账号' : '创建子账号'" @ok="saveSubModal" :width="640" :confirm-loading="saving" v-if="activeTab === 'sub'">
      <a-form :model="subForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="邮箱 *" :rules="[{ required: true, message: '请输入邮箱' }]">
          <a-input v-model:value="subForm.email" placeholder="请输入子账号邮箱" />
        </a-form-item>
        <a-form-item label="企业空间 *">
          <a-select v-model:value="subForm.spaceId" :options="spaceOptions" placeholder="请选择企业空间" />
        </a-form-item>
        <a-form-item label="角色">
          <a-select v-model:value="subForm.role" :options="roleOptions" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 主账号企业空间列表抽屉 -->
    <a-drawer v-model:open="mainSpacesDrawerVisible" title="企业空间列表" :width="720" placement="right">
      <div v-if="currentMainAccount" style="margin-bottom: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
        <div style="font-weight: 600; margin-bottom: 8px;">{{ currentMainAccount.name }}</div>
        <div style="color: #666; font-size: 14px;">共 {{ mainSpacesData.length }} 个企业空间</div>
      </div>

      <a-table
        :columns="mainSpaceColumns"
        :data-source="mainSpacesData"
        :pagination="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a @click="viewSpaceDetail(record)">{{ record.name }}</a>
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
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button size="small" @click="viewSpaceDetail(record)">查看</a-button>
              <a-button size="small" type="primary" @click="editSpace(record)">编辑</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import axios from 'axios'

const router = useRouter()

// Tab 状态
const activeTab = ref('main')

// 加载和保存状态
const loading = ref(false)
const saving = ref(false)

// 主账号空间列表抽屉
const mainSpacesDrawerVisible = ref(false)
const mainSpacesData = ref([])
const page = ref(1)
const total = ref(0)
const selectedRowKeys = ref([])

// 主账号检索
const searchMainName = ref('')

// 子账号检索
const searchSubEmail = ref('')
const searchSubSpace = ref(null)
const searchSubRole = ref(null)

// 抽屉和弹窗
const drawerVisible = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)

// 当前查看的记录
const currentMainAccount = ref(null)
const currentSubAccount = ref(null)

// 主账号数据
const mainData = ref([])
const mainForm = reactive({ id: '', name: '', phone: '', email: '', status: 'normal', spaceCount: 0, created_at: '' })

// 子账号数据
const subData = ref([])
const subForm = reactive({ id: '', email: '', spaceId: null, role: 'user', status: 'pending' })

// 主账号表格列
const mainColumns = [
  { title: '手机号/邮箱', key: 'name', dataIndex: 'name', ellipsis: true, width: 200 },
  { title: '创建空间数', key: 'spaceCount', dataIndex: 'spaceCount', width: 120, align: 'center' },
  { title: '状态', key: 'status', dataIndex: 'status', width: 90 },
  { title: '注册时间', key: 'created_at', dataIndex: 'created_at', width: 170 },
  { title: '操作', key: 'action', width: 140, fixed: 'right' },
]

// 主账号空间列表表格列
const mainSpaceColumns = [
  { title: '空间名称', key: 'name', dataIndex: 'name', ellipsis: true, width: 280 },
  { title: '行业', key: 'industry', dataIndex: 'industry', width: 100 },
  { title: '套餐', key: 'package', dataIndex: 'package', width: 100 },
  { title: '子账号数', key: 'subAccountCount', dataIndex: 'subAccountCount', width: 100, align: 'center' },
  { title: '状态', key: 'status', dataIndex: 'status', width: 90 },
]

// 子账号表格列
const subColumns = [
  { title: '邮箱', key: 'email', dataIndex: 'email', ellipsis: true, width: 200 },
  { title: '所属空间', key: 'spaceName', dataIndex: 'spaceName', width: 150 },
  { title: '角色', key: 'role', dataIndex: 'role', width: 120 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 90 },
  { title: '创建时间', key: 'created_at', dataIndex: 'created_at', width: 170 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' },
]

// 空间选项（子账号用）
const spaceOptions = [
  { value: 'space1', label: '大汉软件股份有限公司' },
  { value: 'space2', label: '创新科技有限公司' },
  { value: 'space3', label: '未来制造企业' },
]

// 角色选项（子账号用）
const roleOptions = [
  { value: 'admin', label: '空间管理员' },
  { value: 'user', label: '普通子账号' },
]

// 状态选项
const statusOptions = [
  { value: 'normal', label: '正常' },
  { value: 'disabled', label: '禁用' },
]

// Tab 切换
const handleTabChange = (key) => {
  page.value = 1
  selectedRowKeys.value = []
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: 20 }
    
    if (activeTab.value === 'main') {
      // 主账号检索
      if (searchMainName.value) params.search = searchMainName.value
      
      // TODO: 实际使用时取消注释
      // const res = await axios.get('http://localhost:3002/api/admin/main-accounts', { params })
      // mainData.value = res.data.data
      // total.value = res.data.total
      
      // Mock 数据
      mainData.value = [
        { id: '1', name: '13800138000', phone: '13800138000', email: 'admin@example.com', status: 'normal', spaceCount: 3, created_at: '2026-01-15 10:30' },
        { id: '2', name: 'zhangsan@example.com', phone: '13900139000', email: 'zhangsan@example.com', status: 'normal', spaceCount: 1, created_at: '2026-02-20 14:20' },
        { id: '3', name: 'lisi@example.com', phone: '13700137000', email: 'lisi@example.com', status: 'disabled', spaceCount: 2, created_at: '2026-03-10 09:15' },
      ]
      total.value = 3
    } else {
      // 子账号检索
      if (searchSubEmail.value) params.search = searchSubEmail.value
      if (searchSubSpace.value) params.spaceId = searchSubSpace.value
      if (searchSubRole.value) params.role = searchSubRole.value
      
      // TODO: 实际使用时取消注释
      // const res = await axios.get('http://localhost:3002/api/admin/sub-accounts', { params })
      // subData.value = res.data.data
      // total.value = res.data.total
      
      // Mock 数据
      subData.value = [
        { id: '1', email: 'user1@dahansoft.com', spaceId: 'space1', spaceName: '大汉软件股份有限公司', role: 'admin', status: 'active', created_at: '2026-01-20 09:00' },
        { id: '2', email: 'user2@dahansoft.com', spaceId: 'space1', spaceName: '大汉软件股份有限公司', role: 'user', status: 'active', created_at: '2026-02-15 14:30' },
        { id: '3', email: 'user3@innovate.com', spaceId: 'space2', spaceName: '创新科技有限公司', role: 'user', status: 'pending', created_at: '2026-03-01 10:00' },
      ]
      total.value = 3
    }
    
    selectedRowKeys.value = []
  } catch (e) {
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  if (activeTab.value === 'main') {
    searchMainName.value = ''
  } else {
    searchSubEmail.value = ''
    searchSubSpace.value = null
    searchSubRole.value = null
  }
  page.value = 1
  fetchData()
}

// ========== 主账号相关方法 ==========

const drawerTitle = computed(() => activeTab.value === 'main' ? '主账号详情' : '子账号详情')

const openMainDrawer = async (record) => {
  currentMainAccount.value = record
  drawerVisible.value = true
}

const resetMainPassword = async (id) => {
  if (!window.confirm('确定要重置该主账号的密码吗？')) return
  
  try {
    // TODO: 实际使用时调用 API
    await new Promise(resolve => setTimeout(resolve, 600))
    message.success('密码已重置')
  } catch (e) {
    console.error(e)
    message.error('操作失败')
  }
}

const openAddMainModal = () => {
  isEdit.value = false
  Object.assign(mainForm, { id: '', name: '', phone: '', email: '', status: 'normal', spaceCount: 0, created_at: '' })
  modalVisible.value = true
}

const openEditMainModal = (record) => {
  isEdit.value = true
  Object.assign(mainForm, {
    id: record.id,
    name: record.name,
    phone: record.phone,
    email: record.email,
    status: record.status,
    spaceCount: record.spaceCount
  })
  modalVisible.value = true
}

const saveMainModal = async () => {
  if (!mainForm.name && !mainForm.phone) {
    message.warning('请输入手机号或邮箱')
    return
  }
  
  saving.value = true
  try {
    // TODO: 实际使用时调用 API
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

// ========== 子账号相关方法 ==========

const openSubDrawer = async (record) => {
  currentSubAccount.value = record
  drawerVisible.value = true
}

const openAddSubModal = () => {
  isEdit.value = false
  Object.assign(subForm, { id: '', email: '', spaceId: null, role: 'user', status: 'pending' })
  modalVisible.value = true
}

const openInviteModal = () => {
  // TODO: 实现邀请弹窗逻辑
  message.info('发送邀请功能待实现')
}

const saveSubModal = async () => {
  if (!subForm.email) {
    message.warning('请输入邮箱')
    return
  }
  if (!subForm.spaceId) {
    message.warning('请选择企业空间')
    return
  }
  
  saving.value = true
  try {
    // TODO: 实际使用时调用 API
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

const resetSubPassword = async (record) => {
  if (!window.confirm(`确定要重置 ${record.email} 的密码吗？`)) return
  
  try {
    // TODO: 实际使用时调用 API
    await new Promise(resolve => setTimeout(resolve, 600))
    message.success('密码已重置')
  } catch (e) {
    console.error(e)
    message.error('操作失败')
  }
}

const deleteSubAccount = async (record) => {
  if (!window.confirm(`确定要删除子账号 ${record.email} 吗？`)) return
  
  try {
    // TODO: 实际使用时调用 API
    await new Promise(resolve => setTimeout(resolve, 600))
    message.success('删除成功')
    fetchData()
  } catch (e) {
    console.error(e)
    message.error('操作失败')
  }
}

// ========== 通用方法 ==========

const batchAction = async (action) => {
  if (!selectedRowKeys.value.length) return
  
  const actionText = action === 'disable' ? '禁用' : '删除'
  const targetType = activeTab.value === 'main' ? '主账号' : '子账号'
  
  if (!window.confirm(`确定要${actionText}选中的 ${selectedRowKeys.value.length} 个${targetType}吗？`)) return
  
  try {
    // TODO: 实际使用时调用 API
    await new Promise(resolve => setTimeout(resolve, 800))
    
    message.success(`${actionText}成功`)
    selectedRowKeys.value = []
    fetchData()
  } catch (e) {
    console.error(e)
    message.error('操作失败')
  }
}

const handleTableChange = (pag) => {
  page.value = pag.current
  fetchData()
}

// 查看主账号创建的空间
const viewMainSpaces = (record) => {
  // 弹窗展示该主账号创建的企业空间列表
  currentMainAccount.value = record
  mainSpacesDrawerVisible.value = true
  // TODO: 实际使用时调用 API 获取该主账号的空间列表
  // 这里用 Mock 数据
  mainSpacesData.value = [
    { id: '1', name: '大汉软件股份有限公司', industry: '软件', package: 'advanced', status: 'normal', subAccountCount: 15, created_at: '2026-01-15 10:30' },
    { id: '2', name: '创新科技有限公司', industry: '互联网', package: 'intermediate', status: 'normal', subAccountCount: 8, created_at: '2026-02-20 14:20' },
  ].filter(space => space.id === record.id || Math.random() > 0.5) // Mock 筛选
}

// 辅助函数：套餐文本
const packageText = (pkg) => {
  if (pkg === 'advanced') return '高级版'
  if (pkg === 'intermediate') return '进阶版'
  return '基础版'
}

// 查看空间详情
const viewSpaceDetail = (record) => {
  message.info(`查看空间：${record.name}`)
}

// 编辑空间
const editSpace = (record) => {
  message.info(`编辑空间：${record.name}`)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.accounts-page { background: transparent; }

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
