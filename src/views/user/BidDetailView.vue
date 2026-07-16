<template>
  <div class="bid-detail-page">
    <TopNav />

    <main class="detail-content">
      <div v-if="record" class="detail-container">
        <button
          type="button"
          class="fixed-back-btn"
          aria-label="返回标讯数据"
          title="返回标讯数据"
          @click="goBack"
        >
          <ArrowLeftOutlined />
        </button>

        <section class="summary-card">
          <div class="summary-topline">
            <div class="summary-tags">
              <span class="record-type">{{ isTender ? '招标详情' : '中标详情' }}</span>
              <span class="business-tag" :style="getTagStyle(record.businessField)">
                {{ record.businessField }}
              </span>
              <span v-if="isTender" class="status-tag" :class="tenderStatus.className">
                {{ tenderStatus.label }}
              </span>
            </div>

            <div class="summary-amount">
              <span>{{ isTender ? '招标预算' : '中标金额' }}</span>
              <strong>{{ formatBidAmount(isTender ? record.tenderBudget : record.awardedAmount) }}</strong>
            </div>
          </div>

          <h1>{{ record.title }}</h1>

          <div class="summary-meta">
            <span><EnvironmentOutlined />{{ record.regionLabel }}</span>
            <span>
              <BankOutlined />
              {{ isTender ? (record.tenderer || '招标单位待定') : (record.awardedCompany || '中标单位待定') }}
            </span>
            <span><CalendarOutlined />{{ primaryDate }}</span>
          </div>
        </section>

        <section class="detail-card" aria-labelledby="basic-information-title">
          <header class="section-header">
            <FileTextOutlined />
            <div>
              <h2 id="basic-information-title">基础信息</h2>
              <p>项目主体、区域与业务归属</p>
            </div>
          </header>
          <dl class="information-grid">
            <div class="information-item full-width">
              <dt>项目名称</dt>
              <dd>{{ display(record.title) }}</dd>
            </div>
            <div class="information-item"><dt>区域-省</dt><dd>{{ display(record.province) }}</dd></div>
            <div class="information-item"><dt>区域-市</dt><dd>{{ display(record.city) }}</dd></div>
            <div class="information-item"><dt>区域-区</dt><dd>{{ display(record.district) }}</dd></div>
            <div class="information-item"><dt>标讯业务</dt><dd>{{ display(record.rawBusinessField) }}</dd></div>
            <div class="information-item"><dt>业务领域标签</dt><dd>{{ record.businessField }}</dd></div>
            <div class="information-item"><dt>标讯行业</dt><dd>{{ display(record.industry) }}</dd></div>
            <div class="information-item"><dt>招标类型</dt><dd>{{ display(record.tenderType) }}</dd></div>
            <div class="information-item"><dt>项目编号</dt><dd>{{ display(record.projectCode) }}</dd></div>
            <div class="information-item full-width"><dt>招标单位</dt><dd>{{ display(record.tenderer) }}</dd></div>
          </dl>
        </section>

        <section class="detail-card" aria-labelledby="time-budget-title">
          <header class="section-header">
            <ClockCircleOutlined />
            <div>
              <h2 id="time-budget-title">时间节点与预算</h2>
              <p>招标进程和金额信息</p>
            </div>
          </header>
          <dl class="information-grid">
            <div class="information-item"><dt>招标预算</dt><dd>{{ formatDetailAmount(record.tenderBudget) }}</dd></div>
            <div class="information-item"><dt>开始时间</dt><dd>{{ display(record.startDate) }}</dd></div>
            <div class="information-item"><dt>报名结束时间</dt><dd>{{ display(record.registrationEndDate) }}</dd></div>
            <div class="information-item"><dt>结束时间</dt><dd>{{ display(record.endDate) }}</dd></div>
          </dl>
        </section>

        <section class="detail-card" aria-labelledby="contact-title">
          <header class="section-header">
            <ContactsOutlined />
            <div>
              <h2 id="contact-title">联系方式</h2>
              <p>招标方与代理机构联系人</p>
            </div>
          </header>
          <dl class="information-grid">
            <div class="information-item"><dt>招标联系人</dt><dd>{{ display(record.tenderContact) }}</dd></div>
            <div class="information-item"><dt>招标联系电话</dt><dd>{{ display(record.tenderPhone) }}</dd></div>
            <div class="information-item full-width"><dt>代理机构</dt><dd>{{ display(record.agency) }}</dd></div>
            <div class="information-item"><dt>代理联系人</dt><dd>{{ display(record.agencyContact) }}</dd></div>
            <div class="information-item"><dt>代理联系电话</dt><dd>{{ display(record.agencyPhone) }}</dd></div>
          </dl>
        </section>

        <section class="detail-card" aria-labelledby="result-title">
          <header class="section-header">
            <TrophyOutlined />
            <div>
              <h2 id="result-title">中标结果与附件</h2>
              <p>中标方、成交金额及招标文件状态</p>
            </div>
          </header>
          <dl class="information-grid">
            <div class="information-item"><dt>招标文件（1-有 0-无）</dt><dd>{{ formatTenderFile(record.hasTenderFile) }}</dd></div>
            <div class="information-item"><dt>中标时间</dt><dd>{{ display(record.awardDate) }}</dd></div>
            <div class="information-item full-width"><dt>中标单位</dt><dd>{{ display(record.awardedCompany) }}</dd></div>
            <div class="information-item"><dt>中标金额</dt><dd>{{ formatDetailAmount(record.awardedAmount) }}</dd></div>
            <div class="information-item"><dt>数据来源</dt><dd>{{ record.sourceFile }}</dd></div>
          </dl>
        </section>
      </div>

      <a-result
        v-else
        status="404"
        title="未找到该标讯数据"
        sub-title="这条数据可能已被移除或链接已失效"
      >
        <template #extra>
          <a-button type="primary" @click="goBack">返回标讯数据</a-button>
        </template>
      </a-result>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  BankOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ContactsOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  TrophyOutlined
} from '@ant-design/icons-vue'
import TopNav from '@/components/TopNav.vue'
import {
  formatBidAmount,
  formatExactAmount,
  formatTenderFile,
  getBidRecord
} from '@/data/bidRecords'

