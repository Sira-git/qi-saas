<template>
  <div class="profile-page">
    <TopNav />

    <!-- 左侧固定返回按钮 -->
    <button class="fixed-back-btn" @click="$router.back()">
      <ArrowLeftOutlined />
    </button>

    <div class="page-wrapper">
      <!-- 企业配置标题 -->
      <div class="page-title-section">
        <div class="title-left">
          <h1 class="page-title">企业配置</h1>
          <div class="enterprise-id">
            <span class="id-label">企业 ID: </span>
            <span class="id-value">{{ enterpriseId }}</span>
          </div>
        </div>
        <button class="btn-primary" @click="saveAll" :loading="saving">保 存</button>
      </div>

      <!-- 顶部横排 Tab -->
      <div class="top-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="top-tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span class="tab-text">{{ tab.label }}</span>
          <span v-if="activeTab === tab.key" class="tab-underline"></span>
        </div>
      </div>

      <!-- Tab 内容区域 -->
      <div class="tab-content">
        <!-- 企业基础信息 -->
        <div v-if="activeTab === 'basic'" class="tab-panel">
          <div class="panel-header">
            <div class="panel-title-row">
              <div class="panel-icon-wrapper">
                <HomeOutlined class="panel-icon" />
              </div>
              <div>
                <h2 class="panel-title">企业基础信息</h2>
                <p class="panel-subtitle">填写企业简介、核心业务领域等基础信息</p>
              </div>
            </div>
          </div>

          <div class="form-section">
            <!-- 企业简介 -->
            <div class="form-item">
              <div class="form-label-row">
                <label class="form-label">
                  <span class="required">*</span> 企业简介
                </label>
                <span class="char-count">{{ form.intro.length }}/5000</span>
              </div>
              <div class="textarea-container">
                <a-textarea
                  v-model:value="form.intro"
                  placeholder="请简要介绍企业的基本情况，您可以描述主营业务、发展历程、竞争优势等"
                  :rows="6"
                  :maxlength="5000"
                />
              </div>
            </div>

            <!-- 核心业务领域 -->
            <div class="form-item">
              <label class="form-label">
                <span class="required">*</span> 核心业务领域
              </label>
              <div class="info-hint">
                <ExclamationCircleOutlined class="hint-icon" />
                <span>政策、行业、友商数据将会根据核心业务领域进行统计、分析</span>
              </div>
              <div class="business-fields">
                <div
                  v-for="(field, index) in businessFields"
                  :key="index"
                  class="business-field-row"
                >
                  <a-input
                    v-model:value="field.name"
                    placeholder="请输入业务领域名称"
                    class="field-name-input"
                  />
                  <a-input
                    v-model:value="field.description"
                    placeholder="请输入业务描述"
                    class="field-desc-input"
                  />
                  <button class="delete-btn" @click="removeBusinessField(index)">
                    <DeleteOutlined />
                  </button>
                </div>
              </div>
              <div class="add-btn-row">
                <button class="add-btn" @click="addBusinessField">
                  <PlusOutlined /> 添加
                </button>
              </div>
            </div>

            <!-- 关注地区 -->
            <div class="form-item">
              <label class="form-label">关注地区</label>
              <a-select
                v-model:value="form.focusRegions"
                mode="tags"
                :max-tag-count="99"
                placeholder="请选择省/市，用于分析政策时筛选省市的政策"
                style="width: 100%"
                class="region-select"
              />
            </div>

            <!-- 核心竞争力 -->
            <div class="form-item">
              <div class="form-label-row">
                <label class="form-label">核心竞争力（技术/壁垒/优势）</label>
                <span class="char-count">{{ form.coreAdvantage.length }}/2000</span>
              </div>
              <div class="textarea-container">
                <a-textarea
                  v-model:value="form.coreAdvantage"
                  placeholder="请简要介绍企业的核心竞争力，用于分析政策利好 / 风险、行业趋势适配度、友商动作威胁 / 机遇"
                  :rows="12"
                  :maxlength="2000"
                />
              </div>
            </div>

            <!-- 重点布局 & 短期目标 -->
            <div class="form-item">
              <div class="form-label-row">
                <label class="form-label">重点布局 & 短期目标</label>
                <span class="char-count">{{ form.keyInitiative.length }}/2000</span>
              </div>
              <div class="textarea-container">
                <a-textarea
                  v-model:value="form.keyInitiative"
                  placeholder="请简要介绍企业的重点布局或者短期目标，用于结合外部动态，精准提炼可落地的市场机会"
                  :rows="16"
                  :maxlength="2000"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 政策订阅 -->
        <div v-if="activeTab === 'policy'" class="tab-panel">
          <!-- 模块标题栏 -->
          <div class="panel-header-with-action">
            <div class="panel-header">
              <div class="panel-title-row">
                <div class="panel-icon-wrapper">
                  <BellOutlined class="panel-icon" />
                </div>
                <div>
                  <h2 class="panel-title">政策订阅管理</h2>
                  <p class="panel-subtitle">订阅关注的政策，及时获取推送</p>
                </div>
              </div>
            </div>
            <button class="btn-primary-inline" @click="openSubscribeModal">
              <PlusOutlined /> 订阅策略
            </button>
          </div>

          <!-- 政策订阅表格 -->
          <div class="subscription-table-wrapper">
            <table class="subscription-table">
              <thead>
                <tr>
                  <th>订阅地区</th>
                  <th>政策类型</th>
                  <th>适用对象</th>
                  <th>政策主题</th>
                  <th>适用行业</th>
                  <th>政策标签</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(sub, index) in policySubscriptions" :key="index">
                  <td>{{ sub.region }}</td>
                  <td>
                    <span class="table-tag">{{ sub.policyType }}</span>
                  </td>
                  <td>
                    <span class="table-tag">{{ sub.target }}</span>
                  </td>
                  <td>{{ sub.topic }}</td>
                  <td>{{ sub.industry }}</td>
                  <td class="text-muted">{{ sub.tags?.join('、') || '—' }}</td>
                  <td class="action-cell">
                    <a class="action-link" @click="viewDetail(index)">详情</a>
                    <a class="action-link danger" @click="unsubscribe(index)">取消订阅</a>
                  </td>
                </tr>
                <tr v-if="policySubscriptions.length === 0">
                  <td colspan="7" style="text-align: center; padding: 40px; color: #999;">暂无订阅策略，点击上方「+ 订阅策略」按钮添加</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 订阅策略弹窗 -->
        <a-modal
          v-model:open="subscribeModalVisible"
          title="订阅策略"
          :footer="null"
          :maskClosable="false"
          :closable="true"
          width="560px"
          class="subscribe-modal"
        >
          <div class="subscribe-modal-body">
            <!-- 订阅地区 -->
            <div class="modal-form-item">
              <label class="modal-form-label">
                <span class="required">*</span> 订阅地区
              </label>
              <a-select
                v-model:value="subscribeForm.region"
                placeholder="请选择"
                :options="regionOptions"
                allow-clear
              />
            </div>

            <!-- 适用行业 -->
            <div class="modal-form-item">
              <label class="modal-form-label">适用行业</label>
              <a-select
                v-model:value="subscribeForm.industry"
                placeholder="请选择"
                :options="industryOptions"
                allow-clear
              />
            </div>

            <!-- 适用对象 -->
            <div class="modal-form-item">
              <label class="modal-form-label">适用对象</label>
              <a-select
                v-model:value="subscribeForm.target"
                placeholder="请选择"
                :options="targetOptions"
                allow-clear
                @change="onTargetChange"
              />
            </div>

            <!-- 政策主题 -->
            <div class="modal-form-item">
              <label class="modal-form-label">政策主题</label>
              <div class="cascading-selects">
                <a-select
                  v-model:value="subscribeForm.topicLevel1"
                  placeholder="请选择"
                  :options="topicLevel1Options"
                  allow-clear
                  @change="onTopicLevel1Change"
                />
                <a-select
                  v-model:value="subscribeForm.topicLevel2"
                  placeholder="请选择"
                  :options="topicLevel2Options"
                  allow-clear
                  @change="onTopicLevel2Change"
                />
              </div>
            </div>

            <!-- 政策类型 -->
            <div class="modal-form-item">
              <label class="modal-form-label">政策类型</label>
              <a-select
                v-model:value="subscribeForm.policyType"
                placeholder="请选择"
                :options="policyTypeOptions"
                allow-clear
              />
            </div>

            <!-- 政策标签 -->
            <div class="modal-form-item">
              <label class="modal-form-label">政策标签</label>
              <a-select
                v-model:value="subscribeForm.policyTag"
                placeholder="请选择"
                :options="policyTagOptions"
                allow-clear
                :disabled="!subscribeForm.topicLevel2"
              />
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeSubscribeModal">取消</button>
            <button class="btn-primary-inline" :disabled="!canSaveSubscription" @click="saveSubscription">确定</button>
          </div>
        </a-modal>

        <!-- 行业信息配置 -->
        <div v-if="activeTab === 'industry'" class="tab-panel">
          <!-- 模块标题栏 -->
          <div class="panel-header">
            <div class="panel-title-row">
              <div class="panel-icon-wrapper">
                <PieChartOutlined class="panel-icon" />
              </div>
              <div>
                <h2 class="panel-title">行业信息配置</h2>
                <p class="panel-subtitle">配置信息源关键词，精准推送行业数据</p>
              </div>
            </div>
          </div>

          <!-- 信息来源模块 -->
          <div class="industry-section">
            <div class="section-header">
              <h3 class="section-title">信息来源</h3>
              <button class="btn-primary-inline" @click="openAddSourceModal">
                <PlusOutlined /> 添加来源
              </button>
            </div>

            <!-- 来源表格 -->
            <div class="subscription-table-wrapper">
              <table class="subscription-table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>来源类型</th>
                    <th>来源地址</th>
                    <th>添加时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(source, index) in paginatedSources" :key="source.id">
                    <td>{{ source.name }}</td>
                    <td>{{ source.type }}</td>
                    <td><a :href="source.url" target="_blank" class="action-link">{{ source.url }}</a></td>
                    <td>{{ source.time }}</td>
                    <td class="action-cell">
                      <a class="action-link danger" @click="deleteSource(index)">删除</a>
                    </td>
                  </tr>
                  <tr v-if="paginatedSources.length === 0">
                    <td colspan="5" class="empty-cell">暂无信息来源</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分页 -->
            <div class="pagination-wrapper">
              <span class="pagination-total">共 {{ industrySources.length }} 条记录</span>
              <div class="pagination-controls">
                <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage--">
                  <span>&lt;</span>
                </button>
                <button
                  v-for="page in industryDisplayedPages"
                  :key="page"
                  class="pagination-btn"
                  :class="{ active: page === currentPage }"
                  @click="currentPage = page"
                >
                  {{ page }}
                </button>
                <button class="pagination-btn" :disabled="currentPage === totalPages" @click="currentPage++">
                  <span>&gt;</span>
                </button>
                <a-select v-model:value="pageSize" style="width: 100px" @change="currentPage = 1">
                  <a-select-option :value="5">5条/页</a-select-option>
                  <a-select-option :value="10">10条/页</a-select-option>
                  <a-select-option :value="20">20条/页</a-select-option>
                </a-select>
                <span class="pagination-jump-text">跳至</span>
                <a-input-number v-model:value="currentPage" :min="1" :max="totalPages" style="width: 60px" @change="handlePageChange" />
                <span class="pagination-jump-text">页</span>
              </div>
            </div>
          </div>

          <!-- 监测关键词模块 -->
          <div class="industry-section">
            <div class="section-header">
              <h3 class="section-title">监测关键词</h3>
            </div>
            <a-select
              v-model:value="monitorKeywords"
              mode="tags"
              placeholder="请添加监测关键词，输入后按回车即可创建；系统将根据关键词筛选行业数据。"
              style="width: 100%"
              :token-separators="[',', ' ']">
            </a-select>
          </div>

          <!-- 排除关键词模块 -->
          <div class="industry-section">
            <div class="section-header">
              <h3 class="section-title">排除关键词</h3>
            </div>
            <a-select
              v-model:value="excludeKeywords"
              mode="tags"
              placeholder="请添加排除关键词，输入后按回车即可创建；系统将自动过滤包含这些关键词的行业数据。"
              style="width: 100%"
              :token-separators="[',', ' ']">
            </a-select>
          </div>
        </div>

        <!-- 添加信息来源弹窗 -->
        <a-modal
          v-model:open="sourceModalVisible"
          title="添加信息来源"
          :footer="null"
          :maskClosable="false"
          :closable="true"
          width="560px"
          class="subscribe-modal"
        >
          <div class="subscribe-modal-body">
            <!-- 来源类型 -->
            <div class="modal-form-item">
              <label class="modal-form-label">
                <span class="required">*</span> 来源类型
              </label>
              <a-select
                v-model:value="sourceForm.type"
                placeholder="请选择"
                :options="sourceTypeOptions"
                allow-clear
              />
            </div>

            <!-- 来源地址 -->
            <div class="modal-form-item">
              <label class="modal-form-label">
                <span class="required">*</span> 来源地址
              </label>
              <a-input
                v-model:value="sourceForm.url"
                placeholder="请输入来源地址"
              />
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeSourceModal">取消</button>
            <button class="btn-primary-inline" :disabled="!canSaveSource" @click="saveSource">确定</button>
          </div>
        </a-modal>

        <!-- 友商信息配置 -->
        <div v-if="activeTab === 'competitor'" class="tab-panel">
          <!-- 模块标题栏 -->
          <div class="panel-header-with-action">
            <div class="panel-header">
              <div class="panel-title-row">
                <div class="panel-icon-wrapper">
                  <BellOutlined class="panel-icon" />
                </div>
                <div>
                  <h2 class="panel-title">友商信息配置</h2>
                  <p class="panel-subtitle">配置信源跟关键词，进准推送友商数据</p>
                </div>
              </div>
            </div>
            <button class="btn-primary-inline" @click="openAddCompetitorModal">
              <PlusOutlined /> 添加友商
            </button>
          </div>

          <!-- 友商列表 -->
          <div class="competitor-list">
            <div
              v-for="competitor in competitorPaginatedList"
              :key="competitor.id"
              class="competitor-item"
            >
              <div class="competitor-info">
                <div class="competitor-name">{{ competitor.name }}</div>
                <div class="competitor-sources">
                  <div v-for="(source, idx) in competitor.sources" :key="idx" class="source-link">
                    <WechatOutlined v-if="source.type === '微信公众号'" class="source-icon" />
                    <GlobalOutlined v-else class="source-icon" />
                    <span class="source-type">{{ source.type }}：</span>
                    <a
                      :href="source.url.startsWith('http') ? source.url : 'https://' + source.url"
                      target="_blank"
                      class="source-url"
                      :title="source.url"
                    >
                      {{ source.url }}
                    </a>
                  </div>
                </div>
              </div>
              <div class="competitor-actions">
                <button class="action-btn-icon edit-btn-icon" @click="editCompetitor(competitor)" title="编辑">
                  <EditOutlined />
                </button>
                <button class="action-btn-icon delete-btn-icon" @click="deleteCompetitor(competitor.id)" title="删除">
                  <DeleteOutlined />
                </button>
              </div>
            </div>
          </div>

          <!-- 分页控件 -->
          <div class="pagination-wrapper">
            <span class="pagination-total">共 {{ competitorList.length }} 条记录</span>
            <div class="pagination-controls">
              <button class="pagination-btn" :disabled="competitorCurrentPage === 1" @click="competitorCurrentPage--">
                <span>&lt;</span>
              </button>
              <button
                v-for="page in competitorDisplayedPages"
                :key="page"
                class="pagination-btn"
                :class="{ active: page === competitorCurrentPage }"
                @click="competitorCurrentPage = page"
              >
                {{ page }}
              </button>
              <button class="pagination-btn" :disabled="competitorCurrentPage === competitorTotalPages" @click="competitorCurrentPage++">
                <span>&gt;</span>
              </button>
              <a-select v-model:value="competitorPageSize" style="width: 100px" @change="competitorCurrentPage = 1">
                <a-select-option :value="5">5条/页</a-select-option>
                <a-select-option :value="10">10条/页</a-select-option>
                <a-select-option :value="20">20条/页</a-select-option>
              </a-select>
              <span class="pagination-jump-text">跳至</span>
              <a-input-number v-model:value="competitorCurrentPage" :min="1" :max="competitorTotalPages" style="width: 60px" @change="handleCompetitorPageChange" />
              <span class="pagination-jump-text">页</span>
            </div>
          </div>

          <!-- 监测关键词模块 -->
          <div class="industry-section">
            <div class="section-header">
              <h3 class="section-title">监测关键词</h3>
            </div>
            <a-select
              v-model:value="competitorMonitorKeywords"
              mode="tags"
              placeholder="请添加监测关键词，输入后按回车即可创建；系统将根据关键词筛选友商数据。"
              style="width: 100%"
              :token-separators="['.', ' ']"
            />
          </div>

          <!-- 排除关键词模块 -->
          <div class="industry-section">
            <div class="section-header">
              <h3 class="section-title">排除关键词</h3>
            </div>
            <a-select
              v-model:value="competitorExcludeKeywords"
              mode="tags"
              placeholder="请添加排除关键词，输入后按回车即可创建；系统将自动过滤相关友商数据。"
              style="width: 100%"
              :token-separators="['.', ' ']"
            />
          </div>
        </div>

        <!-- 添加友商弹窗 -->
        <a-modal
          v-model:open="competitorModalVisible"
          :title="isEditingCompetitor ? '编辑友商' : '添加友商'"
          :footer="null"
          :maskClosable="false"
          :closable="true"
          width="560px"
          class="subscribe-modal"
        >
          <div class="subscribe-modal-body">
            <!-- 友商名称 -->
            <div class="modal-form-item">
              <label class="modal-form-label">
                <span class="required">*</span> 友商名称
              </label>
              <a-input
                v-model:value="competitorForm.name"
                placeholder="请输入友商名称"
                style="height: 32px"
              />
            </div>

            <!-- 信息来源 -->
            <div class="modal-form-item">
              <label class="modal-form-label">
                <span class="required">*</span> 信息来源
              </label>
              <div class="source-rows">
                <div v-for="(row, idx) in competitorForm.sources" :key="idx" class="source-row">
                  <a-select
                    v-model:value="row.type"
                    placeholder="请选择类型"
                    :options="sourceTypeOptions"
                    allow-clear
                    class="source-row-select"
                    style="height: 32px"
                  />
                  <a-input
                    v-model:value="row.url"
                    placeholder="请输入来源地址"
                    class="source-row-input"
                    style="height: 32px"
                  />
                  <DeleteOutlined class="source-row-delete" @click="removeCompetitorSourceRow(idx)" />
                </div>
              </div>
              <div class="add-source-row-btn" @click="addCompetitorSourceRow">
                <PlusOutlined /> 添加来源
              </div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeCompetitorModal">取消</button>
            <button class="btn-primary-inline" :disabled="!canSaveCompetitor" @click="saveCompetitor">确定</button>
          </div>
        </a-modal>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import {
  ArrowLeftOutlined,
  HomeOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  BellOutlined,
  PieChartOutlined,
  GlobalOutlined,
  WechatOutlined,
  EditOutlined,
} from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'
import { usePolicySubscriptionsStore } from '@/stores/policySubscriptions'

