<template>
  <div class="policy-list-page">
    <!-- 统一顶部导航 -->
    <TopNav />

    <div class="page-content">
      <div class="page-container">
        <!-- 页面标题（仅在有来源简报时显示） -->
        <div v-if="fromReportId" class="page-header-bar">
          <div class="page-title-section">
            <button class="back-btn" @click="$router.back()">
              <ArrowLeftOutlined /> 返回
            </button>
            <div class="title-info">
              <h1>{{ fullReportTitle }} - 相关政策</h1>
            </div>
          </div>
        </div>

        <!-- Tab 与操作按钮行 -->
        <div class="tabs-with-actions">
          <!-- 顶部 Tab 切换 -->
          <div class="tabs-header">
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'related' }"
              @click="switchTab('related')"
            >
              与我相关
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'subscribed' }"
              @click="switchTab('subscribed')"
            >
              我订阅的
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'all' }"
              @click="switchTab('all')"
            >
              全部政策
            </div>
          </div>
          
          <!-- 右侧操作按钮 -->
          <div class="page-actions">
            <span class="count-badge">共<em>{{ displayTotal }}</em>条</span>
            <a-button type="primary" @click="goToSubscription">
              <SettingOutlined /> 订阅管理
            </a-button>
          </div>
        </div>

        <!-- 筛选区域 -->
        <div class="filter-section">
          <div class="filter-header">
            <div class="search-box">
              <a-input-search
                v-model:value="searchKeyword"
                :placeholder="searchPlaceholder"
                @search="handleSearch"
                style="width: 400px"
              >
                <template #prefix>
                  <SearchOutlined />
                </template>
              </a-input-search>
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <span v-if="activeTab === 'all'" class="location-chip" :class="{ locating: isLocating }">
                <EnvironmentOutlined /> {{ isLocating ? '定位中' : locatedRegion }}
              </span>
            </div>
            <button v-if="activeTab !== 'subscribed'" class="collapse-btn" @click="isExpanded = !isExpanded">
              {{ isExpanded ? '收起' : '展开' }}
              <CaretUpOutlined v-if="isExpanded" />
              <CaretDownOutlined v-else />
            </button>
          </div>

          <div v-show="isExpanded" class="filter-body">
            <!-- 订阅页面仅展示当前企业已配置的策略，卡片数据同时用于列表准入。 -->
            <div v-if="activeTab === 'subscribed'" class="filter-row subscription-strategy-row">
              <div class="filter-label">订阅策略</div>
              <div class="subscription-strategy-list">
                <article
                  v-for="(strategy, index) in subscriptionStrategies"
                  :key="strategy.id"
                  class="subscription-strategy-card"
                  :class="{ primary: index === 0 }"
                >
                  <p>
                    <span>地区：<strong>{{ strategy.region }}</strong></span>
                    <span>适用对象：<strong>{{ strategy.target }}</strong></span>
                    <span>政策类型：<strong>{{ strategy.policyType }}</strong></span>
                  </p>
                  <p><span>适用行业：<strong>{{ strategy.industry }}</strong></span></p>
                  <p><span>政策主题：<strong>{{ strategy.topic }}</strong></span></p>
                  <p class="strategy-tags">
                    <span>政策标签：</span>
                    <template v-if="strategy.tags.length">
                      <a-tag v-for="tag in strategy.tags" :key="tag">{{ tag }}</a-tag>
                    </template>
                    <span v-else class="empty-strategy-value">—</span>
                  </p>
                </article>
              </div>
            </div>

            <!-- 全部政策：云库完整筛选项 -->
            <template v-if="activeTab === 'all'">
              <div class="filter-row">
                <div class="filter-label">地区</div>
                <div class="filter-options">
                  <a-tag
                    v-for="region in displayedAllRegionOptions"
                    :key="region"
                    class="filter-tag"
                    :class="{ active: filterRegion === region }"
                    @click="filterRegion = region"
                  >
                    {{ region }}
                  </a-tag>
                  <button class="filter-more" @click="regionMoreExpanded = !regionMoreExpanded">
                    {{ regionMoreExpanded ? '收起' : '更多' }}
                    <CaretUpOutlined v-if="regionMoreExpanded" />
                    <CaretDownOutlined v-else />
                  </button>
                </div>
              </div>

              <div class="filter-row">
                <div class="filter-label">适用行业</div>
                <div class="filter-options">
                  <a-tag
                    v-for="industry in displayedIndustryOptions"
                    :key="industry"
                    class="filter-tag"
                    :class="{ active: filterIndustry === industry }"
                    @click="filterIndustry = industry"
                  >
                    {{ industry }}
                  </a-tag>
                  <button class="filter-more" @click="industryMoreExpanded = !industryMoreExpanded">
                    {{ industryMoreExpanded ? '收起' : '更多' }}
                    <CaretUpOutlined v-if="industryMoreExpanded" />
                    <CaretDownOutlined v-else />
                  </button>
                </div>
              </div>

              <div class="filter-row">
                <div class="filter-label">政策主题</div>
                <div class="filter-options">
                  <a-tag
                    v-for="topic in displayedTopicOptions"
                    :key="topic"
                    class="filter-tag"
                    :class="{ active: filterTopic === topic }"
                    @click="filterTopic = topic"
                  >
                    {{ topic }}
                  </a-tag>
                  <button class="filter-more" @click="topicMoreExpanded = !topicMoreExpanded">
                    {{ topicMoreExpanded ? '收起' : '更多' }}
                    <CaretUpOutlined v-if="topicMoreExpanded" />
                    <CaretDownOutlined v-else />
                  </button>
                </div>
              </div>
            </template>

            <!-- 与我相关：保留原筛选项 -->
            <div v-else-if="activeTab === 'related'" class="filter-row">
              <div class="filter-label">地区</div>
              <div class="filter-options">
                <a-tag
                  v-for="region in regionOptions"
                  :key="region"
                  :color="filterRegion === region ? 'blue' : ''"
                  class="filter-tag"
                  :class="{ active: filterRegion === region }"
                  @click="filterRegion = region"
                >
                  {{ region }}
                </a-tag>
              </div>
            </div>

            <!-- 业务领域筛选 -->
            <div v-if="activeTab === 'related'" class="filter-row">
              <div class="filter-label">业务领域</div>
              <div class="filter-options">
                <a-tag
                  v-for="field in businessFieldOptions"
                  :key="field"
                  :color="filterBusinessField === field ? 'blue' : ''"
                  class="filter-tag"
                  :class="{ active: filterBusinessField === field }"
                  @click="filterBusinessField = field"
                >
                  {{ field }}
                </a-tag>
              </div>
            </div>

            <!-- 发布时间筛选 -->
            <div class="filter-row">
              <div class="filter-label">发布时间</div>
              <div class="filter-options">
                <a-tag
                  v-for="time in ['全部', '近3天', '近7天', '近1个月']"
                  :key="time"
                  :color="filterTime === time ? 'blue' : ''"
                  class="filter-tag"
                  :class="{ active: filterTime === time }"
                  @click="selectTimeFilter(time)"
                >
                  {{ time }}
                </a-tag>
                <div class="date-range">
                  <a-range-picker
                    v-model:value="dateRange"
                    :placeholder="['开始日期', '结束日期']"
                    style="width: 240px"
                    @change="handleDateRangeChange"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 已选标签 -->
        <div v-if="hasActiveFilters" class="selected-conditions-bar">
          <span class="conditions-label">已选标签：</span>
          <div class="selected-conditions-list">
            <a-tag
              v-for="tag in selectedTags"
              :key="tag.key"
              color="orange"
              closable
              @close="removeFilter(tag.key)"
              class="condition-tag"
            >
              {{ tag.label }}
            </a-tag>
          </div>
        </div>

        <!-- 政策列表 -->
        <div class="policy-list">
          <div v-for="policy in paginatedPolicies" :key="policy.id" class="policy-item" @click="viewDetail(policy)">
            <div class="policy-main">
              <h3 class="policy-title">{{ policy.title }}</h3>
              <div class="policy-tags">
                <a-tag 
                  v-for="tag in policy.tags" 
                  :key="tag" 
                  class="policy-tag-item"
                  @click.stop="filterByTag(tag)"
                >
                  {{ tag }}
                </a-tag>
              </div>
            </div>
            <div class="policy-meta">
              <div class="meta-left">
                <span class="meta-item">
                  <span class="meta-label">发文单位：</span>
                  <span class="meta-value">{{ policy.issuer }}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-label">发文时间：</span>
                  <span class="meta-value">{{ policy.publishDate }}</span>
                </span>
              </div>
              <span class="meta-link" @click.stop="viewDetail(policy)">查看详情 →</span>
            </div>
          </div>
        </div>

        <div v-if="filteredPolicies.length === 0" class="empty-state">
          <div class="empty-icon">📄</div>
          <p>暂无相关政策</p>
        </div>

        <!-- 分页 -->
        <div v-if="filteredPolicies.length > 0" class="pagination">
          <a-pagination 
            v-model:current="currentPage" 
            v-model:page-size="pageSize" 
            :total="displayTotal" 
            show-size-changer
            show-quick-jumper
            :locale="paginationLocale"
            @change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import { 
  SearchOutlined, 
  CaretUpOutlined, 
  CaretDownOutlined,
  ArrowLeftOutlined,
  SettingOutlined,
  EnvironmentOutlined
} from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'
import { usePolicySubscriptionsStore } from '@/stores/policySubscriptions'
import { relatedPolicyRecords } from '@/data/relatedPolicies'
import dayjs from 'dayjs'

