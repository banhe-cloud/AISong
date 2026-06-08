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

export async function pollTaskStatus(taskId: string) {
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 3000))
    const res = await fetch(apiUrl(`/task/${taskId}`))
    if (!res.ok) throw new Error(await parseApiError(res))
    const data = await res.json()
    if (data.status === 'completed') return data
    if (data.status === 'failed') throw new Error(data.error || 'Task failed')
  }
  throw new Error('Task timeout')
}
