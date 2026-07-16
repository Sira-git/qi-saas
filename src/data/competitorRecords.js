import workbookSheets from './competitorWorkbook.json'

export const configuredBusinessFields = [
  '一网通办',
  '一网协同',
  '人工智能',
  '市场监管',
  '数据要素',
  '门户网站',
  '其他'
]

export const competitorReportedTotal = 257

const BUSINESS_FIELD_ALIASES = {
  协同办公: '一网协同'
}

const BUSINESS_FIELD_KEYWORDS = [
  ['一网通办', ['一网通办', '政务服务', '办事', '审批', '便民服务']],
  ['一网协同', ['一网协同', '协同办公', 'OA', '办公平台', '公文', '会议']],
  ['人工智能', ['人工智能', 'AI', '大模型', '智能体', '机器人']],
  ['市场监管', ['市场监管', '智慧监管', '监管平台', '信用监管']],
  ['数据要素', ['数据要素', '数据治理', '公共数据', '数据运营', '数据空间']],
  ['门户网站', ['门户网站', '网站群', '政府网站', '智能门户']]
]

const pad = (value) => String(value).padStart(2, '0')

const normalizeDate = (value) => {
  if (typeof value === 'number') {
    const date = new Date(Date.UTC(1899, 11, 30) + value * 24 * 60 * 60 * 1000)
    const iso = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
    return { display: iso, sortKey: iso }
  }

  const text = String(value || '').trim()
  if (!text) return { display: '日期未知', sortKey: '0000-00-00' }

  const fullMatch = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (fullMatch) {
    const iso = `${fullMatch[1]}-${pad(fullMatch[2])}-${pad(fullMatch[3])}`
    return { display: iso, sortKey: iso }
  }

  const monthMatch = text.match(/^(\d{4})[-/.](\d{1,2})$/)
  if (monthMatch) {
    const display = `${monthMatch[1]}-${pad(monthMatch[2])}`
    return { display, sortKey: `${display}-01` }
  }

  const shortMatch = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})$/)
  if (shortMatch) {
    const iso = `20${shortMatch[3]}-${pad(shortMatch[1])}-${pad(shortMatch[2])}`
    return { display: iso, sortKey: iso }
  }

  return { display: text, sortKey: text }
}

const splitRawFields = (value) => String(value || '')
  .split(/[,，、/]/)
  .map((field) => field.trim())
  .filter(Boolean)

const resolveBusinessField = (rawFields, title, content) => {
  for (const rawField of rawFields) {
    const field = BUSINESS_FIELD_ALIASES[rawField] || rawField
    if (configuredBusinessFields.includes(field) && field !== '其他') return field
  }

  const searchableText = `${title} ${content}`
  const matched = BUSINESS_FIELD_KEYWORDS.find(([, keywords]) => keywords.some((keyword) => searchableText.includes(keyword)))
  return matched?.[0] || '其他'
}

export const competitorRecords = workbookSheets
  .flatMap((sheet, sheetIndex) => sheet.values.slice(1).map((row, rowIndex) => {
    const title = String(row?.[0] || '').trim()
    const date = normalizeDate(row?.[1])
    const content = String(row?.[5] || '').trim()
    const rawBusinessFields = splitRawFields(row?.[6])

    return {
      id: `competitor-${sheetIndex + 1}-${rowIndex + 1}`,
      title,
      publishDate: date.display,
      sortDate: date.sortKey,
      sourceUrl: String(row?.[2] || '').trim(),
      competitorName: String(row?.[3] || '').trim() || '其他友商',
      channel: String(row?.[4] || '').trim(),
      content,
      rawBusinessFields,
      businessField: resolveBusinessField(rawBusinessFields, title, content),
      analysis: String(row?.[7] || '').trim(),
      sourceIndex: rowIndex
    }
  }))
  .filter((item) => item.title)
  .sort((left, right) => right.sortDate.localeCompare(left.sortDate) || left.sourceIndex - right.sourceIndex)

export const competitorNames = [...new Set(
  competitorRecords.map((item) => item.competitorName)
)].sort((left, right) => left.localeCompare(right, 'zh-CN'))
