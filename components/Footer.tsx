import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <p className="site-footer-links">
        © 2026 SongAI. All rights reserved. |{' '}
        <Link href="/privacy">Privacy Policy</Link> | <Link href="/terms">Terms of Service</Link> |{' '}
        <Link href="/dmca">DMCA</Link>
      </p>
      <p className="site-footer-age">
        This service is intended for users aged 13+. If you are under 13, please do not use SongAI.
      </p>
    </footer>
  )
}
