<template>
  <div class="report-settings-page">
    <TopNav />

    <main class="settings-shell">
      <header class="page-title-row">
        <button class="back-button" type="button" aria-label="返回上一级" @click="router.back()">
          <ArrowLeftOutlined />
        </button>
        <h1>报告设置</h1>
      </header>

      <section class="company-card">
        <div class="company-card-header">
          <div>
            <h2>企业信息</h2>
            <p>企业 ID：{{ companyInfo.id }}</p>
          </div>
          <a-button class="company-config-button" @click="goToCompanyProfile('basic')">
            <EditOutlined /> 企业信息配置
          </a-button>
        </div>

        <nav class="company-tabs" aria-label="企业信息分类">
          <button
            v-for="tab in companyTabs"
            :key="tab.key"
            type="button"
            :class="{ active: companyTab === tab.key }"
            @click="handleCompanyTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </nav>

        <div class="company-details">
          <div class="company-detail-row">
            <span class="detail-label">企业简介：</span>
            <p class="detail-content text-content" :class="{ collapsed: !companyExpanded }">
              {{ companyInfo.intro }}
            </p>
          </div>

          <div class="company-detail-row">
            <span class="detail-label">核心业务领域：</span>
            <div class="detail-content tag-list">
              <a-tag v-for="field in companyInfo.businessFields" :key="field" color="blue">
                {{ field }}
              </a-tag>
            </div>
          </div>

          <div class="company-detail-row">
            <span class="detail-label">关注地区：</span>
            <div class="detail-content tag-list region-tags">
              <a-tag v-for="region in companyInfo.focusRegions" :key="region">
                {{ region }}
              </a-tag>
            </div>
          </div>

          <div class="company-detail-row advantage-row">
            <span class="detail-label">核心竞争力：</span>
            <p class="detail-content text-content advantage-content" :class="{ collapsed: !companyExpanded }">
              {{ companyInfo.coreAdvantage }}
            </p>
          </div>
        </div>

        <button class="expand-button" type="button" @click="companyExpanded = !companyExpanded">
          <UpOutlined v-if="companyExpanded" />
          <DownOutlined v-else />
          {{ companyExpanded ? '收起' : '展开更多' }}
        </button>
      </section>

      <section class="report-rule-panel">
        <nav class="setting-tabs" aria-label="报告设置类型">
          <button
            type="button"
            :class="{ active: activeMode === 'auto' }"
            @click="activeMode = 'auto'"
          >
            自动报告规则设置
          </button>
          <button
            type="button"
            :class="{ active: activeMode === 'manual' }"
            @click="activeMode = 'manual'"
          >
            手动报告生成设置
          </button>
        </nav>

        <div v-if="activeMode === 'auto'" class="auto-rules">
          <article
            v-for="rule in autoRules"
            :key="rule.type"
            class="rule-card"
            :class="{ enabled: rule.enabled }"
          >
            <div class="rule-card-header">
              <h3>{{ getRuleName(rule.type) }}</h3>
              <div class="switch-control">
                <a-switch
                  :checked="rule.enabled"
                  size="small"
                  @change="checked => toggleRule(rule, checked)"
                />
                <span>{{ rule.enabled ? '开启' : '关闭' }}</span>
              </div>
            </div>

            <div class="rule-description">
              <span>生成周期：</span>
              <p>{{ getCycleDescription(rule) }}</p>
            </div>

            <div class="next-run">
              <span>下次生成：</span>
              <strong>{{ getNextRunText(rule) }}</strong>
            </div>

            <div class="rule-card-footer">
              <a-button
                type="primary"
                size="small"
                :disabled="!rule.enabled"
                @click="openRuleConfig(rule)"
              >
                配置
              </a-button>
            </div>
          </article>
        </div>

        <div v-else class="auto-rules manual-rules">
          <article
            v-for="card in manualCards"
            :key="card.type"
            class="rule-card manual-rule-card enabled"
          >
            <div class="rule-card-header">
              <h3>{{ card.title }}</h3>
            </div>

            <div class="manual-period-control">
              <a-date-picker
                v-if="card.type === 'monthly'"
                v-model:value="card.dateValue"
                picker="month"
                format="YYYY-MM"
                :allow-clear="false"
                style="width: 100%"
                @change="syncManualPeriod(card)"
              />
              <a-select
                v-else-if="card.type === 'halfYear'"
                v-model:value="card.period"
                style="width: 100%"
              >
                <a-select-option
                  v-for="option in halfYearOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <a-select v-else v-model:value="card.period" style="width: 100%">
                <a-select-option
                  v-for="year in annualOptions"
                  :key="year"
                  :value="String(year)"
                >
                  {{ year }}年
                </a-select-option>
              </a-select>
            </div>

            <div class="manual-period-range">{{ getManualPeriodRange(card) }}</div>

            <div class="rule-card-footer">
              <a-button type="primary" size="small" @click="startManualReport(card)">
                生成
              </a-button>
            </div>
          </article>
        </div>
      </section>
    </main>

    <a-modal
      v-model:open="configModalOpen"
      :title="configModalTitle"
      width="520px"
      :footer="null"
      :mask-closable="false"
      destroy-on-close
    >
      <div class="config-modal-body">
        <div class="config-label"><span>*</span> 自动生成日</div>

        <div v-if="editingRuleType === 'monthly'" class="config-row">
          <span>每月</span>
          <a-select v-model:value="configDraft.monthlyDay">
            <a-select-option v-for="day in dayOptions" :key="day" :value="day">
              {{ day }}号
            </a-select-option>
          </a-select>
          <span class="config-help">生成上月月报</span>
        </div>

        <template v-else-if="editingRuleType === 'halfYear'">
          <div class="config-row">
            <span>每年7月</span>
            <a-select v-model:value="configDraft.halfYearFirstDay">
              <a-select-option v-for="day in dayOptions" :key="day" :value="day">
                {{ day }}号
              </a-select-option>
            </a-select>
            <span class="config-help">生成当年上半年报</span>
          </div>
          <div class="config-row">
            <span>每年次年1月</span>
            <a-select v-model:value="configDraft.halfYearSecondDay">
              <a-select-option v-for="day in dayOptions" :key="day" :value="day">
                {{ day }}号
              </a-select-option>
            </a-select>
            <span class="config-help">生成上一年下半年报</span>
          </div>
        </template>

        <div v-else-if="editingRuleType === 'annual'" class="config-row">
          <span>每年1月</span>
          <a-select v-model:value="configDraft.annualDay">
            <a-select-option v-for="day in dayOptions" :key="day" :value="day">
              {{ day }}号
            </a-select-option>
          </a-select>
          <span class="config-help">生成上一年年报</span>
        </div>
      </div>

      <div class="config-modal-footer">
        <a-button @click="closeConfigModal">取消</a-button>
        <a-button type="primary" @click="saveRuleConfig">确定</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  DownOutlined,
  EditOutlined,
  UpOutlined,
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import TopNav from '@/components/TopNav.vue'

