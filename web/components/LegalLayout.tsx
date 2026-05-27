import Link from 'next/link'
import type { ReactNode } from 'react'
import Footer from './Footer'

export default function LegalLayout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="legal-page">
      <div className="legal-page-inner">
        <Link href="/" className="legal-back">
          ← Back to SongAI
        </Link>
        <h1>{title}</h1>
        <div className="legal-content">{children}</div>
        <Footer />
      </div>
    </div>
  )
}
