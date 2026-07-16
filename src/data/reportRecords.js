import dayjs from 'dayjs'

export const monthlyReportConfig = [
  { month: 6, createdAt: '2026-07-03T01:04:00', policy: 16, industry: 6, competitor: 36 },
  { month: 5, createdAt: '2026-06-03T01:04:00', policy: 6, industry: 6, competitor: 10 },
  { month: 4, createdAt: '2026-05-03T01:08:00', policy: 3, industry: 2, competitor: 11 },
  { month: 3, createdAt: '2026-04-03T01:09:00', policy: 6, industry: 3, competitor: 12 },
  { month: 2, createdAt: '2026-03-03T01:04:00', policy: 5, industry: 9, competitor: 2 },
  { month: 1, createdAt: '2026-02-03T01:10:00', policy: 5, industry: 4, competitor: 3 },
]

const createMonthlyReport = ({ month, createdAt, policy, industry, competitor }) => {
  const monthText = String(month).padStart(2, '0')
  const date = dayjs(`2026-${monthText}-01`)
  const periodStart = date.startOf('month').format('YYYY-MM-DD')
  const periodEnd = date.endOf('month').format('YYYY-MM-DD')

  return {
    id: `monthly_2026_${monthText}`,
    title: `大汉软件股份有限公司2026年${month}月情报监测报告`,
    type: 'monthly',
    reportLabel: `2026年${month}月`,
    period_date: `2026年${month}月（${periodStart.replaceAll('-', '.')}—${periodEnd.replaceAll('-', '.')}）`,
    periodStart,
    periodEnd,
    created_at: createdAt,
    status: 'normal',
    generate_type: 'scheduled',
    policyCount: policy,
    industryCount: industry,
    competitorCount: competitor,
    creator: '杨蕾',
    favorited: false,
  }
}

export const presetReports = [
  {
    id: 'halfyear_2026_h1',
    title: '大汉软件股份有限公司2026年上半年情报监测报告',
    type: 'halfYear',
    reportLabel: '2026年上半年',
    period_date: '2026年上半年（2026.01.01—2026.06.30）',
    periodStart: '2026-01-01',
    periodEnd: '2026-06-30',
    created_at: '2026-07-03T01:04:00',
    status: 'normal',
    generate_type: 'scheduled',
    policyCount: 41,
    industryCount: 30,
    competitorCount: 74,
    creator: '杨蕾',
    favorited: false,
  },
  ...monthlyReportConfig.map(createMonthlyReport),
]

export const resolveReportPeriod = (report) => {
  if (report?.periodStart && report?.periodEnd) {
    return { start: report.periodStart, end: report.periodEnd }
  }

  const monthlyMatch = String(report?.id || '').match(/^monthly_(\d{4})_(\d{2})$/)
  if (monthlyMatch) {
    const month = dayjs(`${monthlyMatch[1]}-${monthlyMatch[2]}-01`)
    return {
      start: month.startOf('month').format('YYYY-MM-DD'),
      end: month.endOf('month').format('YYYY-MM-DD'),
    }
  }

  const halfYearMatch = String(report?.id || '').match(/^halfyear_(\d{4})_h([12])$/i)
  if (halfYearMatch) {
    const firstHalf = halfYearMatch[2] === '1'
    return {
      start: `${halfYearMatch[1]}-${firstHalf ? '01-01' : '07-01'}`,
      end: `${halfYearMatch[1]}-${firstHalf ? '06-30' : '12-31'}`,
    }
  }

  const selectedDates = (report?.selectedItems || [])
    .map(item => item.publishDate)
    .filter(Boolean)
    .sort()

  return {
    start: selectedDates[0] || '',
    end: selectedDates.at(-1) || '',
  }
}

export const getReportDataListTitle = (report) => {
  const label = report?.reportLabel || String(report?.period_date || '').split('（')[0]
  const suffix = report?.type === 'halfYear' ? '报数据列表'
    : report?.type === 'annual' ? '年报数据列表'
      : '月报数据列表'
  return `${label || '报告'}${suffix}`
}
