const KEY = 'songai_songs'

export type StoredSong = {
  id: number
  name: string
  prompt: string
  audioUrl: string
  createdAt: string
}

function readAll(): StoredSong[] {
  if (typeof window === 'undefined') return []
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function listSongs(page: number, limit: number) {
  const all = readAll()
  const total = all.length
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1)
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * limit
  return {
    items: all.slice(start, start + limit),
    total,
    page: safePage,
    limit,
    totalPages,
  }
}

export function addSong(song: StoredSong) {
  const all = readAll()
  all.unshift(song)
  localStorage.setItem(KEY, JSON.stringify(all))
}
