// src/pages/VenuePage.jsx
// SEO v2: Programmatic content + Internal linking + AI-SEO enrichment

import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { Helmet } from 'react-helmet-async' 
import Navbar from '../components/Navbar'
import api from '../api/client'
import 'leaflet/dist/leaflet.css'
import '../styles/VenuePage.css'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

// ─────────────────────────────────────────────
// YARDIMCI: Alan/değer gösterimi
// ─────────────────────────────────────────────
function FieldValueDisplay({ fv }) {
  if (fv.field_type === 'boolean') {
    const isYes = fv.display_value === 'Yes' || fv.value === 'True' || fv.value === 'true' || fv.value === true
    return isYes
      ? <span className="field-bool yes">Yes</span>
      : <span className="field-bool no">No</span>
  }
  if (fv.field_type === 'url') {
    return <a href={fv.value} target="_blank" rel="noopener noreferrer">{fv.value}</a>
  }
  return <span>{fv.display_value || fv.value}</span>
}

// ─────────────────────────────────────────────
// RATING BİLEŞENLERİ
// ─────────────────────────────────────────────
function StarRating({ rating, size = 'medium', interactive = false, onRate = null }) {
  const [hoverRating, setHoverRating] = useState(0)
  const sizeClass = size === 'small' ? 'stars-small' : size === 'large' ? 'stars-large' : ''
  const handleClick = (star) => { if (interactive && onRate) onRate(star) }
  const displayRating = hoverRating || rating || 0
  return (
    <div
      className={`star-rating ${sizeClass} ${interactive ? 'interactive' : ''}`}
      onMouseLeave={() => interactive && setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`star ${star <= displayRating ? 'filled' : ''}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
        >★</span>
      ))}
    </div>
  )
}

function RatingBreakdown({ breakdown, totalCount }) {
  if (!breakdown || totalCount === 0) return null
  return (
    <div className="rating-breakdown">
      {[5, 4, 3, 2, 1].map(star => {
        const count = breakdown[star] || 0
        const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0
        return (
          <div key={star} className="breakdown-row">
            <span className="breakdown-label">{star}★</span>
            <div className="breakdown-bar">
              <div className="breakdown-fill" style={{ width: `${percentage}%` }} />
            </div>
            <span className="breakdown-count">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

function RatingForm({ venueSlug, userRating, onRatingSubmit }) {
  const [score, setScore] = useState(userRating || 0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isLoggedIn = !!localStorage.getItem('access')

  const handleSubmit = async () => {
    if (!score) { setError('Please select a rating'); return }
    setLoading(true); setError('')
    try {
      const res = await api.post(`/venues/${venueSlug}/rate/`, { score, comment })
      onRatingSubmit(res.data); setComment('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit rating')
    } finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your rating?')) return
    setLoading(true)
    try {
      const res = await api.delete(`/venues/${venueSlug}/rate/delete/`)
      onRatingSubmit(res.data); setScore(0); setComment('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete rating')
    } finally { setLoading(false) }
  }

  if (!isLoggedIn) {
    return (
      <div className="rating-form">
        <p className="rating-login-prompt">
          <Link to="/login">Log in</Link> to rate this venue
        </p>
      </div>
    )
  }
  return (
    <div className="rating-form">
      <h4>{userRating ? 'Update your rating' : 'Rate this venue'}</h4>
      <StarRating rating={score} size="large" interactive={true} onRate={setScore} />
      <textarea
        placeholder="Add a comment (optional)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        maxLength={500}
        className="rating-comment"
      />
      {error && <p className="rating-error">{error}</p>}
      <div className="rating-actions">
        <button onClick={handleSubmit} disabled={loading || !score} className="btn-apply">
          {loading ? 'Submitting...' : (userRating ? 'Update Rating' : 'Submit Rating')}
        </button>
        {userRating && (
          <button onClick={handleDelete} disabled={loading} className="btn-report">
            Delete Rating
          </button>
        )}
      </div>
    </div>
  )
}

function RatingsList({ ratings }) {
  if (!ratings || ratings.length === 0) return null
  return (
    <div className="ratings-list">
      <h4>Recent Reviews</h4>
      {ratings.map(r => (
        <div key={r.id} className="rating-item">
          <div className="rating-header">
            <Link to={`/profile/${r.user.username}`} className="rating-user">
              {r.user.avatar && <img src={r.user.avatar} alt="" className="rating-avatar" />}
              <span>@{r.user.username}</span>
            </Link>
            <StarRating rating={r.score} size="small" />
          </div>
          {r.comment && <p className="rating-comment-text">{r.comment}</p>}
          <span className="rating-date">
            {new Date(r.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// SEO 1: PROGRAMMATIC VENUE DESCRIPTION
// Sadece güvenilir yapısal veri: isim + kategori + konum + rating.
// Field label'larına dokunulmaz — kullanıcı tarafından girildiği için güvenilmez.
// ─────────────────────────────────────────────
function VenueDescription({ venue }) {
  const city = venue.city || ''
  const country = venue.country || ''
  const location = [city, country].filter(Boolean).join(', ')

  // Kategori sayısına göre doğal dil: "a Cafe", "a Cafe and Bar", "a Cafe, Bar, and Museum"
  const cats = venue.categories?.map(c => c.category_name) || []
  let categoryPhrase = ''
  if (cats.length === 1) {
    categoryPhrase = cats[0]
  } else if (cats.length === 2) {
    categoryPhrase = `${cats[0]} and ${cats[1]}`
  } else if (cats.length >= 3) {
    categoryPhrase = `${cats.slice(0, -1).join(', ')}, and ${cats[cats.length - 1]}`
  }

  const ratingText = venue.average_rating && venue.rating_count > 0
    ? ` It has a ${venue.average_rating}/5 rating from ${venue.rating_count} ${venue.rating_count === 1 ? 'review' : 'reviews'} on Mapedia.`
    : ''

  if (!categoryPhrase && !location) return null

  let description = venue.name
  if (categoryPhrase && location) {
    description += ` is a ${categoryPhrase} in ${location}.`
  } else if (categoryPhrase) {
    description += ` is a ${categoryPhrase}.`
  } else {
    description += ` is located in ${location}.`
  }

  return (
    <div className="venue-description" itemProp="description">
      <p>{description}{ratingText}</p>
    </div>
  )
}


// ─────────────────────────────────────────────
// SEO 2: NEARBY VENUES (İÇ LİNKLEME — YER BAZLI)
// Aynı şehir + kategori → coğrafi küme oluşturur.
// "Cafes in Istanbul" → tüm kafeler birbirine bağlanır.
// Backend: /venues/{slug}/ → nearby_venues alanı
// ─────────────────────────────────────────────
function NearbyVenues({ venues, city, categoryName }) {
  if (!venues || venues.length === 0) return null

  return (
    <section className="venue-nearby" aria-label={`Other ${categoryName || 'venues'} near ${city || 'this location'}`}>
      <h2 className="nearby-title">
        {categoryName && city
          ? `Other ${categoryName} venues in ${city}`
          : city
            ? `More venues in ${city}`
            : `Similar nearby venues`}
      </h2>
      <ul className="nearby-list">
        {venues.map(v => (
          <li key={v.slug} className="nearby-item">
            <Link to={`/venue/${v.slug}`} className="nearby-link">
              <span className="nearby-name">{v.name}</span>
              {v.city && <span className="nearby-city">{v.city}</span>}
              {v.average_rating > 0 && (
                <span className="nearby-rating">★ {v.average_rating}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ─────────────────────────────────────────────
// SEO 3: RELATED VENUES (İÇ LİNKLEME — KATEGORİ BAZLI)
// Aynı kategori → tematik küme oluşturur.
// "Museums in Turkey" gibi kümeleri örümcek ağı gibi bağlar.
// Backend: /venues/{slug}/ → related_venues alanı
// ─────────────────────────────────────────────
function RelatedVenues({ venues, categoryName }) {
  if (!venues || venues.length === 0) return null

  return (
    <section className="venue-related" aria-label={`Related ${categoryName || 'venues'}`}>
      <h2 className="related-title">
        {categoryName ? `More ${categoryName} venues` : 'Related venues'}
      </h2>
      <div className="related-grid">
        {venues.map(v => (
          <Link key={v.slug} to={`/venue/${v.slug}`} className="related-card">
            <span className="related-name">{v.name}</span>
            <span className="related-meta">
              {v.city && <span>{v.city}</span>}
              {v.average_rating > 0 && <span>★ {v.average_rating}</span>}
            </span>
          </Link>
        ))}
      </div>
      <Link
        to={`/category/${venues[0]?.primary_category_slug || ''}`}
        className="related-all-link"
      >
        Browse all {categoryName} venues →
      </Link>
    </section>
  )
}

// ─────────────────────────────────────────────
// SEO 4: CATEGORY CONTEXT BLOCK
// Kategori hakkında kısa açıklama + link.
// "What is a Vegan Restaurant?" gibi LLM snippet hedefleri.
// Backend: /categories/{slug}/ → description alanı (opsiyonel)
// ─────────────────────────────────────────────
function CategoryContext({ categories }) {
  if (!categories || categories.length === 0) return null

  // Sadece description'ı olan kategorileri göster
  const catsWithDesc = categories.filter(c => c.category_description)
  if (catsWithDesc.length === 0) return null

  return (
    <aside className="category-context">
      {catsWithDesc.map(cat => (
        <div key={cat.category_slug} className="category-context-item">
          <h3 className="category-context-title">
            About{' '}
            <Link to={`/category/${cat.category_slug}`}>{cat.category_name}</Link>
          </h3>
          <p className="category-context-desc">{cat.category_description}</p>
        </div>
      ))}
    </aside>
  )
}

// ─────────────────────────────────────────────
// SEO 5: BREADCRUMB SCHEMA (JSON-LD)
// Google'a sayfa hiyerarşisini bildirir.
// Arama sonuçlarında "Mapedia > Kafe > Venue adı" şeklinde görünür.
// ─────────────────────────────────────────────
function buildBreadcrumbSchema(venue, venueSlug) {
  const items = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Mapedia",
      "item": "https://mapedia.org"
    }
  ]

  if (venue.city) {
    items.push({
      "@type": "ListItem",
      "position": 2,
      "name": venue.city,
      "item": `https://mapedia.org/city/${venue.city.toLowerCase().replace(/\s+/g, '-')}`
    })
  }

  const primaryCat = venue.categories?.[0]
  if (primaryCat) {
    items.push({
      "@type": "ListItem",
      "position": venue.city ? 3 : 2,
      "name": primaryCat.category_name,
      "item": `https://mapedia.org/category/${primaryCat.category_slug}`
    })
  }

  items.push({
    "@type": "ListItem",
    "position": items.length + 1,
    "name": venue.name,
    "item": `https://mapedia.org/venue/${venueSlug}`
  })

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
  }
}