const paginationLocale = {
  items_per_page: '条/页',
  jump_to: '跳至',
  jump_to_confirm: '确认',
  page: '页',
  prev_page: '上一页',
  next_page: '下一页',
  prev_5: '向前 5 页',
  next_5: '向后 5 页',
  prev_3: '向前 3 页',
  next_3: '向后 3 页',
}

const router = useRouter()
const route = useRoute()
const subscriptionStore = usePolicySubscriptionsStore()
const { strategies: subscriptionStrategies } = storeToRefs(subscriptionStore)

// 从路由参数获取简报信息
const fromReportId = route.query.reportId || route.params.reportId || null
const reportBaseTitle = ref(route.query.reportBaseTitle || '市场简报')
const reportDate = ref(route.query.reportDate || '')
const reportType = ref(route.query.reportType || 'daily')

// 构建完整标题
const fullReportTitle = computed(() => {
  if (!fromReportId) return '市场简报'
  const typeText = reportType.value === 'daily' ? '日报' : reportType.value === 'weekly' ? '周报' : reportType.value === 'monthly' ? '月报' : '日报'
  return `${reportBaseTitle.value} - ${reportDate.value} ${typeText}`
})

// 跳转订阅管理
const goToSubscription = () => {
  const pathSegments = route.path.split('/')
  if (pathSegments[1] === 'space' && pathSegments[2]) {
    router.push(`/space/${pathSegments[2]}/configure`)
  } else {
    router.push('/space/zGMRSoz8tXV4MlCLuw9SG/configure')
  }
}

