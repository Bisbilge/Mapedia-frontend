// src/pages/CategoryVenuesPage.jsx

import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import { SkeletonPage } from '../components/Skeleton'
import api from '../api/client'
import '../styles/wiki.css'
import '../styles/CategoryVenuesPage.css'

const PAGE_SIZE = 20

function CategoryVenuesPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [category, setCategory] = useState(null)
  const [venues, setVenues] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const city = searchParams.get('city') || ''
  const sortBy = searchParams.get('sort') || '-created_at'

  const [searchInput, setSearchInput] = useState(search)
  const [cityInput, setCityInput] = useState(city)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({
      category: slug,
      page: page.toString(),
      page_size: PAGE_SIZE.toString(),
    })
    if (search) params.append('search', search)
    if (city) params.append('city', city)
    if (sortBy) params.append('ordering', sortBy)

    Promise.all([
      api.get(`/categories/${slug}/`),
      api.get(`/venues/?${params.toString()}`)
    ])
      .then(([catRes, venuesRes]) => {
        setCategory(catRes.data)
        setVenues(venuesRes.data.results || venuesRes.data || [])
        setTotalCount(venuesRes.data.count || venuesRes.data.length || 0)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load venues.')
        setLoading(false)
      })
  }, [slug, page, search, city, sortBy])

  const updateFilters = (newParams) => {
    const current = Object.fromEntries(searchParams.entries())
    const updated = { ...current, ...newParams, page: '1' }
    Object.keys(updated).forEach(key => { if (!updated[key]) delete updated[key] })
    setSearchParams(updated)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateFilters({ search: searchInput, city: cityInput })
  }

  const handleSort = (newSort) => { updateFilters({ sort: newSort }) }

  const clearFilters = () => {
    setSearchInput('')
    setCityInput('')
    setSearchParams({})
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const hasFilters = search || city

  const handleExport = async (format) => {
    const params = new URLSearchParams({ category: slug, page_size: '2000' })
    if (search) params.append('search', search)
    if (city) params.append('city', city)
    const res = await api.get(`/venues/?${params.toString()}`)
    const all = res.data.results || res.data || []

    if (format === 'csv') {
      const cols = ['id', 'name', 'city', 'country', 'latitude', 'longitude', 'address', 'website', 'slug']
      const header = cols.join(',')
      const rows = all.map(v =>
        cols.map(c => {
          const val = v[c] ?? ''
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        }).join(',')
      )
      const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slug}-venues.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const geojson = {
        type: 'FeatureCollection',
        features: all
          .filter(v => v.latitude && v.longitude)
          .map(v => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [parseFloat(v.longitude), parseFloat(v.latitude)] },
            properties: { id: v.id, name: v.name, slug: v.slug, city: v.city, country: v.country, address: v.address }
          }))
      }
      const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slug}-venues.geojson`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const getPageUrl = (pageNum) => {
    const current = Object.fromEntries(searchParams.entries())
    const updated = new URLSearchParams({ ...current, page: pageNum.toString() })
    return `/category/${slug}/venues?${updated.toString()}`
  }

  const getPageNumbers = () => {
    const delta = 2
    const range = []
    const left = Math.max(1, page - delta)
    const right = Math.min(totalPages, page + delta)
    for (let i = left; i <= right; i++) range.push(i)
    if (left > 2) range.unshift('...')
    if (left > 1) range.unshift(1)
    if (right < totalPages - 1) range.push('...')
    if (right < totalPages) range.push(totalPages)
    return range
  }

  const pageTitle = page > 1
    ? `${category?.name} Venues — Page ${page} | Mapedia`
    : `All ${category?.name} Venues | Mapedia`
  const pageDesc = category
    ? `Browse all ${category.name} venues on Mapedia. ${totalCount > 0 ? `${totalCount} verified locations` : 'Community-maintained locations'} with maps, details, and reviews.`
    : 'Browse venues on Mapedia.'

  if (loading && !category) {
    return <div><Navbar /><div style={{ padding: 48, textAlign: 'center', color: 'var(--text-light)' }}><SkeletonPage /></div></div>
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <main className="wiki-page">
          <p style={{ color: 'var(--text-light)', padding: '48px 0' }}>{error}</p>
          <Link to={`/category/${slug}`} className="wiki-btn-secondary" style={{ display: 'inline-block', width: 'auto' }}>← Back to category</Link>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="robots" content={hasFilters ? 'noindex, follow' : 'index, follow'} />
        <link rel="canonical" href={`https://mapedia.org/category/${slug}/venues${page > 1 ? `?page=${page}` : ''}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={`https://mapedia.org/category/${slug}/venues`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
      </Helmet>

      <Navbar />

      <main className="wiki-page" style={{ maxWidth: 1040 }}>

        {/* Title bar */}
        <div className="wiki-title-bar">
          <nav className="wiki-breadcrumb">
            <Link to="/">Mapedia</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <Link to="/categories">Categories</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <Link to={`/category/${slug}`}>{category?.name}</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <span>Venues</span>
          </nav>
          <h1>
            {category?.icon && <span style={{ marginRight: 10 }}>{category.icon}</span>}
            {category?.name} Venues
          </h1>
          <p>{totalCount} venue{totalCount !== 1 ? 's' : ''} in this category</p>
        </div>

        <div className="wiki-portal">

          {/* ── LEFT: Main content ── */}
          <div className="wiki-col-main">

            {/* Toolbar */}
            <div className="wiki-box">
              <div style={{ padding: '10px 12px', background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)' }}>
                <form onSubmit={handleSearch} className="catvenues-filters">
                  <input
                    type="text"
                    placeholder="Search venues..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="catvenues-search"
                  />
                  <input
                    type="text"
                    placeholder="City..."
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="catvenues-city"
                  />
                  <button type="submit" className="catvenues-search-btn">Search</button>
                  {hasFilters && (
                    <button type="button" onClick={clearFilters} className="catvenues-clear-btn">Clear</button>
                  )}
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value)}
                    className="catvenues-sort"
                    style={{ marginLeft: 8 }}
                  >
                    <option value="-created_at">Newest</option>
                    <option value="created_at">Oldest</option>
                    <option value="name">Name A–Z</option>
                    <option value="-name">Name Z–A</option>
                    <option value="city">City A–Z</option>
                  </select>
                </form>
              </div>

              {/* Results info */}
              {hasFilters && (
                <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-light)', borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)' }}>
                  Showing {venues.length} of {totalCount} results
                  {search && <span> for "{search}"</span>}
                  {city && <span> in {city}</span>}
                </div>
              )}

              {/* Venues table */}
              {loading ? (
                <div style={{ padding: 24 }}><SkeletonPage /></div>
              ) : venues.length === 0 ? (
                <div className="catvenues-empty">
                  <p>No venues found{hasFilters ? ' matching your filters' : ''}.</p>
                  {hasFilters && (
                    <button onClick={clearFilters} className="catvenues-clear-btn">Clear filters</button>
                  )}
                  <Link to={`/contribute?category=${slug}`} className="catvenues-add-link" style={{ marginTop: 12 }}>
                    + Add the first venue
                  </Link>
                </div>
              ) : (
                <>
                  <table className="catvenues-table">
                    <thead>
                      <tr>
                        <th>Venue</th>
                        <th>City</th>
                        <th>Country</th>
                      </tr>
                    </thead>
                    <tbody>
                      {venues.map(venue => (
                        <tr key={venue.id}>
                          <td>
                            <Link to={`/venue/${venue.slug}`} className="catvenues-venue-link">
                              {venue.name}
                            </Link>
                          </td>
                          <td style={{ color: 'var(--text-light)', fontSize: 13 }}>{venue.city || '—'}</td>
                          <td style={{ color: 'var(--text-light)', fontSize: 13 }}>{venue.country || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="catvenues-pagination">
                      {page > 1 ? (
                        <Link to={getPageUrl(page - 1)} className="catvenues-page-btn" onClick={() => window.scrollTo(0, 0)}>← Prev</Link>
                      ) : (
                        <button className="catvenues-page-btn" disabled>← Prev</button>
                      )}
                      <div className="catvenues-page-numbers">
                        {getPageNumbers().map((num, i) =>
                          num === '...' ? (
                            <span key={`dots-${i}`} className="catvenues-page-dots">…</span>
                          ) : (
                            <Link
                              key={num}
                              to={getPageUrl(num)}
                              className={`catvenues-page-btn ${page === num ? 'active' : ''}`}
                              onClick={() => window.scrollTo(0, 0)}
                            >
                              {num}
                            </Link>
                          )
                        )}
                      </div>
                      {page < totalPages ? (
                        <Link to={getPageUrl(page + 1)} className="catvenues-page-btn" onClick={() => window.scrollTo(0, 0)}>Next →</Link>
                      ) : (
                        <button className="catvenues-page-btn" disabled>Next →</button>
                      )}
                      <span className="catvenues-page-info">Page {page} of {totalPages}</span>
                    </div>
                  )}
                </>
              )}

              {/* Footer actions */}
              <div className="catvenues-footer-actions">
                <Link to={`/category/${slug}/map`} className="catvenues-map-btn">View on Map</Link>
                <Link to={`/contribute?category=${slug}`} className="catvenues-add-btn">+ Add Venue</Link>
                <div className="catvenues-export-group">
                  <span className="catvenues-export-label">Export:</span>
                  <button className="catvenues-export-btn" onClick={() => handleExport('csv')}>CSV</button>
                  <button className="catvenues-export-btn" onClick={() => handleExport('geojson')}>GeoJSON</button>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="wiki-col-side">

            <div className="wiki-box">
              <div className="wiki-box-header wiki-box-header-accent">
                <h2>Actions</h2>
              </div>
              <div className="wiki-side-actions">
                <Link to={`/contribute?category=${slug}`} className="wiki-btn-primary">+ Add a Venue</Link>
                <Link to={`/category/${slug}/map`} className="wiki-btn-secondary">Open Map</Link>
                <Link to={`/category/${slug}`} className="wiki-btn-secondary">Category Overview</Link>
              </div>
            </div>

            {category && (
              <div className="wiki-infobox">
                <div className="wiki-infobox-title">About this category</div>
                <table>
                  <tbody>
                    <tr><td>Category</td><td>{category.name}</td></tr>
                    <tr><td>Venues</td><td>{totalCount}</td></tr>
                    {category.owner && (
                      <tr>
                        <td>Owner</td>
                        <td><Link to={`/profile/${category.owner.username}`}>@{category.owner.username}</Link></td>
                      </tr>
                    )}
                    <tr>
                      <td>License</td>
                      <td>
                        <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {category?.description && (
              <div className="wiki-box">
                <div className="wiki-box-header">
                  <h2>Description</h2>
                </div>
                <div className="wiki-box-body">
                  <p>{category.description}</p>
                </div>
              </div>
            )}

          </aside>
        </div>
      </main>
    </div>
  )
}

export default CategoryVenuesPage
