<template>
  <div class="report-generate-page">
    <TopNav />

    <main class="generate-shell">
      <header class="page-heading">
        <div class="heading-title">
          <button type="button" class="back-button" aria-label="返回报告设置" @click="router.back()">
            <ArrowLeftOutlined />
          </button>
          <div>
            <h1>{{ periodInfo.listTitle }}</h1>
            <p>默认按发布时间从近到远展示，可筛选并调整本次报告包含的数据。</p>
          </div>
        </div>
        <a-button
          type="primary"
          size="large"
          :disabled="availableItems.length === 0"
          @click="openGenerateConfirm"
        >
          确认新报告生成
        </a-button>
      </header>

      <section class="data-panel">
        <nav class="source-tabs" aria-label="报告数据来源">
          <button
            v-for="tab in sourceTabs"
            :key="tab.value"
            type="button"
            :class="{ active: activeSource === tab.value }"
            @click="activeSource = tab.value"
          >
            {{ tab.label }}（{{ tab.count }}）
          </button>
        </nav>

        <div class="data-content">
          <nav class="business-tabs" aria-label="业务领域筛选">
          <button
            v-for="field in businessTabs"
            :key="field.value"
            type="button"
            :class="{ active: businessFilter === field.value }"
            @click="businessFilter = field.value"
          >
            {{ field.label }}（{{ field.count }}）
          </button>
          </nav>

          <div class="filter-bar" :class="{ compact: activeSource !== 'policy' }">
          <a-select
            v-if="activeSource === 'policy'"
            v-model:value="regionFilter"
            allow-clear
            placeholder="地区"
            class="filter-select"
          >
            <a-select-option v-for="region in regionOptions" :key="region" :value="region">
              {{ region }}
            </a-select-option>
          </a-select>
          <a-input
            v-model:value="keyword"
            allow-clear
            placeholder="搜索标题、来源关键词"
            class="keyword-input"
          >
            <template #prefix><SearchOutlined /></template>
          </a-input>
          <a-button @click="resetFilters"><ReloadOutlined /> 重置</a-button>
          <a-button type="primary" @click="openSourceAdd">
            <PlusOutlined /> {{ addButtonText }}
          </a-button>
          </div>

          <div v-if="pageItems.length" class="data-list">
          <article
            v-for="item in pageItems"
            :key="item.id"
            class="data-card"
          >
            <div class="data-card-content">
              <h2>{{ item.title }}</h2>
              <div v-if="item.businessFields.length" class="tag-list">
                <a-tag v-for="field in item.businessFields.slice(0, 4)" :key="field" color="orange">
                  {{ field }}
                </a-tag>
              </div>
              <div class="data-card-divider"></div>
              <div class="data-card-footer">
                <div class="data-meta">
                  <span>来源：{{ item.source }}</span>
                  <span v-if="item.competitorName">友商：{{ item.competitorName }}</span>
                  <span>地区：{{ item.region }}</span>
                  <span>发布时间：{{ item.publishDate }}</span>
                </div>
                <button type="button" class="remove-button" @click="removeItem(item)">
                  移除信息
                </button>
              </div>
            </div>
          </article>
          </div>

          <div v-else class="empty-state">
          <InboxOutlined />
          <p>当前条件下暂无数据</p>
          <a-button @click="resetFilters">重置筛选</a-button>
          </div>

          <footer v-if="filteredItems.length" class="pagination-row">
          <span>共 {{ filteredItems.length }} 条记录</span>
          <a-pagination
            v-model:current="currentPage"
            :total="filteredItems.length"
            :page-size="pageSize"
            :show-size-changer="false"
            show-quick-jumper
          />
          </footer>
        </div>
      </section>
    </main>

    <a-modal
      v-model:open="policyAddModalOpen"
      title="添加政策"
      width="1050px"
      :footer="null"
      :mask-closable="false"
      destroy-on-close
    >
      <div class="policy-add-modal">
        <div class="policy-modal-note">
          仅展示报告周期 {{ periodInfo.start }} 至 {{ periodInfo.end }} 内，且地区属于企业关注地区或全国的政策。
        </div>
        <div class="policy-modal-filters">
          <a-select
            v-model:value="policyModalRegion"
            allow-clear
            placeholder="选择地区"
          >
            <a-select-option v-for="region in policyRegionOptions" :key="region" :value="region">
              {{ region }}
            </a-select-option>
          </a-select>
          <a-range-picker :value="reportDateRange" disabled />
          <a-input
            v-model:value="policyModalKeyword"
            allow-clear
            placeholder="搜索政策标题、发文单位"
          >
            <template #prefix><SearchOutlined /></template>
          </a-input>
        </div>

        <a-table
          row-key="id"
          :columns="policyTableColumns"
          :data-source="policyCandidateItems"
          :pagination="policyTablePagination"
          :scroll="{ y: 410 }"
          @change="handlePolicyTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'operation'">
              <a-button
                type="link"
                :disabled="isItemAdded(record.id)"
                @click="addPolicyItem(record)"
              >
                {{ isItemAdded(record.id) ? '已添加' : '添加' }}
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>

    <a-drawer
      v-model:open="manualAddDrawerOpen"
      :title="manualAddType === 'industry' ? '新增行业信息' : '新增友商信息'"
      width="680px"
      placement="right"
      :mask-closable="false"
    >
      <a-form layout="vertical" class="manual-add-form">
        <div class="drawer-form-grid" :class="{ two: manualAddType === 'competitor' }">
          <a-form-item label="所属业务领域" required>
            <a-select v-model:value="manualAddForm.businessField" placeholder="请选择业务领域">
              <a-select-option v-for="field in configuredBusinessFields" :key="field" :value="field">
                {{ field }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item v-if="manualAddType === 'competitor'" label="所属友商" required>
            <a-select
              v-model:value="manualAddForm.competitor"
              show-search
              placeholder="请选择友商"
            >
              <a-select-option v-for="name in competitorOptions" :key="name" :value="name">
                {{ name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </div>

        <a-form-item label="信息标题" required>
          <a-input v-model:value="manualAddForm.title" placeholder="请输入" />
        </a-form-item>

        <a-form-item label="原文链接" required>
          <a-input v-model:value="manualAddForm.sourceUrl" placeholder="请输入" />
        </a-form-item>

        <div class="drawer-form-grid two">
          <a-form-item label="来源" required>
            <a-input v-model:value="manualAddForm.source" placeholder="请输入" />
          </a-form-item>
          <a-form-item label="发布时间" required>
            <a-date-picker
              v-model:value="manualAddForm.publishDate"
              :disabled-date="disabledReportDate"
              placeholder="选择日期"
              style="width: 100%"
            />
          </a-form-item>
        </div>
      </a-form>

      <template #footer>
        <div class="drawer-footer">
          <a-button @click="manualAddDrawerOpen = false">取消</a-button>
          <a-button type="primary" @click="submitManualItem">确定</a-button>
        </div>
      </template>
    </a-drawer>

    <a-modal
      v-model:open="confirmModalOpen"
      title="确认生成报告"
      width="470px"
      :footer="null"
      :mask-closable="false"
    >
      <div class="confirm-content">
        <ExclamationCircleFilled />
        <div>
          <p>你确定要生成当前勾选的报告吗？生成后报告状态为“生成中”</p>
          <span>本次将包含 {{ availableItems.length }} 条数据，生成记录可在报告列表中查看。</span>
        </div>
      </div>
      <div class="confirm-footer">
        <a-button @click="confirmModalOpen = false">取消</a-button>
        <a-button type="primary" @click="confirmGenerate">确定</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  ArrowLeftOutlined,
  ExclamationCircleFilled,
  InboxOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'
import { relatedPolicyRecords } from '@/data/relatedPolicies.js'
import { cloudPolicyRecords } from '@/data/cloudPolicyRecords.js'
import { industryRecords } from '@/data/industryRecords.js'
import { competitorNames, competitorRecords } from '@/data/competitorRecords.js'
import { saveManualReport } from '@/utils/manualReports.js'

const route = useRoute()
const router = useRouter()
const pageSize = 10

const reportType = ['monthly', 'halfYear', 'annual'].includes(String(route.query.type))
  ? String(route.query.type)
  : 'monthly'

const getDefaultPeriod = (type) => {
  const now = dayjs()
  if (type === 'halfYear') return now.month() >= 6 ? `${now.year()}-H1` : `${now.year() - 1}-H2`
  if (type === 'annual') return String(now.year() - 1)
  return now.format('YYYY-MM')
}

const reportPeriod = String(route.query.period || getDefaultPeriod(reportType))

const createPeriodInfo = (type, period) => {
  if (type === 'halfYear') {
    const matched = period.match(/^(\d{4})-H([12])$/)
    const year = matched?.[1] || String(dayjs().year())
    const half = matched?.[2] || '1'
    const firstHalf = half === '1'
    const label = `${year}年${firstHalf ? '上' : '下'}半年`
    return {
      start: `${year}-${firstHalf ? '01-01' : '07-01'}`,
      end: `${year}-${firstHalf ? '06-30' : '12-31'}`,
      reportLabel: label,
      listTitle: `${label}报数据列表`,
    }
  }

  if (type === 'annual') {
    const year = /^\d{4}$/.test(period) ? period : String(dayjs().year() - 1)
    return {
      start: `${year}-01-01`,
      end: `${year}-12-31`,
      reportLabel: `${year}年`,
      listTitle: `${year}年年报数据列表`,
    }
  }

  const month = /^\d{4}-\d{2}$/.test(period) ? period : dayjs().format('YYYY-MM')
  const date = dayjs(`${month}-01`)
  const label = `${date.year()}年${date.month() + 1}月`
  return {
    start: date.startOf('month').format('YYYY-MM-DD'),
    end: date.endOf('month').format('YYYY-MM-DD'),
    reportLabel: label,
    listTitle: `${label}月报数据列表`,
  }
}

const periodInfo = createPeriodInfo(reportType, reportPeriod)

const configuredBusinessFields = ['一网通办', '一网协同', '人工智能', '市场监管', '数据要素', '门户网站']
const enterpriseFocusRegions = [
  '北京市', '浙江省', '江西省', '山东省', '江苏省', '上海市', '陕西省', '甘肃省',
  '四川省', '广西壮族自治区', '河南省', '天津市', '河北省', '吉林省', '黑龙江省',
  '南京市', '杭州市', '济南市', '宁波市', '南昌市', '兰州市', '苏州市', '西安市',
  '郑州市', '石家庄市',
]

const isPolicyRegionInFocus = (region) => region === '全国' || enterpriseFocusRegions.includes(region)

const normalizeItems = () => {
  const policies = [...relatedPolicyRecords, ...cloudPolicyRecords].map((item) => ({
    id: `policy:${item.id}`,
    originalId: item.id,
    sourceType: 'policy',
    title: item.title,
    source: item.issuer || '政策发布单位',
    publishDate: item.publishDate,
    sortDate: item.publishDate,
    region: item.region || '全国',
    businessFields: [...new Set([...(item.tags || []), item.businessField].filter(Boolean))],
    autoIncluded: item.dataSource !== 'cloud',
  }))

  const industries = industryRecords.map((item) => ({
    id: `industry:${item.id}`,
    originalId: item.id,
    sourceType: 'industry',
    title: item.title,
    source: item.source || '行业信息来源',
    publishDate: item.publishDate,
    sortDate: item.publishDate,
    region: '全国',
    businessFields: item.businessFields || [],
  }))

  const competitors = competitorRecords.map((item) => ({
    id: `competitor:${item.id}`,
    originalId: item.id,
    sourceType: 'competitor',
    title: item.title,
    source: item.competitorName || item.channel || '友商动态来源',
    publishDate: item.publishDate,
    sortDate: item.sortDate || item.publishDate,
    region: '全国',
    businessFields: [item.businessField].filter(Boolean),
  }))

  return [...policies, ...industries, ...competitors]
    .filter((item) => item.sortDate >= periodInfo.start && item.sortDate <= periodInfo.end)
    .sort((left, right) => right.sortDate.localeCompare(left.sortDate))
}

const allPeriodItems = normalizeItems()
const availableItems = ref(allPeriodItems.filter((item) => (
  item.sourceType !== 'policy' || (item.autoIncluded && isPolicyRegionInFocus(item.region))
)))
const activeSource = ref('policy')
const getDefaultBusinessField = (sourceType) => configuredBusinessFields.find((field) => (
  availableItems.value.some((item) => item.sourceType === sourceType && item.businessFields.includes(field))
)) || configuredBusinessFields[0]
const businessFilter = ref(getDefaultBusinessField('policy'))
const regionFilter = ref(undefined)
const keyword = ref('')
const currentPage = ref(1)
const confirmModalOpen = ref(false)
const policyAddModalOpen = ref(false)
const policyModalRegion = ref(undefined)
const policyModalKeyword = ref('')
const policyModalPage = ref(1)
const manualAddDrawerOpen = ref(false)
const manualAddType = ref('industry')
const competitorOptions = competitorNames
const manualAddForm = reactive({
  businessField: configuredBusinessFields[0],
  competitor: undefined,
  title: '',
  sourceUrl: '',
  source: '',
  publishDate: null,
})

const sourceTabs = computed(() => [
  { value: 'policy', label: '政策数据列表', count: availableItems.value.filter((item) => item.sourceType === 'policy').length },
  { value: 'industry', label: '行业信息列表', count: availableItems.value.filter((item) => item.sourceType === 'industry').length },
  { value: 'competitor', label: '友商信息列表', count: availableItems.value.filter((item) => item.sourceType === 'competitor').length },
])

const sourceItems = computed(() => availableItems.value.filter((item) => item.sourceType === activeSource.value))

const businessTabs = computed(() => configuredBusinessFields.map((field) => ({
    value: field,
    label: field,
    count: sourceItems.value.filter((item) => item.businessFields.includes(field)).length,
  })))

const regionOptions = computed(() => [...new Set(sourceItems.value.map((item) => item.region))]
  .sort((left, right) => left.localeCompare(right, 'zh-CN')))

const filteredItems = computed(() => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()
  return sourceItems.value.filter((item) => {
    const matchesBusiness = item.businessFields.includes(businessFilter.value)
    const matchesRegion = !regionFilter.value || item.region === regionFilter.value
    const matchesKeyword = !normalizedKeyword
      || `${item.title} ${item.source}`.toLowerCase().includes(normalizedKeyword)
    return matchesBusiness && matchesRegion && matchesKeyword
  })
})

const pageItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredItems.value.slice(start, start + pageSize)
})