// 筛选状态
const isExpanded = ref(true)
const searchKeyword = ref('')
const validTabs = ['related', 'subscribed', 'all']
const activeTab = ref(validTabs.includes(route.query.tab) ? route.query.tab : 'related')
const locatedRegion = ref(localStorage.getItem('qi_ip_region') || '南京市')
const isLocating = ref(false)
const filterRegion = ref(activeTab.value === 'all' ? locatedRegion.value : '全部')
const filterBusinessField = ref('全部')
const filterIndustry = ref('全部')
const filterTarget = ref('全部')
const filterTopic = ref('全部')
const filterPolicyType = ref('全部')
const filterTime = ref('全部')
const dateRange = ref([])
const filterTags = ref([])
const regionMoreExpanded = ref(false)
const industryMoreExpanded = ref(false)
const topicMoreExpanded = ref(false)

const searchPlaceholder = computed(() => {
  if (activeTab.value === 'subscribed') return '在订阅政策中搜索关键字'
  if (activeTab.value === 'all') return '请输入关键字查询'
  return '搜索政策关键字'
})

// 分页变量
const currentPage = ref(1)
const pageSize = ref(10)

// 地区选项 - 按层级顺序排列
const regionOptions = [
  '全部', '全国',
  // 省份
  '浙江省', '江西省', '山东省', '江苏省', '广西壮族自治区', '河南省', '河北省',
  '甘肃省', '四川省', '吉林省', '黑龙江省', '陕西省', '安徽省',
  // 直辖市
  '北京市', '上海市', '天津市', '重庆市',
  // 地级市
  '南京市', '杭州市', '济南市', '宁波市', '南昌市', '兰州市', '苏州市',
  '西安市', '郑州市', '石家庄市'
]

// 业务领域选项
const businessFieldOptions = [
  '全部', '一网通办', '门户网站', '人工智能', '数据要素', '一网协同', '市场监管'
]

const collapsedAllRegionOptions = [
  '全部', '全国', '江苏省', '南京市', '南京江北新区', '玄武区', '秦淮区', '建邺区',
  '鼓楼区', '浦口区', '栖霞区', '雨花台区'
]
const expandedAllRegionOptions = [
  ...collapsedAllRegionOptions, '江宁区', '六合区', '溧水区', '高淳区', '北京市', '上海市', '浙江省', '广东省', '山东省'
]
const displayedAllRegionOptions = computed(() => {
  const options = regionMoreExpanded.value ? expandedAllRegionOptions : collapsedAllRegionOptions
  if (options.includes(locatedRegion.value)) return options
  return [...options.slice(0, 2), locatedRegion.value, ...options.slice(2)]
})

const collapsedIndustryOptions = [
  '全部', '农、林、牧、渔业', '采矿业', '制造业', '电力/热力/燃气及水生产和供应业', '建筑业',
  '批发和零售业', '交通运输/仓储和邮政业'
]
const expandedIndustryOptions = [
  ...collapsedIndustryOptions, '住宿和餐饮业', '信息传输/软件和信息技术服务业', '金融业', '房地产业',
  '租赁和商务服务业', '科学研究和技术服务业', '水利/环境和公共设施管理业'
]
const displayedIndustryOptions = computed(() => industryMoreExpanded.value
  ? expandedIndustryOptions
  : collapsedIndustryOptions)

const targetOptions = ['全部', '政府', '企业', '个人', '其他']
const collapsedTopicOptions = [
  '全部', '政府治理', '财政税收', '法治建设', '区域与城乡发展', '社会治理与公共安全',
  '生态文明建设', '监督监察', '人事编制'
]
const expandedTopicOptions = [
  ...collapsedTopicOptions, '科技创新', '数字化转型', '产业发展', '商务贸易', '市场监管'
]
const displayedTopicOptions = computed(() => topicMoreExpanded.value
  ? expandedTopicOptions
  : collapsedTopicOptions)
const policyTypeOptions = ['全部', '政策法规', '申报通知', '解读政策', '公示公告']

const locationAliases = {
  Nanjing: '南京市', Beijing: '北京市', Shanghai: '上海市', Guangzhou: '广州市',
  Shenzhen: '深圳市', Hangzhou: '杭州市', Suzhou: '苏州市', Wuhan: '武汉市', Chengdu: '成都市'
}

const normalizeLocatedRegion = ({ city, region, region_code: regionCode }) => {
  if (locationAliases[city]) return locationAliases[city]
  if (city && /[市区县]$/.test(city)) return city
  if (city && /^[\u4e00-\u9fa5]+$/.test(city)) return `${city}市`
  if (regionCode === 'BJ' || region === 'Beijing') return '北京市'
  if (regionCode === 'SH' || region === 'Shanghai') return '上海市'
  return '南京市'
}

const locateByIp = async () => {
  isLocating.value = true
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch('https://ipapi.co/json/', { signal: controller.signal })
    if (!response.ok) throw new Error('IP location request failed')
    const region = normalizeLocatedRegion(await response.json())
    locatedRegion.value = region
    localStorage.setItem('qi_ip_region', region)
    if (activeTab.value === 'all') filterRegion.value = region
  } catch {
    if (activeTab.value === 'all') filterRegion.value = locatedRegion.value
  } finally {
    window.clearTimeout(timer)
    isLocating.value = false
  }
}

onMounted(locateByIp)

const handleSearch = () => {
  message.success('查询成功')
}

// Tab 切换
const switchTab = (tab) => {
  activeTab.value = tab
  currentPage.value = 1
  searchKeyword.value = ''
  filterRegion.value = tab === 'all' ? locatedRegion.value : '全部'
  filterBusinessField.value = '全部'
  filterIndustry.value = '全部'
  filterTarget.value = '全部'
  filterTopic.value = '全部'
  filterPolicyType.value = '全部'
  filterTime.value = '全部'
  dateRange.value = []
  filterTags.value = []

}