const route = useRoute()
const router = useRouter()
const recordType = computed(() => route.params.type === 'award' ? 'award' : 'tender')
const record = computed(() => getBidRecord(recordType.value, route.params.id))
const isTender = computed(() => recordType.value === 'tender')

const primaryDate = computed(() => {
  if (!record.value) return '时间待定'
  if (!isTender.value) return record.value.awardDate || '中标时间待定'
  if (record.value.startDate && record.value.deadline) {
    return `${record.value.startDate} - ${record.value.deadline}`
  }
  return record.value.startDate || record.value.deadline || '时间待定'
})

const tenderStatus = computed(() => {
  if (!record.value?.deadline) return { label: '报名中', className: 'open' }
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return record.value.deadline < today
    ? { label: '已结束', className: 'closed' }
    : { label: '报名中', className: 'open' }
})

const tagColors = {
  一网通办: { color: '#1677ff', borderColor: '#91caff', background: '#e6f4ff' },
  一网协同: { color: '#595959', borderColor: '#d9d9d9', background: '#fafafa' },
  人工智能: { color: '#52c41a', borderColor: '#95de64', background: '#f6ffed' },
  市场监管: { color: '#eb2f96', borderColor: '#ffadd2', background: '#fff0f6' },
  数据要素: { color: '#fa8c16', borderColor: '#ffd591', background: '#fff7e6' },
  门户网站: { color: '#13a8a8', borderColor: '#87e8de', background: '#e6fffb' },
  其他: { color: '#64748b', borderColor: '#cbd5e1', background: '#f8fafc' }
}

const getTagStyle = (field) => tagColors[field] || tagColors.其他
const display = (value) => value === null || value === undefined || value === '' ? '—' : value