const route = useRoute()
const router = useRouter()

const companyInfo = {
  id: 'zGMRSoz8tXV4MlCLuw9SG',
  intro: '大汉软件总部位于南京，是深耕数智化领域的自主可控、信创导向软件开发商与技术服务商，全国 15 城设分支机构，2019 年完成股改并获蚂蚁集团战略投资。公司从 2000 年媒体网站业务起步，逐步切入电子政务、移动政务、互联网+政务服务，2023 年发力政务垂类大模型；拥有 200 余项软著与专利，参与多项政务国家标准编制，入选国家信创图谱，常年位居国内数字政府行业头部。自主研发星汉 Galaxy 政务垂类大模型，已完成国家网信办生成式 AI、深度合成双备案，广泛服务国家部委、各省市政务平台，同时赋能国企、高校数智化转型。',
  businessFields: ['一网通办', '一网协同', '人工智能', '市场监管', '数据要素', '门户网站'],
  focusRegions: ['江苏省', '江西省', '北京市'],
  coreAdvantage: '1. 完整自主可控的底层技术底座\n掌握移动多端全栈、数据智能挖掘、互联网安全认证、高性能服务、门户支撑五大自研核心技术；坚持国产信创路线，拥有完整自主知识产权及 200+ 专利与软著。\n2. 政务行业深耕二十余年，具备标准制定话语权\n2003 年首创政府网站群理念，全程参与国家政务服务多项国家标准编制；服务覆盖国家部委、全国多省市，积累海量政务业务场景经验，行业标杆案例丰富。\n3. 国内领先的政务专属大模型能力\n星汉 Galaxy 政务垂类大模型完成国家网信办双备案，覆盖知识助手、公文辅助、智慧热线、智能帮办、智策大脑、报告助理等成熟场景。\n4. 全链条一体化交付能力\n具备从顶层规划、平台开发、模型训练、项目实施到长期运维、数据运营和安全保障的全流程闭环能力。',
}