const removeItem = (item) => {
  availableItems.value = availableItems.value.filter((candidate) => candidate.id !== item.id)
  message.success('已从本次报告中移除该信息')
}

const resetFilters = () => {
  businessFilter.value = getDefaultBusinessField(activeSource.value)
  regionFilter.value = undefined
  keyword.value = ''
  currentPage.value = 1
}

const addButtonText = computed(() => ({
  policy: '添加政策',
  industry: '新增行业信息',
  competitor: '新增友商信息',
}[activeSource.value]))

const reportDateRange = [dayjs(periodInfo.start), dayjs(periodInfo.end)]

const policyRegionOptions = computed(() => [...new Set(
  allPeriodItems
    .filter((item) => item.sourceType === 'policy' && isPolicyRegionInFocus(item.region))
    .map((item) => item.region),
)].sort((left, right) => {
  if (left === '全国') return -1
  if (right === '全国') return 1
  return left.localeCompare(right, 'zh-CN')
}))

const policyCandidateItems = computed(() => {
  const normalizedKeyword = policyModalKeyword.value.trim().toLowerCase()
  return allPeriodItems.filter((item) => {
    if (item.sourceType !== 'policy' || !isPolicyRegionInFocus(item.region)) return false
    const matchesRegion = !policyModalRegion.value || item.region === policyModalRegion.value
    const matchesKeyword = !normalizedKeyword
      || `${item.title} ${item.source}`.toLowerCase().includes(normalizedKeyword)
    return matchesRegion && matchesKeyword
  })
})