const formatDetailAmount = (amount) => {
  if (!Number.isFinite(amount)) return '—'
  const exact = formatExactAmount(amount)
  return Math.abs(amount) >= 10000 ? `${exact}（${formatBidAmount(amount)}）` : exact
}

const goBack = () => {
  router.push({ name: 'BidList', query: { tab: recordType.value } })
}
</script>

<style scoped>
.bid-detail-page {
  min-height: 100vh;
  padding-top: 64px;
  background: #f3f5f8;
}

.detail-content {
  padding: 28px 0 52px;
}

.detail-container {
  width: min(1200px, calc(100% - 64px));
  margin: 0 auto;
}

.fixed-back-btn {
  position: fixed;
  top: 72px;
  left: 16px;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: #666;
  font-size: 14px;
  background: #fff;
  border: none;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s;
}

.fixed-back-btn:hover {
  color: #333;
  background: #f5f5f5;
}

.summary-card,
.detail-card {
  background: #fff;
  border: 1px solid #e3e7ed;
  border-radius: 12px;
}

.summary-card {
  margin-bottom: 18px;
  padding: 28px 32px 30px;
}

.summary-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.summary-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
}

.record-type,
.business-tag,
.status-tag {
  display: inline-flex;
  align-items: center;
  height: 25px;
  padding: 0 11px;
  font-size: 12px;
  border-radius: 13px;
}

.record-type {
  color: #1677ff;
  background: #e6f4ff;
}

.business-tag {
  border: 1px solid;
}

.status-tag.open {
  color: #389e0d;
  background: #f6ffed;
}

.status-tag.closed {
  color: #8c8c8c;
  background: #f5f5f5;
}

.summary-amount {
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: #eb2f96;
  white-space: nowrap;
}

.summary-amount span {
  font-size: 13px;
}

.summary-amount strong {
  font-size: 21px;
  font-weight: 600;
}

.summary-card h1 {
  max-width: 950px;
  margin: 18px 0 15px;
  color: #202633;
  font-size: 25px;
  font-weight: 600;
  line-height: 1.45;
}

.summary-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 24px;
  color: #697386;
  font-size: 14px;
}

.summary-meta span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.summary-meta :deep(.anticon) {
  color: #8c96a5;
}

.detail-card {
  margin-top: 18px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 20px 26px 18px;
  border-bottom: 1px solid #edf0f4;
}

.section-header > :deep(.anticon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #1677ff;
  font-size: 17px;
  background: #eaf3ff;
  border-radius: 8px;
}

.section-header h2 {
  margin: 0;
  color: #263142;
  font-size: 16px;
  font-weight: 600;
  line-height: 23px;
}

.section-header p {
  margin: 2px 0 0;
  color: #98a2b3;
  font-size: 12px;
  line-height: 18px;
}

.information-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  padding: 4px 26px 20px;
}

.information-item {
  display: grid;
  grid-template-columns: 142px minmax(0, 1fr);
  align-items: start;
  min-height: 52px;
  padding: 15px 16px 13px 0;
  border-bottom: 1px solid #f0f2f5;
}

.information-item:nth-last-child(-n + 2) {
  border-bottom-color: transparent;
}

.information-item.full-width {
  grid-column: 1 / -1;
}

.information-item dt,
.information-item dd {
  margin: 0;
  line-height: 24px;
}

.information-item dt {
  color: #8a94a3;
  font-size: 13px;
}

.information-item dd {
  overflow-wrap: anywhere;
  color: #303846;
  font-size: 14px;
}

@media (max-width: 760px) {
  .detail-container {
    width: calc(100% - 28px);
  }

  .summary-card {
    padding: 22px;
  }

  .summary-topline {
    flex-direction: column;
  }

  .information-grid {
    grid-template-columns: 1fr;
    padding: 4px 20px 18px;
  }

  .information-item,
  .information-item.full-width {
    grid-column: auto;
    grid-template-columns: 120px minmax(0, 1fr);
  }
}
</style>
