// CommunityGuidelinesPage.jsx
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/wiki.css'

function CommunityGuidelinesPage() {
  return (
    <div>
      <Helmet>
        <title>Community Guidelines | Mapedia</title>
        <meta name="description" content="Mapedia's community guidelines for contributors. Learn how to add accurate venue data, moderate responsibly, and keep Mapedia a reliable open resource." />
        <link rel="canonical" href="https://mapedia.org/guidelines" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />

      <main className="wiki-page">

        <div className="wiki-title-bar">
          <div className="wiki-breadcrumb">
            <Link to="/">Mapedia</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <span>Community Guidelines</span>
          </div>
          <h1>Community Guidelines</h1>
          <p>Last updated: February 28, 2026</p>
        </div>

        <div className="wiki-portal">

          {/* ── LEFT: Article ── */}
          <div className="wiki-col-main">

            <div className="wiki-box">
              <div className="wiki-section">
                <p>
                  Mapedia is built on the assumption that people contributing to it are doing so in good faith.
                  These guidelines exist not to restrict participation, but to protect the accuracy and integrity
                  of the data that everyone depends on.
                </p>
              </div>

              <div className="wiki-section">
                <h2>1. Accuracy First</h2>
                <p>
                  Only contribute information you have direct knowledge of or can verify. Do not guess,
                  approximate, or copy from other sources without attribution. Inaccurate data is worse
                  than no data — it misleads people who rely on it.
                </p>
              </div>

              <div className="wiki-section">
                <h2>2. No Fabrication</h2>
                <p>
                  Do not submit false, invented, or deliberately misleading place information. This includes
                  fake venues, incorrect coordinates, and fabricated field values. Accounts found doing this
                  will be suspended.
                </p>
              </div>

              <div className="wiki-section">
                <h2>3. No Spam or Self-Promotion</h2>
                <p>
                  Mapedia is not an advertising platform. Do not use contributions to promote businesses,
                  services, or websites. Do not create duplicate entries for the same place. Do not submit
                  content designed to game rankings or visibility.
                </p>
              </div>

              <div className="wiki-section">
                <h2>4. Respect Privacy</h2>
                <p>
                  Do not submit personal data about individuals — names, contact details, daily routines,
                  or any information that could be used to identify or locate a private person.
                  Access codes, door codes, or security information that could compromise the safety
                  of a private property or its occupants must not be submitted.
                </p>
              </div>

              <div className="wiki-section">
                <h2>5. No Harmful Content</h2>
                <p>
                  Do not submit content that is illegal, threatening, harassing, discriminatory, or
                  promotes hatred toward any group. This includes venue descriptions, field values,
                  and any free-text contributions.
                </p>
              </div>

              <div className="wiki-section">
                <h2>6. Vandalism</h2>
                <p>
                  Do not deliberately damage existing data — this includes overwriting accurate information
                  with false data, blanking fields, or corrupting records. All changes are logged.
                  Vandalism will result in immediate account suspension.
                </p>
              </div>

              <div className="wiki-section">
                <h2>7. Respect the Moderation Process</h2>
                <p>
                  Contributions are reviewed by category moderators before publication. If your contribution
                  is rejected, the moderator may leave a note explaining why. Do not resubmit rejected
                  content without addressing the issue. Do not attempt to pressure or circumvent moderators.
                </p>
              </div>

              <div className="wiki-section">
                <h2>8. Sensitive Information</h2>
                <p>
                  Some categories on Mapedia collect sensitive practical data — accessibility details,
                  entry procedures, infrastructure availability. This data should be submitted and used
                  to help people, not to exploit or harm. Use your judgment. If something feels wrong
                  to share, it probably is.
                </p>
              </div>

              <div className="wiki-section">
                <h2>9. Enforcement</h2>
                <p>
                  Mapedia reserves the right to remove any content and suspend or terminate any account
                  that violates these guidelines, with or without prior notice. Decisions are made by
                  category moderators and the platform operator.
                </p>
                <p>
                  If you believe a moderation decision was made in error, contact us at{' '}
                  <a href="mailto:info@mapedia.org">info@mapedia.org</a>.
                </p>
              </div>

              <div className="wiki-section">
                <h2>10. The Standard</h2>
                <div className="wiki-blockquote">
                  Would I want this in a permanent public record that anyone can read and reuse?
                  If yes, submit it. If not, don't.
                </div>
              </div>

              <div className="wiki-section" style={{ borderBottom: 'none' }}>
                <p style={{ fontSize: 13, color: 'var(--text-light)' }}>
                  These guidelines are part of our <Link to="/terms">Terms of Service</Link>.
                </p>
              </div>
            </div>

          </div>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="wiki-col-side">

            <div className="wiki-box">
              <div className="wiki-box-header wiki-box-header-accent">
                <h2>Core Principles</h2>
              </div>
              <div className="wiki-box-body">
                <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <li>Accuracy over completeness</li>
                  <li>No fabrication or spam</li>
                  <li>Respect privacy</li>
                  <li>No harmful content</li>
                  <li>Respect moderation</li>
                </ol>
              </div>
            </div>

            <div className="wiki-infobox">
              <div className="wiki-infobox-title">Document Info</div>
              <table>
                <tbody>
                  <tr><td>Last updated</td><td>February 28, 2026</td></tr>
                  <tr><td>Enforced by</td><td>Category moderators</td></tr>
                  <tr><td>Appeals</td><td><a href="mailto:info@mapedia.org">Email us</a></td></tr>
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
                  <li><Link to="/privacy">Privacy Policy</Link></li>
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

export default CommunityGuidelinesPage
