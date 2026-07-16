<template>
  <div class="policy-detail-page">
    <TopNav />

    <button class="floating-back" aria-label="返回政策列表" @click="router.back()">
      <ArrowLeftOutlined />
    </button>

    <main v-if="policy" class="detail-layout">
      <section class="policy-content-panel">
        <header ref="policyHeaderRef" class="policy-header">
          <h1>{{ policy.title }}</h1>
          <div class="policy-source-row">
            <span>来源：{{ policy.source }}</span>
            <span class="header-tags">
              <span>标签：</span>
              <a-tag v-for="tag in policy.tags" :key="tag">{{ tag }}</a-tag>
            </span>
            <a
              v-if="policy.sourceUrl"
              class="source-link"
              :href="policy.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkOutlined /> 原文链接
            </a>
          </div>
          <div class="policy-facts">
            <div><span>发文号：</span><strong>{{ policy.documentNumber || '—' }}</strong></div>
            <div><span>发文单位：</span><strong>{{ policy.source }}</strong></div>
            <div><span>发文时间：</span><strong>{{ policy.publishDate }}</strong></div>
            <div><span>失效时间：</span><strong>{{ policy.expiryDate || '—' }}</strong></div>
          </div>
        </header>

        <article class="policy-body">
          <h2>{{ policy.bodyTitle || policy.title }}</h2>
          <p
            v-for="(paragraph, index) in bodyParagraphs"
            :key="`${index}-${paragraph.slice(0, 16)}`"
            :ref="el => setParagraphRef(el, index)"
            :data-section-key="paragraphSectionKeys[index] || undefined"
            :class="{
              'body-heading': isBodyHeading(paragraph),
              'linked-highlight': isParagraphLinked(index),
              'linked-highlight-start': isLinkedSectionStart(index),
              'linked-highlight-end': isLinkedSectionEnd(index),
            }"
          >
            {{ paragraph }}
          </p>
        </article>
      </section>

      <aside ref="analysisPanelRef" class="analysis-panel">
        <div class="analysis-title">
          <span class="ai-badge">AI</span>
          <h2>智能政策分析</h2>
        </div>
        <nav class="analysis-tabs" aria-label="智能政策分析标签页">
          <button
            v-for="tab in analysisTabs"
            :key="tab.key"
            :class="{ active: activeAnalysisTab === tab.key }"
            @click="activeAnalysisTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </nav>
        <div
          ref="analysisContentRef"
          class="analysis-content"
          :class="{
            'interpretation-content': activeAnalysisTab === 'interpretation',
            'enterprise-content': activeAnalysisTab === 'enterprise',
            'suggestions-content': activeAnalysisTab === 'suggestions',
          }"
          @scroll.passive="scheduleConnectorUpdate"
        >
          <template v-if="activeAnalysisTab === 'interpretation' && structuredInterpretationSections.length">
            <template v-for="section in structuredInterpretationSections" :key="section.key">
              <h3 v-if="section.groupTitle" class="interpretation-group-title">
                {{ section.groupTitle }}
              </h3>
              <article
                :ref="el => setInterpretationItemRef(el, section.key)"
                class="interpretation-item"
                :class="{ active: displayedInterpretationKey === section.key }"
                role="button"
                tabindex="0"
                @click="scrollToInterpretationSection(section.key)"
                @keydown.enter.prevent="scrollToInterpretationSection(section.key)"
                @keydown.space.prevent="scrollToInterpretationSection(section.key)"
                @mouseenter="showInterpretationPreview(section.key)"
                @mouseleave="hideInterpretationPreview"
              >
                <h4>{{ section.title }}</h4>
                <ul>
                  <li v-for="point in section.points" :key="point.label">
                    <strong>{{ point.label }}</strong>
                    <span>{{ point.content }}</span>
                  </li>
                </ul>
              </article>
            </template>
          </template>
          <div
            v-else-if="activeAnalysisTab === 'enterprise' && structuredEnterpriseAnalysis.length"
            class="enterprise-analysis-list"
          >
            <article
              v-for="point in structuredEnterpriseAnalysis"
              :key="point.id"
              :ref="el => setEnterpriseItemRef(el, point.id)"
              class="enterprise-analysis-point"
              :class="{ active: isEnterpriseItemActive(point.id) }"
              role="button"
              tabindex="0"
              @click="scrollToEnterpriseItem(point)"
              @keydown.enter.prevent="scrollToEnterpriseItem(point)"
              @keydown.space.prevent="scrollToEnterpriseItem(point)"
              @mouseenter="showEnterpriseItemPreview(point)"
              @mouseleave="hideEnterprisePreview"
            >
              <span class="enterprise-point-number">{{ point.number }}.</span>
              <span>{{ point.content }}</span>
              <span class="enterprise-references" aria-label="原文引用">
                <button
                  v-for="reference in point.references"
                  :key="reference.id"
                  :ref="el => setEnterpriseReferenceRef(el, point.id, reference.id)"
                  type="button"
                  class="analysis-reference enterprise-reference"
                  :class="{ active: displayedEnterpriseSelectionKey === getEnterpriseReferenceKey(point.id, reference.id) }"
                  :aria-label="`定位到原文引用 ${reference.label}`"
                  @click.stop="scrollToEnterpriseReference(point, reference)"
                  @mouseenter="showEnterpriseReferencePreview(point, reference)"
                  @mouseleave="showEnterpriseItemPreview(point)"
                >
                  [{{ reference.label }}]
                </button>
              </span>
            </article>
          </div>
          <div
            v-else-if="activeAnalysisTab === 'suggestions' && structuredSuggestions.length"
            class="suggestion-list"
          >
            <article
              v-for="suggestion in structuredSuggestions"
              :key="suggestion.id"
              :ref="el => setSuggestionItemRef(el, suggestion.id)"
              class="suggestion-item"
              :class="{ active: isSuggestionItemActive(suggestion.id) }"
              role="button"
              tabindex="0"
              @click="scrollToSuggestionItem(suggestion)"
              @keydown.enter.prevent="scrollToSuggestionItem(suggestion)"
              @keydown.space.prevent="scrollToSuggestionItem(suggestion)"
              @mouseenter="showSuggestionItemPreview(suggestion)"
              @mouseleave="hideSuggestionPreview"
            >
              <h4>{{ suggestion.number }}. {{ suggestion.title }}</h4>
              <p>{{ suggestion.content }}</p>
              <span class="suggestion-references" aria-label="原文引用">
                <button
                  v-for="reference in suggestion.references"
                  :key="reference.id"
                  :ref="el => setSuggestionReferenceRef(el, suggestion.id, reference.id)"
                  type="button"
                  class="analysis-reference suggestion-reference"
                  :class="{ active: displayedSuggestionSelectionKey === getSuggestionReferenceKey(suggestion.id, reference.id) }"
                  :aria-label="`定位到原文引用 ${reference.label}`"
                  @click.stop="scrollToSuggestionReference(suggestion, reference)"
                  @mouseenter="showSuggestionReferencePreview(suggestion, reference)"
                  @mouseleave="showSuggestionItemPreview(suggestion)"
                >
                  [{{ reference.label }}]
                </button>
              </span>
            </article>
          </div>
          <template v-else>
            <p v-for="(paragraph, index) in analysisParagraphs" :key="index">
              {{ paragraph }}
            </p>
          </template>
        </div>
      </aside>
    </main>

    <svg
      v-if="connectorLines.length"
      class="policy-link-lines"
      aria-hidden="true"
    >
      <g v-for="line in connectorLines" :key="line.id">
        <path class="connector-halo" :d="line.path" />
        <path class="connector-line" :d="line.path" />
        <circle class="connector-dot" :cx="line.start.x" :cy="line.start.y" r="3.5" />
        <circle class="connector-dot" :cx="line.end.x" :cy="line.end.y" r="3.5" />
      </g>
    </svg>

    <div v-if="!policy" class="not-found">
      <h2>未找到该政策</h2>
      <a-button type="primary" @click="router.push('/report/policy-list')">返回政策列表</a-button>
    </div>

  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftOutlined, LinkOutlined } from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'