const policyTableColumns = [
  { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true, width: 400 },
  { title: '所属地区', dataIndex: 'region', key: 'region', width: 120 },
  { title: '发文单位', dataIndex: 'source', key: 'source', ellipsis: true, width: 190 },
  { title: '发文时间', dataIndex: 'publishDate', key: 'publishDate', width: 120 },
  { title: '操作', key: 'operation', width: 90, align: 'center' },
]

const policyTablePagination = computed(() => ({
  current: policyModalPage.value,
  pageSize: 10,
  total: policyCandidateItems.value.length,
  showSizeChanger: false,
  showQuickJumper: true,
  showTotal: total => `共 ${total} 条记录`,
}))

const isItemAdded = (id) => availableItems.value.some((item) => item.id === id)

const addPolicyItem = (item) => {
  if (isItemAdded(item.id)) return
  const itemForCurrentField = item.businessFields.includes(businessFilter.value)
    ? item
    : { ...item, businessFields: [...item.businessFields, businessFilter.value] }
  availableItems.value = [...availableItems.value, itemForCurrentField]
    .sort((left, right) => right.sortDate.localeCompare(left.sortDate))
  regionFilter.value = undefined
  keyword.value = ''
  currentPage.value = 1
  message.success('政策已添加到本次报告')
}