const handlePageChange = (page, size) => {
  currentPage.value = page
  pageSize.value = size
}

const selectTimeFilter = (time) => {
  filterTime.value = time
  dateRange.value = []
}

const handleDateRangeChange = (value) => {
  dateRange.value = value || []
  if (dateRange.value.length === 2) filterTime.value = '全部'
}

// 已选标签
const hasActiveFilters = computed(() => {
  const hasManualRegion = filterRegion.value !== '全部' &&
    !(activeTab.value === 'all' && filterRegion.value === locatedRegion.value)

  return hasManualRegion ||
         filterBusinessField.value !== '全部' ||
         filterIndustry.value !== '全部' ||
         filterTarget.value !== '全部' ||
         filterTopic.value !== '全部' ||
         filterPolicyType.value !== '全部' ||
         filterTime.value !== '全部' ||
         dateRange.value?.length > 0 ||
         searchKeyword.value ||
         filterTags.value.length > 0
})

const selectedTags = computed(() => {
  const tags = []
  if (filterRegion.value !== '全部' &&
      !(activeTab.value === 'all' && filterRegion.value === locatedRegion.value)) {
    tags.push({ key: 'region', label: filterRegion.value })
  }
  if (filterBusinessField.value !== '全部') {
    tags.push({ key: 'businessField', label: filterBusinessField.value })
  }
  if (filterIndustry.value !== '全部') {
    tags.push({ key: 'industry', label: filterIndustry.value })
  }
  if (filterTarget.value !== '全部') {
    tags.push({ key: 'target', label: filterTarget.value })
  }
  if (filterTopic.value !== '全部') {
    tags.push({ key: 'topic', label: filterTopic.value })
  }
  if (filterPolicyType.value !== '全部') {
    tags.push({ key: 'policyType', label: filterPolicyType.value })
  }
  if (filterTime.value !== '全部') {
    tags.push({ key: 'time', label: filterTime.value })
  }
  if (dateRange.value?.length > 0) {
    tags.push({ 
      key: 'date', 
      label: `${dateRange.value[0].format('YYYY-MM-DD')} 至 ${dateRange.value[1].format('YYYY-MM-DD')}` 
    })
  }
  if (searchKeyword.value) {
    tags.push({ key: 'keyword', label: searchKeyword.value })
  }
  filterTags.value.forEach(tag => {
    tags.push({ key: `tag-${tag}`, label: tag, tagValue: tag })
  })
  return tags
})

const removeFilter = (key) => {
  switch(key) {
    case 'region':
      filterRegion.value = '全部'
      break
    case 'businessField':
      filterBusinessField.value = '全部'
      break
    case 'industry':
      filterIndustry.value = '全部'
      break
    case 'target':
      filterTarget.value = '全部'
      break
    case 'topic':
      filterTopic.value = '全部'
      break
    case 'policyType':
      filterPolicyType.value = '全部'
      break
    case 'time':
      filterTime.value = '全部'
      break
    case 'date':
      dateRange.value = []
      break
    case 'keyword':
      searchKeyword.value = ''
      break
    default:
      if (key.startsWith('tag-')) {
        const tagValue = key.replace('tag-', '')
        const index = filterTags.value.indexOf(tagValue)
        if (index > -1) {
          filterTags.value.splice(index, 1)
        }
      }
      break
  }
}

const filterByTag = (tag) => {
  const index = filterTags.value.indexOf(tag)
  if (index > -1) {
    filterTags.value.splice(index, 1)
    message.info(`已取消筛选：${tag}`)
  } else {
    filterTags.value.push(tag)
    message.success(`已添加筛选：${tag}`)
  }
}

// 企业配置（与企业信息页的预置数据保持一致）
const enterprisePreferences = {
  focusRegions: [
    '北京市', '浙江省', '江西省', '山东省', '江苏省', '上海市', '陕西省', '甘肃省',
    '四川省', '广西壮族自治区', '河南省', '天津市', '河北省', '吉林省', '黑龙江省',
    '南京市', '杭州市', '济南市', '宁波市', '南昌市', '兰州市', '苏州市', '西安市', '郑州市', '石家庄市'
  ],
  businessFields: ['一网通办', '一网协同', '人工智能', '市场监管', '数据要素', '门户网站']
}

