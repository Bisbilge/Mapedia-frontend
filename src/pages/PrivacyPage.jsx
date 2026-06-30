// PrivacyPage.jsx
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/wiki.css'

function PrivacyPage() {
  return (
    <div>
      <Helmet>
        <title>Privacy Policy | Mapedia</title>
        <meta name="description" content="Mapedia's privacy policy — GDPR-compliant. We collect minimal data, never sell it, and host entirely within the EU. Read how we handle your personal information." />
        <link rel="canonical" href="https://mapedia.org/privacy" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />

      <main className="wiki-page">

        <div className="wiki-title-bar">
          <div className="wiki-breadcrumb">
            <Link to="/">Mapedia</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <span>Privacy Policy</span>
          </div>
          <h1>Privacy Policy</h1>
          <p>Last updated: February 28, 2026</p>
        </div>

        <div className="wiki-portal">

          {/* ── LEFT: Article ── */}
          <div className="wiki-col-main">

            <div className="wiki-box">
              <div className="wiki-section">
                <p>
                  Mapedia is a community-driven, open data platform for places and cultural venues.
                  This Privacy Policy explains what personal data we collect, why we collect it,
                  and how it is protected and used.
                </p>
              </div>

              <div className="wiki-section">
                <h2>1. Data Controller</h2>
                <p>
                  <strong>Bilge Kaan Yazıcı</strong><br />
                  Istanbul, Türkiye<br />
                  Contact: <a href="mailto:info@mapedia.org">info@mapedia.org</a>
                </p>
                <p>Mapedia is operated by an independent individual (no registered company at this time).</p>
              </div>

              <div className="wiki-section">
                <h2>2. Hosting and Data Location</h2>
                <p>
                  Mapedia infrastructure is hosted by <strong>Hetzner Online GmbH (Germany)</strong>,
                  within the European Union. All personal data is processed within the European
                  Economic Area (EEA) and subject to GDPR safeguards.
                </p>
              </div>

              <div className="wiki-section">
                <h2>3. Data We Collect</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 16 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 'normal', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-light)' }}>Data</th>
                      <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 'normal', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-light)' }}>Purpose</th>
                      <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 'normal', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-light)' }}>Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px' }}>Email address</td>
                      <td style={{ padding: '8px 12px' }}>Account verification and notifications</td>
                      <td style={{ padding: '8px 12px' }}>Performance of contract — GDPR Art. 6(1)(b)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px' }}>IP address</td>
                      <td style={{ padding: '8px 12px' }}>Security and abuse prevention</td>
                      <td style={{ padding: '8px 12px' }}>Legitimate interest — GDPR Art. 6(1)(f)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px' }}>Username, bio, avatar</td>
                      <td style={{ padding: '8px 12px' }}>Profile and contribution attribution</td>
                      <td style={{ padding: '8px 12px' }}>Consent — GDPR Art. 6(1)(a)</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px' }}>Contribution content</td>
                      <td style={{ padding: '8px 12px' }}>Creating and maintaining open map data</td>
                      <td style={{ padding: '8px 12px' }}>Consent — GDPR Art. 6(1)(a)</td>
                    </tr>
                  </tbody>
                </table>
                <p>Mapedia does not collect precise location data, phone numbers, identity documents, or payment information.</p>
              </div>

              <div className="wiki-section">
                <h2>4. Open Data and Public Contributions</h2>
                <p>
                  Mapedia is an open knowledge platform. Content you submit (such as place information,
                  descriptions, and edits) may be publicly visible and shared under the{' '}
                  <strong>Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</strong> license.
                </p>
                <p>
                  When you delete your account, your personal data (email, profile data) is permanently deleted.
                  Your contributions may be retained in anonymized form to preserve the integrity of the public dataset.
                </p>
              </div>

              <div className="wiki-section">
                <h2>5. Third-Party Services</h2>
                <p><strong>Resend</strong> — email delivery (verification and notifications). Only your email address is processed.</p>
                <p><strong>Sentry</strong> — technical error monitoring. Limited diagnostic data may be processed solely for debugging and is not used to identify users.</p>
                <p>No third-party service is used for advertising, profiling, or tracking. Your data is never sold or shared for marketing purposes.</p>
              </div>

              <div className="wiki-section">
                <h2>6. Data Security</h2>
                <ul>
                  <li>All connections are encrypted via HTTPS (SSL/TLS)</li>
                  <li>Authentication and cache data are stored in a local Redis instance on the server and never leave the server</li>
                  <li>Automated protections against brute-force and unauthorized access</li>
                  <li>Automated database backups taken nightly and stored on the server and a secure secondary location within the European Union</li>
                </ul>
              </div>

              <div className="wiki-section">
                <h2>7. Browser Storage</h2>
                <p>
                  Mapedia does not use advertising or tracking cookies. Authentication tokens are stored
                  in your browser's local storage solely for maintaining your logged-in session.
                  Clearing your browser data or logging out removes this information.
                </p>
              </div>

              <div className="wiki-section">
                <h2>8. Data Retention</h2>
                <p>
                  Personal data is retained only while your account is active. When you delete your account,
                  personal identifiers are permanently deleted, avatars and uploaded media are physically removed
                  from storage, and session data is destroyed automatically. Security logs may be retained
                  for a limited period for abuse prevention.
                </p>
              </div>

              <div className="wiki-section">
                <h2>9. Your Rights</h2>
                <p>
                  Under the GDPR, you have the right to access, correct, delete, restrict, or port your
                  personal data, and to object to processing based on legitimate interest. You may exercise
                  these rights by emailing <a href="mailto:info@mapedia.org">info@mapedia.org</a> or deleting
                  your account through the platform. Requests are handled within 30 days.
                </p>
              </div>

              <div className="wiki-section">
                <h2>10. Eligibility</h2>
                <p>Mapedia is intended for users who are at least 16 years old. By creating an account, you confirm that you meet this requirement.</p>
              </div>

              <div className="wiki-section">
                <h2>11. Right to Lodge a Complaint</h2>
                <p>You have the right to lodge a complaint with your local data protection authority in your country of residence.</p>
              </div>

              <div className="wiki-section">
                <h2>12. Policy Updates</h2>
                <p>If significant changes are made to this policy, registered users will be notified by email. The latest version will always be available on this page.</p>
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
                  <tr><td>Jurisdiction</td><td>EU / GDPR</td></tr>
                  <tr><td>Hosting</td><td>Hetzner, Germany</td></tr>
                  <tr><td>Data sold</td><td>Never</td></tr>
                  <tr><td>Cookies</td><td>None (auth tokens only)</td></tr>
                  <tr><td>Contact</td><td><a href="mailto:info@mapedia.org">info@mapedia.org</a></td></tr>
                </tbody>
              </table>
            </div>

            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>Related</h2>
              </div>
              <div className="wiki-box-body">
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li><Link to="/terms">Terms of Service</Link></li>
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

export default PrivacyPage
