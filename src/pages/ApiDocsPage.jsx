// src/pages/ApiDocsPage.jsx

import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import '../styles/wiki.css'
import '../styles/ApiDocsPage.css'

const BASE = 'https://mapedia.org/api/v1'

function Endpoint({ method, path, desc, params, example }) {
  return (
    <div className="api-endpoint">
      <div className="api-endpoint-header">
        <span className={`api-method api-method-${method.toLowerCase()}`}>{method}</span>
        <code className="api-path">{BASE}{path}</code>
      </div>
      <p className="api-desc">{desc}</p>
      {params && (
        <table className="api-params-table">
          <thead>
            <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
          </thead>
          <tbody>
            {params.map(p => (
              <tr key={p.name}>
                <td><code>{p.name}</code>{p.required && <span className="api-required"> *</span>}</td>
                <td className="api-param-type">{p.type}</td>
                <td>{p.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {example && (
        <div className="api-example">
          <span className="api-example-label">Example</span>
          <code>{BASE}{example}</code>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="wiki-box" style={{ marginBottom: 20 }}>
      <div className="wiki-box-header">
        <h2>{title}</h2>
      </div>
      <div className="api-section-body">
        {children}
      </div>
    </div>
  )
}

function ApiDocsPage() {
  return (
    <div>
      <Helmet>
        <title>API Documentation | Mapedia</title>
        <meta name="description" content="Mapedia open REST API documentation — access venue, category, and contributor data." />
        <link rel="canonical" href="https://mapedia.org/api-docs" />
      </Helmet>
      <Navbar />

      <main className="wiki-page" style={{ maxWidth: 920 }}>
        <div className="wiki-title-bar">
          <nav className="wiki-breadcrumb">
            <Link to="/">Mapedia</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <span>API Docs</span>
          </nav>
          <h1>API Documentation</h1>
          <p>Free, open REST API — no authentication required for read operations.</p>
        </div>

        <div className="wiki-portal">
          <div className="wiki-col-main">

            <div className="wiki-box api-intro-box">
              <div className="wiki-box-body">
                <p>
                  All data from Mapedia is available via a public REST API. The base URL is{' '}
                  <code>{BASE}/</code>. All responses are JSON. Data is released under{' '}
                  <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a> —
                  attribution required.
                </p>
                <p style={{ marginBottom: 0 }}>
                  Rate limiting: please keep requests below 60/minute for read endpoints.
                  For bulk exports, use the <Link to="/api-docs#export">export endpoints</Link> instead.
                </p>
              </div>
            </div>

            <Section title="Venues">
              <Endpoint
                method="GET"
                path="/venues/"
                desc="List all approved venues. Supports filtering, search, and pagination."
                params={[
                  { name: 'page', type: 'integer', desc: 'Page number (default: 1)' },
                  { name: 'page_size', type: 'integer', desc: 'Results per page (default: 20, max: 100)' },
                  { name: 'search', type: 'string', desc: 'Full-text search by name, description, city' },
                  { name: 'category', type: 'string', desc: 'Filter by category slug' },
                  { name: 'city', type: 'string', desc: 'Filter by city name' },
                  { name: 'country', type: 'string', desc: 'Filter by country name' },
                  { name: 'lat', type: 'float', desc: 'Latitude for nearby search (use with lng)' },
                  { name: 'lng', type: 'float', desc: 'Longitude for nearby search (use with lat)' },
                  { name: 'radius', type: 'float', desc: 'Radius in km for nearby search (default: 5)' },
                  { name: 'ordering', type: 'string', desc: 'Sort field: name, -name, created_at, -created_at, city' },
                ]}
                example="/venues/?category=water-fountain&city=Paris&page=1"
              />
              <Endpoint
                method="GET"
                path="/venues/{slug}/"
                desc="Get full details for a single venue, including custom field values, ratings, and coordinates."
                example="/venues/blue-spring-fountain/"
              />
              <Endpoint
                method="GET"
                path="/venues/{slug}/ratings/"
                desc="List all ratings for a venue."
                example="/venues/blue-spring-fountain/ratings/"
              />
              <Endpoint
                method="GET"
                path="/venues/{slug}/map-markers/"
                desc="Lightweight marker data (id, name, lat, lng) for all venues in the same category. Used for map rendering."
                example="/venues/blue-spring-fountain/map-markers/"
              />
            </Section>

            <Section title="Categories">
              <Endpoint
                method="GET"
                path="/categories/"
                desc="List all public categories."
                params={[
                  { name: 'search', type: 'string', desc: 'Search by name or description' },
                  { name: 'page', type: 'integer', desc: 'Page number' },
                  { name: 'page_size', type: 'integer', desc: 'Results per page' },
                ]}
                example="/categories/?search=fountain"
              />
              <Endpoint
                method="GET"
                path="/categories/{slug}/"
                desc="Get category details including custom field definitions."
                example="/categories/water-fountain/"
              />
            </Section>

            <Section title="Cities &amp; Countries">
              <Endpoint
                method="GET"
                path="/cities/"
                desc="List top cities by venue count (up to 150 cities)."
                example="/cities/"
              />
              <Endpoint
                method="GET"
                path="/countries/"
                desc="List all countries by venue count, with city count per country."
                example="/countries/"
              />
            </Section>

            <Section title="Stats">
              <Endpoint
                method="GET"
                path="/stats/"
                desc="Global statistics: total venues, users, categories, ratings, and weekly activity."
                example="/stats/"
              />
            </Section>

            <Section title="Users">
              <Endpoint
                method="GET"
                path="/users/list/"
                desc="List contributors. Useful for leaderboards."
                params={[
                  { name: 'ordering', type: 'string', desc: '-contribution_count, -ratings_count, -date_joined' },
                  { name: 'page', type: 'integer', desc: 'Page number' },
                  { name: 'page_size', type: 'integer', desc: 'Results per page' },
                ]}
                example="/users/list/?ordering=-contribution_count&page_size=10"
              />
              <Endpoint
                method="GET"
                path="/users/{username}/"
                desc="Get public profile for a contributor."
                example="/users/alice/"
              />
            </Section>

          </div>

          <aside className="wiki-col-side">
            <div className="wiki-box">
              <div className="wiki-box-header wiki-box-header-accent">
                <h2>Quick Reference</h2>
              </div>
              <div className="wiki-box-body" style={{ fontSize: 13 }}>
                <p><strong>Base URL</strong><br /><code style={{ fontSize: 12 }}>{BASE}/</code></p>
                <p><strong>Format</strong><br />JSON</p>
                <p><strong>Auth</strong><br />Not required for GET</p>
                <p style={{ marginBottom: 0 }}>
                  <strong>License</strong><br />
                  <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>
                </p>
              </div>
            </div>

            <div className="wiki-infobox">
              <div className="wiki-infobox-title">Download Data</div>
              <table>
                <tbody>
                  <tr>
                    <td colSpan={2} style={{ padding: '8px 10px', fontSize: 13 }}>
                      Download all venues for a category as CSV or GeoJSON from any category venues page.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>Attribution</h2>
              </div>
              <div className="wiki-box-body" style={{ fontSize: 13 }}>
                <p>When using Mapedia data, please include:</p>
                <code style={{ display: 'block', background: 'var(--accent)', padding: '8px', fontSize: 12, lineHeight: 1.5 }}>
                  Data from Mapedia (mapedia.org), CC BY-SA 4.0
                </code>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default ApiDocsPage