import { relatedPolicyDetails } from '@/data/relatedPolicyDetails'
import { relatedPolicyJuneAdditions } from '@/data/relatedPolicyJuneAdditions'
import { buildPolicyAnalysis } from '@/data/policyAnalysis'

const route = useRoute()
const router = useRouter()
const activeAnalysisTab = ref('overview')
const activeInterpretationKey = ref('goal')
const hoveredInterpretationKey = ref('')
const activeEnterpriseSelectionKey = ref('enterprise-1-item')
const hoveredEnterpriseSelectionKey = ref('')
const activeSuggestionSelectionKey = ref('suggestion-1-item')
const hoveredSuggestionSelectionKey = ref('')
const policyHeaderRef = ref(null)
const analysisPanelRef = ref(null)
const analysisContentRef = ref(null)
const paragraphRefs = ref([])
const interpretationItemRefs = ref({})
const enterpriseItemRefs = ref({})
const enterpriseReferenceRefs = ref({})
const suggestionItemRefs = ref({})
const suggestionReferenceRefs = ref({})
const connectorLines = ref([])

let connectorFrame = 0
let scrollFrame = 0
let programmaticScrollTimer = 0
let isProgrammaticScrolling = false

const analysisTabs = [
  { key: 'overview', label: '政策概述' },
  { key: 'interpretation', label: '政策解读' },
  { key: 'enterprise', label: '与企业相关' },
  { key: 'suggestions', label: '可落地的建议' },
]

const interpretationSections = [
  {
    key: 'goal',
    title: '一、总体工作目标解读',
    points: [
      { label: '底层资源建设目标', content: '夯实全市数据基础，批量建成高质量行业数据集、多模态特色语料库和行业专用大模型，补齐本地训练数据供给短板。' },
      { label: '特色产业目标', content: '做大做强数据标注产业，为政务、工业及特色学科大模型持续提供训练素材支撑。' },
      { label: '安全底线目标', content: '搭建全域覆盖、全流程闭环的数据安全防护体系，平衡数据流通利用与合规监管。' },
      { label: '场景与产业循环目标', content: '打造可复制的AI融合标杆场景，构建“数据—模型—场景应用”的良性发展循环。' },
    ],
  },
  {
    key: 'source-governance',
    groupTitle: '二、五大重点任务板块分项解读',
    title: '（一）源头规范数据归集治理',
    points: [
      { label: '政务平台升级', content: '优化市级政务数据共享交换平台核心模块，统一行业、企业数据目录标准，打通跨部门、跨层级、跨区域数据流通。' },
      { label: '公共数据全量登记', content: '推动机关、企事业单位和运营机构完成数据、产品与服务登记，落实“一数一源、一源一码、全程可追溯”。' },
      { label: '授权运营提质', content: '扩大公共数据归集调用范围，评估授权运营场景，以合规开放释放数据要素价值。' },
    ],
  },
  {
    key: 'datasets',
    title: '（二）分行业建设高质量数据集与语料库',
    points: [
      { label: '工业模数共振行动', content: '围绕工业行业建设数据集、行业专属模型和智能体，贯通工业数据AI改造落地路径。' },
      { label: '以赛促建挖掘场景', content: '依托“数据要素×”大赛发动多方主体，挖掘行业数据集、语料建设典型案例。' },
      { label: '本地化多模态语料库', content: '立足甘肃特色学科与产业，汇聚文本、图像、音视频数据，打造产学研AI协同样板。' },
    ],
  },
  {
    key: 'annotation',
    title: '（三）壮大数据标注产业',
    points: [
      { label: '标注人才培育', content: '联合院校开展常态化实操培训，建设标准化、专业化的数据标注人才队伍。' },
      { label: '标注产业规模化', content: '扶持标注基地和企业，打通数据采集、标注、流通与应用的一体化链条。' },
      { label: '专项资金配套', content: '对接中央预算、专项债和政策性金融工具，支撑数据集、基础设施与产业项目落地。' },
    ],
  },
  {
    key: 'security',
    title: '（四）全周期构建数据安全防护体系',
    points: [
      { label: '全天候风险处置', content: '完善7×24小时监测预警和分级闭环处置，提升数据安全风险发现与协同响应能力。' },
      { label: '生成式AI专项合规整治', content: '落实安全评估和算法备案，治理未备案、数据投毒、虚假信息传播等突出问题。' },
      { label: '数据流通合规保障', content: '引入风险评估、安全审计等第三方服务，保障数据炼化、交易和共享全流程安全可控。' },
    ],
  },
  {
    key: 'industry',
    title: '（五）数据赋能千行百业',
    points: [
      { label: '赋能平台经济', content: '规范本地互联网平台数据采集使用，完善内部治理并支持跨境数字业务发展。' },
      { label: '赋能数字政府', content: '深化“高效办成一件事”，推广免证办、就近办和智能办，压缩办事材料及时限。' },
      { label: '赋能公共服务', content: '拓展文旅、教育、医疗和生态等公共服务智能应用，释放数据要素价值。' },
    ],
  },
  {
    key: 'requirements',
    title: '三、落地实施工作要求解读',
    points: [
      { label: '压实主体责任', content: '各县区、各部门提高站位，将数据归集、数据集建设和标注产业培育纳入年度重点工作。' },
      { label: '统筹资源保障', content: '统筹资金、人才和技术资源，为15项重点任务持续提供实施保障。' },
      { label: '强化协同落地', content: '细化责任分工与工作举措，推动各板块形成闭环，确保任务取得实效。' },
    ],
  },
]

