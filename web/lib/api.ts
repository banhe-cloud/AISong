export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4233'

export function apiUrl(path: string) {
  return `${API_BASE}/api${path}`
}

export async function parseApiError(res: Response) {
  const text = await res.text()
  try {
    const json = JSON.parse(text)
    return json.message || text
  } catch {
    return text || res.statusText
  }
}