const handlePolicyTableChange = (pagination) => {
  policyModalPage.value = pagination.current || 1
}

const getDefaultPublishDate = () => {
  const now = dayjs()
  const start = dayjs(periodInfo.start)
  const end = dayjs(periodInfo.end)
  if (now.isBefore(start)) return start
  if (now.isAfter(end)) return end
  return now
}

const resetManualAddForm = (sourceType) => {
  manualAddForm.businessField = configuredBusinessFields.includes(businessFilter.value)
    ? businessFilter.value
    : getDefaultBusinessField(sourceType)
  manualAddForm.competitor = undefined
  manualAddForm.title = ''
  manualAddForm.sourceUrl = ''
  manualAddForm.source = ''
  manualAddForm.publishDate = getDefaultPublishDate()
  manualAddType.value = sourceType
}

const openSourceAdd = () => {
  if (activeSource.value === 'policy') {
    policyModalRegion.value = undefined
    policyModalKeyword.value = ''
    policyModalPage.value = 1
    policyAddModalOpen.value = true
    return
  }

  resetManualAddForm(activeSource.value)
  manualAddDrawerOpen.value = true
}

const disabledReportDate = (date) => {
  if (!date) return false
  return date.isBefore(dayjs(periodInfo.start), 'day') || date.isAfter(dayjs(periodInfo.end), 'day')
}