const enterpriseAnalysisPoints = [
  {
    id: 'enterprise-1',
    number: 1,
    content: '政策明确要升级市级政务数据共享平台、完成全市公共数据统一登记、推进公共数据授权运营，打通跨层级跨部门数据流通渠道，同时要求数据全流程可追溯、合规安全流通。',
    references: [
      { id: 'reference-1', label: '1', targets: ['task-1'] },
      { id: 'reference-2', label: '2', targets: ['task-2'] },
      { id: 'reference-3', label: '3', targets: ['task-3'] },
      { id: 'reference-4', label: '4', targets: ['task-12'] },
    ],
  },
  {
    id: 'enterprise-2',
    number: 2,
    content: '全市规划打造行业高质量数据集、多模态特色语料库，布局行业专属大模型与智能体，重点围绕工业、敦煌学、寒旱特色领域落地 AI 产学研项目，形成“数据—模型—场景”完整闭环。',
    references: [
      { id: 'reference-1', label: '1', targets: ['goal'] },
      { id: 'reference-2', label: '2', targets: ['task-4'] },
      { id: 'reference-3', label: '3', targets: ['task-6'] },
    ],
  },
  {
    id: 'enterprise-3',
    number: 3,
    content: '地方将扶持数据标注产业，配套院校人才培育机制，同时开放中央预算内投资、专项债等资金渠道，重点扶持数据基础设施、数据集类数字化项目。',
    references: [
      { id: 'reference-1', label: '1', targets: ['task-7'] },
      { id: 'reference-2', label: '2', targets: ['task-8'] },
      { id: 'reference-3', label: '3', targets: ['task-9'] },
    ],
  },
  {
    id: 'enterprise-4',
    number: 4,
    content: '对生成式 AI 出台完整合规管理要求，包含算法备案、安全自评估，开展为期 4 个月 AI 行业专项整治，同步搭建 7×24 小时数据安全监测、应急处置闭环体系。',
    references: [
      { id: 'reference-1', label: '1', targets: ['task-10'] },
      { id: 'reference-2', label: '2', targets: ['task-11'] },
    ],
  },
  {
    id: 'enterprise-5',
    number: 5,
    content: '全面推进政务服务智能化升级，深化“高效办成一件事”，推动高频事项免证办、智能办，精简办事材料与审批环节，拓展 AI 在政务办事中的落地场景。',
    references: [
      { id: 'reference-1', label: '1', targets: ['task-14'] },
    ],
  },
  {
    id: 'enterprise-6',
    number: 6,
    content: '推动文旅、医疗、教育、生态等公共服务数字化改造，丰富多行业 AI 便民应用，打通多领域政务数据实现业务协同联动。',
    references: [
      { id: 'reference-1', label: '1', targets: ['task-1'] },
      { id: 'reference-2', label: '2', targets: ['task-15'] },
    ],
  },
  {
    id: 'enterprise-7',
    number: 7,
    content: '强化平台企业全流程数据监管，依托 AI 识别线上虚假宣传、AI 水军、数据投毒等违规行为，同步配套企业数据合规、跨境数据治理相关指导服务。',
    references: [
      { id: 'reference-1', label: '1', targets: ['task-13'] },
      { id: 'reference-2', label: '2', targets: ['task-11'] },
    ],
  },
]

const actionableSuggestions = [
  {
    id: 'suggestion-1',
    number: 1,
    title: '承接全市数据底座与数据运营类项目',
    content: '依托大汉公共数据运营资质、知识中枢平台，参与兰州市政务数据共享平台迭代、公共数据统一登记系统建设；同步提供公共数据授权运营整套解决方案，配套数据溯源、合规审计工具，满足政策对数据可溯、安全流通的硬性要求，抢占本地数据要素市场化项目机会。',
    references: [
      { id: 'reference-1', label: '1', targets: ['task-1'] },
      { id: 'reference-2', label: '2', targets: ['task-2'] },
      { id: 'reference-3', label: '3', targets: ['task-3'] },
      { id: 'reference-4', label: '4', targets: ['task-12'] },
    ],
  },
  {
    id: 'suggestion-2',
    number: 2,
    title: '落地本地化政务垂类大模型与产学研 AI 项目',
    content: '使用自研星汉 Galaxy 政务大模型，针对兰州工业、敦煌、寒旱特色行业定制轻量化模型与智能体；联动本地高校共建多模态语料库，申报“数据要素 ×”大赛示范项目，同步提供训推一体机适配本地中小算力，同时配套生成式 AI 备案、安全评估全流程合规服务，匹配全市 AI 专项整治工作需求。',
    references: [
      { id: 'reference-1', label: '1', targets: ['goal'] },
      { id: 'reference-2', label: '2', targets: ['task-4'] },
      { id: 'reference-3', label: '3', targets: ['task-6'] },
    ],
  },
  {
    id: 'suggestion-3',
    number: 3,
    title: '打造一体化政务智能服务标杆案例',
    content: '复制赣服通、泉城通办成熟落地经验，为兰州搭建 AI 一体化政务服务平台，落地智能预填、政策精准匹配、免申即享等功能；同步配套文旅、医疗、教育行业智能门户，打通跨部门数据实现业务协同，补齐民生领域智能化场景短板。',
    references: [
      { id: 'reference-1', label: '1', targets: ['task-14'] },
      { id: 'reference-2', label: '2', targets: ['task-15'] },
    ],
  },
  {
    id: 'suggestion-4',
    number: 4,
    title: '布局线上智慧监管与企业合规服务',
    content: '输出智慧监管配套系统，利用大模型自动识别网络虚假宣传、AI 水军、数据投毒等违规线索，辅助监管部门开展线上平台常态化治理；同时面向本地互联网企业提供全流程数据合规咨询、系统工具，覆盖企业数据采集、存储、使用全生命周期管理需求。',
    references: [
      { id: 'reference-1', label: '1', targets: ['task-13'] },
      { id: 'reference-2', label: '2', targets: ['task-11'] },
    ],
  },
  {
    id: 'suggestion-5',
    number: 5,
    title: '产业生态共建 + 专项资金项目申报总包服务',
    content: '联合本地院校搭建数据标注实训、配套平台服务，补齐本地 AI 训练数据供给短板；依托公司顶层规划、开发部署、运维安全全链条交付能力，打包数据治理、政务 AI、智能政务、安全防护一体化方案，参与专项债、中央资金类数字基建项目招投标，一站式承接全市数字化综合项目。',
    references: [
      { id: 'reference-1', label: '1', targets: ['task-7'] },
      { id: 'reference-2', label: '2', targets: ['task-8'] },
      { id: 'reference-3', label: '3', targets: ['task-9'] },
      { id: 'reference-4', label: '4', targets: ['requirements'] },
    ],
  },
]