const route = useRoute()
const router = useRouter()
const policySubscriptionStore = usePolicySubscriptionsStore()
const { strategies: policySubscriptions } = storeToRefs(policySubscriptionStore)

// 企业ID
const enterpriseId = ref('zGMRSoz8tXV4MlCLuw9SG')

// Tab 配置
const tabs = [
  { key: 'basic', label: '企业基础信息' },
  { key: 'policy', label: '政策订阅' },
  { key: 'industry', label: '行业信息配置' },
  { key: 'competitor', label: '友商信息配置' },
]

// 激活的 Tab；支持从报告设置页直接跳转到对应配置项。
const activeTab = ref(tabs.some(tab => tab.key === route.query.tab) ? route.query.tab : 'basic')

// 表单数据 - 预填大汉软件数据
const form = ref({
  intro: '大汉软件总部位于南京，是深耕数智化领域的自主可控、信创导向软件开发与技术服务商，全国 15 城设分支机构，2019 年完成股改并获蚂蚁集团战略投资。公司从 2000 年媒体网站业务起步，逐步切入电子政务、政务服务、互联网+政务服务，2023 年发力政务大模型；拥有 200 余项软著与专利，参与多项政务国家标准编制，入选国家信创图谱，常年位居国内数字政府行业头部，2024 年政务大模型市场份额全国第 2，斩获百余项行业权威荣誉。自主研发星汉 Galaxy 政务类大模型，已完成国家网信办生成式 AI、深度合成双备案，广泛服务国家部委、各省市政数平台，同时赋能国企、高校数智化转型。',
  focusRegions: ['北京市', '浙江省', '江西省', '山东省', '江苏省', '上海市', '陕西省', '甘肃省', '四川省', '广西壮族自治区', '河南省', '天津市', '河北省', '吉林省', '黑龙江省', '南京市', '杭州市', '济南市', '宁波市', '南昌市', '兰州市', '苏州市', '西安市', '郑州市', '天津市', '石家庄市'],
  coreAdvantage: '－完整自主可控的底层技术底座\n掌握五大自研核心技术：移动多端全栈、数据智能挖掘、互联网安全认证、高性能服务、门户支撑技术；坚持国产信创路线，拥有完整自主知识产权，200+ 专利与软著。\n－政务行业深耕二十余年，标准制定话语权\n2003 年首创政府网站群理念，全程参与国家政务服务多项国家标准编制；服务覆盖国家部委、全国多省市，积累海量政务业务场景经验，行业标杆案例丰富（工信部、浙江政务网、国家政务服务平台等）。\n－国内领先政务专属大模型能力\n1）合规资质齐全：完成国家网信办双备案，入选信通院政务大模型产业图谱；\n2）完整技术体系：四大平台（知识中枢、模型训练、AI 能力、Agent 智能体），自研 0.7B/2B/7B 轻量化小模型，配套训推一体机，适配政务小算力环境；\n3）成熟落地场景：六大政务 AI 场景（知识助手、公文辅助、智慧热线、智能帮办、智策大脑、报告助理）；\n4）市场地位突出：2024 年政务大模型市场份额全国第 2，打造赣服通、泉城通办、扬州智能门户等全国标杆 AI 政务项目。\n－全链条一体化交付能力\n具备从顶层规划、平台开发、AI 模型训练、项目实施、长期运维、数据运营到安全保障的全流程闭环服务能力；中台化架构支撑产品快速迭代，分布式微服务保障高并发政务业务稳定运行。\n－行业权威背书与客户壁垒\n连续多年入选 IDC 数字政府权威报告、AI 百强、数字政府服务商榜单；沉淀全国各省市政数客户、央国企、高校长期合作资源，标杆项目形成示范效应。',
  keyInitiative: '（一）核心业务重点布局\n－政务大模型规模化落地\n持续复制赣服通、泉城通办、扬州智能门户模式，向全国各省市落地智能办事、智能门户、智能公文、智慧预警等 AI 场景；推广星汉训推一体机，适配各地政务本地化、私有化部署需求。\n－政务知识中枢平台推广\n依托大模型搭建政务统一知识中心，打通政府内外数据，实现政务知识生产、管理、应用一体化，支撑科学化决策、精准治理。\n－公共数据运营业务拓展\n依托南京公共数据运营资质，拓展各地公共数据开发利用业务，挖掘政务数据价值，赋能惠企、便民服务。\n－多领域政务 AI 场景延伸\n深化应急防灾预警大脑建设，拓展 8 大领域防灾减灾智能应用；持续迭代 Agent 智能体，推出聆记、智能导办、政策匹配等轻量化政务智能应用。\n（二）短期发展目标\n－持续完善星汉 Galaxy 大模型产品矩阵，迭代多模态一体化 AI 底座，优化轻量化小模型适配能力；\n－扩大政务大模型市场份额，打造更多全国标杆性 AI 数字政府项目，巩固行业第二位置；\n－推进"政数企"全域数智化，把智能门户、智能办事、智能公文体系标准化、产品化快速复制；\n－深耕公共数据运营赛道，形成标准化政务数据运营服务体系；\n－完善大模型全产业链配套，提升训推一体机、行业 Agent、知识中枢平台商业化落地规模；\n－拓展应急治理、社会治理等新型智慧政务赛道，构建差异化 AI 政务竞争优势。',
})

