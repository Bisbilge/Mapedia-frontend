// TermsPage.jsx
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/wiki.css'

function TermsPage() {
  return (
    <div>
      <Helmet>
        <title>Terms of Service | Mapedia</title>
        <meta name="description" content="Mapedia's terms of service. By using Mapedia you agree to contribute data under CC BY-SA 4.0 and follow community guidelines." />
        <link rel="canonical" href="https://mapedia.org/terms" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />

      <main className="wiki-page">

        <div className="wiki-title-bar">
          <div className="wiki-breadcrumb">
            <Link to="/">Mapedia</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <span>Terms of Service</span>
          </div>
          <h1>Terms of Service</h1>
          <p>Last updated: February 28, 2026</p>
        </div>

        <div className="wiki-portal">

          {/* ── LEFT: Article ── */}
          <div className="wiki-col-main">

            <div className="wiki-box">
              <div className="wiki-section">
                <p>By creating an account or contributing to Mapedia, you agree to these Terms of Service. Please read them carefully.</p>
              </div>

              <div className="wiki-section">
                <h2>1. About Mapedia</h2>
                <p>
                  Mapedia is an open data platform for places and cultural venues, operated by{' '}
                  <strong>Bilge Kaan Yazıcı</strong> (Istanbul, Türkiye). The platform allows users
                  to add, edit, and explore place information collaboratively.
                </p>
              </div>

              <div className="wiki-section">
                <h2>2. Eligibility</h2>
                <p>You must be at least 16 years old to use Mapedia. By creating an account, you confirm that you meet this requirement.</p>
              </div>

              <div className="wiki-section">
                <h2>3. Your Account</h2>
                <ul>
                  <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                  <li>You must provide a valid email address and verify it to activate your account.</li>
                  <li>You may not create accounts for others without their consent.</li>
                  <li>You may delete your account at any time through the platform.</li>
                </ul>
              </div>

              <div className="wiki-section">
                <h2>4. Content and Contributions</h2>
                <p>
                  All content you submit to Mapedia is published under the{' '}
                  <strong>Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</strong> license.
                  This means your contributions are freely available to anyone to use, share, and adapt,
                  provided attribution is given and derivative works are shared under the same license.
                </p>
                <p>
                  By submitting content, you confirm that you have the right to contribute it and that it
                  does not infringe any third-party rights. When you delete your account, your personal data
                  is removed. However, your contributions may be retained in anonymized form to preserve
                  the integrity of the public dataset.
                </p>
              </div>

              <div className="wiki-section">
                <h2>5. Acceptable Use</h2>
                <p>You agree not to:</p>
                <ul>
                  <li>Submit false, misleading, or fabricated place information</li>
                  <li>Upload content that is illegal, harmful, defamatory, or infringes intellectual property rights</li>
                  <li>Attempt to gain unauthorized access to the platform or other users' accounts</li>
                  <li>Use automated tools to scrape or abuse the platform in ways that degrade service for others</li>
                  <li>Harass, impersonate, or harm other users or contributors</li>
                </ul>
                <p>Mapedia reserves the right to remove content or suspend accounts that violate these terms.</p>
              </div>

              <div className="wiki-section">
                <h2>6. Content Moderation</h2>
                <p>
                  Mapedia operates a community moderation system. Category owners and moderators review
                  contributions before they are published. Mapedia reserves the right to reject or remove
                  any content, with or without notice.
                </p>
              </div>

              <div className="wiki-section">
                <h2>7. Open Data</h2>
                <p>
                  The place data published on Mapedia is made available as open data under CC BY-SA 4.0.
                  You are free to use, share, and build upon this data provided you give appropriate credit
                  and distribute derivative works under the same license.
                </p>
              </div>

              <div className="wiki-section">
                <h2>8. Data Accuracy</h2>
                <p>
                  Mapedia does not guarantee the accuracy or completeness of place information contributed
                  by users. All data is community-contributed and may contain errors or outdated information.
                  Use of this data is at your own discretion.
                </p>
              </div>

              <div className="wiki-section">
                <h2>9. Service Availability</h2>
                <p>
                  Mapedia is provided "as-is" by an independent developer. While we aim to keep the
                  platform available and reliable, we do not guarantee uninterrupted access or preservation
                  of data. We are not liable for any loss or damage arising from use of the platform.
                </p>
              </div>

              <div className="wiki-section">
                <h2>10. Privacy</h2>
                <p>
                  Your use of Mapedia is also governed by our{' '}
                  <Link to="/privacy">Privacy Policy</Link>, which is incorporated into these Terms by reference.
                </p>
              </div>

              <div className="wiki-section">
                <h2>11. Governing Law</h2>
                <p>
                  These Terms are governed by the laws of the Republic of Türkiye. Any disputes arising
                  from these Terms shall be subject to the jurisdiction of Turkish courts.
                </p>
              </div>

              <div className="wiki-section">
                <h2>12. Changes to These Terms</h2>
                <p>
                  If significant changes are made to these Terms, registered users will be notified by email.
                  Continued use of the platform after changes constitutes acceptance of the updated Terms.
                </p>
              </div>

              <div className="wiki-section">
                <h2>13. Contact</h2>
                <p>Bilge Kaan Yazıcı — <a href="mailto:info@mapedia.org">info@mapedia.org</a></p>
              </div>
            </div>

          </div>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="wiki-col-side">

            <div className="wiki-infobox">
              <div className="wiki-infobox-title">Document Info</div>
              <table>
                <tbody>
                  <tr><td>Last updated</td><td>February 28, 2026</td></tr>
                  <tr><td>Operator</td><td>Bilge Kaan Yazıcı</td></tr>
                  <tr><td>Jurisdiction</td><td>Türkiye</td></tr>
                  <tr><td>Min. age</td><td>16 years</td></tr>
                  <tr><td>Data license</td><td>CC BY-SA 4.0</td></tr>
                </tbody>
              </table>
            </div>

            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>Related</h2>
              </div>
              <div className="wiki-box-body">
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li><Link to="/privacy">Privacy Policy</Link></li>
                  <li><Link to="/guidelines">Community Guidelines</Link></li>
                  <li><Link to="/license">Open Data License</Link></li>
                </ul>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  )
}

export default TermsPage