// 云库“全部政策”当前页数据，字段用于完整筛选条件查询。
const allPolicies = ref([
  {
    id: 'cloud-1',
    title: '关于征求《武器装备质量管理条例（修订草案）》意见的通知',
    tags: [],
    issuer: '国家国防科技工业局、中央军委装备发展部',
    publishDate: '2026-07-13',
    region: '全国',
    industry: '制造业',
    target: '企业',
    topic: '政府治理',
    policyType: '政策法规',
    dataSource: 'cloud'
  },
  {
    id: 'cloud-2',
    title: '商务部 海关总署公告2026年第29号 公布对氯气实施临时禁止出口管理',
    tags: ['出口管理'],
    issuer: '商务部、海关总署',
    publishDate: '2026-07-10',
    region: '全国',
    industry: '制造业',
    target: '企业',
    topic: '商务贸易',
    policyType: '政策法规',
    dataSource: 'cloud'
  },
  {
    id: 'cloud-3',
    title: '关于第二届全国住房城乡建设行业职业技能大赛技术技能展示交流项目方案的通知',
    tags: ['职业技能大赛', '建筑机器人', '传统建造技艺', '城镇燃气安全', '行业职业教育'],
    issuer: '住房和城乡建设部',
    publishDate: '2026-07-10',
    region: '全国',
    industry: '建筑业',
    target: '企业',
    topic: '人事编制',
    policyType: '申报通知',
    dataSource: 'cloud'
  },
  {
    id: 'cloud-4',
    title: '关于追加中交建筑集团第三工程有限公司等1家企业进行资质核查的通知',
    tags: ['资质核查', '民航专业工程', '建筑业企业资质', '动态核查', '资质自查'],
    issuer: '中国民用航空局机场司',
    publishDate: '2026-07-10',
    region: '全国',
    industry: '建筑业',
    target: '企业',
    topic: '市场监管',
    policyType: '公示公告',
    dataSource: 'cloud'
  },
  {
    id: 'cloud-5',
    title: '关于发布行业标准查询服务网点的通告',
    tags: ['标准查询'],
    issuer: '国家国防科技工业局',
    publishDate: '2026-07-10',
    region: '全国',
    industry: '科学研究和技术服务业',
    target: '企业',
    topic: '政府治理',
    policyType: '公示公告',
    dataSource: 'cloud'
  },
  {
    id: 'cloud-6',
    title: '关于南通四建集团有限公司等1家企业民航专业工程资质动态核查整改材料的公示',
    tags: ['资质核查', '动态核查', '民航专业工程', '资质核定', '公示'],
    issuer: '中国民用航空局机场司',
    publishDate: '2026-07-10',
    region: '全国',
    industry: '建筑业',
    target: '企业',
    topic: '市场监管',
    policyType: '公示公告',
    dataSource: 'cloud'
  },
  {
    id: 'cloud-7',
    title: '国际航线审批结果公开（C2026006）',
    tags: ['国际航线', '经营许可', '临时加班', '包机审批'],
    issuer: '中国民用航空局运输司',
    publishDate: '2026-07-09',
    region: '全国',
    industry: '交通运输/仓储和邮政业',
    target: '企业',
    topic: '政府治理',
    policyType: '公示公告',
    dataSource: 'cloud'
  },
  {
    id: 'cloud-8',
    title: '关于第四监管周期省级电网输配电价、区域电网输电价格及有关事项的通知（发改价格〔2026〕1077号）',
    tags: ['输配电价', '区域电网输电价格', '价格监管', '自然垄断环节'],
    issuer: '国家发展改革委',
    publishDate: '2026-07-08',
    region: '全国',
    industry: '电力/热力/燃气及水生产和供应业',
    target: '企业',
    topic: '财政税收',
    policyType: '政策法规',
    dataSource: 'cloud'
  },
  {
    id: 'cloud-9',
    title: '关于发布2026年菌草及菌草制品出口配额招标第二次招标系数的通知',
    tags: ['出口配额'],
    issuer: '商务部对外贸易司',
    publishDate: '2026-07-08',
    region: '全国',
    industry: '农、林、牧、渔业',
    target: '企业',
    topic: '商务贸易',
    policyType: '申报通知',
    dataSource: 'cloud'
  },
  {
    id: 'cloud-10',
    title: '关于开展2026年第二批制造业数字化转型试点申报的通知',
    tags: ['数字化转型', '制造业', '试点申报'],
    issuer: '工业和信息化部',
    publishDate: '2026-07-08',
    region: '全国',
    industry: '制造业',
    target: '企业',
    topic: '数字化转型',
    policyType: '申报通知',
    dataSource: 'cloud'
  }
])