const passedPolicy = window.history.state?.policy || null

const normalizePassedPolicy = (record) => {
  if (!record) return null
  return {
    id: String(record.id),
    title: record.title,
    bodyTitle: record.bodyTitle || record.title,
    tags: record.tags || [],
    documentNumber: record.documentNumber || '—',
    source: record.source || record.issuer || '—',
    publishDate: record.publishDate || '—',
    expiryDate: record.expiryDate || '—',
    content: record.content || `《${record.title}》政策全文内容正在同步中，请通过原文链接查看完整内容。`,
    sourceUrl: record.sourceUrl || '',
    analysis: record.analysis || '',
    overview: Array.isArray(record.overview) ? record.overview : null,
  }
}

const policy = computed(() => {
  const id = String(route.params.id)
  const storedPolicy = relatedPolicyDetails.find(item => item.id === id) ||
    relatedPolicyJuneAdditions.find(item => item.id === id)
  return (storedPolicy ? normalizePassedPolicy(storedPolicy) : null) ||
    (String(passedPolicy?.id) === id ? normalizePassedPolicy(passedPolicy) : null)
})

const splitParagraphs = (text) => String(text || '')
  .split(/\n+/)
  .map(item => item.trim())
  .filter(Boolean)

const splitNumberedAnalysis = (text) => String(text || '')
  .replace(/^【与企业相关分析】/, '')
  .split(/(?=\d+\.)/)
  .map(item => item.trim())
  .filter(Boolean)

const bodyParagraphs = computed(() => splitParagraphs(policy.value?.content))

const generatedAnalysis = computed(() => buildPolicyAnalysis(policy.value, bodyParagraphs.value))

const structuredInterpretationSections = computed(() =>
  policy.value?.id === 'excel-2' ? interpretationSections : generatedAnalysis.value.interpretation)

const structuredEnterpriseAnalysis = computed(() =>
  policy.value?.id === 'excel-2' ? enterpriseAnalysisPoints : generatedAnalysis.value.enterprise)

const structuredSuggestions = computed(() =>
  policy.value?.id === 'excel-2' ? actionableSuggestions : generatedAnalysis.value.suggestions)

const paragraphSectionKeys = computed(() => {
  if (policy.value?.id !== 'excel-2') {
    return bodyParagraphs.value.map((_, index) => `paragraph-${index}`)
  }

  let currentSection = ''

  return bodyParagraphs.value.map((paragraph) => {
    if (/^一、工作目标/.test(paragraph)) currentSection = 'goal'
    else if (/^二、重点工作任务/.test(paragraph)) currentSection = ''
    else if (/^（一）源头规范数据归集治理/.test(paragraph)) currentSection = 'source-governance'
    else if (/^（二）分行业建设高质量数据集与语料库/.test(paragraph)) currentSection = 'datasets'
    else if (/^（三）壮大数据标注产业/.test(paragraph)) currentSection = 'annotation'
    else if (/^（四）全周期构建数据安全防护体系/.test(paragraph)) currentSection = 'security'
    else if (/^（五）数据赋能千行百业/.test(paragraph)) currentSection = 'industry'
    else if (/^三、工作要求/.test(paragraph)) currentSection = 'requirements'

    return currentSection
  })
})

const paragraphTargetKeys = computed(() => bodyParagraphs.value.map((paragraph, index) => {
  if (policy.value?.id !== 'excel-2') return [`paragraph-${index}`]

  const keys = []
  if (['goal', 'requirements'].includes(paragraphSectionKeys.value[index])) {
    keys.push(paragraphSectionKeys.value[index])
  }
  const numberedTask = paragraph.match(/^(\d+)\./)
  if (numberedTask) keys.push(`task-${numberedTask[1]}`)
  return keys
}))

const displayedInterpretationKey = computed(() =>
  hoveredInterpretationKey.value || activeInterpretationKey.value)

const displayedEnterpriseSelectionKey = computed(() =>
  hoveredEnterpriseSelectionKey.value || activeEnterpriseSelectionKey.value)

const getEnterpriseItemKey = (pointId) => `${pointId}-item`

const getEnterpriseReferenceKey = (pointId, referenceId) => `${pointId}-${referenceId}`

const displayedEnterpriseSelection = computed(() => {
  for (const point of structuredEnterpriseAnalysis.value) {
    if (getEnterpriseItemKey(point.id) === displayedEnterpriseSelectionKey.value) {
      return {
        point,
        reference: null,
        targets: [...new Set(point.references.flatMap(reference => reference.targets))],
      }
    }
    const reference = point.references.find(item =>
      getEnterpriseReferenceKey(point.id, item.id) === displayedEnterpriseSelectionKey.value)
    if (reference) return { point, reference, targets: reference.targets }
  }
  return null
})

const activeEnterpriseTargetKeys = computed(() =>
  displayedEnterpriseSelection.value?.targets || [])

const isEnterpriseItemActive = (pointId) =>
  displayedEnterpriseSelectionKey.value.startsWith(`${pointId}-`)

const displayedSuggestionSelectionKey = computed(() =>
  hoveredSuggestionSelectionKey.value || activeSuggestionSelectionKey.value)

const getSuggestionItemKey = (suggestionId) => `${suggestionId}-item`

const getSuggestionReferenceKey = (suggestionId, referenceId) => `${suggestionId}-${referenceId}`

const displayedSuggestionSelection = computed(() => {
  for (const suggestion of structuredSuggestions.value) {
    if (getSuggestionItemKey(suggestion.id) === displayedSuggestionSelectionKey.value) {
      return {
        suggestion,
        reference: null,
        targets: [...new Set(suggestion.references.flatMap(reference => reference.targets))],
      }
    }
    const reference = suggestion.references.find(item =>
      getSuggestionReferenceKey(suggestion.id, item.id) === displayedSuggestionSelectionKey.value)
    if (reference) return { suggestion, reference, targets: reference.targets }
  }
  return null
})

const activeSuggestionTargetKeys = computed(() =>
  displayedSuggestionSelection.value?.targets || [])

const isSuggestionItemActive = (suggestionId) =>
  displayedSuggestionSelectionKey.value.startsWith(`${suggestionId}-`)

const setParagraphRef = (element, index) => {
  if (element) paragraphRefs.value[index] = element
}

const setInterpretationItemRef = (element, key) => {
  if (element) interpretationItemRefs.value[key] = element
}

const setEnterpriseItemRef = (element, pointId) => {
  if (element) enterpriseItemRefs.value[pointId] = element
}

