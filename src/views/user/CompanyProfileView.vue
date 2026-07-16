<template>
  <div class="profile-page">
    <TopNav />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-container header-inner">
        <button class="back-btn" @click="$router.back()">
          <ArrowLeftOutlined /> 返回
        </button>
        <h1>企业信息配置</h1>
        <div class="header-right">
          <button class="btn-primary" @click="saveAll" :loading="savingAll">保存</button>
        </div>
      </div>
    </div>

    <div class="page-body">
      <div class="page-container">
        <div class="tabs-layout">
          <!-- 左侧 Tab 导航 -->
          <div class="tab-nav">
            <div
              v-for="tab in tabs"
              :key="tab.key"
              class="tab-item"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </div>
          </div>

          <!-- 右侧内容区域 -->
          <div class="tab-content">
            <!-- 企业基本信息 -->
            <div v-if="activeTab === 'basic'" class="tab-panel">
              <h2 class="panel-title">企业基本信息</h2>
              <div class="form-section">
                <div class="form-item">
                  <label class="form-label">企业简介</label>
                  <a-textarea
                    v-model:value="company.intro"
                    placeholder="请简要介绍企业的基本情况，包括主营业务、发展历程、竞争优势等"
                    :rows="6"
                    :maxlength="1000"
                    show-count
                  />
                </div>

                <div class="form-item">
                  <label class="form-label">所属行业 <span class="required-mark">*</span></label>
                  <a-select v-model:value="company.industry" placeholder="请选择您企业所属的行业" style="width: 100%">
                    <a-select-option value="it">IT/互联网/通信</a-select-option>
                    <a-select-option value="software">软件服务</a-select-option>
                    <a-select-option value="hardware">硬件制造</a-select-option>
                    <a-select-option value="electronics">电子半导体</a-select-option>
                    <a-select-option value="finance">金融/保险/投资</a-select-option>
                    <a-select-option value="healthcare">医疗健康</a-select-option>
                    <a-select-option value="education">教育培训</a-select-option>
                    <a-select-option value="manufacturing">制造业</a-select-option>
                    <a-select-option value="energy">能源/材料</a-select-option>
                    <a-select-option value="construction">建筑/房地产</a-select-option>
                    <a-select-option value="transportation">交通/物流</a-select-option>
                    <a-select-option value="media">媒体/广告/娱乐</a-select-option>
                    <a-select-option value="consulting">咨询服务</a-select-option>
                    <a-select-option value="agriculture">农林牧渔</a-select-option>
                    <a-select-option value="other">其他</a-select-option>
                  </a-select>
                </div>

                <div class="form-item">
                  <label class="form-label">经营区域 <span class="required-mark">*</span></label>
                  <a-select v-model:value="company.regions" mode="multiple" placeholder="请选择企业经营所在的省/市/自治区" style="width: 100%" :max-tag-count="3">
                    <a-select-option value="北京">北京</a-select-option>
                    <a-select-option value="上海">上海</a-select-option>
                    <a-select-option value="广东">广东</a-select-option>
                    <a-select-option value="江苏">江苏</a-select-option>
                    <a-select-option value="浙江">浙江</a-select-option>
                    <a-select-option value="山东">山东</a-select-option>
                    <a-select-option value="四川">四川</a-select-option>
                    <a-select-option value="湖北">湖北</a-select-option>
                    <a-select-option value="湖南">湖南</a-select-option>
                    <a-select-option value="河南">河南</a-select-option>
                    <a-select-option value="河北">河北</a-select-option>
                    <a-select-option value="福建">福建</a-select-option>
                    <a-select-option value="安徽">安徽</a-select-option>
                    <a-select-option value="其他">其他</a-select-option>
                  </a-select>
                </div>

                <div class="form-item">
                  <label class="form-label">业务范围</label>
                  <a-input v-model:value="company.businessScope" placeholder="请输入业务范围，用逗号分隔（如：软件开发、系统集成、技术咨询）" />
                </div>
              </div>
            </div>

            <!-- 政策订阅 -->
            <div v-if="activeTab === 'policy'" class="tab-panel">
              <h2 class="panel-title">政策订阅</h2>
              <div class="form-section">
                <div class="toolbar">
                  <div class="quota-info"><InfoCircleOutlined /> 当前可创建 {{ subscriptionQuota }} 个订阅策略</div>
                  <a-button type="primary" @click="showSubscribeModal = true"><PlusOutlined /> 订阅策略</a-button>
                </div>

                <div v-if="subscriptions.length === 0" class="empty-state">
                  <div class="empty-icon"><BellOutlined /></div>
                  <div class="empty-text">暂无订阅策略</div>
                  <a-button type="primary" @click="showSubscribeModal = true">添加订阅策略</a-button>
                </div>

                <div v-else class="subscription-table">
                  <a-table :columns="subscriptionColumns" :data-source="subscriptions" :pagination="false" row-key="id">
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.key === 'policyType'"><a-tag color="blue">{{ record.policyType }}</a-tag></template>
                      <template v-if="column.key === 'target'"><a-tag :color="getTargetColor(record.target)">{{ record.target }}</a-tag></template>
                      <template v-if="column.key === 'action'">
                        <a-space>
                          <a-button type="link" size="small" @click="viewSubscription(record)">详情</a-button>
                          <a-button type="link" size="small" danger @click="cancelSubscription(record.id)">取消订阅</a-button>
                        </a-space>
                      </template>
                    </template>
                  </a-table>
                </div>
              </div>
            </div>

            <!-- 行业信息配置 -->
            <div v-if="activeTab === 'industry'" class="tab-panel">
              <h2 class="panel-title">行业信息配置</h2>
              <div class="form-section">
                <div class="keywords-tip">
                  <InfoCircleOutlined style="margin-right: 4px;" />
                  关键词将用于市场、政策、行业等相关信息的采集与过滤
                </div>
                <div class="keywords-input">
                  <a-input v-model:value="newKeyword" placeholder="输入关键词，按回车添加" @pressEnter="addKeyword" allow-clear style="max-width: 400px;" />
                  <a-button type="primary" @click="addKeyword" style="margin-left: 8px;"><PlusOutlined /> 添加</a-button>
                </div>
                <div class="keywords-list">
                  <div v-if="kw.keywords.length === 0" class="empty-text">暂无关键词</div>
                  <div v-else class="tags-container">
                    <a-tag v-for="(keyword, index) in kw.keywords" :key="index" closable @close="removeKeyword(index)" color="blue">{{ keyword }}</a-tag>
                  </div>
                </div>
              </div>
            </div>

            <!-- 友商信息配置 -->
            <div v-if="activeTab === 'competitor'" class="tab-panel">
              <h2 class="panel-title">友商信息配置</h2>
              <div class="form-section">
                <div class="toolbar">
                  <a-input-search v-model:value="competitorSearch" placeholder="搜索友商名称" style="width: 300px" allow-clear />
                  <a-button type="primary" @click="showAddCompetitor"><PlusOutlined /> 添加友商</a-button>
                </div>

                <div class="competitor-list">
                  <div v-if="paginatedCompetitors.length === 0" class="empty-text">暂无友商信息</div>
                  <div v-else class="cards-container">
                    <div v-for="comp in paginatedCompetitors" :key="comp.id" class="competitor-card">
                      <div class="card-header">
                        <div class="competitor-name">{{ comp.name }}</div>
                        <div class="card-actions">
                          <a-button size="small" @click="editCompetitor(comp)">编辑</a-button>
                          <a-button size="small" danger @click="deleteCompetitor(comp.id)">删除</a-button>
                        </div>
                      </div>
                      <div class="card-body">
                        <div class="competitor-website"><GlobalOutlined /> <a :href="'https://' + comp.website" target="_blank">{{ comp.website }}</a></div>
                        <div v-if="comp.coreBusiness" class="competitor-business"><TagOutlined /> {{ comp.coreBusiness }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="totalCompetitors > pageSize" class="pagination">
                  <a-pagination v-model:current="currentPage" :page-size="pageSize" :total="totalCompetitors" show-quick-jumper :show-total="(total) => '共 ' + total + ' 条'" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 友商编辑抽屉 -->
    <a-drawer v-model:open="showDrawer" :title="isEditing ? '编辑友商' : '添加友商'" width="600px" placement="right">
      <div class="drawer-content">
        <div class="form-item">
          <label>友商名称 <span class="required-mark">*</span></label>
          <a-input v-model:value="competitorForm.name" placeholder="请输入友商名称" size="large" />
        </div>
        <div class="form-item">
          <label>官方网站 <span class="required-mark">*</span></label>
          <a-input v-model:value="competitorForm.website" placeholder="请输入官方网站" size="large" addon-before="https://" />
        </div>
        <div class="form-item">
          <label>核心业务</label>
          <a-textarea v-model:value="competitorForm.coreBusiness" placeholder="请输入核心业务" :rows="4" size="large" />
        </div>
      </div>
      <template #footer>
        <div style="display: flex; gap: 12px; justify-content: flex-end">
          <a-button @click="showDrawer = false">取消</a-button>
          <a-button type="primary" @click="saveCompetitor">确定</a-button>
        </div>
      </template>
    </a-drawer>

    <!-- 订阅策略弹窗 -->
    <a-modal v-model:open="showSubscribeModal" title="新增订阅策略" width="700px" :footer="null">
      <a-form layout="vertical">
        <a-form-item label="政策层级" required>
          <a-radio-group v-model:value="subscribeForm.level">
            <a-radio value="national">国家级</a-radio>
            <a-radio value="provincial">省市区</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="subscribeForm.level === 'provincial'" label="订阅地区" required>
          <a-select v-model:value="subscribeForm.region" placeholder="请选择订阅地区" style="width: 100%">
            <a-select-option value="北京">北京</a-select-option>
            <a-select-option value="上海">上海</a-select-option>
            <a-select-option value="广东">广东</a-select-option>
            <a-select-option value="江苏">江苏</a-select-option>
            <a-select-option value="浙江">浙江</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="政策类型" required>
          <a-select v-model:value="subscribeForm.policyType" placeholder="请选择政策类型" style="width: 100%">
            <a-select-option value="政策法规">政策法规</a-select-option>
            <a-select-option value="通知公告">通知公告</a-select-option>
            <a-select-option value="专项资金">专项资金</a-select-option>
            <a-select-option value="资质认定">资质认定</a-select-option>
            <a-select-option value="项目申报">项目申报</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="适用对象" required>
          <a-radio-group v-model:value="subscribeForm.target">
            <a-radio value="政府">政府</a-radio>
            <a-radio value="企业">企业</a-radio>
            <a-radio value="个人">个人</a-radio>
            <a-radio value="其他">其他</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="政策主题">
          <a-textarea v-model:value="subscribeForm.subject" placeholder="请输入政策主题" :rows="3" />
        </a-form-item>
        <a-form-item label="适用行业">
          <a-select v-model:value="subscribeForm.industries" mode="multiple" placeholder="请选择适用行业" style="width: 100%">
            <a-select-option value="软件">软件</a-select-option>
            <a-select-option value="互联网">互联网</a-select-option>
            <a-select-option value="人工智能">人工智能</a-select-option>
            <a-select-option value="大数据">大数据</a-select-option>
            <a-select-option value="云计算">云计算</a-select-option>
            <a-select-option value="制造业">制造业</a-select-option>
            <a-select-option value="金融业">金融业</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="政策标签">
          <a-select v-model:value="subscribeForm.tags" mode="multiple" placeholder="请选择政策标签" style="width: 100%">
            <a-select-option value="高新技术">高新技术</a-select-option>
            <a-select-option value="专精特新">专精特新</a-select-option>
            <a-select-option value="中小企业">中小企业</a-select-option>
            <a-select-option value="科技创新">科技创新</a-select-option>
            <a-select-option value="数字化转型">数字化转型</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
      <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px;">
        <a-button @click="showSubscribeModal = false">取消</a-button>
        <a-button type="primary" @click="addSubscription">确定</a-button>
      </div>
    </a-modal>

    <!-- 订阅详情弹窗 -->
    <a-modal v-model:open="showDetailModal" title="订阅策略详情" width="700px" :footer="null">
      <div v-if="currentSubscription">
        <a-descriptions bordered :column="1" size="small">
          <a-descriptions-item label="政策层级">
            <a-tag :color="currentSubscription.level === 'national' ? 'blue' : 'green'">{{ currentSubscription.level === 'national' ? '国家级' : '省市区' }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="订阅地区">{{ currentSubscription.region || '全国' }}</a-descriptions-item>
          <a-descriptions-item label="政策类型"><a-tag color="blue">{{ currentSubscription.policyType }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="适用对象"><a-tag :color="getTargetColor(currentSubscription.target)">{{ currentSubscription.target }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="政策主题">{{ currentSubscription.subject || '-' }}</a-descriptions-item>
        </a-descriptions>
      </div>
      <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px;">
        <a-button @click="showDetailModal = false">关闭</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, CheckOutlined, GlobalOutlined, TagOutlined, ArrowLeftOutlined, BellOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'

const activeTab = ref('basic')

const tabs = [
  { key: 'basic', label: '企业基本信息' },
  { key: 'policy', label: '政策订阅' },
  { key: 'industry', label: '行业信息配置' },
  { key: 'competitor', label: '友商信息配置' },
]

const savingAll = ref(false)

const saveAll = () => {
  savingAll.value = true
  setTimeout(() => {
    message.success('保存成功')
    savingAll.value = false
  }, 800)
}

// ===== 企业信息 =====
const company = reactive({ intro: '', industry: '', regions: [], businessScope: '' })

// ===== 关键词管理 =====
const kw = reactive({ keywords: ['人工智能', '大数据', '云计算'] })
const newKeyword = ref('')

const addKeyword = () => {
  const val = newKeyword.value.trim()
  if (val && !kw.keywords.includes(val)) { kw.keywords.push(val) }
  newKeyword.value = ''
}

const removeKeyword = (index) => { kw.keywords.splice(index, 1) }

// ===== 友商信息 =====
const competitors = ref([
  { id: 1, name: '示例友商 A', website: 'www.competitor-a.com', coreBusiness: '智能硬件' },
  { id: 2, name: '示例友商 B', website: 'www.competitor-b.com', coreBusiness: 'SaaS 服务' },
  { id: 3, name: '示例友商 C', website: 'www.competitor-c.com', coreBusiness: '云计算服务' },
])
const competitorSearch = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const showDrawer = ref(false)
const isEditing = ref(false)
const editingCompetitorId = ref(null)
const competitorForm = reactive({ name: '', website: '', coreBusiness: '' })

const filteredCompetitors = computed(() => {
  if (!competitorSearch.value) return competitors.value
  return competitors.value.filter(c => c.name.toLowerCase().includes(competitorSearch.value.toLowerCase()))
})

const totalCompetitors = computed(() => filteredCompetitors.value.length)

const paginatedCompetitors = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredCompetitors.value.slice(start, start + pageSize.value)
})

const showAddCompetitor = () => {
  showDrawer.value = true; isEditing.value = false;
  competitorForm.name = ''; competitorForm.website = ''; competitorForm.coreBusiness = ''
}

const editCompetitor = (comp) => {
  showDrawer.value = true; isEditing.value = true; editingCompetitorId.value = comp.id;
  competitorForm.name = comp.name; competitorForm.website = comp.website; competitorForm.coreBusiness = comp.coreBusiness || ''
}

const saveCompetitor = () => {
  if (!competitorForm.name || !competitorForm.website) { message.error('请填写必填项'); return }
  if (isEditing.value) {
    const idx = competitors.value.findIndex(c => c.id === editingCompetitorId.value)
    if (idx !== -1) competitors.value[idx] = { ...competitorForm, id: editingCompetitorId.value }
    message.success('已更新')
  } else {
    const newId = Math.max(...competitors.value.map(c => c.id), 0) + 1
    competitors.value.push({ ...competitorForm, id: newId })
    message.success('已添加')
  }
  showDrawer.value = false
}

const deleteCompetitor = (id) => { competitors.value = competitors.value.filter(c => c.id !== id); message.success('已删除') }

// ===== 政策订阅 =====
const showSubscribeModal = ref(false)
const showDetailModal = ref(false)
const subscriptionQuota = ref(3)
const currentSubscription = ref(null)
const subscribeForm = reactive({ level: 'national', region: '', policyType: '', target: '企业', subject: '', industries: [], tags: [] })

const subscriptionColumns = [
  { title: '订阅地区', dataIndex: 'region', key: 'region', width: 120 },
  { title: '政策类型', dataIndex: 'policyType', key: 'policyType', width: 120 },
  { title: '适用对象', dataIndex: 'target', key: 'target', width: 100 },
  { title: '政策主题', dataIndex: 'subject', key: 'subject', ellipsis: true },
  { title: '操作', key: 'action', width: 150 },
]

const subscriptions = ref([
  { id: 1, level: 'provincial', region: '河北省', policyType: '政策法规', target: '政府', subject: '-' },
])

const getTargetColor = (target) => ({ '政府': 'blue', '企业': 'green', '个人': 'orange', '其他': 'default' }[target] || 'default')

const viewSubscription = (record) => { currentSubscription.value = record; showDetailModal.value = true }

const cancelSubscription = (id) => { subscriptions.value = subscriptions.value.filter(s => s.id !== id); message.success('已取消订阅') }

const addSubscription = () => {
  if (!subscribeForm.policyType || !subscribeForm.target) { message.warning('请填写必填项'); return }
  subscriptions.value.push({
    id: Date.now(),
    level: subscribeForm.level,
    region: subscribeForm.level === 'national' ? '全国' : subscribeForm.region,
    policyType: subscribeForm.policyType,
    target: subscribeForm.target,
    subject: subscribeForm.subject || '-',
  })
  message.success('订阅策略已添加')
  showSubscribeModal.value = false
  Object.assign(subscribeForm, { level: 'national', region: '', policyType: '', target: '企业', subject: '', industries: [], tags: [] })
}
</script>

<style scoped>
.profile-page { min-height: 100vh; background: #f5f7ff; padding-top: 64px; }

.page-header {
  background: #fff; border-bottom: 1px solid #e5e7eb; position: sticky; top: 64px; z-index: 50; height: 64px; display: flex; align-items: center; margin-bottom: 16px;
}

.page-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; width: 100%; }

.header-inner { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.header-inner h1 { font-size: 18px; font-weight: 600; flex: 1; text-align: center; margin: 0; }

.header-right { display: flex; align-items: center; gap: 12px; }

.back-btn {
  background: none; border: none; color: #64748b; cursor: pointer; font-size: 15px;
  display: flex; align-items: center; gap: 4px; padding: 8px 12px; border-radius: 6px; transition: all 0.2s;
}
.back-btn:hover { background: #f0f2f5; color: #1677ff; }

.btn-primary {
  background: #4096ff; color: #fff; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.2s;
}
.btn-primary:hover { background: #1677ff; }

.page-body { padding: 24px 0 60px; }

/* Tabs 左右布局 */
.tabs-layout {
  display: flex;
  gap: 0;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  min-height: 600px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

/* 左侧 Tab 导航 */
.tab-nav {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  background: #fafafa;
  padding: 16px 0;
}

.tab-item {
  padding: 12px 24px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  border-left: 3px solid transparent;
  user-select: none;
}

.tab-item:hover {
  color: #1a202c;
  background: rgba(0, 0, 0, 0.02);
}

.tab-item.active {
  color: #1677ff;
  background: #ffffff;
  border-left-color: #1677ff;
  font-weight: 500;
}

/* 右侧内容区域 */
.tab-content {
  flex: 1;
  padding: 32px;
  background: #ffffff;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item { margin-bottom: 24px; }
.form-item label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; }
.form-label { font-size: 14px; font-weight: 500; color: #1a202c; display: block; margin-bottom: 8px; }
.required-mark { color: #ff4d4f; }

.keywords-tip { font-size: 13px; color: #64748b; margin-bottom: 12px; padding: 8px 12px; background: rgba(22,119,255,0.05); border-radius: 6px; }
.keywords-input { display: flex; align-items: center; margin-bottom: 16px; }
.tags-container { display: flex; flex-wrap: wrap; gap: 8px; }
.empty-text { color: #94a3b8; font-size: 13px; padding: 20px 0; }

.toolbar { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; }
.quota-info { font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 4px; }

.competitor-list { max-height: 400px; overflow-y: auto; padding: 4px; }
.cards-container { display: flex; flex-direction: column; gap: 12px; }

.competitor-card {
  background: #f8f9fa; border-radius: 8px; padding: 16px; border: 1px solid transparent; transition: all 0.2s;
}
.competitor-card:hover { background: #f0f2f5; border-color: rgba(22,119,255,0.2); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.competitor-name { font-size: 15px; font-weight: 600; }
.card-actions { display: flex; gap: 8px; }
.card-body { display: flex; flex-direction: column; gap: 4px; }
.competitor-website, .competitor-business { font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 4px; }
.competitor-website a { color: #1677ff; text-decoration: none; }

.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }

.drawer-content .form-item { margin-bottom: 16px; }
.drawer-content label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; }

.empty-state { text-align: center; padding: 60px 20px; }
.empty-state .empty-icon { font-size: 48px; color: #d9d9d9; margin-bottom: 16px; }
.empty-state .empty-text { font-size: 14px; color: #8c8c8c; margin-bottom: 20px; }

.subscription-table { margin-top: 16px; }

@media (max-width: 768px) {
  .tabs-layout {
    flex-direction: column;
  }

  .tab-nav {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    overflow-x: auto;
    padding: 8px 0;
  }

  .tab-item {
    border-left: none;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
    padding: 8px 16px;
  }

  .tab-item.active {
    border-left-color: transparent;
    border-bottom-color: #1677ff;
  }

  .tab-content {
    padding: 20px;
  }
}
</style>