// 政策数据 - 云库增量数据的页面模拟
const policies = ref([
  {
    id: '1',
    title: '14项重点任务，山东出台数据赋能人工智能创新发展实施意见',
    tags: ['人工智能'],
    issuer: '山东省大数据局',
    publishDate: '2026-07-10',
    region: '山东省',
    policyType: '政策法规',
    target: '政府+企业',
    businessField: '人工智能,数据要素',
    dataSource: 'cloud-increment',
    type: 'related'
  },
  {
    id: '2',
    title: '兰州市人民政府办公室关于印发《推进"人工智能+"数据新要素行动的工作方案》的通知',
    tags: ['人工智能', '数据要素'],
    issuer: '兰州市人民政府办公室',
    publishDate: '2026-07-01',
    region: '甘肃省',
    policyType: '政策法规',
    target: '政府+企业',
    businessField: '人工智能,数据要素',
    dataSource: 'cloud-increment',
    type: 'related'
  },
  {
    id: '3',
    title: '杭州市数据资源管理局关于市政协十二届四次会议409号提案的办理意见',
    tags: ['人工智能', '数据要素'],
    issuer: '杭州市数据资源管理局',
    publishDate: '2026-06-23',
    region: '浙江省',
    policyType: '公示公告',
    target: '政府',
    businessField: '人工智能,数据要素',
    dataSource: 'cloud-increment',
    type: 'related'
  },
  {
    id: '4',
    title: '数智济南建设2026年工作要点',
    tags: ['一网通办', '人工智能', '一网协同', '数据要素'],
    issuer: '济南市大数据局',
    publishDate: '2026-06-18',
    region: '山东省',
    policyType: '政策法规',
    target: '政府+企业',
    businessField: '一网通办,人工智能,一网协同,数据要素',
    dataSource: 'cloud-increment',
    type: 'related'
  },
  {
    id: '5',
    title: '住房城乡建设部 国家数据局关于全面建立房屋建筑统一代码制度的通知',
    tags: ['数据要素', '一网通办'],
    issuer: '住房和城乡建设部、国家数据局',
    publishDate: '2026-06-17',
    region: '国家',
    policyType: '政策法规',
    target: '政府+企业',
    businessField: '数据要素,一网通办',
    dataSource: 'cloud-increment',
    type: 'related'
  },
  {
    id: '6',
    title: '一窗受理减环节 一网通办增效能 皋兰县全力打造一流政务营商环境',
    tags: ['一网通办'],
    issuer: '兰州市人民政府',
    publishDate: '2026-06-15',
    region: '甘肃省',
    policyType: '公示公告',
    target: '政府',
    businessField: '一网通办',
    dataSource: 'cloud-increment',
    type: 'related'
  },
  {
    id: '7',
    title: '中共陕西省委办公厅 陕西省人民政府办公厅关于加快公共数据资源开发利用的实施意见',
    tags: ['数据要素'],
    issuer: '中共陕西省委办公厅、陕西省人民政府办公厅',
    publishDate: '2026-06-10',
    region: '陕西省',
    policyType: '政策法规',
    target: '政府+企业',
    businessField: '数据要素',
    dataSource: 'cloud-increment',
    type: 'related'
  },
  {
    id: '8',
    title: '江苏省数据局关于打造高效便捷政务环境相关推进举措',
    tags: ['一网通办', '一网协同'],
    issuer: '江苏省数据局',
    publishDate: '2026-06-05',
    region: '江苏省',
    policyType: '政策法规',
    target: '政府+企业',
    businessField: '一网通办,一网协同',
    dataSource: 'cloud-increment',
    type: 'related'
  },
  {
    id: '9',
    title: '市委改革办(市营商环境建设局)关于市十六届人大六次会议第248号建议的答复',
    tags: ['人工智能', '一网通办'],
    issuer: '宁波市人民政府',
    publishDate: '2026-05-28',
    region: '浙江省',
    policyType: '政策法规',
    target: '政府+企业',
    businessField: '人工智能,一网通办',
    dataSource: 'cloud-increment',
    type: 'related'
  },
  {
    id: '10',
    title: '全方位打造数智强省，河南出台18条举措',
    tags: ['数据要素', '一网通办', '人工智能'],
    issuer: '河南省人民政府办公厅',
    publishDate: '2026-05-23',
    region: '河南省',
    policyType: '政策法规',
    target: '政府+企业',
    businessField: '数据要素,一网通办,人工智能',
    dataSource: 'cloud-increment',
    type: 'related'
  },
  {
    id: '11',
    title: '加快我省制造业智能化提质升级',
    tags: ['智能工厂', '数据分级', '双创基地'],
    issuer: '江苏省人民政府',
    publishDate: '2026-02-04',
    region: '江苏省',
    policyType: '政策法规',
    target: '企业',
    businessField: '人工智能,数据要素',
    industry: '信息传输、软件和信息技术服务业',
    topic: '科技创新',
    policyTags: ['智能工厂', '数据分级', '双创基地'],
    dataSource: 'cloud-increment'
  },
  {
    id: '12',
    title: '知识产权促进民营经济发展实施办法',
    tags: ['维权援助', '专精特新', '技术转移'],
    issuer: '江苏省知识产权局',
    publishDate: '2025-11-07',
    region: '江苏省',
    policyType: '政策法规',
    target: '企业',
    businessField: '人工智能',
    industry: '信息传输、软件和信息技术服务业',
    topic: '科技创新',
    policyTags: ['维权援助', '专精特新', '技术转移'],
    dataSource: 'cloud-increment'
  },
  {
    id: '13',
    title: '省科技厅关于印发《江苏省科技计划项目合同制管理实施细则（试行）》的通知',
    tags: ['技术转移', '企业技术中心'],
    issuer: '江苏省科技厅',
    publishDate: '2025-10-20',
    region: '江苏省',
    policyType: '政策法规',
    target: '企业',
    businessField: '人工智能',
    industry: '信息传输、软件和信息技术服务业',
    topic: '科技创新',
    policyTags: ['技术转移', '企业技术中心'],
    dataSource: 'cloud-increment'
  },
  {
    id: '14',
    title: '知识产权预警信息2025年9月第4期',
    tags: ['经营者集中', '海外维权', '行业预警'],
    issuer: '江苏省贸促会',
    publishDate: '2025-09-25',
    region: '江苏省',
    policyType: '政策法规',
    target: '企业',
    businessField: '数据要素',
    industry: '信息传输、软件和信息技术服务业',
    topic: '科技创新',
    policyTags: ['经营者集中', '海外维权', '行业预警'],
    dataSource: 'cloud-increment'
  },
  {
    id: '15',
    title: '关于印发《江苏省省级企业技术中心认定评价工作流程（2025年修订）》的通知',
    tags: ['企业技术中心'],
    issuer: '江苏省贸促会',
    publishDate: '2025-09-25',
    region: '江苏省',
    policyType: '政策法规',
    target: '企业',
    businessField: '人工智能',
    industry: '信息传输、软件和信息技术服务业',
    topic: '科技创新',
    policyTags: ['企业技术中心'],
    dataSource: 'cloud-increment'
  },
  {
    id: '16',
    title: '关于印发《企业数据资源入表指南》的通知',
    tags: ['数据入表', '数据资源', '会计处理', '数据资产', '数字经济'],
    issuer: '江苏省财政厅',
    publishDate: '2025-08-27',
    region: '江苏省',
    policyType: '政策法规',
    target: '企业',
    businessField: '数据要素',
    industry: '信息传输、软件和信息技术服务业',
    topic: '科技创新',
    policyTags: ['数据入表', '数据资源', '会计处理', '数据资产', '数字经济'],
    dataSource: 'cloud-increment'
  },
  {
    id: '17',
    title: '数据安全与数据资源开发利用管理办法',
    tags: ['数据资源', '数据安全'],
    issuer: '国家数据局',
    publishDate: '2025-03-25',
    region: '国家',
    policyType: '政策法规',
    target: '企业',
    businessField: '数据要素',
    industry: '信息传输、软件和信息技术服务业',
    topic: '科技创新',
    policyTags: ['数据资源', '数据安全'],
    dataSource: 'cloud-increment'
  },
  {
    id: '18',
    title: '关于深入实施“人工智能+”行动的意见',
    tags: ['技改导向', '技术转移', 'AI创新'],
    issuer: '国务院',
    publishDate: '2025-02-24',
    region: '国家',
    policyType: '政策法规',
    target: '企业',
    businessField: '人工智能',
    industry: '信息传输、软件和信息技术服务业',
    topic: '数字化转型',
    policyTags: ['AI创新'],
    dataSource: 'cloud-increment'
  }
])

