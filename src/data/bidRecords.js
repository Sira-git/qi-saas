import workbookSheets from './bidWorkbook.json'

export const bidReportedTotal = 123

export const bidBusinessFields = [
  '一网通办',
  '一网协同',
  '人工智能',
  '市场监管',
  '数据要素',
  '门户网站',
  '其他'
]

const BUSINESS_FIELD_ALIASES = {
  协同办公: '一网协同',
  大模型: '人工智能',
  智慧市监: '市场监管'
}

const FIELD_KEYS = {
  '*区域-省': 'province',
  '区域-市': 'city',
  '区域-区': 'district',
  '*项目名称': 'title',
  招标预算: 'tenderBudget',
  招标单位: 'tenderer',
  '*标讯业务': 'rawBusinessField',
  '*标讯行业': 'industry',
  招标类型: 'tenderType',
  开始时间: 'startDate',
  报名结束时间: 'registrationEndDate',
  结束时间: 'endDate',
  招标联系人: 'tenderContact',
  招标联系电话: 'tenderPhone',
  代理机构: 'agency',
  代理联系人: 'agencyContact',
  代理联系电话: 'agencyPhone',
  项目编号: 'projectCode',
  '招标文件（1-有 0-无）': 'hasTenderFile',
  中标单位: 'awardedCompany',
  中标金额: 'awardedAmount',
  中标时间: 'awardDate'
}

const MISSING_PLACEHOLDER = '27'
const pad = (value) => String(value).padStart(2, '0')

const cleanValue = (value) => {
  if (value === null || value === undefined) return null
  const text = String(value).trim()
  if (!text || text === MISSING_PLACEHOLDER) return null
  return typeof value === 'string' ? text : value
}

const normalizeDate = (value) => {
  const cleaned = cleanValue(value)
  if (cleaned === null) return null

  if (typeof cleaned === 'number') {
    const date = new Date(Date.UTC(1899, 11, 30) + cleaned * 24 * 60 * 60 * 1000)
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
  }

  const match = String(cleaned).match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  return match ? `${match[1]}-${pad(match[2])}-${pad(match[3])}` : String(cleaned)
}

const normalizeAmount = (value) => {
  const cleaned = cleanValue(value)
  if (cleaned === null) return null
  if (typeof cleaned === 'number') return cleaned

  const amount = Number(String(cleaned).replace(/[¥￥,，\s]/g, ''))
  return Number.isFinite(amount) ? amount : null
}

const resolveBusinessField = (rawBusinessField) => {
  const normalized = BUSINESS_FIELD_ALIASES[rawBusinessField] || rawBusinessField
  return bidBusinessFields.includes(normalized) && normalized !== '其他' ? normalized : '其他'
}

const createRecord = (sheet, row, rowIndex, headers) => {
  const raw = Object.fromEntries(headers.map((header, columnIndex) => [
    FIELD_KEYS[header] || header,
    cleanValue(row[columnIndex])
  ]))
  const recordType = sheet.type
  const deadline = normalizeDate(raw.endDate) || normalizeDate(raw.registrationEndDate)

  return {
    ...raw,
    id: `${recordType}-${rowIndex + 1}`,
    recordType,
    sourceFile: sheet.sourceFile,
    sourceIndex: rowIndex,
    businessField: resolveBusinessField(raw.rawBusinessField),
    regionLabel: [raw.province, raw.city, raw.district].filter(Boolean).join(' · ') || '区域未知',
    tenderBudget: normalizeAmount(raw.tenderBudget),
    awardedAmount: normalizeAmount(raw.awardedAmount),
    startDate: normalizeDate(raw.startDate),
    registrationEndDate: normalizeDate(raw.registrationEndDate),
    endDate: normalizeDate(raw.endDate),
    awardDate: normalizeDate(raw.awardDate),
    deadline
  }
}

const recordsByType = Object.fromEntries(workbookSheets.map((sheet) => {
  const [headers, ...rows] = sheet.values
  const records = rows
    .map((row, rowIndex) => createRecord(sheet, row, rowIndex, headers))
    .filter((record) => record.title)

  return [sheet.type, records]
}))

export const tenderRecords = recordsByType.tender || []
export const awardRecords = recordsByType.award || []

export const bidRegions = [...new Set(
  [...tenderRecords, ...awardRecords].map((record) => record.province).filter(Boolean)
)].sort((left, right) => left.localeCompare(right, 'zh-CN'))

export const awardedCompanies = [...new Set(
  awardRecords.map((record) => record.awardedCompany).filter(Boolean)
)].sort((left, right) => left.localeCompare(right, 'zh-CN'))

export const getBidRecord = (recordType, id) => {
  const records = recordType === 'award' ? awardRecords : tenderRecords
  return records.find((record) => record.id === id)
}

export const formatBidAmount = (amount, fallback = '金额待定') => {
  if (!Number.isFinite(amount)) return fallback

  if (Math.abs(amount) >= 10000) {
    const valueInWan = amount / 10000
    return `¥${valueInWan.toLocaleString('zh-CN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}万`
  }

  return `¥${amount.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`
}

export const formatExactAmount = (amount) => Number.isFinite(amount)
  ? `¥${amount.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`
  : '—'

export const formatTenderFile = (value) => {
  if (value === 1 || value === '1') return '有'
  if (value === 0 || value === '0') return '无'
  return '—'
}