// 核心业务领域 - 预填6组数据
const businessFields = ref([
  { name: '一网通办', description: '搭建省、市、县多级线上办事平台，配套政务小程序、APP，搭载星汉大模型 AI 助手，提供智能咨询、线上办事、政策匹配服务，简化企业群众办事流程。' },
  { name: '一网协同', description: '面向党政、国企搭建跨部门协同办公系统，融合大模型实现智能写稿、会议转记、线上审批，打通机关内部分、跨部门数据壁垒。' },
  { name: '人工智能', description: '自研政务专属大模型，完成网信办双备案，配套四大技术平台与训推一体机，覆盖公文、办事、热线等六大 AI 场景，为政务、国企、高校提供智能化解决方案。' },
  { name: '市场监管', description: '整合企业开办、许可审批、信用监管、投诉处理全流程业务，借助大模型分析企业数据、识别经营风险、精准推送惠企政策，实现智慧监管与服务。' },
  { name: '数据要素', description: '拥有公共数据运营资质，依托知识中枢平台归集、治理政务数据，安全挖掘数据价值，沉淀政务知识库，为政府决策、民生服务提供数据支撑。' },
  { name: '门户网站', description: '提供省市县区多级集约化政府官网、网站群建设，支持信息公开、政民互动；结合大模型打造智能门户，实现 AI 问答、内容智能推送，服务全渠道公众需求。' },
])

