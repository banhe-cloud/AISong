export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002').replace(/\/$/, '')

export const LOGO_PATH = '/images/logo2.png'

export const OG_IMAGE_PATH = '/images/og-image.png'

export const LOGO_SRC = process.env.NEXT_PUBLIC_LOGO_URL || LOGO_PATH

export const LOGO_ALT = 'SongAI - AI Music Generator Logo'

export const SITE_TITLE = 'SongAI - AI Music Generator for TikTok & Reels'

export const SITE_DESCRIPTION =
  'SongAI is a free AI song generator with no sign up — an AI music maker for YouTube, TikTok, and Reels. Create royalty-free tracks in about 2 minutes.'
