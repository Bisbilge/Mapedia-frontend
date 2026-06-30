// AboutPage.jsx
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/wiki.css'

function AboutPage() {
  return (
    <div>
      <Helmet>
        <title>About Mapedia | The Free Encyclopedia of Places</title>
        <meta name="description" content="Learn about Mapedia — a community-maintained, open database of real-world venues. Free data, forever. Licensed under CC BY-SA 4.0." />
        <link rel="canonical" href="https://mapedia.org/about" />
        <meta property="og:title" content="About Mapedia | The Free Encyclopedia of Places" />
        <meta property="og:description" content="Learn about Mapedia — a community-maintained, open database of real-world venues. Free data, forever." />
        <meta property="og:url" content="https://mapedia.org/about" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="About Mapedia" />
        <meta name="twitter:description" content="Community-maintained open database of real-world venues. CC BY-SA 4.0." />
      </Helmet>

      <Navbar />

      <main className="wiki-page">

        <div className="wiki-title-bar">
          <h1>About Mapedia</h1>
          <p>The free, community-maintained encyclopedia of places</p>
        </div>

        <div className="wiki-portal">

          {/* ── LEFT: Article ── */}
          <div className="wiki-col-main">

            <div className="wiki-box">
              <div className="wiki-section">
                <h2>The Problem</h2>
                <p>
                  Most mapping services treat location data as a proprietary asset. Coordinates, place details,
                  and practical information are locked behind commercial interests, shaped by algorithms, and
                  made available only on someone else's terms. The data exists — but it isn't free.
                </p>
                <p>
                  Mapedia was built in response to this. Not to compete with existing maps, but to occupy
                  a different space entirely: the granular, practical knowledge about places that commercial
                  platforms have no incentive to collect or share.
                </p>
              </div>

              <div className="wiki-section">
                <h2>What Mapedia Documents</h2>
                <p>
                  A coordinate tells you where a place is. Mapedia tries to answer what it's actually like
                  to be there — the entry procedures, the available power outlets, the real accessibility
                  situation, the connection quality, the practical micro-details that determine whether a
                  place works for you before you arrive.
                </p>
                <p>
                  This is not data that scales well through automation. It requires people who have been
                  to these places, who noticed, and who chose to share what they found.
                </p>
              </div>

              <div className="wiki-section">
                <h2>How It Works</h2>
                <p>
                  Mapedia is built around community-owned <strong>categories</strong>. Any user can create
                  a new category of places, define what data should be collected for it, and take
                  responsibility for moderating contributions. Each category is shaped entirely by its
                  creator — because no one understands what a community needs better than the people in it.
                  There is no central authority deciding what is worth tracking.
                </p>
                <p>
                  A volunteer mapping aid stations during a disaster, a community tracking affordable food
                  spots, an accessibility advocate documenting wheelchair access — each can build their own
                  category, define their own fields, and start collecting data in minutes.
                </p>
                <p>
                  Contributions go through a moderation layer before they are published — not to gatekeep,
                  but to maintain the accuracy that makes the data useful. Trusted contributors can bypass
                  this step once they've established a track record.
                </p>
              </div>

              <div className="wiki-section">
                <h2>Open Data</h2>
                <p>
                  Every piece of data on Mapedia is published under the{' '}
                  <strong>Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</strong>{' '}
                  license. This is not a courtesy — it is a structural commitment.
                </p>
                <p>
                  It means the data belongs to no one and to everyone. It can be downloaded, reused,
                  built upon, and redistributed freely, as long as the same freedom is preserved downstream.
                  No data on Mapedia can be taken and made proprietary.
                </p>
              </div>

              <div className="wiki-section">
                <h2>Infrastructure</h2>
                <p>
                  Mapedia runs on a single server hosted by Hetzner Online GmbH in Germany, within the
                  European Union. It is maintained by one person. There is no company, no investors,
                  and no roadmap driven by growth metrics. The goal is a reliable, honest, and permanent
                  public record of places — nothing more.
                </p>
              </div>
            </div>

          </div>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="wiki-col-side">

            {/* Infobox */}
            <div className="wiki-infobox">
              <div className="wiki-infobox-title">Mapedia</div>
              <table>
                <tbody>
                  <tr>
                    <td>Type</td>
                    <td>Open geographic database</td>
                  </tr>
                  <tr>
                    <td>License</td>
                    <td>
                      <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">
                        CC BY-SA 4.0
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>Hosting</td>
                    <td>Hetzner, Germany (EU)</td>
                  </tr>
                  <tr>
                    <td>Backend</td>
                    <td>Django REST Framework</td>
                  </tr>
                  <tr>
                    <td>Frontend</td>
                    <td>React + Vite</td>
                  </tr>
                  <tr>
                    <td>Contact</td>
                    <td><a href="mailto:info@mapedia.org">info@mapedia.org</a></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Participate */}
            <div className="wiki-box">
              <div className="wiki-box-header wiki-box-header-accent">
                <h2>Participate</h2>
              </div>
              <div className="wiki-box-body">
                <p>
                  The platform is only as useful as its data. If you know a place well enough to document
                  it accurately, that knowledge has a home here.
                </p>
              </div>
              <div className="wiki-side-actions">
                <Link to="/contribute" className="wiki-btn-primary">Add a Place</Link>
                <Link to="/register" className="wiki-btn-secondary">Create Account</Link>
                <Link to="/categories" className="wiki-btn-secondary">Browse Categories</Link>
              </div>
            </div>

            {/* See also */}
            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>See Also</h2>
              </div>
              <div className="wiki-box-body">
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li><Link to="/license">Open Data License</Link></li>
                  <li><Link to="/guidelines">Community Guidelines</Link></li>
                  <li><Link to="/privacy">Privacy Policy</Link></li>
                  <li><Link to="/terms">Terms of Service</Link></li>
                </ul>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  )
}

export default AboutPage