const setEnterpriseReferenceRef = (element, pointId, referenceId) => {
  if (element) enterpriseReferenceRefs.value[getEnterpriseReferenceKey(pointId, referenceId)] = element
}

const setSuggestionItemRef = (element, suggestionId) => {
  if (element) suggestionItemRefs.value[suggestionId] = element
}

const setSuggestionReferenceRef = (element, suggestionId, referenceId) => {
  if (element) suggestionReferenceRefs.value[getSuggestionReferenceKey(suggestionId, referenceId)] = element
}

const isParagraphLinked = (index) => {
  if (activeAnalysisTab.value === 'interpretation') {
    return paragraphSectionKeys.value[index] === displayedInterpretationKey.value
  }
  if (activeAnalysisTab.value === 'enterprise') {
    const targetKeys = paragraphTargetKeys.value[index] || []
    return activeEnterpriseTargetKeys.value.some(key => targetKeys.includes(key))
  }
  if (activeAnalysisTab.value === 'suggestions') {
    const targetKeys = paragraphTargetKeys.value[index] || []
    return activeSuggestionTargetKeys.value.some(key => targetKeys.includes(key))
  }
  return false
}

const isLinkedSectionStart = (index) =>
  isParagraphLinked(index) && !isParagraphLinked(index - 1)

const isLinkedSectionEnd = (index) =>
  isParagraphLinked(index) && !isParagraphLinked(index + 1)

const isBodyHeading = (paragraph) => {
  if (/^[一二三四五六七八九十]+、/.test(paragraph)) return true
  if (!/^（[一二三四五六七八九十]+）/.test(paragraph)) return false

  // “（一）标题”独立成段时才作为二级标题；标题后紧接正文的整段按普通正文展示。
  return paragraph.length <= 30 && !/[。！？；]/.test(paragraph)
}

const overviewParagraphs = computed(() => {
  if (Array.isArray(policy.value?.overview) && policy.value.overview.length) {
    return policy.value.overview
  }
  if (policy.value?.id !== 'excel-2' && generatedAnalysis.value.overview.length) {
    return generatedAnalysis.value.overview
  }
  const paragraphs = bodyParagraphs.value
  if (!paragraphs.length) return ['暂无政策概述。']
  return paragraphs.slice(0, Math.min(3, paragraphs.length))
})

const interpretationParagraphs = computed(() => {
  const tags = policy.value?.tags || []
  const tagText = tags.length ? tags.join('、') : '政策实施'
  return [
    `该政策聚焦${tagText}，明确了相关工作方向、重点任务与实施要求。`,
    ...overviewParagraphs.value,
  ]
})

const enterpriseParagraphs = computed(() => {
  const paragraphs = splitNumberedAnalysis(policy.value?.analysis)
  return paragraphs.length ? paragraphs : ['暂无与企业相关的分析结果。']
})

const suggestionParagraphs = computed(() => {
  const tags = policy.value?.tags?.length ? policy.value.tags : ['政策方向']
  return [
    `1. 建立${tags.join('、')}政策跟踪清单，持续跟进主管部门的实施细则和项目机会。`,
    '2. 结合企业现有产品与案例，形成针对性解决方案和客户沟通材料。',
    '3. 对接政策发布单位及相关地区客户，识别可申报、可试点、可合作的具体场景。',
    '4. 明确责任人、时间节点和预期成果，将政策机会转化为可跟踪的销售或交付行动。',
  ]
})

const analysisParagraphs = computed(() => ({
  overview: overviewParagraphs.value,
  interpretation: interpretationParagraphs.value,
  enterprise: enterpriseParagraphs.value,
  suggestions: suggestionParagraphs.value,
}[activeAnalysisTab.value]))

const getSectionElements = (key) => paragraphRefs.value.filter((element, index) =>
  element && paragraphSectionKeys.value[index] === key)

const getTargetElements = (key) => {
  if (['goal', 'requirements'].includes(key)) return getSectionElements(key)
  return paragraphRefs.value.filter((element, index) =>
    element && paragraphTargetKeys.value[index].includes(key))
}

const getElementsBounds = (elements) => {
  if (!elements.length) return null

  const firstRect = elements[0].getBoundingClientRect()
  const lastRect = elements[elements.length - 1].getBoundingClientRect()
  return {
    left: Math.min(...elements.map(element => element.getBoundingClientRect().left)),
    right: Math.max(...elements.map(element => element.getBoundingClientRect().right)),
    top: firstRect.top,
    bottom: lastRect.bottom,
  }
}

const getSectionBounds = (key) => getElementsBounds(getSectionElements(key))

const getTargetBounds = (key) => getElementsBounds(getTargetElements(key))

const ensureInterpretationItemVisible = (key) => {
  const container = analysisContentRef.value
  const item = interpretationItemRefs.value[key]
  if (!container || !item) return

  const containerRect = container.getBoundingClientRect()
  const itemRect = item.getBoundingClientRect()
  if (itemRect.top < containerRect.top + 12) {
    container.scrollTo({
      top: container.scrollTop - (containerRect.top + 12 - itemRect.top),
      behavior: 'smooth',
    })
  } else if (itemRect.bottom > containerRect.bottom - 12) {
    container.scrollTo({
      top: container.scrollTop + (itemRect.bottom - containerRect.bottom + 12),
      behavior: 'smooth',
    })
  }
}