// 添加业务领域
const addBusinessField = () => {
  businessFields.value.push({ name: '', description: '' })
}

// 删除业务领域
const removeBusinessField = (index) => {
  if (businessFields.value.length > 1) {
    businessFields.value.splice(index, 1)
  } else {
    businessFields.value[0] = { name: '', description: '' }
  }
}

// 保存状态
const saving = ref(false)

// 保存所有数据
const saveAll = async () => {
  // 验证必填项
  if (!form.value.intro || !form.value.intro.trim()) {
    message.warning('请填写企业简介')
    return
  }

  const hasValidField = businessFields.value.some(
    f => f.name && f.name.trim()
  )
  if (!hasValidField) {
    message.warning('请至少填写一个核心业务领域')
    return
  }

  saving.value = true
  try {
    // TODO: 调用 API 保存数据
    await new Promise(resolve => setTimeout(resolve, 500))
    message.success('保存成功')
  } catch (error) {
    message.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// ========== 订阅策略弹窗 ==========
const subscribeModalVisible = ref(false)
const subscribeForm = ref({
  region: null,
  industry: null,
  target: null,
  topicLevel1: null,
  topicLevel2: null,
  policyType: null,
  policyTag: null,
})

// 重置表单
const resetSubscribeForm = () => {
  subscribeForm.value = {
    region: null,
    industry: null,
    target: null,
    topicLevel1: null,
    topicLevel2: null,
    policyType: null,
    policyTag: null,
  }
}

// 订阅地区选项
const regionOptions = [
  { label: '全国', value: '全国' },
  { label: '江苏省', value: '江苏省' },
  { label: '江西省', value: '江西省' },
  { label: '山东省', value: '山东省' },
  { label: '北京市', value: '北京市' },
  { label: '上海市', value: '上海市' },
  { label: '浙江省', value: '浙江省' },
  { label: '河北省', value: '河北省' },
  { label: '广东省', value: '广东省' },
  { label: '湖北省', value: '湖北省' },
  { label: '湖南省', value: '湖南省' },
  { label: '四川省', value: '四川省' },
  { label: '安徽省', value: '安徽省' },
  { label: '福建省', value: '福建省' },
  { label: '河南省', value: '河南省' },
  { label: '陕西省', value: '陕西省' },
  { label: '辽宁省', value: '辽宁省' },
  { label: '重庆市', value: '重庆市' },
  { label: '天津市', value: '天津市' },
  { label: '云南省', value: '云南省' },
  { label: '广西壮族自治区', value: '广西壮族自治区' },
  { label: '贵州省', value: '贵州省' },
  { label: '甘肃省', value: '甘肃省' },
  { label: '海南省', value: '海南省' },
  { label: '内蒙古自治区', value: '内蒙古自治区' },
  { label: '宁夏回族自治区', value: '宁夏回族自治区' },
  { label: '新疆维吾尔自治区', value: '新疆维吾尔自治区' },
  { label: '西藏自治区', value: '西藏自治区' },
  { label: '青海省', value: '青海省' },
  { label: '吉林省', value: '吉林省' },
  { label: '黑龙江省', value: '黑龙江省' },
]

// 适用行业选项
const industryOptions = [
  { label: '农、林、牧、渔业', value: '农、林、牧、渔业' },
  { label: '采矿业', value: '采矿业' },
  { label: '制造业', value: '制造业' },
  { label: '电力、热力、燃气及水生产和供应业', value: '电力、热力、燃气及水生产和供应业' },
  { label: '建筑业', value: '建筑业' },
  { label: '批发和零售业', value: '批发和零售业' },
  { label: '交通运输、仓储和邮政业', value: '交通运输、仓储和邮政业' },
  { label: '住宿和餐饮业', value: '住宿和餐饮业' },
  { label: '信息传输、软件和信息技术服务业', value: '信息传输、软件和信息技术服务业' },
  { label: '金融业', value: '金融业' },
  { label: '房地产业', value: '房地产业' },
  { label: '租赁和商务服务业', value: '租赁和商务服务业' },
  { label: '科学研究和技术服务业', value: '科学研究和技术服务业' },
  { label: '水利、环境和公共设施管理业', value: '水利、环境和公共设施管理业' },
  { label: '居民服务、修理和其他服务业', value: '居民服务、修理和其他服务业' },
  { label: '教育', value: '教育' },
  { label: '卫生和社会工作', value: '卫生和社会工作' },
  { label: '文化、体育和娱乐业', value: '文化、体育和娱乐业' },
  { label: '公共管理、社会保障和社会组织', value: '公共管理、社会保障和社会组织' },
  { label: '国际组织', value: '国际组织' },
]

// 适用对象选项
const targetOptions = [
  { label: '政府', value: '政府' },
  { label: '企业', value: '企业' },
  { label: '个人', value: '个人' },
  { label: '其他', value: '其他' },
]

// 政策类型选项
const policyTypeOptions = [
  { label: '政策法规', value: '政策法规' },
  { label: '申报通知', value: '申报通知' },
  { label: '解读政策', value: '解读政策' },
  { label: '公示公告', value: '公示公告' },
]

// 政策主题数据（按适用对象分组）
const policyTopicsData = {
  '政府': [
    {
      label: '政务管理',
      value: '政务管理',
      children: [
        { label: '政务改革', value: '政务改革', tags: ['改革举措', '办事指南', '惠企服务', '效能提升'] },
        { label: '政务服务', value: '政务服务', tags: ['改革举措', '办事指南', '惠企服务', '效能提升'] },
        { label: '营商环境', value: '营商环境', tags: ['改革举措', '办事指南', '惠企服务', '效能提升'] },
      ],
    },
    {
      label: '财政税务',
      value: '财政税务',
      children: [
        { label: '财政政策', value: '财政政策', tags: ['资金申报', '税费减免', '补贴政策', '预算管理'] },
        { label: '税收优惠', value: '税收优惠', tags: ['资金申报', '税费减免', '补贴政策', '预算管理'] },
        { label: '专项资金', value: '专项资金', tags: ['资金申报', '税费减免', '补贴政策', '预算管理'] },
      ],
    },
    {
      label: '规划发展',
      value: '规划发展',
      children: [
        { label: '区域规划', value: '区域规划', tags: ['发展纲要', '项目落地', '基建工程', '区域扶持'] },
        { label: '产业规划', value: '产业规划', tags: ['发展纲要', '项目落地', '基建工程', '区域扶持'] },
        { label: '城乡建设', value: '城乡建设', tags: ['发展纲要', '项目落地', '基建工程', '区域扶持'] },
      ],
    },
    {
      label: '民生保障',
      value: '民生保障',
      children: [
        { label: '公共服务', value: '公共服务', tags: ['民生实事', '风险防控', '公共配套', '应急预案'] },
        { label: '社会保障', value: '社会保障', tags: ['民生实事', '风险防控', '公共配套', '应急预案'] },
        { label: '应急管理', value: '应急管理', tags: ['民生实事', '风险防控', '公共配套', '应急预案'] },
      ],
    },
  ],
  '企业': [
    {
      label: '产业发展',
      value: '产业发展',
      children: [
        { label: '主导产业', value: '主导产业', tags: ['产业扶持', '技改补贴', '园区政策', '业态培育'] },
        { label: '新兴产业', value: '新兴产业', tags: ['产业扶持', '技改补贴', '园区政策', '业态培育'] },
        { label: '传统产业升级', value: '传统产业升级', tags: ['产业扶持', '技改补贴', '园区政策', '业态培育'] },
      ],
    },
    {
      label: '市场经营',
      value: '市场经营',
      children: [
        { label: '市场准入', value: '市场准入', tags: ['资质办理', '行业监管', '对外招商', '市场补贴'] },
        { label: '经营规范', value: '经营规范', tags: ['资质办理', '行业监管', '对外招商', '市场补贴'] },
        { label: '市场拓展', value: '市场拓展', tags: ['资质办理', '行业监管', '对外招商', '市场补贴'] },
      ],
    },
    {
      label: '财税金融',
      value: '财税金融',
      children: [
        { label: '融资支持', value: '融资支持', tags: ['信贷服务', '减税降费', '企业奖励', '贴息补助'] },
        { label: '税费优惠', value: '税费优惠', tags: ['信贷服务', '减税降费', '企业奖励', '贴息补助'] },
        { label: '奖补政策', value: '奖补政策', tags: ['信贷服务', '减税降费', '企业奖励', '贴息补助'] },
      ],
    },
    {
      label: '人才科创',
      value: '人才科创',
      children: [
        { label: '人才引进', value: '人才引进', tags: ['人才补贴', '研发奖励', '科创平台', '知识产权'] },
        { label: '技术创新', value: '技术创新', tags: ['人才补贴', '研发奖励', '科创平台', '知识产权'] },
        { label: '平台建设', value: '平台建设', tags: ['人才补贴', '研发奖励', '科创平台', '知识产权'] },
      ],
    },
  ],
  '个人': [
    {
      label: '就业创业',
      value: '就业创业',
      children: [
        { label: '就业扶持', value: '就业扶持', tags: ['岗位推荐', '创业扶持', '技能培训', '灵活就业'] },
        { label: '创业补贴', value: '创业补贴', tags: ['岗位推荐', '创业扶持', '技能培训', '灵活就业'] },
        { label: '职业技能', value: '职业技能', tags: ['岗位推荐', '创业扶持', '技能培训', '灵活就业'] },
      ],
    },
    {
      label: '社会保障',
      value: '社会保障',
      children: [
        { label: '医保社保', value: '医保社保', tags: ['参保指南', '养老补贴', '帮扶救助', '福利政策'] },
        { label: '养老服务', value: '养老服务', tags: ['参保指南', '养老补贴', '帮扶救助', '福利政策'] },
        { label: '社会救助', value: '社会救助', tags: ['参保指南', '养老补贴', '帮扶救助', '福利政策'] },
      ],
    },
    {
      label: '教育文体',
      value: '教育文体',
      children: [
        { label: '基础教育', value: '基础教育', tags: ['助学补贴', '校园政策', '文体活动', '场馆服务'] },
        { label: '职业教育', value: '职业教育', tags: ['助学补贴', '校园政策', '文体活动', '场馆服务'] },
        { label: '文化体育', value: '文化体育', tags: ['助学补贴', '校园政策', '文体活动', '场馆服务'] },
      ],
    },
    {
      label: '医疗卫生',
      value: '医疗卫生',
      children: [
        { label: '医疗保障', value: '医疗保障', tags: ['就医指南', '防疫政策', '健康管理', '医疗补贴'] },
        { label: '健康服务', value: '健康服务', tags: ['就医指南', '防疫政策', '健康管理', '医疗补贴'] },
        { label: '公共卫生', value: '公共卫生', tags: ['就医指南', '防疫政策', '健康管理', '医疗补贴'] },
      ],
    },
  ],
  '其他': [
    {
      label: '通用综合',
      value: '通用综合',
      children: [
        { label: '通用综合', value: '通用综合', tags: ['综合资讯', '行业动态', '公共通知'] },
      ],
    },
  ],
}

// 计算属性
const topicLevel1Options = computed(() => {
  if (!subscribeForm.value.target) return []
  const data = policyTopicsData[subscribeForm.value.target]
  if (!data) return []
  return data.map(item => ({ label: item.label, value: item.value }))
})

const topicLevel2Options = computed(() => {
  if (!subscribeForm.value.target || !subscribeForm.value.topicLevel1) return []
  const data = policyTopicsData[subscribeForm.value.target]
  if (!data) return []
  const level1 = data.find(item => item.value === subscribeForm.value.topicLevel1)
  if (!level1 || !level1.children) return []
  return level1.children.map(item => ({ label: item.label, value: item.value }))
})

const policyTagOptions = computed(() => {
  if (!subscribeForm.value.target || !subscribeForm.value.topicLevel1 || !subscribeForm.value.topicLevel2) return []
  const data = policyTopicsData[subscribeForm.value.target]
  if (!data) return []
  const level1 = data.find(item => item.value === subscribeForm.value.topicLevel1)
  if (!level1 || !level1.children) return []
  const level2 = level1.children.find(item => item.value === subscribeForm.value.topicLevel2)
  if (!level2 || !level2.tags) return []
  return level2.tags.map(tag => ({ label: tag, value: tag }))
})

// 联动方法
const onTargetChange = () => {
  subscribeForm.value.topicLevel1 = ''
  subscribeForm.value.topicLevel2 = ''
  subscribeForm.value.policyTag = ''
}

const onTopicLevel1Change = () => {
  subscribeForm.value.topicLevel2 = ''
  subscribeForm.value.policyTag = ''
}

const onTopicLevel2Change = () => {
  subscribeForm.value.policyTag = ''
}

// 弹窗操作
const openSubscribeModal = () => {
  resetSubscribeForm()
  subscribeModalVisible.value = true
}

const closeSubscribeModal = () => {
  subscribeModalVisible.value = false
  resetSubscribeForm()
}

// 保存订阅策略
const saveSubscription = () => {
  if (!subscribeForm.value.region) {
    message.warning('请选择订阅地区')
    return
  }

  // 构建主题显示文本
  let topicDisplay = ''
  if (subscribeForm.value.topicLevel2) {
    topicDisplay = subscribeForm.value.topicLevel2
  } else if (subscribeForm.value.topicLevel1) {
    topicDisplay = subscribeForm.value.topicLevel1
  }

  const newSub = {
    region: subscribeForm.value.region,
    policyType: subscribeForm.value.policyType || '—',
    target: subscribeForm.value.target || '—',
    topic: topicDisplay || '—',
    industry: subscribeForm.value.industry || '—',
    tags: subscribeForm.value.policyTag ? [subscribeForm.value.policyTag] : [],
  }

  policySubscriptionStore.addStrategy(newSub)
  message.success('订阅策略添加成功')
  closeSubscribeModal()
}

const viewDetail = (index) => {
  message.info(`查看订阅详情: ${policySubscriptions.value[index].region}`)
}

const unsubscribe = (index) => {
  const item = policySubscriptions.value[index]
  policySubscriptionStore.removeStrategy(index)
  message.success(`已取消订阅: ${item.region}`)
}

// 确定按钮是否可点击
const canSaveSubscription = computed(() => {
  return !!subscribeForm.value.region
})

// ========== 行业信息配置数据 ==========
const industrySources = ref([
  { id: 1, name: '行业网', type: '网站', url: 'http://gywb.gyxww.cn', time: '2025-6-24 14:38:39' },
  { id: 2, name: '聚行业', type: '微信公众号', url: 'shturl.cc/ckxSWQqKu6qcj', time: '2025-6-24 14:38:30' },
  { id: 3, name: '行业论坛', type: '网站', url: 'http://tieba.huluobow.cn/', time: '2025-6-24 14:38:19' },
  { id: 4, name: '行业解读', type: '网站', url: 'http://www.wwcoo.cn', time: '2025-6-24 14:38:10' },
  { id: 5, name: '行业大全', type: '网站', url: 'http://www.jyxbzx.com', time: '2025-6-24 14:38:01' },
  { id: 6, name: '行业资讯', type: '网站', url: 'http://www.example.com/1', time: '2025-6-24 14:37:50' },
  { id: 7, name: '行业观察', type: '网站', url: 'http://www.example.com/2', time: '2025-6-24 14:37:40' },
  { id: 8, name: '行业研究', type: '网站', url: 'http://www.example.com/3', time: '2025-6-24 14:37:30' },
  { id: 9, name: '行业分析', type: '网站', url: 'http://www.example.com/4', time: '2025-6-24 14:37:20' },
  { id: 10, name: '行业报告', type: '网站', url: 'http://www.example.com/5', time: '2025-6-24 14:37:10' },
  { id: 11, name: '行业数据', type: '网站', url: 'http://www.example.com/6', time: '2025-6-24 14:37:00' },
  { id: 12, name: '行业趋势', type: '网站', url: 'http://www.example.com/7', time: '2025-6-24 14:36:50' },
  { id: 13, name: '行业情报', type: '网站', url: 'http://www.example.com/8', time: '2025-6-24 14:36:40' },
  { id: 14, name: '行业洞察', type: '网站', url: 'http://www.example.com/9', time: '2025-6-24 14:36:30' },
  { id: 15, name: '行业视野', type: '网站', url: 'http://www.example.com/10', time: '2025-6-24 14:36:20' },
])

const currentPage = ref(1)
const pageSize = ref(5)

const paginatedSources = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return industrySources.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => {
  return Math.ceil(industrySources.value.length / pageSize.value)
})

// 行业信息分页显示的页码（带 ... 省略号）
const industryDisplayedPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }

  return pages
})

