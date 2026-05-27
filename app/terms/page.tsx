import LegalLayout from '@/components/LegalLayout'

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <p>Last updated: May 26, 2026</p>
      <p>By using SongAI, you agree to these Terms of Service.</p>
      <h2>Service</h2>
      <p>
        SongAI provides AI-assisted music generation tools. We may change, suspend, or discontinue features
        at any time.
      </p>
      <h2>Eligibility</h2>
      <p>You must be at least 13 years old to use SongAI. If you are under 18, you should use the service with
        parental consent where required by law.</p>
      <h2>Free Tier &amp; Future Paid Plans</h2>
      <ul>
        <li>Free users receive a limited number of generations per day per IP address.</li>
        <li>Limits may change without notice.</li>
        <li>
          If paid plans are introduced, additional terms (billing, refunds, cancellation) will apply at
          checkout. Minors may not make purchases without lawful parental authorization where required.
        </li>
      </ul>
      <h2>Ownership &amp; License</h2>
      <ul>
        <li>
          <strong>Your content:</strong> Subject to these terms and third-party AI provider rules, you receive
          a non-exclusive license to use tracks you generate through SongAI for personal and commercial
          purposes, including social platforms (e.g. TikTok, Reels, YouTube), unless prohibited by law or
          platform policy.
        </li>
        <li>
          <strong>Our service:</strong> SongAI software, branding, and website remain our property. You may
          not copy, reverse engineer, or resell the service itself.
        </li>
      </ul>
      <h2>Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use SongAI for illegal, harmful, or infringing purposes</li>
        <li>Generate content that violates others&apos; copyrights, trademarks, or privacy</li>
        <li>Abuse rate limits, automate excessive requests, or attempt to disrupt the service</li>
        <li>Misrepresent AI-generated music as human-performed when disclosure is required</li>
      </ul>
      <h2>Disclaimer</h2>
      <p>
        The service is provided &quot;as is&quot; without warranties. We do not guarantee uninterrupted
        availability, specific audio quality, or that outputs will meet every platform&apos;s policies. You
        are responsible for how you publish and monetize generated tracks.
      </p>
      <h2>Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, SongAI is not liable for indirect, incidental, or consequential
        damages arising from your use of the service.
      </p>
      <h2>Contact</h2>
      <p>
        <a href="mailto:songai.app@gmail.com">songai.app@gmail.com</a>
      </p>
    </LegalLayout>
  )
}