// ─────────────────────────────────────────────
// SEO 6: FAQ SCHEMA
// Sık sorulan sorulardan snippet üretir.
// LLM ve featured snippet hedeflemesi için.
// ─────────────────────────────────────────────
function buildFAQSchema(venue) {
  const faqs = []
  const categoryNames = venue.categories?.map(c => c.category_name).join(' ve ')
  const location = [venue.city, venue.country].filter(Boolean).join(', ')

  if (location) {
    faqs.push({
      "@type": "Question",
      "name": `Where is ${venue.name} located?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `${venue.name} is located in ${location}.${venue.latitude ? ` Coordinates: ${venue.latitude}, ${venue.longitude}.` : ''}`
      }
    })
  }

  if (categoryNames) {
    faqs.push({
      "@type": "Question",
      "name": `What type of venue is ${venue.name}?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `${venue.name} is categorized as ${categoryNames} on Mapedia.`
      }
    })
  }

  if (venue.average_rating && venue.rating_count > 0) {
    faqs.push({
      "@type": "Question",
      "name": `What is the rating of ${venue.name}?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `${venue.name} has an average rating of ${venue.average_rating} out of 5, based on ${venue.rating_count} reviews on Mapedia.`
      }
    })
  }

  if (faqs.length === 0) return null

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs
  }
}

// ─────────────────────────────────────────────
// ANA BİLEŞEN
// ─────────────────────────────────────────────
function VenuePage() {
  const { venueSlug } = useParams()
  const navigate = useNavigate()
  const [venue, setVenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDesc, setReportDesc] = useState('')
  const [reportSent, setReportSent] = useState(false)

  const fetchVenue = useCallback(async (retryWithoutToken = false) => {
    if (!retryWithoutToken) setLoading(true)
    const token = retryWithoutToken ? null : localStorage.getItem('access')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    try {
      const res = await api.get(`/venues/${venueSlug}/`, { headers })
      setVenue(res.data)
    } catch (err) {
      if (err.response?.status === 401 && !retryWithoutToken) {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        fetchVenue(true)
        return
      }
    } finally {
      setLoading(false)
    }
  }, [venueSlug])

  useEffect(() => { fetchVenue() }, [fetchVenue])

  const handleRatingSubmit = (data) => {
    setVenue(prev => ({
      ...prev,
      average_rating: data.average_rating,
      rating_count: data.rating_count,
      user_rating: data.rating?.score || null
    }))
    fetchVenue()
  }

  const submitReport = () => {
    if (!venue) return
    api.post('/reports/', { venue: venue.id, reason: reportReason, description: reportDesc })
      .then(() => { setReportSent(true); setReportOpen(false); setReportReason(''); setReportDesc('') })
      .catch(err => console.error('Report failed:', err))
  }

  if (loading) return <div><Navbar /><div className="venue-loading">Loading…</div></div>

  if (!venue) return (
    <div>
      <Navbar />
      <div className="venue-loading">
        <h2>Venue not found</h2>
        <p>The link might be broken or the venue is no longer active.</p>
        <Link to="/" className="btn-edit" style={{ marginTop: 16, display: 'inline-block' }}>Back to Home</Link>
      </div>
    </div>
  )

  const primaryCat = venue.categories?.[0]
  const pageTitle = `${venue.name}${venue.city ? ` — ${venue.city}` : ''}${primaryCat ? ` | ${primaryCat.category_name}` : ''} | Mapedia`

  // Programmatic meta description: keyword-rich, 150-160 karakter hedefi
  const categoryNames = venue.categories?.map(c => c.category_name).join(', ')
  const location = [venue.city, venue.country].filter(Boolean).join(', ')
  const ratingSnippet = venue.average_rating && venue.rating_count > 0
    ? ` Rated ${venue.average_rating}/5 (${venue.rating_count} reviews).`
    : ''
  const pageDesc = `${venue.name} is a ${categoryNames || 'venue'}${location ? ` in ${location}` : ''}.${ratingSnippet} View location, features and reviews on Mapedia.`

  // Schema: LocalBusiness tipi
  const getGoogleSchemaType = (categories) => {
    if (!categories || categories.length === 0) return "LocalBusiness"
    const slug = categories[0].category_slug.toLowerCase()
    const typeMap = {
      'vegan': 'Restaurant', 'restoran': 'Restaurant',
      'kafe': 'CafeOrCoffeeShop', 'muze': 'Museum',
      'tarihi-yer': 'TouristAttraction', 'park': 'Park',
      'otel': 'LodgingBusiness'
    }
    return typeMap[slug] || "LocalBusiness"
  }

  const schemaData = {
    "@context": "https://schema.org",
    "@type": getGoogleSchemaType(venue.categories),
    "name": venue.name,
    "description": pageDesc,
    "url": `https://mapedia.org/venue/${venueSlug}`,
    // Mekan görseli varsa ekle, yoksa site logosu
    "image": venue.image || "https://mapedia.org/mapedia.svg",
    ...(venue.latitude && venue.longitude && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": parseFloat(venue.latitude),
        "longitude": parseFloat(venue.longitude)
      },
      // hasMap: Google Maps ve OSM linkleri
      "hasMap": [
        `https://www.openstreetmap.org/?mlat=${venue.latitude}&mlon=${venue.longitude}&zoom=16`,
        `https://maps.google.com/?q=${venue.latitude},${venue.longitude}`
      ]
    }),
    ...(venue.city || venue.country ? {
      "address": {
        "@type": "PostalAddress",
        "addressLocality": venue.city,
        "addressCountry": venue.country || "TR"
      }
    } : {}),
    ...(venue.average_rating && venue.rating_count > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": venue.average_rating,
        "reviewCount": venue.rating_count,
        "bestRating": "5",
        "worstRating": "1"
      }
    } : {}),
    // sameAs: OSM kaynağı varsa ekle (AI/LLM entity linking için kritik)
    ...(venue.osm_id ? {
      "sameAs": [
        `https://www.openstreetmap.org/${venue.osm_type || 'node'}/${venue.osm_id}`
      ]
    } : {})
  }

  const breadcrumbSchema = buildBreadcrumbSchema(venue, venueSlug)
  const faqSchema = buildFAQSchema(venue)

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={`https://mapedia.org/venue/${venueSlug}`} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={`https://mapedia.org/venue/${venueSlug}`} />
        <meta property="og:type" content="place" />
        {venue.image && <meta property="og:image" content={venue.image} />}

        {/* LocalBusiness Schema */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>

        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>

        {/* FAQ Schema (sadece yeterli veri varsa) */}
        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
      </Helmet>

      <Navbar />

      {/* itemScope: Sayfanın tamamı semantic HTML ile işaretlendi */}
      <main
        className="venue-main"
        itemScope
        itemType={`https://schema.org/${getGoogleSchemaType(venue.categories)}`}
      >
        <div className="venue-layout">
          <div className="venue-content">

            {/* ── BREADCRUMB ── */}
            <nav className="venue-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Mapedia</Link>
              <span className="venue-breadcrumb-sep" aria-hidden="true">›</span>
              {venue.city && (
                <>
                  <Link to={`/city/${venue.city.toLowerCase().replace(/\s+/g, '-')}`}>
                    {venue.city}
                  </Link>
                  <span className="venue-breadcrumb-sep" aria-hidden="true">›</span>
                </>
              )}
              {primaryCat && (
                <>
                  <Link to={`/category/${primaryCat.category_slug}`}>{primaryCat.category_name}</Link>
                  <span className="venue-breadcrumb-sep" aria-hidden="true">›</span>
                </>
              )}
              <span aria-current="page">{venue.name}</span>
            </nav>

            {/* ── BAŞLIK ── */}
            <h1 className="venue-title" itemProp="name">{venue.name}</h1>

            {/* ── PROGRAMMATIC AÇIKLAMA (SEO 1) ── */}
            <VenueDescription venue={venue} />

            {/* ── RATING ÖZET ── */}
            {(venue.average_rating || venue.rating_count > 0) && (
              <div className="venue-rating-summary" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                <meta itemProp="ratingValue" content={venue.average_rating} />
                <meta itemProp="reviewCount" content={venue.rating_count} />
                <StarRating rating={Math.round(venue.average_rating)} />
                <span className="rating-value">{venue.average_rating}</span>
                <span className="rating-count">({venue.rating_count} {venue.rating_count === 1 ? 'review' : 'reviews'})</span>
              </div>
            )}

            {/* ── META ETIKETLER ── */}
            <div className="venue-meta-row">
              {venue.city && (
                <Link
                  to={`/city/${venue.city.toLowerCase().replace(/\s+/g, '-')}`}
                  className="venue-tag"
                  itemProp="address"
                  itemScope
                  itemType="https://schema.org/PostalAddress"
                >
                  <meta itemProp="addressLocality" content={venue.city} />
                  📍 {venue.city}{venue.country ? `, ${venue.country}` : ''}
                </Link>
              )}
              {venue.categories?.map(cat => (
                <Link key={cat.category_slug} to={`/category/${cat.category_slug}`} className="venue-tag">
                  {cat.category_name}
                </Link>
              ))}
            </div>

            {/* ── ALAN DEĞERLERİ ── */}
            {venue.categories?.map(cat => (
              cat.field_values?.length > 0 && (
                <div key={cat.category_slug} className="venue-fields">
                  <h2>{cat.category_name}</h2>
                  <table className="fields-table">
                    <tbody>
                      {cat.field_values.map(fv => (
                        <tr key={fv.id}>
                          <td className="field-label">{fv.field_label}</td>
                          <td className="field-value"><FieldValueDisplay fv={fv} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ))}

            {/* ── KATEGORİ BAĞLAM BLOĞU (SEO 4) ── */}
            <CategoryContext categories={venue.categories} />

            {/* ── RATING SECTION ── */}
            <div className="venue-rating-section">
              <h2>Ratings & Reviews</h2>
              <div className="rating-overview">
                <div className="rating-big">
                  <span className="rating-big-number">{venue.average_rating || '—'}</span>
                  <StarRating rating={Math.round(venue.average_rating || 0)} />
                  <span className="rating-total">{venue.rating_count} reviews</span>
                </div>
                <RatingBreakdown breakdown={venue.rating_breakdown} totalCount={venue.rating_count} />
              </div>
              <RatingForm venueSlug={venueSlug} userRating={venue.user_rating} onRatingSubmit={handleRatingSubmit} />
              <RatingsList ratings={venue.recent_ratings} />
              {venue.rating_count > 5 && (
                <Link to={`/venue/${venueSlug}/reviews`} className="btn-edit" style={{ marginTop: 16 }}>
                  View all {venue.rating_count} reviews →
                </Link>
              )}
            </div>

            {/* ── YAKINDAKI MEKÂNLAR (SEO 2 — YER BAZLI İÇ LİNK) ── */}
            <NearbyVenues
              venues={venue.nearby_venues}
              city={venue.city}
              categoryName={primaryCat?.category_name}
            />

            {/* ── İLGİLİ MEKÂNLAR (SEO 3 — KATEGORİ BAZLI İÇ LİNK) ── */}
            <RelatedVenues
              venues={venue.related_venues}
              categoryName={primaryCat?.category_name}
            />

            {/* ── ACTIONS ── */}
            <div className="venue-actions">
              <Link to={`/venue/${venueSlug}/edit`} className="btn-edit">Edit</Link>
              <button className="btn-edit" onClick={() => navigate(`/venue/${venueSlug}/add-category`)}>
                + Add Category
              </button>
              <button className="btn-report" onClick={() => setReportOpen(!reportOpen)}>
                {reportOpen ? 'Cancel' : 'Report an issue'}
              </button>
              {reportSent && <span className="report-sent">✓ Report sent, thank you.</span>}
            </div>

            {reportOpen && (
              <div className="report-form">
                <h3>Report an Issue</h3>
                <select value={reportReason} onChange={e => setReportReason(e.target.value)} className="filter-select">
                  <option value="">Select reason…</option>
                  <option value="closed">Venue Closed / Not Found</option>
                  <option value="wrong_location">Wrong Location on Map</option>
                  <option value="wrong_info">Incorrect Information</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="duplicate">Duplicate Entry</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  placeholder="Additional details (optional)"
                  value={reportDesc}
                  onChange={e => setReportDesc(e.target.value)}
                  className="report-textarea"
                />
                <button onClick={submitReport} disabled={!reportReason} className="btn-apply">Submit Report</button>
              </div>
            )}

            <div className="venue-footer">
              <span>
                Added:{' '}
                <time dateTime={venue.created_at}>
                  {new Date(venue.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
              </span>
              <span>
                Data licensed under{' '}
                <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>
              </span>
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="venue-sidebar">
            {venue.latitude && venue.longitude && (
              <div className="venue-map" itemProp="geo" itemScope itemType="https://schema.org/GeoCoordinates">
                <meta itemProp="latitude" content={venue.latitude} />
                <meta itemProp="longitude" content={venue.longitude} />
                <MapContainer
                  center={[parseFloat(venue.latitude), parseFloat(venue.longitude)]}
                  zoom={16}
                  style={{ height: '220px', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={[parseFloat(venue.latitude), parseFloat(venue.longitude)]} />
                </MapContainer>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${venue.latitude}&mlon=${venue.longitude}&zoom=16`}
                  target="_blank" rel="noreferrer" className="osm-link"
                >
                  View on OpenStreetMap ↗
                </a>
                <a
                  href={`https://maps.google.com/?q=${venue.latitude},${venue.longitude}`}
                  target="_blank" rel="noreferrer" className="osm-link"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  Open on Google Maps ↗
                </a>
              </div>
            )}

            <div className="venue-info-box">
              <div className="info-box-title">About this venue</div>
              <table className="info-table">
                <tbody>
                  <tr>
                    <td>Categories</td>
                    <td>
                      {venue.categories?.map((cat, i) => (
                        <span key={cat.category_slug}>
                          {i > 0 && ', '}
                          <Link to={`/category/${cat.category_slug}`}>{cat.category_name}</Link>
                        </span>
                      ))}
                    </td>
                  </tr>
                  {venue.average_rating && (
                    <tr>
                      <td>Rating</td>
                      <td><span className="info-rating">{venue.average_rating} ★ ({venue.rating_count})</span></td>
                    </tr>
                  )}
                  {venue.contributors && venue.contributors.length > 0 && (
                    <tr>
                      <td>Contributors</td>
                      <td>
                        {venue.contributors.map((c, i) => (
                          <span key={i}>
                            {i > 0 && ', '}
                            <Link to={`/profile/${c.username}`} className="contributor-link">@{c.username}</Link>
                          </span>
                        ))}
                      </td>
                    </tr>
                  )}
                  {venue.city && (
                    <tr>
                      <td>City</td>
                      <td>
                        <Link to={`/city/${venue.city.toLowerCase().replace(/\s+/g, '-')}`}>
                          {venue.city}
                        </Link>
                      </td>
                    </tr>
                  )}
                  {venue.country && <tr><td>Country</td><td>{venue.country}</td></tr>}
                  {venue.latitude && (
                    <tr>
                      <td>Coordinates</td>
                      <td className="venue-coords">{venue.latitude}, {venue.longitude}</td>
                    </tr>
                  )}
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
          </aside>
        </div>
      </main>
    </div>
  )
}

export default VenuePage