const updateConnector = () => {
  connectorLines.value = []

  let targetKeys = []
  let sourceElement = null
  if (activeAnalysisTab.value === 'interpretation') {
    targetKeys = [displayedInterpretationKey.value]
    sourceElement = interpretationItemRefs.value[displayedInterpretationKey.value]
  } else if (activeAnalysisTab.value === 'enterprise') {
    targetKeys = activeEnterpriseTargetKeys.value
    const selection = displayedEnterpriseSelection.value
    sourceElement = selection?.reference
      ? enterpriseReferenceRefs.value[displayedEnterpriseSelectionKey.value]
      : enterpriseItemRefs.value[selection?.point.id]
  } else if (activeAnalysisTab.value === 'suggestions') {
    targetKeys = activeSuggestionTargetKeys.value
    const selection = displayedSuggestionSelection.value
    sourceElement = selection?.reference
      ? suggestionReferenceRefs.value[displayedSuggestionSelectionKey.value]
      : suggestionItemRefs.value[selection?.suggestion.id]
  } else {
    return
  }

  const content = analysisContentRef.value
  if (!targetKeys.length || !sourceElement || !content) return

  const sourceRect = sourceElement.getBoundingClientRect()
  const contentRect = content.getBoundingClientRect()
  const headerBottom = policyHeaderRef.value?.getBoundingClientRect().bottom || 64
  const visibleSourceTop = Math.max(sourceRect.top, contentRect.top + 4)
  const visibleSourceBottom = Math.min(sourceRect.bottom, contentRect.bottom - 4)
  if (visibleSourceBottom <= visibleSourceTop) return

  const lines = []
  targetKeys.forEach((key, index) => {
    const targetBounds = activeAnalysisTab.value === 'interpretation'
      ? getSectionBounds(key)
      : getTargetBounds(key)
    if (!targetBounds) return

    const visibleTargetTop = Math.max(targetBounds.top, headerBottom + 8, 8)
    const visibleTargetBottom = Math.min(targetBounds.bottom, window.innerHeight - 12)
    if (visibleTargetBottom <= visibleTargetTop) return

    const start = {
      x: targetBounds.right + 5,
      y: (visibleTargetTop + visibleTargetBottom) / 2,
    }
    const end = {
      x: sourceRect.left - 7,
      y: (visibleSourceTop + visibleSourceBottom) / 2 + (index - (targetKeys.length - 1) / 2) * 5,
    }
    if (end.x <= start.x) return

    const distance = end.x - start.x
    const firstControlX = start.x + Math.max(18, distance * 0.38)
    const secondControlX = end.x - Math.max(18, distance * 0.38)
    lines.push({
      id: `${activeAnalysisTab.value}-${key}-${index}`,
      start,
      end,
      path: `M ${start.x} ${start.y} C ${firstControlX} ${start.y}, ${secondControlX} ${end.y}, ${end.x} ${end.y}`,
    })
  })

  connectorLines.value = lines
}

const scheduleConnectorUpdate = () => {
  if (connectorFrame) cancelAnimationFrame(connectorFrame)
  connectorFrame = requestAnimationFrame(() => {
    connectorFrame = 0
    updateConnector()
  })
}

const scrollToInterpretationSection = async (key) => {
  activeInterpretationKey.value = key
  hoveredInterpretationKey.value = ''
  await nextTick()

  const target = getSectionElements(key)[0]
  if (!target) return

  isProgrammaticScrolling = true
  const stickyHeaderHeight = policyHeaderRef.value?.offsetHeight || 0
  const targetTop = target.getBoundingClientRect().top + window.scrollY - stickyHeaderHeight - 80
  window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
  ensureInterpretationItemVisible(key)
  scheduleConnectorUpdate()

  window.clearTimeout(programmaticScrollTimer)
  programmaticScrollTimer = window.setTimeout(() => {
    isProgrammaticScrolling = false
    scheduleConnectorUpdate()
  }, 850)
}

const showInterpretationPreview = (key) => {
  hoveredInterpretationKey.value = key
  nextTick(scheduleConnectorUpdate)
}

const hideInterpretationPreview = () => {
  hoveredInterpretationKey.value = ''
  nextTick(scheduleConnectorUpdate)
}

const scrollToEnterpriseTargets = async (selectionKey, targetKeys) => {
  activeEnterpriseSelectionKey.value = selectionKey
  hoveredEnterpriseSelectionKey.value = ''
  await nextTick()

  const target = getTargetElements(targetKeys[0])[0]
  if (!target) return

  isProgrammaticScrolling = true
  const stickyHeaderHeight = policyHeaderRef.value?.offsetHeight || 0
  const targetTop = target.getBoundingClientRect().top + window.scrollY - stickyHeaderHeight - 80
  window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
  scheduleConnectorUpdate()

  window.clearTimeout(programmaticScrollTimer)
  programmaticScrollTimer = window.setTimeout(() => {
    isProgrammaticScrolling = false
    scheduleConnectorUpdate()
  }, 850)
}

const scrollToEnterpriseItem = (point) => {
  const targetKeys = [...new Set(point.references.flatMap(reference => reference.targets))]
  scrollToEnterpriseTargets(getEnterpriseItemKey(point.id), targetKeys)
}

const scrollToEnterpriseReference = (point, reference) => {
  scrollToEnterpriseTargets(
    getEnterpriseReferenceKey(point.id, reference.id),
    reference.targets,
  )
}

const showEnterpriseItemPreview = (point) => {
  hoveredEnterpriseSelectionKey.value = getEnterpriseItemKey(point.id)
  nextTick(scheduleConnectorUpdate)
}

const showEnterpriseReferencePreview = (point, reference) => {
  hoveredEnterpriseSelectionKey.value = getEnterpriseReferenceKey(point.id, reference.id)
  nextTick(scheduleConnectorUpdate)
}

const hideEnterprisePreview = () => {
  hoveredEnterpriseSelectionKey.value = ''
  nextTick(scheduleConnectorUpdate)
}

const scrollToSuggestionTargets = async (selectionKey, targetKeys) => {
  activeSuggestionSelectionKey.value = selectionKey
  hoveredSuggestionSelectionKey.value = ''
  await nextTick()

  const target = getTargetElements(targetKeys[0])[0]
  if (!target) return

  isProgrammaticScrolling = true
  const stickyHeaderHeight = policyHeaderRef.value?.offsetHeight || 0
  const targetTop = target.getBoundingClientRect().top + window.scrollY - stickyHeaderHeight - 80
  window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
  scheduleConnectorUpdate()

  window.clearTimeout(programmaticScrollTimer)
  programmaticScrollTimer = window.setTimeout(() => {
    isProgrammaticScrolling = false
    scheduleConnectorUpdate()
  }, 850)
}

const scrollToSuggestionItem = (suggestion) => {
  const targetKeys = [...new Set(suggestion.references.flatMap(reference => reference.targets))]
  scrollToSuggestionTargets(getSuggestionItemKey(suggestion.id), targetKeys)
}

const scrollToSuggestionReference = (suggestion, reference) => {
  scrollToSuggestionTargets(
    getSuggestionReferenceKey(suggestion.id, reference.id),
    reference.targets,
  )
}

const showSuggestionItemPreview = (suggestion) => {
  hoveredSuggestionSelectionKey.value = getSuggestionItemKey(suggestion.id)
  nextTick(scheduleConnectorUpdate)
}

const showSuggestionReferencePreview = (suggestion, reference) => {
  hoveredSuggestionSelectionKey.value = getSuggestionReferenceKey(suggestion.id, reference.id)
  nextTick(scheduleConnectorUpdate)
}

const hideSuggestionPreview = () => {
  hoveredSuggestionSelectionKey.value = ''
  nextTick(scheduleConnectorUpdate)
}