const handlePageChange = (page) => {
  if (page < 1) currentPage.value = 1
  if (page > totalPages.value) currentPage.value = totalPages.value
}

const deleteSource = (index) => {
  const start = (currentPage.value - 1) * pageSize.value
  const actualIndex = start + index
  const item = industrySources.value[actualIndex]
  industrySources.value.splice(actualIndex, 1)
  message.success(`已删除来源: ${item.name}`)
  // 如果删除后当前页没有数据了，跳转到上一页
  if (paginatedSources.value.length === 0 && currentPage.value > 1) {
    currentPage.value--
  }
}

const openAddSourceModal = () => {
  sourceModalVisible.value = true
  Object.assign(sourceForm.value, {
    type: null,
    url: '',
    name: ''
  })
}

// 添加信息来源弹窗
const sourceModalVisible = ref(false)
const sourceForm = ref({
  type: null,
  url: '',
  name: ''
})

const sourceTypeOptions = [
  { label: '网址', value: '网址' },
  { label: '微信公众号', value: '微信公众号' },
  { label: '微博', value: '微博' },
  { label: '其他', value: '其他' }
]

const canSaveSource = computed(() => {
  return sourceForm.value.type && sourceForm.value.url
})

const closeSourceModal = () => {
  sourceModalVisible.value = false
}

