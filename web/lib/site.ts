export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export const LOGO_PATH = '/images/logo2.png'

export const LOGO_SRC = process.env.NEXT_PUBLIC_LOGO_URL || LOGO_PATH

export const LOGO_ALT = 'SongAI - AI Music Generator Logo'

export const SITE_TITLE = 'SongAI - AI Music Generator for TikTok & Reels'

export const SITE_DESCRIPTION =
  'SongAI is a free AI music generator and AI song generator. Create original tracks for TikTok, Instagram Reels, and short videos in minutes.'
