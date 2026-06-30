// src/pages/SearchResultsPage.jsx

import { useState, useEffect, lazy, Suspense } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import { SkeletonPage } from '../components/Skeleton'
import api from '../api/client'
import '../styles/wiki.css'
import '../styles/SearchResultsPage.css'

const SearchMap = lazy(() => import('../components/SearchMap'))

const PAGE_SIZE = 20

function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'all'
  const page = parseInt(searchParams.get('page') || '1')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius') || '5'
  const isNearby = !!(lat && lng)

  const [venues, setVenues] = useState([])
  const [categories, setCategories] = useState([])
  const [venueCount, setVenueCount] = useState(0)
  const [categoryCount, setCategoryCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [queryInput, setQueryInput] = useState(query)
  const [showMap, setShowMap] = useState(isNearby)

  useEffect(() => {
    setQueryInput(query)
  }, [query])

  useEffect(() => {
    if (!query.trim() && !isNearby) return

    setLoading(true)

    const promises = []

    if (type === 'all' || type === 'venues') {
      const p = { page: page.toString(), page_size: PAGE_SIZE.toString() }
      if (query.trim()) p.search = query
      if (isNearby) { p.lat = lat; p.lng = lng; p.radius = radius }
      const params = new URLSearchParams(p)
      promises.push(api.get(`/venues/?${params}`))
    } else {
      promises.push(Promise.resolve({ data: { results: [], count: 0 } }))
    }

    if (!isNearby && (type === 'all' || type === 'categories')) {
      const params = new URLSearchParams({ search: query, page: page.toString(), page_size: PAGE_SIZE.toString() })
      promises.push(api.get(`/categories/?${params}`))
    } else {
      promises.push(Promise.resolve({ data: { results: [], count: 0 } }))
    }

    Promise.all(promises)
      .then(([venueRes, catRes]) => {
        const venueData = venueRes.data
        const catData = catRes.data

        setVenues(venueData.results || venueData || [])
        setVenueCount(venueData.count || (venueData.results ? venueData.count : venueData.length) || 0)

        setCategories(catData.results || catData || [])
        setCategoryCount(catData.count || (catData.results ? catData.count : catData.length) || 0)
      })
      .catch((err) => { console.error('Search failed:', err) })
      .finally(() => setLoading(false))
  }, [query, type, page, lat, lng, radius])

  const updateSearch = (newParams) => {
    const current = Object.fromEntries(searchParams.entries())
    const updated = { ...current, ...newParams, page: '1' }
    Object.keys(updated).forEach(key => { if (!updated[key]) delete updated[key] })
    setSearchParams(updated)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (queryInput.trim()) {
      updateSearch({ q: queryInput.trim() })
    }
  }

  const getPageUrl = (pageNum) => {
    const current = Object.fromEntries(searchParams.entries())
    const updated = new URLSearchParams({ ...current, page: pageNum.toString() })
    return `/search?${updated.toString()}`
  }

  const totalCount = type === 'venues' ? venueCount : type === 'categories' ? categoryCount : venueCount + categoryCount
  const totalPages = Math.ceil((type === 'venues' ? venueCount : type === 'categories' ? categoryCount : Math.max(venueCount, categoryCount)) / PAGE_SIZE)

  const pageTitle = isNearby
    ? `Venues Near You | Mapedia`
    : query
      ? `Search: "${query}" | Mapedia`
      : 'Search | Mapedia'

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={`Search results for "${query}" on Mapedia.`} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />

      <main className="wiki-page" style={{ maxWidth: 1040 }}>

        <div className="wiki-title-bar">
          <nav className="wiki-breadcrumb">
            <Link to="/">Mapedia</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <span>Search</span>
          </nav>
          <h1>
            {isNearby ? 'Venues Near You' : query ? <>Results for "<em>{query}</em>"</> : 'Search'}
          </h1>
          {(query || isNearby) && !loading && (
            <p>{venueCount} venue{venueCount !== 1 ? 's' : ''}{isNearby ? ` within ${radius} km` : ''}</p>
          )}
        </div>

        <div className="wiki-portal">

          {/* ── LEFT: Results ── */}
          <div className="wiki-col-main">

            {/* Search bar */}
            <div className="wiki-box">
              <div style={{ padding: '10px 12px', background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)' }}>
                <form onSubmit={handleSearch} className="search-form">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search venues and categories..."
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    autoFocus={!query}
                  />
                  <button type="submit" className="search-btn">Search</button>
                </form>
              </div>

              {/* Type filter */}
              {query && (
                <div className="search-type-filter">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'venues', label: `Venues${venueCount ? ` (${venueCount})` : ''}` },
                    { key: 'categories', label: `Categories${categoryCount ? ` (${categoryCount})` : ''}` },
                  ].map(t => (
                    <button
                      key={t.key}
                      className={`search-type-btn ${type === t.key ? 'active' : ''}`}
                      onClick={() => updateSearch({ type: t.key })}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Map toggle */}
            {query && venues.length > 0 && venues.some(v => v.latitude && v.longitude) && (
              <div style={{ padding: '6px 12px', borderBottom: showMap ? '1px solid var(--border)' : 'none' }}>
                <button
                  className="search-map-toggle"
                  onClick={() => setShowMap(v => !v)}
                >
                  {showMap ? '▲ Hide Map' : '▼ Show Map'}
                </button>
              </div>
            )}
            {showMap && (
              <Suspense fallback={<div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading map…</div>}>
                <SearchMap venues={venues.filter(v => v.latitude && v.longitude)} />
              </Suspense>
            )}

            {/* Results */}
            {!query ? (
              <div className="wiki-box">
                <div className="wiki-box-body">
                  <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '32px 0' }}>
                    Enter a search term to find venues and categories.
                  </p>
                </div>
              </div>
            ) : loading ? (
              <div className="wiki-box" style={{ padding: 24 }}>
                <SkeletonPage />
              </div>
            ) : (
              <>
                {/* Venue results */}
                {(type === 'all' || type === 'venues') && venues.length > 0 && (
                  <div className="wiki-box" style={{ marginBottom: 16 }}>
                    <div className="wiki-box-header">
                      <h2>Venues <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-light)' }}>({venueCount})</span></h2>
                    </div>
                    <div className="search-results-table-wrap">
                    <table className="search-results-table">
                      <thead>
                        <tr>
                          <th>Venue</th>
                          <th>City</th>
                          <th>Country</th>
                          <th>Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {venues.map(venue => (
                          <tr key={venue.id}>
                            <td>
                              <Link to={`/venue/${venue.slug}`} className="search-result-link">
                                {venue.name}
                              </Link>
                            </td>
                            <td style={{ color: 'var(--text-light)', fontSize: 13 }}>{venue.city || '—'}</td>
                            <td style={{ color: 'var(--text-light)', fontSize: 13 }}>{venue.country || '—'}</td>
                            <td style={{ fontSize: 13 }}>
                              {venue.categories?.length > 0 ? (
                                <Link to={`/category/${venue.categories[0].category_slug}`} style={{ color: 'var(--link)' }}>
                                  {venue.categories[0].category_name}
                                </Link>
                              ) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                    {type === 'all' && venueCount > PAGE_SIZE && (
                      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
                        <button className="search-more-btn" onClick={() => updateSearch({ type: 'venues' })}>
                          View all {venueCount} venues →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Category results */}
                {(type === 'all' || type === 'categories') && categories.length > 0 && (
                  <div className="wiki-box" style={{ marginBottom: 16 }}>
                    <div className="wiki-box-header">
                      <h2>Categories <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-light)' }}>({categoryCount})</span></h2>
                    </div>
                    <div className="search-results-table-wrap">
                    <table className="search-results-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Venues</th>
                          <th>Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map(cat => (
                          <tr key={cat.id}>
                            <td>
                              <Link to={`/category/${cat.slug}`} className="search-result-link">
                                {cat.icon && <span style={{ marginRight: 6 }}>{cat.icon}</span>}
                                {cat.name}
                              </Link>
                              {cat.description && (
                                <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>
                                  {cat.description.length > 80 ? cat.description.slice(0, 80) + '...' : cat.description}
                                </div>
                              )}
                            </td>
                            <td style={{ color: 'var(--text-light)', fontSize: 13 }}>{cat.venue_count || 0}</td>
                            <td style={{ fontSize: 13 }}>
                              {cat.owner_username ? (
                                <Link to={`/profile/${cat.owner_username}`} style={{ color: 'var(--text-light)' }}>
                                  @{cat.owner_username}
                                </Link>
                              ) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                    {type === 'all' && categoryCount > PAGE_SIZE && (
                      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
                        <button className="search-more-btn" onClick={() => updateSearch({ type: 'categories' })}>
                          View all {categoryCount} categories →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* No results */}
                {venues.length === 0 && categories.length === 0 && (
                  <div className="wiki-box">
                    <div className="wiki-box-body">
                      <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '32px 0' }}>
                        No results found for "<strong>{query}</strong>".
                      </p>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <Link to="/categories" className="wiki-btn-secondary" style={{ display: 'inline-block', width: 'auto' }}>Browse Categories</Link>
                        <Link to="/contribute" className="wiki-btn-primary" style={{ display: 'inline-block', width: 'auto' }}>+ Add a Venue</Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pagination (single-type views) */}
                {type !== 'all' && totalPages > 1 && (
                  <div className="search-pagination">
                    {page > 1 ? (
                      <Link to={getPageUrl(page - 1)} className="catvenues-page-btn">← Prev</Link>
                    ) : (
                      <button className="catvenues-page-btn" disabled>← Prev</button>
                    )}
                    <span className="catvenues-page-info">Page {page} of {totalPages}</span>
                    {page < totalPages ? (
                      <Link to={getPageUrl(page + 1)} className="catvenues-page-btn">Next →</Link>
                    ) : (
                      <button className="catvenues-page-btn" disabled>Next →</button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="wiki-col-side">

            <div className="wiki-box">
              <div className="wiki-box-header wiki-box-header-accent">
                <h2>Search Tips</h2>
              </div>
              <div className="wiki-box-body">
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <li>Search by venue name, city, or country</li>
                  <li>Search by category name or description</li>
                  <li>Use the type filter to narrow results</li>
                </ul>
              </div>
            </div>

            {query && (
              <div className="wiki-infobox">
                <div className="wiki-infobox-title">Search Results</div>
                <table>
                  <tbody>
                    <tr><td>Query</td><td>"{query}"</td></tr>
                    <tr><td>Venues</td><td>{venueCount}</td></tr>
                    <tr><td>Categories</td><td>{categoryCount}</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>Explore</h2>
              </div>
              <div className="wiki-box-body">
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                  <li><Link to="/categories">All Categories</Link></li>
                  <li><Link to="/contribute">Add a Venue</Link></li>
                  <li><Link to="/create-category">Create a Category</Link></li>
                </ul>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  )
}

export default SearchResultsPage