const syncInterpretationFromScroll = () => {
  scheduleConnectorUpdate()
  if (
    isProgrammaticScrolling ||
    activeAnalysisTab.value !== 'interpretation' ||
    !structuredInterpretationSections.value.length
  ) return

  const headerBottom = policyHeaderRef.value?.getBoundingClientRect().bottom || 64
  const probe = Math.min(window.innerHeight - 60, Math.max(headerBottom + 36, window.innerHeight * 0.42))
  const candidates = structuredInterpretationSections.value
    .map(section => ({ key: section.key, bounds: getSectionBounds(section.key) }))
    .filter(item => item.bounds)
  if (!candidates.length) return

  const matching = candidates.find(({ bounds }) => bounds.top <= probe && bounds.bottom >= probe)
  const nearest = matching || candidates.reduce((closest, current) => {
    const currentDistance = Math.min(Math.abs(current.bounds.top - probe), Math.abs(current.bounds.bottom - probe))
    const closestDistance = Math.min(Math.abs(closest.bounds.top - probe), Math.abs(closest.bounds.bottom - probe))
    return currentDistance < closestDistance ? current : closest
  })

  if (nearest.key !== activeInterpretationKey.value) {
    activeInterpretationKey.value = nearest.key
    nextTick(() => {
      ensureInterpretationItemVisible(nearest.key)
      scheduleConnectorUpdate()
    })
  }
}

const handleWindowScroll = () => {
  if (scrollFrame) return
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0
    syncInterpretationFromScroll()
  })
}

const handleWindowResize = () => {
  scheduleConnectorUpdate()
}

watch(() => policy.value?.id, async () => {
  activeAnalysisTab.value = 'overview'
  paragraphRefs.value = []
  interpretationItemRefs.value = {}
  enterpriseItemRefs.value = {}
  enterpriseReferenceRefs.value = {}
  suggestionItemRefs.value = {}
  suggestionReferenceRefs.value = {}
  connectorLines.value = []
  hoveredInterpretationKey.value = ''
  hoveredEnterpriseSelectionKey.value = ''
  hoveredSuggestionSelectionKey.value = ''

  const firstInterpretation = structuredInterpretationSections.value[0]
  const firstEnterprisePoint = structuredEnterpriseAnalysis.value[0]
  const firstSuggestion = structuredSuggestions.value[0]
  activeInterpretationKey.value = firstInterpretation?.key || ''
  activeEnterpriseSelectionKey.value = firstEnterprisePoint
    ? getEnterpriseItemKey(firstEnterprisePoint.id)
    : ''
  activeSuggestionSelectionKey.value = firstSuggestion
    ? getSuggestionItemKey(firstSuggestion.id)
    : ''

  await nextTick()
  scheduleConnectorUpdate()
}, { immediate: true })

watch(activeAnalysisTab, async (tab) => {
  connectorLines.value = []
  hoveredInterpretationKey.value = ''
  hoveredEnterpriseSelectionKey.value = ''
  hoveredSuggestionSelectionKey.value = ''

  if (tab === 'enterprise' && structuredEnterpriseAnalysis.value.length) {
    await nextTick()
    scheduleConnectorUpdate()
    return
  }
  if (tab === 'suggestions' && structuredSuggestions.value.length) {
    await nextTick()
    scheduleConnectorUpdate()
    return
  }
  if (tab !== 'interpretation' || !structuredInterpretationSections.value.length) return

  await nextTick()
  syncInterpretationFromScroll()
  ensureInterpretationItemVisible(activeInterpretationKey.value)
  scheduleConnectorUpdate()
})

watch(displayedInterpretationKey, () => nextTick(scheduleConnectorUpdate))
watch(displayedEnterpriseSelectionKey, () => nextTick(scheduleConnectorUpdate))
watch(displayedSuggestionSelectionKey, () => nextTick(scheduleConnectorUpdate))

onMounted(() => {
  window.addEventListener('scroll', handleWindowScroll, { passive: true })
  window.addEventListener('resize', handleWindowResize, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleWindowScroll)
  window.removeEventListener('resize', handleWindowResize)
  window.clearTimeout(programmaticScrollTimer)
  if (connectorFrame) cancelAnimationFrame(connectorFrame)
  if (scrollFrame) cancelAnimationFrame(scrollFrame)
})

</script>

<style scoped>
.policy-detail-page {
  min-height: 100vh;
  padding-top: 64px;
  padding-bottom: 24px;
  background: #f0f2f5;
}

.floating-back {
  position: fixed;
  top: 82px;
  left: 24px;
  z-index: 30;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  cursor: pointer;
}

.floating-back:hover {
  color: #1677ff;
  border-color: #91caff;
}

.detail-layout {
  width: min(1480px, calc(100% - 128px));
  margin: 20px auto 0;
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(380px, 1fr);
  gap: 16px;
  align-items: start;
}

.policy-content-panel,
.analysis-panel {
  min-width: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.policy-content-panel {
  overflow: visible;
}

.policy-header {
  position: sticky;
  top: 64px;
  z-index: 20;
  padding: 20px 24px 18px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.05);
}

.policy-header h1 {
  margin: 0 0 10px;
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.55;
}

.policy-source-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 18px;
  margin-bottom: 14px;
  color: #64748b;
  font-size: 13px;
}

.header-tags {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.header-tags :deep(.ant-tag) {
  margin: 0;
  color: #64748b;
  background: #f5f5f5;
  border: none;
}

.source-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1677ff;
}

.policy-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 32px;
  padding: 14px 16px;
  color: #8c8c8c;
  background: #f7f8fa;
  border-radius: 6px;
  font-size: 13px;
}

.policy-facts div {
  display: flex;
  gap: 8px;
}

.policy-facts strong {
  color: #64748b;
  font-weight: 400;
}

.policy-body {
  padding: 24px 48px 48px;
  color: #374151;
  font-size: 15px;
  line-height: 2;
}

.policy-body h2 {
  max-width: 680px;
  margin: 0 auto 22px;
  color: #262626;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
}