const isGovernmentAndEnterprisePolicy = (policy) => {
  const targets = Array.isArray(policy.target)
    ? policy.target
    : String(policy.target || '').split(/[+、,]/)

  return targets.includes('政府') && targets.includes('企业')
}

const getBusinessFields = (policy) => String(policy.businessField || '')
  .split(',')
  .map(field => field.trim())
  .filter(Boolean)

// 「与我相关」展示附件政策数据，按发文时间倒序排列。
const relatedPolicies = computed(() => [...relatedPolicyRecords]
  .sort((a, b) => dayjs(b.publishDate).valueOf() - dayjs(a.publishDate).valueOf()))

const getTargetValues = (target) => (Array.isArray(target) ? target : String(target || '').split(/[+、,]/))
  .map(value => value.trim())
  .filter(Boolean)

const matchesSubscriptionStrategy = (policy, strategy) => {
  const policyTags = Array.isArray(policy.policyTags) ? policy.policyTags : policy.tags || []

  return policy.region === strategy.region &&
    getTargetValues(policy.target).includes(strategy.target) &&
    policy.policyType === strategy.policyType &&
    policy.industry === strategy.industry &&
    policy.topic === strategy.topic &&
    (!strategy.tags.length || strategy.tags.some(tag => policyTags.includes(tag)))
}

const subscribedPolicies = computed(() => policies.value
  .filter(policy => subscriptionStrategies.value.some(strategy => matchesSubscriptionStrategy(policy, strategy)))
  .sort((a, b) => dayjs(b.publishDate).valueOf() - dayjs(a.publishDate).valueOf()))

const isWithinSelectedTime = (publishDate) => {
  const publishedAt = dayjs(publishDate)

  if (dateRange.value?.length === 2) {
    return !publishedAt.isBefore(dayjs(dateRange.value[0]).startOf('day')) &&
      !publishedAt.isAfter(dayjs(dateRange.value[1]).endOf('day'))
  }

  const daysByOption = { '近3天': 3, '近7天': 7, '近1个月': 30 }
  const days = daysByOption[filterTime.value]
  if (!days) return true

  return !publishedAt.isBefore(dayjs().subtract(days, 'day').startOf('day'))
}

const matchesAllPolicyRegion = (policy) => {
  if (filterRegion.value === '全部' || filterRegion.value === '全国') return true
  // 国家级政策对定位地区同样适用。
  return policy.region === '全国' || policy.region === '国家' || policy.region === filterRegion.value
}

const matchesKeyword = (policy) => {
  if (!searchKeyword.value) return true
  const searchableText = [policy.title, policy.issuer, ...(policy.tags || [])].join('')
  return searchableText.includes(searchKeyword.value.trim())
}

const filteredPolicies = computed(() => {
  if (activeTab.value === 'all') {
    return allPolicies.value.filter(policy => {
      if (!matchesAllPolicyRegion(policy)) return false
      if (filterIndustry.value !== '全部' && policy.industry !== filterIndustry.value) return false
      if (filterTarget.value !== '全部' && !getTargetValues(policy.target).includes(filterTarget.value)) return false
      if (filterTopic.value !== '全部' && policy.topic !== filterTopic.value) return false
      if (filterPolicyType.value !== '全部' && policy.policyType !== filterPolicyType.value) return false
      if (!isWithinSelectedTime(policy.publishDate)) return false
      if (filterTags.value.length && !filterTags.value.every(tag => policy.tags.includes(tag))) return false
      return matchesKeyword(policy)
    })
  }

  const tabPolicies = activeTab.value === 'related' ? relatedPolicies.value : subscribedPolicies.value

  return tabPolicies.filter(policy => {
    if (fromReportId && policy.reportId !== fromReportId) return false
    if (filterRegion.value !== '全部' && policy.region !== filterRegion.value) return false
    if (filterBusinessField.value !== '全部' && !policy.businessField.includes(filterBusinessField.value)) return false
    if (!isWithinSelectedTime(policy.publishDate)) return false
    if (filterTags.value.length > 0) {
      const hasAllTags = filterTags.value.every(tag => policy.tags.includes(tag))
      if (!hasAllTags) return false
    }
    if (!matchesKeyword(policy)) return false
    return true
  })
})

const CLOUD_POLICY_TOTAL = 74216
const displayTotal = computed(() => {
  if (activeTab.value !== 'all') return filteredPolicies.value.length
  return hasActiveFilters.value ? filteredPolicies.value.length : CLOUD_POLICY_TOTAL
})

const paginatedPolicies = computed(() => {
  // 全部政策的模拟数据是云库返回的当前页，翻页交互由云库总量驱动。
  if (activeTab.value === 'all') return filteredPolicies.value.slice(0, pageSize.value)
  const start = (currentPage.value - 1) * pageSize.value
  return filteredPolicies.value.slice(start, start + pageSize.value)
})

