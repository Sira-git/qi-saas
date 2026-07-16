export const REPORT_FAVORITES_STORAGE_KEY = 'qi_report_favorites_v1'

export const REPORT_FAVORITE_TYPES = ['monthly', 'halfYear', 'annual']

const isSupportedReport = (report) => (
  report
  && report.id !== undefined
  && REPORT_FAVORITE_TYPES.includes(report.type)
)

export const loadReportFavorites = () => {
  try {
    const favorites = JSON.parse(localStorage.getItem(REPORT_FAVORITES_STORAGE_KEY) || '[]')
    return Array.isArray(favorites) ? favorites.filter(isSupportedReport) : []
  } catch {
    return []
  }
}

export const isReportFavorited = (reportId) => (
  loadReportFavorites().some((report) => String(report.id) === String(reportId))
)

export const saveReportFavorite = (report) => {
  if (!isSupportedReport(report)) return false

  const favorites = loadReportFavorites()
  const existing = favorites.find((item) => String(item.id) === String(report.id))
  const favorite = {
    ...report,
    favorite_time: existing?.favorite_time || new Date().toISOString(),
    favorited: true,
  }

  localStorage.setItem(
    REPORT_FAVORITES_STORAGE_KEY,
    JSON.stringify([favorite, ...favorites.filter((item) => String(item.id) !== String(report.id))]),
  )
  return true
}

export const removeReportFavorite = (reportId) => {
  const favorites = loadReportFavorites()
  localStorage.setItem(
    REPORT_FAVORITES_STORAGE_KEY,
    JSON.stringify(favorites.filter((report) => String(report.id) !== String(reportId))),
  )
}
