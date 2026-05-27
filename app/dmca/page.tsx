import LegalLayout from '@/components/LegalLayout'

export default function DmcaPage() {
  return (
    <LegalLayout title="DMCA Policy">
      <p>Last updated: May 26, 2026</p>
      <p>
        SongAI respects intellectual property rights and complies with the Digital Millennium Copyright Act
        (DMCA).
      </p>
      <h2>Copyright Complaints</h2>
      <p>
        If you believe content accessible through SongAI infringes your copyright, send a DMCA notice to
        our designated agent with:
      </p>
      <ul>
        <li>Your physical or electronic signature</li>
        <li>Identification of the copyrighted work claimed to be infringed</li>
        <li>Identification of the material and sufficient information to locate it</li>
        <li>Your contact information (address, phone, email)</li>
        <li>
          A statement that you have a good-faith belief the use is not authorized by the copyright owner
        </li>
        <li>
          A statement, under penalty of perjury, that the information in the notice is accurate and you are
          authorized to act on behalf of the owner
        </li>
      </ul>
      <h2>Designated Agent</h2>
      <p>
        Email: <a href="mailto:songai.app@gmail.com">songai.app@gmail.com</a>
      </p>
      <h2>Counter-Notification</h2>
      <p>
        If you believe your material was removed by mistake, you may submit a counter-notification meeting
        DMCA requirements. We may restore content unless the complainant files suit.
      </p>
      <h2>Repeat Infringers</h2>
      <p>We may terminate access for users who repeatedly infringe copyrights.</p>
    </LegalLayout>
  )
}