const submitManualItem = () => {
  const requiredValues = [
    manualAddForm.businessField,
    manualAddForm.title.trim(),
    manualAddForm.sourceUrl.trim(),
    manualAddForm.source.trim(),
    manualAddForm.publishDate,
  ]
  if (manualAddType.value === 'competitor') requiredValues.push(manualAddForm.competitor)
  if (requiredValues.some((value) => !value)) {
    message.warning('请完整填写必填信息')
    return
  }

  const id = `manual-${manualAddType.value}:${Date.now()}`
  const newItem = {
    id,
    originalId: id,
    sourceType: manualAddType.value,
    title: manualAddForm.title.trim(),
    source: manualAddForm.source.trim(),
    sourceUrl: manualAddForm.sourceUrl.trim(),
    competitorName: manualAddForm.competitor,
    publishDate: dayjs(manualAddForm.publishDate).format('YYYY-MM-DD'),
    sortDate: dayjs(manualAddForm.publishDate).format('YYYY-MM-DD'),
    region: '全国',
    businessFields: [manualAddForm.businessField],
    manuallyAdded: true,
  }

  availableItems.value = [...availableItems.value, newItem]
    .sort((left, right) => right.sortDate.localeCompare(left.sortDate))
  activeSource.value = manualAddType.value
  businessFilter.value = manualAddForm.businessField
  regionFilter.value = undefined
  keyword.value = ''
  currentPage.value = 1
  manualAddDrawerOpen.value = false
  message.success(`${manualAddType.value === 'industry' ? '行业信息' : '友商信息'}已加入本次报告`)
}