const companyTabs = [
  { key: 'basic', label: '企业基础信息' },
  { key: 'policy', label: '政策订阅' },
  { key: 'industry', label: '行业信息配置' },
  { key: 'competitor', label: '友商信息配置' },
]

const companyTab = ref('basic')
const companyExpanded = ref(false)
const activeMode = ref('auto')

const getSpaceId = () => {
  const pathSegments = route.path.split('/')
  if (pathSegments[1] === 'space' && pathSegments[2]) return pathSegments[2]
  return companyInfo.id
}

const goToCompanyProfile = (tab = 'basic') => {
  router.push({
    path: `/space/${getSpaceId()}/configure`,
    query: { tab },
  })
}

const handleCompanyTab = (tab) => {
  if (tab === 'basic') {
    companyTab.value = tab
    return
  }
  goToCompanyProfile(tab)
}

const createDefaultRules = () => [
  {
    type: 'monthly',
    enabled: false,
    configured: false,
    monthlyDay: 3,
  },
  {
    type: 'halfYear',
    enabled: false,
    configured: false,
    halfYearFirstDay: 3,
    halfYearSecondDay: 3,
  },
  {
    type: 'annual',
    enabled: false,
    configured: false,
    annualDay: 3,
  },
]

const loadAutoRules = () => {
  try {
    const savedRules = JSON.parse(localStorage.getItem('qi_auto_report_rules_v2') || 'null')
    if (!Array.isArray(savedRules)) return createDefaultRules()

    const defaults = createDefaultRules()
    return defaults.map(defaultRule => ({
      ...defaultRule,
      ...(savedRules.find(rule => rule.type === defaultRule.type) || {}),
    }))
  } catch {
    return createDefaultRules()
  }
}

const autoRules = ref(loadAutoRules())
const dayOptions = Array.from({ length: 28 }, (_, index) => index + 1)
const editingRuleType = ref('')
const configModalOpen = ref(false)
const configDraft = reactive({
  monthlyDay: 3,
  halfYearFirstDay: 3,
  halfYearSecondDay: 3,
  annualDay: 3,
})

const configModalTitle = computed(() => {
  const titles = {
    monthly: '月报自动生成配置',
    halfYear: '半年报自动生成配置',
    annual: '年报自动生成配置',
  }
  return titles[editingRuleType.value] || '自动生成配置'
})

const persistAutoRules = () => {
  localStorage.setItem('qi_auto_report_rules_v2', JSON.stringify(autoRules.value))
}

const getRuleName = (type) => ({
  monthly: '月报',
  halfYear: '半年报',
  annual: '年报',
}[type] || type)

const getCycleDescription = (rule) => {
  if (!rule.configured) return '开启后点击“配置”设置生成时间'
  if (rule.type === 'monthly') return `每月${rule.monthlyDay}号 → 生成上月月报`
  if (rule.type === 'halfYear') {
    return `每年7月${rule.halfYearFirstDay}号 → 生成当年上半年报\n每年次年1月${rule.halfYearSecondDay}号 → 生成上一年下半年报`
  }
  return `每年1月${rule.annualDay}号 → 生成上一年年报`
}

const getNextGeneration = (rule, now = dayjs()) => {
  if (!rule.configured) return null

  if (rule.type === 'monthly') {
    let candidate = now.startOf('month').date(rule.monthlyDay).startOf('day')
    if (!candidate.isAfter(now)) candidate = candidate.add(1, 'month')
    return candidate
  }

  if (rule.type === 'halfYear') {
    const candidates = []
    for (let year = now.year(); year <= now.year() + 2; year += 1) {
      candidates.push(dayjs().year(year).month(0).date(rule.halfYearSecondDay).startOf('day'))
      candidates.push(dayjs().year(year).month(6).date(rule.halfYearFirstDay).startOf('day'))
    }
    return candidates
      .filter(candidate => candidate.isAfter(now))
      .sort((left, right) => left.valueOf() - right.valueOf())[0] || null
  }

  let candidate = dayjs().year(now.year()).month(0).date(rule.annualDay).startOf('day')
  if (!candidate.isAfter(now)) candidate = candidate.add(1, 'year')
  return candidate
}

const getNextRunText = (rule) => {
  if (!rule.enabled) return '已暂停'
  if (!rule.configured) return '待配置'
  return getNextGeneration(rule)?.format('YYYY-MM-DD HH:mm') || '待配置'
}