const saveSource = () => {
  if (!sourceForm.value.type) {
    message.warning('请选择来源类型')
    return
  }
  if (!sourceForm.value.url) {
    message.warning('请输入来源地址')
    return
  }

  // 根据来源类型提取名称
  let extractedName = sourceForm.value.url
  if (sourceForm.value.type === '网址') {
    try {
      extractedName = new URL(sourceForm.value.url).hostname.replace(/^www\./, '')
    } catch {
      extractedName = sourceForm.value.url.split('/')[0]
    }
  } else if (sourceForm.value.type === '微信公众号') {
    extractedName = sourceForm.value.url.split('/').pop() || '未知公众号'
  }

  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

  industrySources.value.unshift({
    id: Date.now(),
    name: extractedName,
    type: sourceForm.value.type,
    url: sourceForm.value.url,
    time: timeStr
  })

  message.success('添加成功！')
  sourceModalVisible.value = false
}

// 监测关键词
const monitorKeywords = ref([
  '大模型', 'AI', '算力', '智能体', 'Agent', '龙虾', 'Claw', '数智化', '信创',
  '大数据', '数字政府', '智慧政务', '政务服务', '一网统管', '一网通办', '高效办成一件事',
  '协同整合', '数字机关', '公文', '一网协同', '智慧党建', '智能门户', '政务公开',
  '云计算', '多端', '数据要素', '政策解读', '公共数据', '办事大厅', 'AIGC',
  '数据利用', '一体化平台', '一体机'
])

// 排除关键词
const excludeKeywords = ref([])

// ========== 友商信息配置数据 ==========
const competitorList = ref([
  { id: 1, name: '拓尔思', sources: [{ type: '微信公众号', url: 'MzkyMTQxODcyOQ==' }, { type: '网站', url: 'https://www.trs.com.cn/' }] },
  { id: 2, name: '南威', sources: [{ type: '微信公众号', url: 'MzlxNjEOOTc50Q==' }] },
  { id: 3, name: '浪潮软件', sources: [{ type: '微信公众号', url: 'Mzg5OTYWOTM0OQ==' }] },
  { id: 4, name: '致远互联', sources: [{ type: '微信公众号', url: 'MjM5MTM4NDQ4MA==' }] },
  { id: 5, name: '开普云', sources: [{ type: '微信公众号', url: 'MzIONTEONDg4Ng==' }] },
  { id: 6, name: '万达信息', sources: [{ type: '网站', url: 'www.wondersinfo.com' }] },
  { id: 7, name: '神州数码', sources: [{ type: '网站', url: 'www.digitech.com.cn' }] },
  { id: 8, name: '东软集团', sources: [{ type: '网站', url: 'www.neusoft.com' }] },
  { id: 9, name: '宝信软件', sources: [{ type: '网站', url: 'www.baosight.com.cn' }] },
  { id: 10, name: '太极股份', sources: [{ type: '网站', url: 'www.taiji.com.cn' }] },
  { id: 11, name: '中科软', sources: [{ type: '网站', url: 'www.sinosoft.com.cn' }] },
  { id: 12, name: '润和软件', sources: [{ type: '网站', url: 'www.hrhsoft.com' }] },
  { id: 13, name: '软通动力', sources: [{ type: '网站', url: 'www.rhonway.com' }] },
  { id: 14, name: '中软国际', sources: [{ type: '网站', url: 'www.chinasofti.com' }] },
  { id: 15, name: '宇信科技', sources: [{ type: '网站', url: 'www.yusys.com.cn' }] },
])

const competitorCurrentPage = ref(1)
const competitorPageSize = ref(5)

const competitorTotalPages = computed(() => {
  return Math.ceil(competitorList.value.length / competitorPageSize.value)
})

const competitorDisplayedPages = computed(() => {
  const pages = []
  for (let i = 1; i <= competitorTotalPages.value; i++) {
    pages.push(i)
  }
  return pages
})

const competitorPaginatedList = computed(() => {
  const start = (competitorCurrentPage.value - 1) * competitorPageSize.value
  return competitorList.value.slice(start, start + competitorPageSize.value)
})

const handleCompetitorPageChange = (page) => {
  if (page < 1) competitorCurrentPage.value = 1
  if (page > competitorTotalPages.value) competitorCurrentPage.value = competitorTotalPages.value
}

const competitorModalVisible = ref(false)
const isEditingCompetitor = ref(false)
const editingCompetitorId = ref(null)
const competitorForm = ref({
  name: '',
  sources: [
    { type: null, url: '' }
  ]
})

const canSaveCompetitor = computed(() => {
  return competitorForm.value.name && competitorForm.value.sources.some(row => row.type && row.url)
})

const openAddCompetitorModal = () => {
  isEditingCompetitor.value = false
  editingCompetitorId.value = null
  competitorModalVisible.value = true
  Object.assign(competitorForm.value, {
    name: '',
    sources: [
      { type: null, url: '' }
    ]
  })
}

const editCompetitor = (competitor) => {
  isEditingCompetitor.value = true
  editingCompetitorId.value = competitor.id
  competitorModalVisible.value = true
  Object.assign(competitorForm.value, {
    name: competitor.name,
    sources: competitor.sources.map(s => ({ type: s.type, url: s.url }))
  })
}

const deleteCompetitor = (id) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该友商信息吗？此操作不可恢复。',
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: () => {
      competitorList.value = competitorList.value.filter(c => c.id !== id)
      if (competitorPaginatedList.value.length === 0 && competitorCurrentPage.value > 1) {
        competitorCurrentPage.value--
      }
      message.success('删除成功！')
    }
  })
}

const closeCompetitorModal = () => {
  competitorModalVisible.value = false
}

const addCompetitorSourceRow = () => {
  competitorForm.value.sources.push({ type: null, url: '' })
}

const removeCompetitorSourceRow = (idx) => {
  if (competitorForm.value.sources.length > 1) {
    competitorForm.value.sources.splice(idx, 1)
  }
}

