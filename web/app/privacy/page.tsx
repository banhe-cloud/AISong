import LegalLayout from '@/components/LegalLayout'
import { pageMetadata } from '@/lib/metadata'

export const metadata = pageMetadata({
  title: 'Privacy Policy | SongAI',
  description: 'SongAI privacy policy: what data we collect, how we use it, and your rights.',
  path: '/privacy',
})

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>Last updated: May 26, 2026</p>
      <p>
        SongAI (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains what information we
        collect, how we use it, and your rights.
      </p>
      <h2>Information We Collect</h2>
      <ul>
        <li>
          <strong>Usage data:</strong> IP address, browser type, pages visited, generation requests, and
          timestamps (used for daily limits and service operation).
        </li>
        <li>
          <strong>Generated content metadata:</strong> prompts you submit, song titles, and links to generated
          audio (stored to show your history).
        </li>
        <li>
          <strong>Optional contact:</strong> if you email us, we receive your email address and message content.
        </li>
      </ul>
      <p>We do not require account registration at this time and do not knowingly collect payment card data.</p>
      <h2>How We Use Information</h2>
      <ul>
        <li>Provide and improve the music generation service</li>
        <li>Enforce free-tier limits and prevent abuse</li>
        <li>Respond to support, legal, and DMCA requests</li>
        <li>Comply with applicable law</li>
      </ul>
      <h2>Third-Party Services</h2>
      <p>
        Audio and AI processing may be handled by third-party API providers. Those providers process data
        according to their own policies. Generated files may be hosted on third-party CDNs.
      </p>
      <h2>Data Retention</h2>
      <p>
        Usage and song history may be stored locally on our servers for as long as needed to operate the
        service. You may request deletion of data associated with your IP by contacting us.
      </p>
      <h2>Your Rights (CCPA / GDPR)</h2>
      <p>
        Depending on your location, you may have the right to access, correct, delete, or restrict processing
        of your personal data, and to opt out of certain sharing. To exercise these rights, contact{' '}
        <a href="mailto:songai.app@gmail.com">songai.app@gmail.com</a>.
      </p>
      <h2>Children</h2>
      <p>
        SongAI is not directed to children under 13. We do not knowingly collect personal information from
        children under 13.
      </p>
      <h2>Contact</h2>
      <p>
        Questions: <a href="mailto:songai.app@gmail.com">songai.app@gmail.com</a>
      </p>
    </LegalLayout>
  )
}
