import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LOGO_PATH, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '@/lib/site'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    'AI music generator',
    'AI song generator',
    'TikTok music',
    'Reels music',
    'royalty free AI music',
    'short video music',
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  icons: { icon: LOGO_PATH, apple: LOGO_PATH },
  openGraph: {
    type: 'website',
    url: '/',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [LOGO_PATH],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [LOGO_PATH],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