watch(
  [
    activeTab, filterRegion, filterBusinessField, filterIndustry, filterTarget, filterTopic,
    filterPolicyType, filterTime, dateRange, searchKeyword, filterTags, pageSize
  ],
  () => { currentPage.value = 1 },
  { deep: true }
)

const viewDetail = (policy) => {
  router.push({
    name: 'PolicyDetail',
    params: { id: String(policy.id) },
    state: {
      policy: JSON.parse(JSON.stringify(policy)),
      sourceTab: activeTab.value,
    },
  })
}
</script>

<style scoped>
.policy-list-page {
  min-height: 100vh;
  background: #f0f2f5;
  padding-top: 64px;
}

.page-content {
  padding-top: 24px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 页面标题栏（仅来源简报时显示） */
.page-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f5f5f5;
  color: #1677ff;
}

.title-info h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
}

/* Tab 与操作按钮行 */
.tabs-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 8px;
}

/* 已选条件栏 */
.selected-conditions-bar {
  background: #fff;
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

/* 顶部 Tab 切换 */
.tabs-header {
  display: flex;
  gap: 24px;
}

.tab-item {
  font-size: 18px;
  font-weight: 600;
  color: #8c8c8c;
  cursor: pointer;
  padding: 12px 0;
  position: relative;
  transition: all 0.2s;
}

.tab-item:hover {
  color: #1677ff;
}

.tab-item.active {
  color: #1677ff;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 3px;
  background: #1677ff;
  border-radius: 2px 2px 0 0;
}

/* 右侧操作按钮 */
.page-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;
}

.page-actions .ant-btn {
  height: 32px;
  padding: 0 12px;
  font-size: 14px;
}

.count-badge {
  font-size: 14px;
  color: #1677ff;
  white-space: nowrap;
  padding: 2px 8px;
  border: 1px solid #91caff;
  border-radius: 999px;
  background: #e6f4ff;
}

.count-badge :deep(em) {
  font-style: normal;
  color: #1677ff;
  font-weight: 600;
}

.conditions-label {
  font-size: 14px;
  color: #64748b;
  flex-shrink: 0;
  font-weight: 500;
}

.selected-conditions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  flex: 1;
}

.condition-tag {
  margin: 0;
  background: #fff7e6 !important;
  color: #d46b08 !important;
  border-color: #ffd591 !important;
  font-size: 12px;
  padding: 2px 8px;
}

.condition-tag:hover {
  background: #d46b08 !important;
  color: #fff !important;
  border-color: #d46b08 !important;
}

/* 筛选区域 */
.filter-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.search-box {
  display: flex;
  gap: 8px;
  align-items: center;
}

.location-chip {
  height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 10px;
  color: #1677ff;
  background: #e6f4ff;
  border-radius: 4px;
  font-size: 13px;
  white-space: nowrap;
}

.location-chip.locating {
  color: #8c8c8c;
  background: #f5f5f5;
}

.collapse-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: #f5f5f5;
  color: #1677ff;
}

.filter-body {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.filter-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  gap: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.filter-label {
  width: 80px;
  font-size: 14px;
  color: #64748b;
  flex-shrink: 0;
  padding-top: 6px;
}

.filter-options {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.filter-tag {
  cursor: pointer;
  padding: 4px 12px;
  margin: 0;
  font-size: 13px;
  border-radius: 4px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.filter-tag:hover {
  border-color: #1677ff;
  color: #1677ff;
}

.filter-tag.active {
  background: #1677ff !important;
  color: #fff !important;
  border-color: #1677ff !important;
}

.filter-more {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: auto;
  padding: 4px 0 4px 12px;
  color: #1677ff;
  background: transparent;
  border: none;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.filter-more:hover {
  color: #4096ff;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.subscription-strategy-row {
  align-items: stretch;
}

.subscription-strategy-list {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.subscription-strategy-card {
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fff;
  color: #8c8c8c;
  font-size: 13px;
  line-height: 1.6;
}

.subscription-strategy-card.primary {
  border-color: #1677ff;
}

.subscription-strategy-card p {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin: 0 0 6px;
}

.subscription-strategy-card p:last-child {
  margin-bottom: 0;
}

.subscription-strategy-card strong {
  color: #595959;
  font-weight: 400;
}

.strategy-tags {
  align-items: center;
}

.strategy-tags :deep(.ant-tag) {
  margin: 0;
  color: #64748b;
  background: #f5f5f5;
  border-color: #d9d9d9;
}

.empty-strategy-value {
  color: #8c8c8c;
}

/* 政策列表 */
.policy-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.policy-item {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.policy-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d9d9d9;
}

.policy-main {
  margin-bottom: 14px;
}

.policy-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  line-height: 1.5;
  margin-bottom: 10px;
}

.policy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.policy-tag-item {
  font-size: 12px;
  padding: 2px 8px;
  background: #fff7e6;
  color: #d46b08;
  border-color: #ffd591;
  cursor: pointer;
}

.policy-tag-item:hover {
  background: #d46b08;
  color: #fff;
  border-color: #d46b08;
}

.policy-meta {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #64748b;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 14px;
}

.meta-left {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.meta-item {
  display: flex;
  gap: 4px;
}

.meta-label {
  color: #9ca3af;
}

.meta-link {
  margin-left: auto;
  color: #1677ff;
  cursor: pointer;
  transition: all 0.2s;
}

.meta-link:hover {
  color: #4096ff;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 16px 0;
}

@media (max-width: 960px) {
  .subscription-strategy-list {
    grid-template-columns: 1fr;
  }
}
</style>