const toggleRule = (rule, checked) => {
  rule.enabled = checked
  persistAutoRules()

  if (checked && !rule.configured) {
    message.info(`${getRuleName(rule.type)}已开启，请点击“配置”设置生成时间`)
    return
  }

  if (checked) {
    message.success(`${getRuleName(rule.type)}已开启，下次生成：${getNextRunText(rule)}`)
  } else {
    message.success(`${getRuleName(rule.type)}已关闭`)
  }
}

const openRuleConfig = (rule) => {
  if (!rule.enabled) return
  editingRuleType.value = rule.type
  configDraft.monthlyDay = rule.monthlyDay || 3
  configDraft.halfYearFirstDay = rule.halfYearFirstDay || 3
  configDraft.halfYearSecondDay = rule.halfYearSecondDay || 3
  configDraft.annualDay = rule.annualDay || 3
  configModalOpen.value = true
}

const closeConfigModal = () => {
  configModalOpen.value = false
  editingRuleType.value = ''
}

const saveRuleConfig = () => {
  const rule = autoRules.value.find(item => item.type === editingRuleType.value)
  if (!rule) return

  if (rule.type === 'monthly') rule.monthlyDay = configDraft.monthlyDay
  if (rule.type === 'halfYear') {
    rule.halfYearFirstDay = configDraft.halfYearFirstDay
    rule.halfYearSecondDay = configDraft.halfYearSecondDay
  }
  if (rule.type === 'annual') rule.annualDay = configDraft.annualDay

  rule.configured = true
  persistAutoRules()
  const nextRun = getNextRunText(rule)
  message.success(`${getRuleName(rule.type)}配置已保存，下次生成：${nextRun}`)
  closeConfigModal()
}

const currentDate = dayjs()
const latestCompletedHalfYear = currentDate.month() >= 6
  ? `${currentDate.year()}-H1`
  : `${currentDate.year() - 1}-H2`

const manualCards = reactive([
  {
    type: 'monthly',
    title: '月报',
    period: currentDate.format('YYYY-MM'),
    dateValue: currentDate.startOf('month'),
  },
  {
    type: 'halfYear',
    title: '半年报',
    period: latestCompletedHalfYear,
  },
  {
    type: 'annual',
    title: '年报',
    period: String(currentDate.year() - 1),
  },
])

const halfYearOptions = computed(() => {
  const options = []
  for (let year = currentDate.year(); year >= currentDate.year() - 4; year -= 1) {
    options.push({ value: `${year}-H2`, label: `${year}年下半年` })
    options.push({ value: `${year}-H1`, label: `${year}年上半年` })
  }
  return options
})

const annualOptions = Array.from({ length: 5 }, (_, index) => currentDate.year() - index)

const syncManualPeriod = (card) => {
  if (card.dateValue) card.period = dayjs(card.dateValue).format('YYYY-MM')
}

const getManualPeriodRange = (card) => {
  if (card.type === 'monthly') {
    const start = dayjs(`${card.period}-01`)
    return `${start.format('YYYY-MM-DD')} — ${start.endOf('month').format('YYYY-MM-DD')}`
  }

  if (card.type === 'halfYear') {
    const [year, half] = card.period.split('-')
    return half === 'H1'
      ? `${year}-01-01 — ${year}-06-30`
      : `${year}-07-01 — ${year}-12-31`
  }

  return `${card.period}-01-01 — ${card.period}-12-31`
}

const startManualReport = (card) => {
  router.push({
    path: '/report/generate',
    query: { type: card.type, period: card.period },
  })
}
</script>

<style scoped>
.report-settings-page {
  min-height: 100vh;
  padding-top: 64px;
  background: #f3f5f8;
  color: #1f2329;
}

.settings-shell {
  width: min(1200px, calc(100% - 48px));
  margin: 0 auto;
  padding: 18px 0 56px;
}

.page-title-row {
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 52px;
  margin-bottom: 14px;
}

.page-title-row h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.back-button {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #fff;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  transition: color 0.2s, box-shadow 0.2s;
}

.back-button:hover {
  color: #1677ff;
  box-shadow: 0 3px 12px rgba(22, 119, 255, 0.16);
}

.company-card,
.report-rule-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 5px rgba(15, 23, 42, 0.04);
}

.company-card {
  padding: 24px 30px 10px;
  margin-bottom: 20px;
}

.company-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 18px;
  border-bottom: 1px solid #eef0f3;
}

.company-card-header h2 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
}

.company-card-header p {
  margin: 0;
  color: #9aa0a6;
  font-size: 13px;
}

