// src/pages/CategoryDetailPage.jsx

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { MapContainer, TileLayer, Marker } from 'react-leaflet' 
import Navbar from '../components/Navbar'
import api from '../api/client'
import 'leaflet/dist/leaflet.css' 
import '../styles/CategoryDetailPage.css'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

// Leaflet default icon setup
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

function CategoryDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [recentVenues, setRecentVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    
    Promise.all([
      api.get(`/categories/${slug}/`),
      api.get(`/venues/?category=${slug}&page_size=5`)
    ])
      .then(([catRes, venuesRes]) => {
        setCategory(catRes.data)
        setRecentVenues(venuesRes.data.results || venuesRes.data || [])
        setLoading(false)
      })
      .catch(() => {
        setError('Category not found.')
        setLoading(false)
      })
  }, [slug])

  if (loading) return (
    <div className="catdetail-page">
      <Navbar />
      <main className="catdetail-main">
        <p className="catdetail-loading">Loading…</p>
      </main>
    </div>
  )

  if (error || !category) return (
    <div className="catdetail-page">
      <Navbar />
      <main className="catdetail-main">
        <p className="catdetail-error">{error || 'Something went wrong.'}</p>
        <Link to="/" className="catdetail-back-link">Back to Home</Link>
      </main>
    </div>
  )

  const publicFields = category.field_definitions?.filter(f => f.is_public) || []

  // SEO METADATA & SCHEMA (Translated to English)
  const pageTitle = `${category.name} Map & Locations | Mapedia`
  const pageDesc = category.description 
    ? category.description 
    : `Explore ${category.venue_count || 'all'} community-maintained ${category.name} locations on Mapedia. View maps, addresses, and detailed data.`

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": pageTitle,
    "description": pageDesc,
    "url": `https://mapedia.org/category/${slug}`,
    ...(recentVenues.length > 0 && {
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": recentVenues.map((venue, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `https://mapedia.org/venue/${venue.slug}`,
          "name": venue.name
        }))
      }
    })
  }

  // Find venues with valid coordinates for map center
  const validVenues = recentVenues.filter(v => v.latitude && v.longitude)
  const mapCenter = validVenues.length > 0 
    ? [parseFloat(validVenues[0].latitude), parseFloat(validVenues[0].longitude)] 
    : [39.0, 35.0] // Fallback center
  const mapZoom = validVenues.length > 0 ? 12 : 5

  return (
    <div className="catdetail-page">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={`https://mapedia.org/category/${slug}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={`https://mapedia.org/category/${slug}`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <Navbar />
      <main className="catdetail-main">
        <div className="catdetail-box">

          {/* HEADER */}
          <div className="catdetail-header">
            <div className="catdetail-breadcrumb">
              <Link to="/">Mapedia</Link>
              <span className="catdetail-breadcrumb-sep">›</span>
              <Link to="/categories">Categories</Link>
              <span className="catdetail-breadcrumb-sep">›</span>
              <span>{category.name}</span>
            </div>
            <div className="catdetail-title-row">
              {category.icon && <span className="catdetail-icon">{category.icon}</span>}
              <h1 className="catdetail-title">{category.name}</h1>
            </div>
            {category.description && (
              <p className="catdetail-desc">{category.description}</p>
            )}
          </div>

          {/* MAP PREVIEW (Sharp edges - borderRadius: 0) */}
          <div 
            className="catdetail-map-highlight" 
            style={{
              position: 'relative',
              height: '240px',
              marginTop: '16px',
              marginBottom: '24px',
              borderRadius: '0', // KÖŞELİ (SHARP EDGES)
              overflow: 'hidden',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            {/* Background Static Map */}
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%', zIndex: 1 }}
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {validVenues.map(venue => (
                <Marker key={venue.id} position={[parseFloat(venue.latitude), parseFloat(venue.longitude)]} />
              ))}
            </MapContainer>

            {/* Clickable Overlay & Sharp Button (English text) */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(2px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/category/${slug}/map`)}
            >
              <button 
                style={{
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '600',
                  backgroundColor: 'var(--link)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0', // KÖŞELİ (SHARP EDGES)
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  pointerEvents: 'none' 
                }}
              >
                <span style={{ fontSize: '22px' }}>🗺️</span> 
                Open Map ({category.venue_count || 0} {category.venue_count === 1 ? 'Venue' : 'Venues'})
              </button>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="catdetail-actions">
            <Link to={`/category/${slug}/venues`} className="catdetail-action-btn primary">
              View All Venues ({category.venue_count || 0})
            </Link>
            <Link to={`/contribute?category=${slug}`} className="catdetail-action-btn">
              + Add Venue
            </Link>
          </div>

          {/* STATS */}
          <div className="catdetail-stats">
            <div className="catdetail-stat">
              <span className="catdetail-stat-value">{category.venue_count || 0}</span>
              <span className="catdetail-stat-label">Venues</span>
            </div>
            <div className="catdetail-stat">
              <span className="catdetail-stat-value">{publicFields.length}</span>
              <span className="catdetail-stat-label">Fields</span>
            </div>
            <div className="catdetail-stat">
              <span className="catdetail-stat-value">
                {(category.moderators?.length || 0) + (category.owner ? 1 : 0)}
              </span>
              <span className="catdetail-stat-label">Maintainers</span>
            </div>
          </div>

          {/* RECENT VENUES */}
          {recentVenues.length > 0 && (
            <div className="catdetail-section">
              <h2 className="catdetail-section-title">Recent Venues</h2>
              <table className="catdetail-venues-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
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
                    </tr>
                  ))}
                </tbody>
              </table>
              {category.venue_count > 5 && (
                <div className="catdetail-venues-more">
                  <Link to={`/category/${slug}/venues`}>
                    View all {category.venue_count} venues →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* INFOBOX */}
          <div className="catdetail-infobox">
            <div className="catdetail-infobox-title">About this category</div>
            <table className="catdetail-infobox-table">
              <tbody>
                {category.owner && (
                  <tr>
                    <td>Owner</td>
                    <td>
                      <Link to={`/profile/${category.owner.username}`}>
                        @{category.owner.username}
                      </Link>
                    </td>
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
                  <td>{publicFields.length} data points tracked</td>
                </tr>
                <tr>
                  <td>License</td>
                  <td>
                    <a 
                      href="https://creativecommons.org/licenses/by-sa/4.0/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      CC BY-SA 4.0
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FIELDS */}
          {publicFields.length > 0 && (
            <div className="catdetail-section">
              <h2 className="catdetail-section-title">Data Schema</h2>
              <p className="catdetail-section-sub">
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
                        {f.help_text && (
                          <span className="catdetail-field-help">{f.help_text}</span>
                        )}
                      </td>
                      <td>
                        <span className="catdetail-field-type">{f.field_type}</span>
                      </td>
                      <td>
                        {f.is_required ? (
                          <span className="catdetail-badge required">Yes</span>
                        ) : (
                          <span className="catdetail-badge optional">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CTA */}
          <div className="catdetail-cta">
            <p>
              Know a place that belongs here?{' '}
              <Link to={`/contribute?category=${slug}`}>Add it to Mapedia →</Link>
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}

export default CategoryDetailPage