const saveCompetitor = () => {
  if (!competitorForm.value.name) {
    message.warning('请输入友商名称')
    return
  }
  const validSources = competitorForm.value.sources.filter(row => row.type && row.url)
  if (validSources.length === 0) {
    message.warning('请至少填写一个完整的来源信息')
    return
  }

  if (isEditingCompetitor.value) {
    const target = competitorList.value.find(c => c.id === editingCompetitorId.value)
    if (target) {
      Object.assign(target, {
        name: competitorForm.value.name,
        sources: validSources.map(row => ({ type: row.type, url: row.url }))
      })
      message.success('编辑成功！')
    }
  } else {
    competitorList.value.unshift({
      id: Date.now(),
      name: competitorForm.value.name,
      sources: validSources.map(row => ({ type: row.type, url: row.url }))
    })
    message.success('添加成功！')
  }
  competitorModalVisible.value = false
}

// 友商监测关键词
const competitorMonitorKeywords = ref([
  '大模型', 'AI', '算力', '智能体', 'Agent', '龙虾', 'Claw', '数智化', '信创',
  '大数据', '数字政府', '智慧政务', '政务服务', '一网统管', '一网通办', '高效办成一件事',
  '协同整合', '数字机关', '公文', '一网协同', '智慧党建', '智能门户', '政务公开',
  '云计算', '多端', '数据要素', '政策解读', '公共数据', '办事大厅', 'AIGC',
  '数据利用', '一体化平台', '一体机'
])

// 友商排除关键词
const competitorExcludeKeywords = ref([])

onMounted(() => {
  // 数据已预填在 ref 中
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 56px;
}

/* 固定返回按钮 */
.fixed-back-btn {
  position: fixed;
  top: 72px;
  left: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  z-index: 100;
  transition: all 0.2s;
}

.fixed-back-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.page-wrapper {
  max-width: 1100px;
  margin: 24px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 标题栏 - 微蓝背景 */
.page-title-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  background: #F5F8FF;
  position: relative;
}

.title-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.enterprise-id {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.id-label {
  color: #999;
}

.id-value {
  color: #999;
}

/* 顶部横排 Tab - 高度 46px */
.top-tabs {
  display: flex;
  align-items: flex-end;
  gap: 0;
  position: relative;
  padding: 0 32px;
  height: 46px; /* 固定高度 46px */
  margin-bottom: 0; /* 去掉下方间距 */
  border-bottom: 1px solid #e8e8e8;
  box-sizing: border-box;
}

.top-tab-item {
  padding: 0 16px 0;
  font-size: 14px;
  font-weight: 400; /* 统一基础字重，避免切换时 font-weight 变化导致闪烁 */
  color: #86909c;
  cursor: pointer;
  transition: color 0.2s; /* 只过渡颜色，不过渡 font-weight，避免闪烁 */
  position: relative;
  width: auto;
  display: flex;
  align-items: center;
  height: 100%;
  box-sizing: border-box;
}

.top-tab-item:hover {
  color: #1677ff;
}

.top-tab-item.active {
  color: #1677ff;
  font-weight: 500;
}

.tab-text {
  position: relative;
  z-index: 1;
}

.tab-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%; /* 宽度与文字一致 */
  height: 2px;
  background: #1677ff;
  border-radius: 1px;
  z-index: 2;
}

.tab-content {
  margin-top: 0;
  padding: 20px 32px 40px; /* 上边距 20px，左右 32px，下边距 40px */
  overflow-y: auto; /* 启用内部滚动 */
  max-height: calc(100vh - 260px); /* 限制最大高度，确保滚动条始终出现（或预留空间） */
  scrollbar-gutter: stable; /* 稳定滚动条空间，防止切换标签时因滚动条出现/消失导致布局跳动 */
}

.tab-panel {
  max-width: 100%;
}

.panel-header {
  margin-bottom: 20px; /* 标题栏与下方表单间距 20px */
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 64px; /* 统一标题栏最小高度，确保切换时无跳动 */
  box-sizing: border-box;
}

.panel-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-icon-wrapper {
  width: 40px;
  height: 40px;
  background: #e6f4ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.panel-icon {
  font-size: 20px;
  color: #1677ff;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
}

.panel-subtitle {
  font-size: 13px;
  color: #999;
  margin: 0;
}

/* 带右侧按钮的模块标题栏 */
.panel-header-with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  min-height: 64px; /* 与 .panel-header 保持一致，确保切换时无跳动 */
  box-sizing: border-box;
}

.panel-header-with-action > .panel-header {
  margin-bottom: 0;
  flex: 1;
}

/* 内联主按钮（如 + 订阅策略） */
.btn-primary-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #1677ff;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-primary-inline:hover {
  background: #4096ff;
}

/* 政策订阅表格 */
.subscription-table-wrapper {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.subscription-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.subscription-table thead {
  background: #fafafa;
}

.subscription-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: #555;
  border-bottom: 1px solid #e8e8e8;
  white-space: nowrap;
}

.subscription-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

.subscription-table tbody tr:last-child td {
  border-bottom: none;
}

.subscription-table tbody tr:hover {
  background: #fafafa;
}

/* 表格内的标签 */
.table-tag {
  display: inline-block;
  padding: 2px 12px;
  background: #e6f4ff;
  color: #1677ff;
  border-radius: 4px;
  font-size: 13px;
}

/* 操作列 */
.action-cell {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-link {
  color: #1677ff;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.action-link:hover {
  color: #4096ff;
}

.action-link.danger {
  color: #ff4d4f;
}

.action-link.danger:hover {
  color: #ff7875;
}

.text-muted {
  color: #999;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 24px; /* 表单项全局间距 24px */
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin: 0;
}

/* 标签行 - 标题与字符计数同行 */
.form-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.char-count {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  white-space: nowrap;
}

.required {
  color: #ff4d4f;
  margin-right: 2px;
}

.textarea-container {
  position: relative;
  width: 100%;
}

.textarea-container :deep(.ant-input) {
  resize: none;
  font-size: 14px;
  line-height: 1.6;
}

/* 提示条 */
.info-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #e6f7ff;
  border: 1px solid #91caff;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #0958d9;
}

.hint-icon {
  font-size: 14px;
  margin-top: 2px;
  flex-shrink: 0;
}

/* 业务领域输入 */
.business-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.business-field-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-name-input {
  width: 200px !important;
  flex-shrink: 0;
}

.field-desc-input {
  flex: 1;
}

.delete-btn {
  padding: 4px 8px;
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  transition: color 0.2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.delete-btn:hover {
  color: #ff4d4f;
}

.add-btn-row {
  margin-top: 8px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  padding: 8px;
  text-align: center;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  color: #1677ff;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  transition: color 0.2s;
}

.add-btn:hover {
  color: #4096ff;
}

/* 关注地区 - tags 模式 */
.region-select :deep(.ant-select-selector) {
  min-height: 40px;
}

/* 保存按钮 */
.btn-primary {
  background: #1677ff;
  color: #fff;
  border: none;
  padding: 10px 28px;
  border-radius: 6px;
  font-size: 15px;
  letter-spacing: 4px;
  cursor: pointer;
  transition: all 0.2s;
  position: absolute;
  top: 20px;
  right: 32px;
  flex-shrink: 0;
}

.btn-primary:hover {
  background: #4096ff;
}

/* 内联主按钮（如 + 订阅策略） */
.btn-primary-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #1677ff;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-primary-inline:hover {
  background: #4096ff;
}

/* 带右侧按钮的模块标题栏 */
.panel-header-with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  min-height: 64px; /* 与 .panel-header 保持一致，确保切换时无跳动 */
  box-sizing: border-box;
}

.panel-header-with-action > .panel-header {
  margin-bottom: 0;
  flex: 1;
}

/* 政策订阅表格 */
.subscription-table-wrapper {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.subscription-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.subscription-table thead {
  background: #fafafa;
}

.subscription-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: #555;
  border-bottom: 1px solid #e8e8e8;
  white-space: nowrap;
}

.subscription-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

.subscription-table tbody tr:last-child td {
  border-bottom: none;
}

.subscription-table tbody tr:hover {
  background: #fafafa;
}

/* 表格内的标签 */
.table-tag {
  display: inline-block;
  padding: 2px 12px;
  background: #e6f4ff;
  color: #1677ff;
  border-radius: 4px;
  font-size: 13px;
}

