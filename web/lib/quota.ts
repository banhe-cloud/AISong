const KEY = 'songai_daily_quota'
export const DAILY_LIMIT = 5

function today() {
  return new Date().toISOString().slice(0, 10)
}

function readUsed() {
  if (typeof window === 'undefined') return 0
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || '{}')
    if (data.date !== today()) return 0
    return Number(data.used) || 0
  } catch {
    return 0
  }
}

export function getDailyRemaining() {
  return Math.max(0, DAILY_LIMIT - readUsed())
}

export function consumeDailyQuota() {
  const used = readUsed()
  if (used >= DAILY_LIMIT) return false
  localStorage.setItem(KEY, JSON.stringify({ date: today(), used: used + 1 }))
  return true
}