const openGenerateConfirm = () => {
  if (!availableItems.value.length) {
    message.warning('请至少添加一条报告数据')
    return
  }
  confirmModalOpen.value = true
}

const confirmGenerate = () => {
  const selectedItems = availableItems.value
  const countBySource = (sourceType) => selectedItems.filter((item) => item.sourceType === sourceType).length
  const tags = [...new Set(selectedItems.flatMap((item) => item.businessFields))].slice(0, 5)
  const createdAt = dayjs().format('YYYY-MM-DDTHH:mm:ss')

  saveManualReport({
    id: `manual_${Date.now()}`,
    title: `${periodInfo.reportLabel}手动报告`,
    type: reportType,
    reportLabel: periodInfo.reportLabel,
    period_date: periodInfo.reportLabel,
    periodStart: periodInfo.start,
    periodEnd: periodInfo.end,
    created_at: createdAt,
    status: 'generating',
    favorited: false,
    generate_type: 'manual',
    summary: `报告正在生成中，已选取 ${selectedItems.length} 条政策、行业及友商数据。`,
    policyCount: countBySource('policy'),
    industryCount: countBySource('industry'),
    competitorCount: countBySource('competitor'),
    bidCount: 0,
    creator: '杨蕾',
    tags,
    selectedItems: selectedItems.map((item) => ({
      id: item.originalId,
      sourceType: item.sourceType,
      title: item.title,
      source: item.source,
      publishDate: item.publishDate,
      region: item.region,
      competitorName: item.competitorName,
      businessFields: item.businessFields,
      sourceUrl: item.sourceUrl,
    })),
  })

  confirmModalOpen.value = false
  message.success('报告记录已新增，当前状态为“生成中”')
  router.push('/report/list')
}

watch([activeSource, businessFilter, regionFilter, keyword], () => {
  currentPage.value = 1
})

watch(activeSource, () => {
  businessFilter.value = getDefaultBusinessField(activeSource.value)
  regionFilter.value = undefined
  keyword.value = ''
})

watch([policyModalRegion, policyModalKeyword], () => {
  policyModalPage.value = 1
})

watch(() => filteredItems.value.length, (total) => {
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  if (currentPage.value > lastPage) currentPage.value = lastPage
})
</script>

<style scoped>
.report-generate-page {
  min-height: 100vh;
  padding-top: 64px;
  background: #f3f5f8;
  color: #1f2329;
}

.generate-shell {
  width: min(1200px, calc(100% - 48px));
  margin: 0 auto;
  padding: 24px 0 56px;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
}

.heading-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.heading-title h1 {
  margin: 0 0 5px;
  font-size: 20px;
  font-weight: 600;
}

.heading-title p {
  margin: 0;
  color: #8a9099;
  font-size: 13px;
}

.back-button {
  width: 38px;
  height: 38px;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #fff;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  cursor: pointer;
}

.data-panel {
  min-height: 650px;
  padding: 0;
  background: transparent;
}

.data-content {
  min-height: 650px;
  padding: 0 0 22px;
  border-radius: 0 12px 12px 12px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
}

.source-tabs {
  display: inline-flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 0;
}

.source-tabs button {
  min-width: 148px;
  padding: 13px 18px;
  border: 1px solid transparent;
  border-radius: 8px 8px 0 0;
  background: #e9edf2;
  color: #5d646e;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, box-shadow 0.2s;
}

.source-tabs button::after {
  display: none;
}

.source-tabs button.active {
  color: #1677ff;
  font-weight: 500;
  background: #fff;
  border-color: #e6e9ed;
  border-bottom-color: #fff;
  box-shadow: 0 -2px 8px rgba(15, 23, 42, 0.035);
}

.business-tabs {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 24px;
  margin: 0 30px;
  padding: 0 12px;
  border-bottom: 1px solid #dfe4ea;
}

