// OpenDataLicensePage.jsx
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/wiki.css'

function OpenDataLicensePage() {
  return (
    <div>
      <Helmet>
        <title>Open Data License | Mapedia</title>
        <meta name="description" content="All Mapedia venue data is published under Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0). Free to use, share, and build upon." />
        <link rel="canonical" href="https://mapedia.org/license" />
        <meta property="og:title" content="Open Data License | Mapedia" />
        <meta property="og:description" content="All Mapedia venue data is published under CC BY-SA 4.0 — free to use, share, and build upon forever." />
        <meta property="og:url" content="https://mapedia.org/license" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Navbar />

      <main className="wiki-page">

        <div className="wiki-title-bar">
          <h1>Open Data License</h1>
          <p>All place data on Mapedia is released under CC BY-SA 4.0</p>
        </div>

        <div className="wiki-portal">

          {/* ── LEFT: Article ── */}
          <div className="wiki-col-main">

            <div className="wiki-box">
              <div className="wiki-section">
                <h2>The License</h2>
                <p>
                  All place data contributed to and published by Mapedia is released under the{' '}
                  <strong>Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</strong>{' '}
                  license.
                </p>
              </div>

              <div className="wiki-section">
                <h2>What You Can Do</h2>
                <ul>
                  <li><strong>Use</strong> — download, access, and use Mapedia data for any purpose, including commercial use</li>
                  <li><strong>Share</strong> — copy and redistribute the data in any format or medium</li>
                  <li><strong>Adapt</strong> — transform, build upon, and integrate the data into your own projects</li>
                </ul>
                <p style={{ marginTop: 12 }}>Under the following conditions:</p>
                <ul>
                  <li><strong>Attribution</strong> — give appropriate credit to Mapedia and its contributors</li>
                  <li><strong>ShareAlike</strong> — if you build upon or redistribute this data, you must use the same CC BY-SA 4.0 license</li>
                </ul>
              </div>

              <div className="wiki-section">
                <h2>Why CC BY-SA 4.0</h2>
                <p>
                  This license was chosen deliberately. The ShareAlike condition means that Mapedia data
                  cannot be taken, modified, and made proprietary. Any derivative work must remain open
                  under the same terms. This protects the data commons that contributors are building together.
                </p>
                <p>
                  It is the same license used by Wikipedia and OpenStreetMap — projects that have demonstrated
                  that open, community-maintained data can be more accurate, more comprehensive, and more
                  durable than proprietary alternatives.
                </p>
              </div>

              <div className="wiki-section">
                <h2>How to Attribute</h2>
                <p>When using Mapedia data, attribution should include:</p>
                <ul>
                  <li>The name <strong>Mapedia</strong> with a link to <strong>mapedia.org</strong></li>
                  <li>A reference to the CC BY-SA 4.0 license</li>
                </ul>
                <div className="wiki-blockquote" style={{ marginTop: 12 }}>
                  Data from <a href="https://mapedia.org">Mapedia</a>, licensed under{' '}
                  <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">
                    CC BY-SA 4.0
                  </a>.
                </div>
              </div>

              <div className="wiki-section">
                <h2>Scope & Accessing the Data</h2>
                <p>
                  This license applies to the place data contributed by users. It does not apply to
                  Mapedia's source code, interface design, or branding. User account information is
                  governed by the <Link to="/privacy">Privacy Policy</Link>.
                </p>
                <p>
                  Mapedia data is accessible via the public API. All approved venue data can be retrieved
                  without authentication. For bulk data access or integration questions,
                  contact <a href="mailto:info@mapedia.org">info@mapedia.org</a>.
                </p>
              </div>
            </div>

          </div>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="wiki-col-side">

            {/* CC Badge */}
            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>License Summary</h2>
              </div>
              <div className="wiki-box-body" style={{ textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', padding: '16px 24px', border: '1px solid var(--border)', background: 'var(--nav-bg)', marginBottom: 12 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>CC</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', marginTop: 4, letterSpacing: '0.3px' }}>BY-SA 4.0</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-light)', margin: 0 }}>
                  Creative Commons<br />Attribution-ShareAlike 4.0
                </p>
              </div>
              <div className="wiki-box-footer">
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--link)', textDecoration: 'none', fontSize: 13 }}
                >
                  Full license text →
                </a>
              </div>
            </div>

            {/* Infobox */}
            <div className="wiki-infobox">
              <div className="wiki-infobox-title">License Details</div>
              <table>
                <tbody>
                  <tr><td>License</td><td>CC BY-SA 4.0</td></tr>
                  <tr><td>Commercial use</td><td>✓ Allowed</td></tr>
                  <tr><td>Modification</td><td>✓ Allowed</td></tr>
                  <tr><td>Distribution</td><td>✓ Allowed</td></tr>
                  <tr><td>Attribution</td><td>Required</td></tr>
                  <tr><td>ShareAlike</td><td>Required</td></tr>
                </tbody>
              </table>
            </div>

            {/* Similar projects */}
            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>Similar Projects</h2>
              </div>
              <div className="wiki-box-body">
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li><a href="https://wikipedia.org" target="_blank" rel="noopener noreferrer">Wikipedia</a> — CC BY-SA</li>
                  <li><a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> — ODbL</li>
                  <li><a href="https://wikidata.org" target="_blank" rel="noopener noreferrer">Wikidata</a> — CC0</li>
                </ul>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  )
}

export default OpenDataLicensePage
