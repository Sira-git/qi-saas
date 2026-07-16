import { relatedPolicyRecords } from './relatedPolicies.js'
import { cloudPolicyRecords } from './cloudPolicyRecords.js'
import { industryRecords } from './industryRecords.js'
import { competitorRecords } from './competitorRecords.js'
import { resolveReportPeriod } from './reportRecords.js'

export const reportBusinessFields = ['一网通办', '一网协同', '人工智能', '市场监管', '数据要素', '门户网站']

const enterpriseFocusRegions = [
  '北京市', '浙江省', '江西省', '山东省', '江苏省', '上海市', '陕西省', '甘肃省',
  '四川省', '广西壮族自治区', '河南省', '天津市', '河北省', '吉林省', '黑龙江省',
  '南京市', '杭州市', '济南市', '宁波市', '南昌市', '兰州市', '苏州市', '西安市',
  '郑州市', '石家庄市',
]

const normalizeBusinessFields = (fields, fallback) => [...new Set(
  [...(Array.isArray(fields) ? fields : []), fallback]
    .flatMap(field => String(field || '').split(/[,，、/]/))
    .map(field => field.trim())
    .filter(Boolean),
)]

const normalizedPolicies = [...relatedPolicyRecords, ...cloudPolicyRecords].map(item => ({
  id: `policy:${item.id}`,
  originalId: item.id,
  sourceType: 'policy',
  title: item.title,
  source: item.issuer || '政策发布单位',
  publishDate: item.publishDate,
  sortDate: item.publishDate,
  region: item.region || '全国',
  businessFields: normalizeBusinessFields(item.tags, item.businessField),
  autoIncluded: item.dataSource !== 'cloud',
  raw: item,
}))

const normalizedIndustries = industryRecords.map(item => ({
  id: `industry:${item.id}`,
  originalId: item.id,
  sourceType: 'industry',
  title: item.title,
  source: item.source || '行业信息来源',
  publishDate: item.publishDate,
  sortDate: item.publishDate,
  region: '全国',
  businessFields: normalizeBusinessFields(item.businessFields),
  raw: item,
}))

const normalizedCompetitors = competitorRecords.map(item => ({
  id: `competitor:${item.id}`,
  originalId: item.id,
  sourceType: 'competitor',
  title: item.title,
  source: item.channel || item.competitorName || '友商动态来源',
  competitorName: item.competitorName,
  publishDate: item.publishDate,
  sortDate: item.sortDate || item.publishDate,
  region: '全国',
  businessFields: normalizeBusinessFields([item.businessField]),
  raw: item,
}))

const allItems = [...normalizedPolicies, ...normalizedIndustries, ...normalizedCompetitors]
const itemIndex = new Map(allItems.map(item => [item.id, item]))

const resolveSelectedItem = (item) => itemIndex.get(`${item.sourceType}:${item.id}`) || {
  id: `${item.sourceType}:${item.id}`,
  originalId: item.id,
  sourceType: item.sourceType,
  title: item.title,
  source: item.source || '数据来源',
  publishDate: item.publishDate || '',
  sortDate: item.publishDate || '',
  region: item.region || '全国',
  competitorName: item.competitorName || '',
  businessFields: normalizeBusinessFields(item.businessFields),
  raw: item,
}

const getCountKey = sourceType => ({
  policy: 'policyCount',
  industry: 'industryCount',
  competitor: 'competitorCount',
}[sourceType])

export const getReportPeriodItems = (report) => {
  if (!report) return []

  if (Array.isArray(report.selectedItems) && report.selectedItems.length) {
    return report.selectedItems
      .map(resolveSelectedItem)
      .sort((left, right) => String(right.sortDate).localeCompare(String(left.sortDate)))
  }

  const { start, end } = resolveReportPeriod(report)
  const periodItems = allItems
    .filter(item => !start || !end || (item.sortDate >= start && item.sortDate <= end))
    .filter(item => item.sourceType !== 'policy' || (
      item.autoIncluded && (item.region === '全国' || enterpriseFocusRegions.includes(item.region))
    ))
    .sort((left, right) => String(right.sortDate).localeCompare(String(left.sortDate)))

  return ['policy', 'industry', 'competitor'].flatMap(sourceType => {
    const items = periodItems.filter(item => item.sourceType === sourceType)
    const expectedCount = Number(report[getCountKey(sourceType)])
    return Number.isFinite(expectedCount) && expectedCount >= 0
      ? items.slice(0, expectedCount)
      : items
  })
}