.policy-body p {
  margin: 0 -12px 4px;
  padding: 4px 12px;
  border-left: 2px solid transparent;
  font-weight: 400;
  text-align: justify;
  text-indent: 2em;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.policy-body p.body-heading {
  margin-top: 16px;
  color: #262626;
  font-weight: 600;
  text-indent: 0;
}

.policy-body p.linked-highlight {
  margin-bottom: 0;
  color: #334155;
  background: #edf5ff;
  border-left-color: #69b1ff;
}

.policy-body p.linked-highlight-start {
  border-radius: 6px 6px 0 0;
  box-shadow: inset 0 1px 0 rgba(105, 177, 255, 0.22);
}

.policy-body p.linked-highlight-end {
  margin-bottom: 12px;
  border-radius: 0 0 6px 6px;
  box-shadow: inset 0 -1px 0 rgba(105, 177, 255, 0.22);
}

.policy-body p.linked-highlight-start.linked-highlight-end {
  border-radius: 6px;
}

.analysis-panel {
  position: sticky;
  top: 84px;
  max-height: calc(100vh - 108px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.analysis-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px;
  border-bottom: 1px solid #f0f0f0;
}

.ai-badge {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #1677ff, #4096ff);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
}

.analysis-title h2 {
  margin: 0;
  color: #262626;
  font-size: 18px;
  font-weight: 600;
}

.analysis-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 0 12px;
  border-bottom: 1px solid #f0f0f0;
}

.analysis-tabs button {
  position: relative;
  padding: 14px 4px 12px;
  color: #64748b;
  background: transparent;
  border: none;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.analysis-tabs button.active {
  color: #1677ff;
  font-weight: 500;
}

.analysis-tabs button.active::after {
  content: '';
  position: absolute;
  right: 22%;
  bottom: 0;
  left: 22%;
  height: 2px;
  background: #1677ff;
  border-radius: 2px 2px 0 0;
}

.analysis-content {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 20px 22px 28px;
  color: #475569;
  font-size: 14px;
  line-height: 1.9;
  scrollbar-gutter: stable;
  scroll-behavior: smooth;
}

.analysis-content p {
  margin: 0 0 14px;
  text-align: justify;
}

.analysis-content.interpretation-content {
  padding: 14px 16px 24px;
  background: #fff;
}

.interpretation-group-title {
  margin: 18px 2px 8px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
}

.interpretation-item:first-child,
.interpretation-content > .interpretation-group-title:first-child {
  margin-top: 0;
}

.interpretation-item {
  position: relative;
  margin-bottom: 10px;
  padding: 12px 14px;
  color: #475569;
  background: #f7f8fa;
  border: 1px solid transparent;
  border-radius: 7px;
  outline: none;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.interpretation-item:hover,
.interpretation-item:focus-visible,
.interpretation-item.active {
  background: #edf5ff;
  border-color: #91caff;
  box-shadow: 0 3px 12px rgba(22, 119, 255, 0.1);
}

.interpretation-item:hover {
  transform: translateX(-2px);
}

.interpretation-item.active::before {
  content: '';
  position: absolute;
  top: 14px;
  left: -4px;
  width: 7px;
  height: 7px;
  background: #1677ff;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px #69b1ff;
}

.interpretation-item h4 {
  margin: 0 0 7px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
}

.interpretation-item ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.interpretation-item li {
  position: relative;
  margin-top: 5px;
  padding-left: 12px;
  line-height: 1.65;
}

.interpretation-item li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #1677ff;
}

.interpretation-item li strong,
.interpretation-item li span {
  display: block;
}

.interpretation-item li strong {
  color: #334155;
  font-size: 13px;
  font-weight: 500;
}

.interpretation-item li span {
  color: #64748b;
  font-size: 12px;
}

.analysis-content.enterprise-content {
  padding: 18px 20px 26px;
}

.enterprise-analysis-point {
  position: relative;
  margin: 0 0 10px;
  padding: 10px 12px;
  color: #475569;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  outline: none;
  font-size: 14px;
  line-height: 1.9;
  text-align: justify;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.enterprise-analysis-point:hover,
.enterprise-analysis-point:focus-visible,
.enterprise-analysis-point.active {
  background: #edf5ff;
  border-color: #91caff;
  box-shadow: 0 3px 12px rgba(22, 119, 255, 0.1);
}

.enterprise-analysis-point:hover {
  transform: translateX(-2px);
}

.enterprise-analysis-point.active::before {
  content: '';
  position: absolute;
  top: 15px;
  left: -4px;
  width: 7px;
  height: 7px;
  background: #1677ff;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px #69b1ff;
}

.enterprise-point-number {
  margin-right: 4px;
  color: #334155;
  font-weight: 600;
}

.enterprise-references {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 7px;
  vertical-align: baseline;
}

.analysis-reference {
  min-width: 23px;
  height: 22px;
  padding: 0 3px;
  color: #64748b;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 11px;
  line-height: 20px;
  text-align: center;
  cursor: pointer;
  transition: color 0.18s ease, background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.analysis-reference:hover,
.analysis-reference:focus-visible,
.analysis-reference.active {
  color: #0958d9;
  background: #e6f4ff;
  border-color: #69b1ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.08);
  text-decoration: underline;
  text-underline-offset: 2px;
  outline: none;
}

.analysis-content.suggestions-content {
  padding: 14px 16px 24px;
  background: #fff;
}

.suggestion-item {
  position: relative;
  margin-bottom: 10px;
  padding: 13px 14px 12px;
  color: #475569;
  background: #f7f8fa;
  border: 1px solid transparent;
  border-radius: 7px;
  outline: none;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.suggestion-item:hover,
.suggestion-item:focus-visible,
.suggestion-item.active {
  background: #edf5ff;
  border-color: #91caff;
  box-shadow: 0 3px 12px rgba(22, 119, 255, 0.1);
}

.suggestion-item:hover {
  transform: translateX(-2px);
}

.suggestion-item.active::before {
  content: '';
  position: absolute;
  top: 15px;
  left: -4px;
  width: 7px;
  height: 7px;
  background: #1677ff;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px #69b1ff;
}

.suggestion-item h4 {
  margin: 0 0 7px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.65;
}

.analysis-content .suggestion-item p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.75;
  text-align: justify;
}

.suggestion-references {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  margin-top: 9px;
}

.policy-link-lines {
  position: fixed;
  inset: 0;
  z-index: 24;
  width: 100vw;
  height: 100vh;
  overflow: visible;
  pointer-events: none;
}

.connector-halo,
.connector-line {
  fill: none;
  stroke-linecap: round;
}

.connector-halo {
  stroke: rgba(255, 255, 255, 0.94);
  stroke-width: 5;
}

.connector-line {
  stroke: #69b1ff;
  stroke-width: 1.8;
  stroke-dasharray: 5 4;
  filter: drop-shadow(0 1px 1px rgba(22, 119, 255, 0.12));
}

.connector-dot {
  fill: #1677ff;
  stroke: #fff;
  stroke-width: 1.5;
}

.not-found {
  width: min(720px, calc(100% - 48px));
  margin: 100px auto;
  padding: 64px;
  background: #fff;
  border-radius: 8px;
  text-align: center;
}

@media (max-width: 1100px) {
  .detail-layout {
    width: calc(100% - 48px);
    grid-template-columns: 1fr;
  }

  .analysis-panel {
    position: static;
    max-height: none;
  }
}

@media (max-width: 640px) {
  .detail-layout {
    width: calc(100% - 24px);
  }

  .floating-back {
    left: 12px;
  }

  .policy-header,
  .policy-body {
    padding-right: 18px;
    padding-left: 18px;
  }

  .policy-facts {
    grid-template-columns: 1fr;
  }

  .analysis-tabs {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