.business-tabs button {
  position: relative;
  min-width: 128px;
  padding: 14px 10px 16px;
  border: 0;
  background: transparent;
  color: #5f6670;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
}

.business-tabs button::after {
  position: absolute;
  right: 14%;
  bottom: -1px;
  left: 14%;
  height: 2px;
  border-radius: 2px;
  background: transparent;
  content: '';
}

.business-tabs button.active {
  color: #1677ff;
  font-weight: 500;
}

.business-tabs button.active::after {
  background: #1677ff;
}

.filter-bar {
  display: grid;
  grid-template-columns: 160px minmax(260px, 1fr) auto auto;
  gap: 12px;
  margin: 0 30px;
  padding: 18px 0;
  border-bottom: 1px solid #dfe4ea;
}

.filter-bar.compact {
  grid-template-columns: minmax(260px, 1fr) auto auto;
  padding-left: 34%;
}

.filter-select,
.keyword-input {
  width: 100%;
}

.data-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 30px 0;
}

.data-card {
  position: relative;
  display: block;
  padding: 18px 18px 15px;
  border: 1px solid #edf0f3;
  border-radius: 9px;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.data-card-content h2 {
  margin: 0 0 10px;
  color: #272b32;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.55;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-list :deep(.ant-tag) {
  margin: 0;
}

.data-card-divider {
  height: 1px;
  margin: 12px 0 10px;
  background: #f0f1f3;
}

.data-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 26px;
  color: #89909a;
  font-size: 13px;
}

.data-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 28px;
}

.remove-button {
  flex: 0 0 auto;
  padding: 5px 0;
  border: 0;
  background: transparent;
  color: #ff4d4f;
  font-size: 13px;
  cursor: pointer;
}

.empty-state {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #a0a6af;
}

.empty-state > :first-child {
  font-size: 42px;
}

.empty-state p {
  margin: 0;
}

.pagination-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  margin: 0 30px;
  padding-top: 22px;
  color: #8a9099;
  font-size: 13px;
}

.confirm-content {
  display: flex;
  gap: 14px;
  padding: 10px 0 22px;
}

.confirm-content > :first-child {
  flex: 0 0 auto;
  margin-top: 3px;
  color: #faad14;
  font-size: 20px;
}

.confirm-content p {
  margin: 0 0 8px;
  color: #24282f;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.7;
}

.confirm-content span {
  color: #8a9099;
  font-size: 13px;
}

.confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid #f0f0f0;
}

.policy-add-modal {
  padding-top: 2px;
}

.policy-modal-note {
  margin-bottom: 14px;
  padding: 10px 12px;
  border-radius: 6px;
  background: #f0f7ff;
  color: #5d6b7c;
  font-size: 13px;
}

.policy-modal-filters {
  display: grid;
  grid-template-columns: 170px 300px minmax(260px, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.manual-add-form {
  padding: 8px 2px;
}

.drawer-form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.drawer-form-grid.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 900px) {
  .page-heading {
    align-items: flex-start;
  }

  .filter-bar {
    grid-template-columns: 1fr 1fr;
  }

  .filter-bar.compact {
    grid-template-columns: 1fr 1fr;
    padding-left: 0;
  }

  .source-tabs {
    gap: 18px;
    overflow-x: auto;
  }

  .business-tabs {
    display: flex;
    margin: 0;
    overflow-x: auto;
  }

  .business-tabs button {
    min-width: 112px;
  }

  .policy-modal-filters {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .generate-shell {
    width: min(100% - 24px, 1200px);
  }

  .page-heading {
    flex-direction: column;
  }

  .data-panel {
    padding: 0 0 18px;
  }

  .filter-bar {
    grid-template-columns: 1fr;
  }

  .filter-bar.compact {
    grid-template-columns: 1fr;
  }

  .filter-bar,
  .pagination-row {
    margin-right: 0;
    margin-left: 0;
  }

  .data-list {
    padding-right: 0;
    padding-left: 0;
  }

  .data-card-footer {
    align-items: flex-start;
  }

  .drawer-form-grid.two {
    grid-template-columns: 1fr;
  }
}
</style>
