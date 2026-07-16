import workbookSheets from './industryWorkbook.json'

const SOURCE_NAMES = {
  'ndrc.gov.cn': '国家发展改革委',
  'echinagov.com': '国脉电子政务网',
  'miit.gov.cn': '工业和信息化部',
  'cj.sina.cn': '新浪财经',
  'm.sohu.com': '搜狐网',
  'samr.gov.cn': '国家市场监督管理总局',
  'm.chinairn.com': '中研网',
  'guancha.gmw.cn': '光明网',
  'iim.net.cn': '中经视野',
  'caifuhao.eastmoney.com': '东方财富网',
  'm.moji.com': '墨迹资讯',
  'ce.cn': '中国经济网',
  'it.caigou2003.com': '政府采购信息网',
  'blog.csdn.net': 'CSDN',
  'bokee.net': '博客网',
  'docin.com': '豆丁网',
  'wap.seccw.com': '中商情报网',
  'k.sina.com.cn': '新浪网',
  'caict.ac.cn': '中国信息通信研究院',
  'idc.com': 'IDC',
  'finance.sina.com.cn': '新浪财经',
  'inspur.com': '浪潮集团',
  'sohu.com': '搜狐网',
  'blog.51cto.com': '51CTO'
}

const pad = (value) => String(value).padStart(2, '0')

const normalizeDate = (value) => {
  if (typeof value === 'number') {
    const date = new Date(Date.UTC(1899, 11, 30) + value * 24 * 60 * 60 * 1000)
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
  }

  const text = String(value || '').trim()
  if (!text) return ''

  const directMatch = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (directMatch) return `${directMatch[1]}-${pad(directMatch[2])}-${pad(directMatch[3])}`

  const shortMatch = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})$/)
  if (shortMatch) return `20${shortMatch[3]}-${pad(shortMatch[1])}-${pad(shortMatch[2])}`

  return text
}

const splitBusinessFields = (value) => [...new Set(
  String(value || '')
    .split(/[,，、/]/)
    .map((field) => field.trim())
    .filter(Boolean)
)]

const resolveSource = (url) => {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    return SOURCE_NAMES[hostname] || hostname
  } catch {
    return '来源网站'
  }
}

export const industryRecords = workbookSheets
  .flatMap((sheet, sheetIndex) => sheet.values.slice(1).map((row, rowIndex) => {
    const sourceUrl = String(row?.[2] || '').trim()

    return {
      id: `industry-${sheetIndex + 1}-${rowIndex + 1}`,
      title: String(row?.[0] || '').trim(),
      publishDate: normalizeDate(row?.[1]),
      sourceUrl,
      content: String(row?.[3] || '').trim(),
      businessFields: splitBusinessFields(row?.[4]),
      analysis: String(row?.[5] || '').trim(),
      source: resolveSource(sourceUrl)
    }
  }))
  .filter((item) => item.title)
  .sort((left, right) => right.publishDate.localeCompare(left.publishDate))

export const industryBusinessFields = [...new Set(
  industryRecords.flatMap((item) => item.businessFields)
)].sort((left, right) => left.localeCompare(right, 'zh-CN'))