/* 操作列 */
.action-cell {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-link {
  color: #1677ff;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.action-link:hover {
  color: #4096ff;
}

.action-link.danger {
  color: #ff4d4f;
}

.action-link.danger:hover {
  color: #ff7875;
}

.text-muted {
  color: #999;
}

/* ========== 订阅策略弹窗样式 ========== */
.subscribe-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

.subscribe-modal :deep(.ant-modal-header) {
  margin-bottom: 0;
  padding: 24px 24px 0;
  border-bottom: none;
}

.subscribe-modal :deep(.ant-modal-title) {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.subscribe-modal :deep(.ant-modal-body) {
  padding: 0;
}

.subscribe-modal-body {
  padding: 24px 0; /* 去掉左右边距 */
  display: flex;
  flex-direction: column;
  gap: 20px; /* 字段间距 20px */
}

.modal-form-item {
  display: flex;
  flex-direction: column;
  gap: 8px; /* 标题与输入框间距 8px */
}

.modal-form-label {
  font-size: 14px;
  color: #333;
  font-weight: 400;
}

.modal-form-item .required {
  color: #ff4d4f;
  margin-right: 2px;
}

.modal-form-item :deep(.ant-select) {
  width: 100%;
}

.modal-form-item :deep(.ant-select-selector) {
  min-height: 32px !important;
  height: 32px !important;
  border-radius: 6px;
}

.modal-form-item :deep(.ant-select-selection-item) {
  line-height: 32px;
}

.modal-form-item :deep(.ant-select-selection-placeholder) {
  display: block !important;
  opacity: 1 !important;
  line-height: 32px;
  color: #bfbfbf;
}

.modal-form-item :deep(.ant-input) {
  height: 32px;
  line-height: 32px;
  border-radius: 6px;
}

/* 级联选择器 */
.cascading-selects {
  display: flex;
  gap: 8px;
}

.cascading-selects :deep(.ant-select) {
  flex: 1;
  width: 100%;
}

.cascading-selects :deep(.ant-select-selector) {
  min-height: 32px !important;
  height: 32px !important;
  border-radius: 6px;
}

.cascading-selects :deep(.ant-select-selection-item) {
  line-height: 32px;
}

/* 政策标签禁用状态 */
.modal-form-item :deep(.ant-select-disabled .ant-select-selector) {
  background: #f5f5f5 !important;
}

/* 弹窗底部按钮 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 0 12px; /* 去掉左右边距，底部间距 12px */
}

.btn-cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  color: #666;
  border: 1px solid #d9d9d9;
  padding: 0 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 64px;
  height: 36px;
}

.btn-cancel:hover {
  color: #1677ff;
  border-color: #1677ff;
}

.modal-footer .btn-primary-inline {
  opacity: 1;
  min-width: 64px;
  height: 36px;
  padding: 0 20px;
  letter-spacing: 1px;
}

.modal-footer .btn-primary-inline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
/* ========== 行业信息配置样式 ========== */
.industry-section {
  margin-bottom: 24px;
}

.industry-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
  padding-left: 8px;
  border-left: 3px solid #1677ff;
  line-height: 1;
}

.industry-section :deep(.ant-input) {
  border-radius: 6px;
}

.industry-section :deep(.ant-select) {
  border-radius: 6px;
}

.industry-section :deep(.ant-select-selector) {
  border-radius: 6px !important;
  min-height: auto !important;
  flex-wrap: wrap !important;
  padding: 4px 4px !important; /* 输入框内边距 4px */
}

.industry-section :deep(.ant-select-selection-overflow) {
  flex-wrap: wrap !important;
}

.industry-section :deep(.ant-select-selection-item) {
  line-height: 22px;
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.keyword-tag {
  display: inline-flex;
  align-items: center;
  background: #f0f5ff;
  color: #1677ff;
  border: 1px solid #d6e4ff;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 13px;
  line-height: 20px;
  height: 24px;
}

.keyword-tag.danger {
  background: #fff1f0;
  color: #ff4d4f;
  border-color: #ffccc7;
}

.tag-close {
  margin-left: 6px;
  cursor: pointer;
  font-size: 14px;
  color: inherit;
  opacity: 0.6;
  transition: opacity 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.tag-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

.empty-hint {
  color: #999;
  font-size: 13px;
}

/* 信息来源表格样式 (复用订阅表格样式) */
.source-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.source-table th,
.source-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.source-table th {
  background: #fafafa;
  font-weight: 600;
  color: #333;
}

.source-table td a {
  color: #1677ff;
  text-decoration: none;
}

.source-table td a:hover {
  text-decoration: underline;
}

.source-table .action-btn {
  background: none;
  border: none;
  color: #1677ff;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
}

.source-table .action-btn:hover {
  color: #4096ff;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 16px;
  gap: 12px;
  font-size: 14px;
  color: #666;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #333;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #1677ff;
  color: #1677ff;
}

.pagination-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination-btn.active {
  background: #1677ff;
  border-color: #1677ff;
  color: #fff;
}

.pagination-jump {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-jump :deep(.ant-input-number) {
  width: 60px;
}
.empty-cell {
  text-align: center;
  color: #999;
  padding: 24px 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 24px; /* 分页与下方模块间距 24px */
  font-size: 14px;
}

.pagination-total {
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-jump-text {
  color: #666;
}

/* 分页按钮 */
.pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #333;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  padding: 0;
}

.pagination-btn:hover {
  color: #1677ff;
  border-color: #1677ff;
}

.pagination-btn.active {
  background: #1677ff;
  color: #fff;
  border-color: #1677ff;
}

.pagination-btn:disabled {
  color: #d9d9d9;
  cursor: not-allowed;
}

.pagination-btn:disabled:hover {
  color: #d9d9d9;
  border-color: #d9d9d9;
}

.pagination-wrapper :deep(.ant-select-selector) {
  border-radius: 6px !important;
  height: 32px !important;
  min-height: 32px !important;
}

.pagination-wrapper :deep(.ant-input-number) {
  width: 60px;
  border-radius: 6px;
  height: 32px;
}
/* ========== 友商信息配置样式 ========== */
.competitor-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.competitor-item {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  transition: background 0.2s ease;
  position: relative;
}

.competitor-item:hover {
  background: #f0f5ff;
}

.competitor-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.competitor-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.4;
}

.competitor-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.source-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.source-icon {
  font-size: 14px;
  color: #999;
  flex-shrink: 0;
}

.source-type {
  color: #666;
  flex-shrink: 0;
}

.source-url {
  color: #1890ff;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
  display: inline-block;
  transition: color 0.2s;
}

.source-url:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.competitor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.competitor-item:hover .competitor-actions {
  opacity: 1;
}

.action-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: auto;
  border: none;
  background: transparent;
  color: #86909c;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 18px;
  padding: 4px;
}

.action-btn-icon:hover {
  color: #1677ff;
  background: rgba(22, 119, 255, 0.05);
}

.delete-btn-icon:hover {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.05);
}

/* ========== 友商信息配置样式 ========== */
.competitor-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.competitor-item {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  transition: background 0.2s ease;
  position: relative;
}

.competitor-item:hover {
  background: #f0f5ff;
}

.competitor-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.competitor-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.4;
}

.competitor-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.source-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.source-icon {
  font-size: 14px;
  color: #999;
  flex-shrink: 0;
}

.source-type {
  color: #666;
  flex-shrink: 0;
}

.source-url {
  color: #1890ff;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
  display: inline-block;
  transition: color 0.2s;
}

.source-url:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.competitor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.competitor-item:hover .competitor-actions {
  opacity: 1;
}

.action-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: auto;
  border: none;
  background: transparent;
  color: #86909c;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 18px;
  padding: 4px;
}

.action-btn-icon:hover {
  color: #1677ff;
  background: rgba(22, 119, 255, 0.05);
}

.delete-btn-icon:hover {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.05);
}

.competitor-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 8px;
}

.competitor-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.source-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.source-icon {
  font-size: 14px;
  color: #999;
}

.source-type {
  color: #666;
}

/* 来源行（添加友商弹窗内） */
.source-rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.source-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-row-select {
  width: 130px !important;
  flex-shrink: 0;
}

.source-row-input {
  flex: 1;
  min-width: 0;
}

.source-row-delete {
  font-size: 16px;
  color: #999;
  cursor: pointer;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.source-row-delete:hover {
  color: #ff4d4f;
  background: #fff1f0;
}

.add-source-row-btn {
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  padding: 4px 12px;
  text-align: center;
  cursor: pointer;
  color: #999;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s;
  margin-top: 4px;
}

.add-source-row-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}
</style>
