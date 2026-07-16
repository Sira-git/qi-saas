<template>
  <div class="sub-account-page">
    <!-- 统一顶部导航 -->
    <TopNav />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-container header-inner">
        <button class="back-btn" @click="router.push('/space')">
          <ArrowLeftOutlined /> 返回
        </button>
        <h1>子账号管理 - {{ currentSpaceName }}</h1>
        <a-button type="primary" @click="showInviteModal">
          <PlusOutlined /> 邀请子账号
        </a-button>
      </div>
    </div>

    <div class="page-container">
      <div class="quota-info">
        <a-tag color="blue">已用：{{ subAccounts.length }} / {{ maxAccounts }} 个子账号名额</a-tag>
        <span class="package-label">（{{ packageName }}）</span>
      </div>

      <!-- 搜索区 -->
      <div class="search-area">
        <a-row :gutter="16" align="bottom">
          <a-col :span="6">
            <a-input v-model:value="searchForm.phone" placeholder="手机号" allow-clear />
          </a-col>
          <a-col :span="6">
            <a-select v-model:value="searchForm.role" placeholder="角色" allow-clear style="width: 100%">
              <a-select-option value="space-admin">企业空间管理员</a-select-option>
              <a-select-option value="sub-account">普通子账号</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select v-model:value="searchForm.status" placeholder="状态" allow-clear style="width: 100%">
              <a-select-option value="normal">正常</a-select-option>
              <a-select-option value="disabled">禁用</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-space>
              <a-button type="primary" @click="handleSearch"><SearchOutlined /> 搜索</a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-col>
        </a-row>
      </div>

      <!-- 列表 -->
      <a-card :bordered="false" class="table-card">
        <a-table 
          :columns="columns" 
          :data-source="filteredAccounts" 
          :loading="loading" 
          :pagination="{ 
            pageSize: 10, 
            showSizeChanger: true, 
            showTotal: (total) => `共 ${total} 条`,
            showQuickJumper: true,
            locale: { items_per_page: '条/页', jump_to: '跳转到', page: '页' },
            pageSizeOptions: ['10', '20', '50', '100']
          }" 
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'role'">
              <a-tag :color="record.role === 'space-admin' ? 'blue' : 'default'">
                {{ record.role === 'space-admin' ? '企业空间管理员' : '普通子账号' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === 'normal' ? 'green' : 'red'">
                {{ record.status === 'normal' ? '正常' : '禁用' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-dropdown>
                <a class="action-btn">更多 <DownOutlined /></a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item v-if="record.role === 'space-admin'" @click="handleTransferAdmin(record)">
                      <TeamOutlined /> 转交企业管理员
                    </a-menu-item>
                    <a-menu-item @click="handleResetPassword(record)"><KeyOutlined /> 重置密码</a-menu-item>
                    <a-menu-item @click="handleToggleStatus(record)">{{ record.status === 'normal' ? '禁用' : '启用' }}</a-menu-item>
                    <a-menu-item danger @click="handleDelete(record)"><DeleteOutlined /> 删除</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
          </template>
        </a-table>
      </a-card>

      <!-- 邀请弹窗 -->
      <a-modal v-model:open="inviteVisible" title="邀请子账号" width="520px" :footer="null">
        <div class="invite-content">
          <div v-if="!inviteLink" class="invite-form">
            <a-form layout="vertical">
              <a-form-item label="选择角色">
                <div class="role-selector">
                  <div 
                    class="role-card" 
                    :class="{ active: inviteForm.role === 'sub-account' }"
                    @click="inviteForm.role = 'sub-account'"
                  >
                    <div class="role-card-inner">
                      <UserOutlined class="role-icon" />
                      <div class="role-info">
                        <div class="role-name">普通子账号</div>
                        <div class="role-desc">普通成员权限</div>
                      </div>
                    </div>
                  </div>
                  <div 
                    class="role-card" 
                    :class="{ active: inviteForm.role === 'space-admin' }"
                    @click="inviteForm.role = 'space-admin'"
                  >
                    <div class="role-card-inner">
                      <TeamOutlined class="role-icon" />
                      <div class="role-info">
                        <div class="role-name">企业空间管理员</div>
                        <div class="role-desc">管理企业空间权限</div>
                      </div>
                    </div>
                  </div>
                </div>
              </a-form-item>
              
              <a-form-item label="邀请方式">
                <div class="invite-method-selector">
                  <div 
                    class="method-card"
                    :class="{ active: inviteForm.method === 'link' }"
                    @click="inviteForm.method = 'link'"
                  >
                    <div class="method-card-inner">
                      <LinkOutlined class="method-icon" />
                      <div class="method-info">
                        <div class="method-name">复制链接</div>
                        <div class="method-desc">手动发送给同事</div>
                      </div>
                    </div>
                  </div>
                  <div 
                    class="method-card"
                    :class="{ active: inviteForm.method === 'email' }"
                    @click="inviteForm.method = 'email'"
                  >
                    <div class="method-card-inner">
                      <MailOutlined class="method-icon" />
                      <div class="method-info">
                        <div class="method-name">发送邮件</div>
                        <div class="method-desc">系统自动发送邀请邮件</div>
                      </div>
                    </div>
                  </div>
                </div>
              </a-form-item>
              
              <a-form-item 
                v-if="inviteForm.method === 'email'" 
                label="邮箱地址"
                :rules="[{ required: true, type: 'email', message: '请输入正确的邮箱' }]"
              >
                <a-input 
                  v-model:value="inviteForm.email" 
                  placeholder="请输入同事的邮箱"
                  size="large"
                />
              </a-form-item>
              
              <a-divider />
              
              <div class="invite-actions">
                <a-space>
                  <a-button @click="inviteVisible = false">取消</a-button>
                  <a-button type="primary" @click="generateInviteLink">
                    {{ inviteForm.method === 'email' ? '发送邮件' : '生成邀请' }}
                  </a-button>
                </a-space>
              </div>
            </a-form>
          </div>
          
          <div v-else class="invite-result">
            <div class="success-icon">
              <CheckCircleOutlined />
            </div>
            <h3>{{ inviteForm.method === 'email' ? '邀请邮件已发送' : '邀请链接已生成' }}</h3>
            <p class="invite-desc">
              <template v-if="inviteForm.method === 'email'">
                邮件已发送至 <strong>{{ inviteForm.email }}</strong>，对方点击邮件中的链接即可加入
              </template>
              <template v-else>
                将链接发送给同事，对方点击后即可加入企业空间
              </template>
            </p>
            
            <div v-if="inviteForm.method === 'link'" class="link-box">
              <div class="link-text">{{ inviteLink }}</div>
              <a-button type="link" @click="copyLink" class="copy-btn">
                <template #icon><CopyOutlined /></template>
                复制
              </a-button>
            </div>
            
            <div v-if="inviteForm.method === 'link'" class="qr-code-box">
              <div id="qrcode"></div>
              <p class="qr-tip">扫描二维码快速加入</p>
            </div>
            
            <div class="invite-actions">
              <a-space>
                <a-button v-if="inviteForm.method === 'link'" @click="resetInvite">重新生成</a-button>
                <a-button @click="inviteVisible = false">完成</a-button>
              </a-space>
            </div>
          </div>
        </div>
      </a-modal>

      <!-- 转交企业管理员弹窗 -->
      <a-modal v-model:open="transferVisible" title="转交企业管理员" :confirm-loading="transferLoading"
        @ok="confirmTransfer" okText="确认转交" cancelText="取消">
        <div class="transfer-modal-content">
          <div class="transfer-warning">
            <ExclamationCircleOutlined />
            <p>转交后，当前账号将自动转为「普通子账号」，新的管理员将获得所有管理权限。</p>
          </div>
          <a-form layout="vertical">
            <a-form-item label="选择新的管理员">
              <a-select
                v-model:value="transferTargetId"
                placeholder="请选择接收转交的子账号"
                style="width: 100%"
                show-search
                :filter-option="filterTransferOption"
                option-label-prop="children"
              >
                <a-select-option
                  v-for="account in nonAdminAccounts"
                  :key="account.id"
                  :value="account.id"
                  :label="account.phone + account.role + account.createdAt"
                >
                  <div class="transfer-option">
                    <span class="transfer-phone">{{ account.phone }}</span>
                    <span class="transfer-role">{{ account.role === 'space-admin' ? '企业空间管理员' : '普通子账号' }}</span>
                    <span class="transfer-time">{{ account.createdAt }}</span>
                  </div>
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
          <a-alert
            v-if="transferTargetId"
            :message="`确定将企业管理员转交给 ${getTargetAccount().phone}？`"
            type="info"
            show-icon
          />
        </div>
      </a-modal>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { 
  PlusOutlined, SearchOutlined, DownOutlined, KeyOutlined, 
  DeleteOutlined, ArrowLeftOutlined, UserOutlined, TeamOutlined,
  CheckCircleOutlined, CopyOutlined, MailOutlined, ReloadOutlined,
  LinkOutlined, ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'

const route = useRoute()
const router = useRouter()
const spaceId = computed(() => route.params.id || '1')
const currentSpaceName = ref('大汉软件股份有限公司')
const packageName = ref('高级版')
const maxAccounts = ref(10)

const loading = ref(false)
const inviteVisible = ref(false)
const inviteLoading = ref(false)
const searchForm = reactive({ phone: '', role: undefined, status: undefined })
const inviteForm = reactive({ role: 'sub-account', method: 'link', email: '' })
const inviteLink = ref('')

// 转交管理员相关
const transferVisible = ref(false)
const transferLoading = ref(false)
const transferTargetId = ref('')
const currentAdminAccount = ref(null)

const subAccounts = ref([
  { id: '1', phone: '138****1234', role: 'space-admin', status: 'normal', createdAt: '2026-02-20 14:30' },
  { id: '2', phone: '139****5678', role: 'sub-account', status: 'normal', createdAt: '2026-03-15 10:00' },
  { id: '3', phone: '137****9012', role: 'sub-account', status: 'disabled', createdAt: '2026-04-01 09:15' },
])

const columns = [
  { title: '手机号', dataIndex: 'phone', key: 'phone' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  { title: '注册时间', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action', width: 100 },
]

const filteredAccounts = computed(() => {
  return subAccounts.value.filter((item) => {
    if (searchForm.phone && !item.phone.includes(searchForm.phone)) return false
    if (searchForm.role && item.role !== searchForm.role) return false
    if (searchForm.status && item.status !== searchForm.status) return false
    return true
  })
})

const showInviteModal = () => {
  inviteForm.role = 'sub-account'
  inviteForm.method = 'link'
  inviteForm.email = ''
  inviteLink.value = ''
  inviteVisible.value = true
}

const generateInviteLink = () => {
  // 验证邮箱
  if (inviteForm.method === 'email' && !inviteForm.email) {
    message.warning('请输入邮箱地址')
    return
  }
  if (inviteForm.method === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) {
    message.warning('请输入正确的邮箱格式')
    return
  }
  
  const token = 'inv_' + Math.random().toString(36).substring(2, 15)
  inviteLink.value = `${window.location.origin}/invite/${token}?space=${spaceId.value}&role=${inviteForm.role}`
  
  if (inviteForm.method === 'email') {
    // 模拟发送邮件
    message.success(`邀请邮件已发送至 ${inviteForm.email}`)
  } else {
    message.success('邀请链接已生成')
    nextTick(() => {
      // 生成二维码
      const qrContainer = document.getElementById('qrcode')
      if (qrContainer) {
        qrContainer.innerHTML = ''
        qrContainer.innerHTML = `<div style="width:150px;height:150px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:13px;color:#666;">二维码</div>`
      }
    })
  }
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    message.success('链接已复制到剪贴板')
  } catch (e) {
    message.error('复制失败')
  }
}

const resetInvite = () => {
  inviteLink.value = ''
  inviteForm.role = 'sub-account'
  inviteForm.method = 'link'
  inviteForm.email = ''
}

const handleSearch = () => {}
const handleReset = () => { searchForm.phone = ''; searchForm.role = undefined; searchForm.status = undefined }

const handleResetPassword = (record) => message.info(`已重置 ${record.email} 的密码`)
const handleToggleStatus = (record) => { record.status = record.status === 'normal' ? 'disabled' : 'normal'; message.success('状态已更新') }
const handleDelete = (record) => { window.confirm(`确认删除子账号 ${record.email}？`) && message.success('已删除') }

// 转交企业管理员相关函数
const filterTransferOption = (input, option) => {
  return (option.props.label || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const nonAdminAccounts = computed(() => {
  return subAccounts.value.filter((account) => account.role !== 'space-admin' && account.status === 'normal')
})

const getTargetAccount = () => {
  return subAccounts.value.find((account) => account.id === transferTargetId.value) || {}
}

const handleTransferAdmin = (record) => {
  currentAdminAccount.value = record
  transferTargetId.value = ''
  transferVisible.value = true
}

const confirmTransfer = () => {
  if (!transferTargetId.value) {
    message.warning('请选择接收转交的子账号')
    return
  }
  
  transferLoading.value = true
  
  setTimeout(() => {
    const currentAdminId = currentAdminAccount.value.id
    const targetId = transferTargetId.value
    
    const currentAdmin = subAccounts.value.find((a) => a.id === currentAdminId)
    if (currentAdmin) {
      currentAdmin.role = 'sub-account'
    }
    
    const targetAccount = subAccounts.value.find((a) => a.id === targetId)
    if (targetAccount) {
      targetAccount.role = 'space-admin'
    }
    
    message.success(`已成功将企业管理员转交给 ${getTargetAccount().phone}`)
    transferVisible.value = false
    transferLoading.value = false
    transferTargetId.value = ''
    currentAdminAccount.value = null
  }, 1000)
}
</script>

<style scoped>
.sub-account-page {
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
}

.header-inner h1 {
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
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

.quota-info {
  margin-bottom: 16px;
  padding: 24px 0 16px;
}

.package-label {
  margin-left: 8px;
  color: #8c8c8c;
  font-size: 14px;
}

.search-area {
  margin-bottom: 16px;
}

.table-card {
  border-radius: 8px;
}

.action-btn {
  cursor: pointer;
  color: #1677ff;
}

/* 邀请弹窗 */
.invite-content {
  padding: 8px 0;
}

.role-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.role-card {
  width: 100%;
  cursor: pointer;
  transition: all 0.3s;
}

.role-card-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  transition: all 0.3s;
}

.role-card:hover .role-card-inner {
  border-color: #4096ff;
  background: #f0f5ff;
}

.role-card.active .role-card-inner {
  border-color: #1677ff;
  background: #e6f4ff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.1);
}

.role-icon {
  font-size: 24px;
  color: #1677ff;
  flex-shrink: 0;
}

.role-info {
  flex: 1;
}

.role-name {
  font-size: 15px;
  font-weight: 500;
  color: #1a202c;
  margin-bottom: 4px;
}

.role-desc {
  font-size: 13px;
  color: #64748b;
}

.invite-method-selector {
  display: flex;
  gap: 12px;
  width: 100%;
}

.method-card {
  flex: 1;
  cursor: pointer;
  transition: all 0.3s;
}

.method-card-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  transition: all 0.3s;
}

.method-card:hover .method-card-inner {
  border-color: #4096ff;
  background: #f0f5ff;
}

.method-card.active .method-card-inner {
  border-color: #1677ff;
  background: #e6f4ff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.1);
}

.method-icon {
  font-size: 20px;
  color: #1677ff;
  flex-shrink: 0;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a202c;
  margin-bottom: 2px;
}

.method-desc {
  font-size: 12px;
  color: #64748b;
}

.invite-result {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 48px;
  color: #52c41a;
  margin-bottom: 16px;
}

.invite-result h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
}

.invite-desc {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 24px;
}

.link-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 24px;
}

.link-text {
  flex: 1;
  font-size: 13px;
  color: #1a202c;
  font-family: monospace;
  word-break: break-all;
}

.copy-btn {
  flex-shrink: 0;
}

.qr-code-box {
  display: inline-block;
  padding: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 24px;
}

.qr-tip {
  font-size: 13px;
  color: #64748b;
  margin-top: 12px;
}

.invite-actions {
  display: flex;
  justify-content: center;
}

/* 转交弹窗 */
.transfer-modal-content {
  padding: 8px 0;
}

.transfer-warning {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: #fff7e6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  margin-bottom: 16px;
}

.transfer-warning .anticon {
  color: #faad14;
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

.transfer-warning p {
  margin: 0;
  font-size: 14px;
  color: #663c00;
  line-height: 1.6;
}

.transfer-option {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.transfer-phone {
  font-weight: 500;
  color: #1a202c;
  min-width: 100px;
}

.transfer-role {
  font-size: 13px;
  color: #64748b;
  padding: 2px 8px;
  background: #f0f5ff;
  border-radius: 4px;
}

.transfer-time {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}
</style>
