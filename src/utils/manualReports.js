export const MANUAL_REPORTS_STORAGE_KEY = 'qi_manual_reports_v1'

export const loadManualReports = () => {
  try {
    const reports = JSON.parse(localStorage.getItem(MANUAL_REPORTS_STORAGE_KEY) || '[]')
    return Array.isArray(reports) ? reports : []
  } catch {
    return []
  }
}

export const saveManualReport = (report) => {
  const reports = loadManualReports()
  localStorage.setItem(
    MANUAL_REPORTS_STORAGE_KEY,
    JSON.stringify([report, ...reports.filter((item) => item.id !== report.id)]),
  )
}