.company-config-button {
  height: 34px;
}

.company-tabs,
.setting-tabs {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e7e9ed;
}

.company-tabs {
  gap: 34px;
}

.company-tabs button,
.setting-tabs button {
  position: relative;
  padding: 18px 2px 14px;
  border: 0;
  background: transparent;
  color: #646a73;
  font-size: 14px;
  cursor: pointer;
}

.company-tabs button::after,
.setting-tabs button::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  border-radius: 2px;
  background: transparent;
}

.company-tabs button.active,
.setting-tabs button.active {
  color: #1677ff;
  font-weight: 600;
}

.company-tabs button.active::after,
.setting-tabs button.active::after {
  background: #1677ff;
}

.company-details {
  padding-top: 8px;
}

.company-detail-row {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  gap: 8px;
  padding: 18px 0;
  border-bottom: 1px dashed #e5e7eb;
}

.company-detail-row:last-child {
  border-bottom: 0;
}

.detail-label {
  color: #8a9099;
  font-size: 14px;
  line-height: 1.8;
}

.detail-content {
  min-width: 0;
  margin: 0;
  color: #4e545d;
  font-size: 14px;
  line-height: 1.8;
}

.text-content {
  white-space: pre-line;
  transition: max-height 0.25s ease;
}

.text-content.collapsed {
  max-height: 76px;
  overflow: hidden;
}

.advantage-content.collapsed {
  max-height: 92px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  align-items: center;
}

.tag-list :deep(.ant-tag) {
  margin: 0;
}

.region-tags :deep(.ant-tag) {
  color: #59616b;
  background: #f7f8fa;
  border-color: #dcdfe4;
}

.expand-button {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0 auto;
  padding: 8px 16px;
  border: 0;
  background: transparent;
  color: #1677ff;
  font-size: 13px;
  cursor: pointer;
}

.report-rule-panel {
  padding: 0 24px 24px;
}

.setting-tabs {
  gap: 36px;
  margin-bottom: 14px;
}

.setting-tabs button {
  padding-top: 20px;
  font-size: 15px;
}

.auto-rules {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.rule-card {
  min-height: 190px;
  display: flex;
  flex-direction: column;
  padding: 18px 16px;
  border: 1px solid #e6e8ec;
  border-radius: 9px;
  background: #fafafa;
  transition: border-color 0.2s, background 0.2s;
}

.rule-card.enabled {
  border-color: #91caff;
  background: #fff;
}

.rule-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.rule-card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.switch-control {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #7b818a;
  font-size: 13px;
}

.rule-description,
.next-run {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 4px;
  color: #858b94;
  font-size: 13px;
  line-height: 1.65;
}

.rule-description {
  min-height: 48px;
}

.rule-description span,
.next-run span {
  white-space: nowrap;
}

.rule-description p {
  margin: 0;
  white-space: pre-line;
}

.next-run {
  margin-top: 6px;
}

.next-run strong {
  color: #7b818a;
  font-weight: 400;
}

.rule-card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 0;
}

.manual-rule-card {
  min-height: 190px;
}

.manual-period-control {
  margin-bottom: 9px;
}

.manual-period-range {
  color: #858b94;
  font-size: 13px;
  line-height: 1.65;
}

.config-modal-body {
  padding: 6px 0 12px;
}

.config-label {
  margin-bottom: 16px;
  color: #333842;
  font-size: 14px;
  font-weight: 500;
}

.config-label span {
  margin-right: 5px;
  color: #ff4d4f;
}

.config-row {
  display: grid;
  grid-template-columns: 90px 170px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  color: #59616b;
  font-size: 14px;
}

.config-row :deep(.ant-select) {
  width: 170px;
}

.config-help {
  color: #7d838c;
  white-space: nowrap;
}

.config-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 900px) {
  .auto-rules {
    grid-template-columns: 1fr;
  }

  .company-card {
    padding-right: 20px;
    padding-left: 20px;
  }
}

@media (max-width: 640px) {
  .settings-shell {
    width: min(100% - 24px, 1200px);
  }

  .company-card-header,
  .manual-form {
    align-items: flex-start;
    flex-direction: column;
  }

  .company-tabs {
    gap: 18px;
    overflow-x: auto;
  }

  .company-tabs button {
    flex: 0 0 auto;
  }

  .company-detail-row {
    grid-template-columns: 1fr;
    gap: 5px;
  }

  .setting-tabs {
    gap: 22px;
  }

  .config-row {
    grid-template-columns: 1fr;
  }
}
</style>
