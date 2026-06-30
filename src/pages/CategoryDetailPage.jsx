import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import { SkeletonPage } from '../components/Skeleton'
import api from '../api/client'
import '../styles/wiki.css'
import '../styles/CategoryDetailPage.css'

const FIELD_TYPE_LABELS = {
  boolean:      'Yes / No',
  string:       'Short Text',
  text:         'Long Text',
  integer:      'Whole Number',
  decimal:      'Decimal Number',
  url:          'Website Link',
  choice:       'Single Choice',
  multi_choice: 'Multiple Choice',
}

function CategoryDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [recentVenues, setRecentVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [following, setFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)
  const [embedOpen, setEmbedOpen] = useState(false)
  const isLoggedIn = !!localStorage.getItem('access')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/categories/${slug}/`),
      api.get(`/venues/?category=${slug}&page_size=8`)
    ])
      .then(([catRes, venuesRes]) => {
        setCategory(catRes.data)
        setFollowing(catRes.data.is_following || false)
        setFollowerCount(catRes.data.follower_count || 0)
        setRecentVenues(venuesRes.data.results || venuesRes.data || [])
        setLoading(false)
      })
      .catch(() => {
        setError('Category not found.')
        setLoading(false)
      })
  }, [slug])

  async function handleFollow() {
    if (!isLoggedIn) { navigate('/login'); return }
    setFollowLoading(true)
    try {
      const res = await api.post(`/categories/${slug}/follow/`)
      setFollowing(res.data.following)
      setFollowerCount(res.data.follower_count)
    } catch {}
    finally { setFollowLoading(false) }
  }

  if (loading) return <div><Navbar /><SkeletonPage /></div>

  if (error || !category) return (
    <div>
      <Navbar />
      <main className="wiki-page">
        <p style={{ color: 'var(--text-light)', padding: '48px 0' }}>{error || 'Something went wrong.'}</p>
        <Link to="/" className="wiki-btn-secondary" style={{ display: 'inline-block', width: 'auto' }}>Back to Home</Link>
      </main>
    </div>
  )

  const publicFields = category.field_definitions?.filter(f => f.is_public) || []
  const pageTitle = `${category.name} Map & Locations | Mapedia`
  const pageDesc = category.description
    ? category.description
    : `Explore ${category.venue_count || 'all'} community-maintained ${category.name} locations on Mapedia.`

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageDesc,
    url: `https://mapedia.org/category/${slug}`,
    ...(recentVenues.length > 0 && {
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: recentVenues.map((venue, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `https://mapedia.org/venue/${venue.slug}`,
          name: venue.name,
        })),
      },
    }),
  }

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={`https://mapedia.org/category/${slug}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={`https://mapedia.org/category/${slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://mapedia.org/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content="https://mapedia.org/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      <Navbar />

      <main className="wiki-page">

        {/* ── Title bar ── */}
        <div className="wiki-title-bar">
          <div className="wiki-breadcrumb">
            <Link to="/">Mapedia</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <Link to="/categories">Categories</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <span>{category.name}</span>
          </div>
          <h1>
            {category.icon && <span className="catdetail-icon">{category.icon}</span>}
            {category.name}
          </h1>
          {category.description && <p>{category.description}</p>}
        </div>

        {/* ── Stats bar ── */}
        <div className="catdetail-stats-bar">
          <div className="catdetail-stat">
            <strong>{category.venue_count || 0}</strong>
            <span>Venues</span>
          </div>
          <div className="catdetail-stat-sep" />
          <div className="catdetail-stat">
            <strong>{publicFields.length}</strong>
            <span>Fields</span>
          </div>
          <div className="catdetail-stat-sep" />
          <div className="catdetail-stat">
            <strong>{(category.moderators?.length || 0) + (category.owner ? 1 : 0)}</strong>
            <span>Maintainers</span>
          </div>
          <div className="catdetail-stat-sep" />
          <div className="catdetail-stat">
            <strong>{followerCount}</strong>
            <span>Followers</span>
          </div>
          <div className="catdetail-stat-follow">
            <button
              className={`catdetail-follow-btn${following ? ' catdetail-follow-btn-active' : ''}`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {following ? '★ Following' : '☆ Follow'}
            </button>
          </div>
        </div>

        <div className="wiki-portal">

          {/* ── LEFT: Main content ── */}
          <div className="wiki-col-main">

            {/* Map preview */}
            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>Map</h2>
                <Link to={`/category/${slug}/map`} style={{ fontSize: 12, color: 'var(--link)' }}>
                  Open full map →
                </Link>
              </div>
              <div
                className="catdetail-map-preview"
                onClick={() => navigate(`/category/${slug}/map`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(`/category/${slug}/map`)}
                aria-label={`Open full map for ${category.name}`}
              >
                <div className="catdetail-map-overlay">
                  <span className="catdetail-map-icon">🗺️</span>
                  <span className="catdetail-map-label">
                    View {category.venue_count || 0} {category.venue_count === 1 ? 'venue' : 'venues'} on the map
                  </span>
                  <span className="catdetail-map-hint">Click to open →</span>
                </div>
              </div>
            </div>

            {/* Recent venues */}
            {recentVenues.length > 0 && (
              <div className="wiki-box">
                <div className="wiki-box-header">
                  <h2>Venues</h2>
                  {category.venue_count > 8 && (
                    <Link to={`/category/${slug}/venues`} style={{ fontSize: 13, color: 'var(--link)' }}>
                      View all {category.venue_count} →
                    </Link>
                  )}
                </div>
                <table className="catdetail-venues-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVenues.map(venue => (
                      <tr key={venue.id}>
                        <td>
                          <Link to={`/venue/${venue.slug}`} className="catdetail-venue-link">
                            {venue.name}
                          </Link>
                        </td>
                        <td className="catdetail-venue-location">
                          {[venue.city, venue.country].filter(Boolean).join(', ') || '—'}
                        </td>
                        <td className="catdetail-venue-rating">
                          {venue.average_rating
                            ? <span>★ {venue.average_rating}</span>
                            : <span className="catdetail-venue-no-rating">—</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Data schema */}
            {publicFields.length > 0 && (
              <div className="wiki-box">
                <div className="wiki-box-header">
                  <h2>Data Schema</h2>
                </div>
                <div className="wiki-box-body" style={{ padding: 0 }}>
                  <p className="catdetail-schema-note">
                    Each venue in this category documents the following fields:
                  </p>
                  <table className="catdetail-fields-table">
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Type</th>
                        <th>Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      {publicFields.map(f => (
                        <tr key={f.id}>
                          <td>
                            <span className="catdetail-field-name">{f.label}</span>
                            {f.help_text && <span className="catdetail-field-help">{f.help_text}</span>}
                          </td>
                          <td>
                            <span className="catdetail-field-type">
                              {FIELD_TYPE_LABELS[f.field_type] || f.field_type}
                            </span>
                          </td>
                          <td>
                            {f.is_required
                              ? <span className="catdetail-badge required">Yes</span>
                              : <span className="catdetail-badge optional">No</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="wiki-col-side">

            {/* Actions */}
            <div className="wiki-box">
              <div className="wiki-box-header wiki-box-header-accent">
                <h2>Contribute</h2>
              </div>
              <div className="wiki-side-actions">
                <Link to={`/contribute?category=${slug}`} className="wiki-btn-primary">
                  + Add a Venue
                </Link>
                <Link to={`/category/${slug}/venues`} className="wiki-btn-secondary">
                  Browse All Venues
                </Link>
                <Link to={`/category/${slug}/map`} className="wiki-btn-secondary">
                  Open Map
                </Link>
              </div>
            </div>

            {/* Infobox */}
            <div className="wiki-infobox">
              <div className="wiki-infobox-title">About this category</div>
              <table>
                <tbody>
                  {category.owner && (
                    <tr>
                      <td>Owner</td>
                      <td><Link to={`/profile/${category.owner.username}`}>@{category.owner.username}</Link></td>
                    </tr>
                  )}
                  {category.moderators?.length > 0 && (
                    <tr>
                      <td>Moderators</td>
                      <td>
                        {category.moderators.map((m, i) => (
                          <span key={m.id}>
                            {i > 0 && ', '}
                            <Link to={`/profile/${m.username}`}>@{m.username}</Link>
                          </span>
                        ))}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td>Fields</td>
                    <td>{publicFields.length} tracked</td>
                  </tr>
                  <tr>
                    <td>License</td>
                    <td>
                      <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">
                        CC BY-SA 4.0
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Embed */}
            <div className="wiki-box">
              <div className="catdetail-embed-toggle">
                <button className="catdetail-embed-btn" onClick={() => setEmbedOpen(v => !v)}>
                  {embedOpen ? '▲ Hide embed code' : '▼ Embed this category'}
                </button>
              </div>
              {embedOpen && (
                <div className="catdetail-embed-body">
                  <p className="catdetail-embed-hint">Copy this snippet to embed a link to this category:</p>
                  <textarea
                    readOnly
                    className="catdetail-embed-code"
                    value={`<a href="https://mapedia.org/category/${slug}" target="_blank" rel="noopener noreferrer">${category?.name} on Mapedia</a>`}
                    onClick={e => e.target.select()}
                  />
                  <p className="catdetail-embed-license">
                    Data under <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a> — attribution required.
                  </p>
                </div>
              )}
            </div>

            {/* Moderation */}
            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>Moderation</h2>
              </div>
              <div className="wiki-side-actions">
                <Link to={`/moderation/${slug}`} className="wiki-btn-secondary">
                  Moderation Queue
                </Link>
                <Link to={`/moderation/${slug}/moderators`} className="wiki-btn-secondary">
                  Moderators
                </Link>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  )
}

export default CategoryDetailPage
