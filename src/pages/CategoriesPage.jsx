// src/pages/CategoriesPage.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import { SkeletonPage } from '../components/Skeleton'
import api from '../api/client'
import '../styles/wiki.css'
import '../styles/CategoriesPage.css'

const PAGE_SIZE = 24

function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('-venue_count')
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState({ totalVenues: 0, totalCategories: 0 })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await api.get('/categories/')
      const data = res.data.results || res.data
      setCategories(data)
      const totalVenues = data.reduce((sum, cat) => sum + (cat.venue_count || 0), 0)
      setStats({ totalCategories: data.length, totalVenues })
    } catch (err) {
      console.error('Categories load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(cat => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q) ||
      cat.slug?.toLowerCase().includes(q)
    )
  })

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === '-name') return b.name.localeCompare(a.name)
    if (sortBy === '-venue_count') return (b.venue_count || 0) - (a.venue_count || 0)
    if (sortBy === 'venue_count') return (a.venue_count || 0) - (b.venue_count || 0)
    if (sortBy === '-field_count') return (b.field_count || 0) - (a.field_count || 0)
    if (sortBy === '-created') return new Date(b.created_at) - new Date(a.created_at)
    return 0
  })

  const totalPages = Math.ceil(sortedCategories.length / PAGE_SIZE)
  const paginatedCategories = sortedCategories.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  useEffect(() => { setPage(1) }, [search, sortBy])

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

  const topCategories = [...categories]
    .sort((a, b) => (b.venue_count || 0) - (a.venue_count || 0))
    .slice(0, 3)
    .map(c => c.id)

  return (
    <div>
      <Helmet>
        <title>All Categories | Mapedia</title>
        <meta name="description" content="Browse all community-maintained place categories on Mapedia — water fountains, free toilets, laptop-friendly cafes, and more. Free geodata under CC BY-SA 4.0." />
        <link rel="canonical" href="https://mapedia.org/categories" />
        <meta property="og:title" content="All Categories | Mapedia" />
        <meta property="og:description" content="Browse all community-maintained place categories on Mapedia. Free geodata under CC BY-SA 4.0." />
        <meta property="og:url" content="https://mapedia.org/categories" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="All Categories | Mapedia" />
        <meta name="twitter:description" content="Browse all community-maintained place categories on Mapedia." />
      </Helmet>
      <Navbar />

      <main className="wiki-page" style={{ maxWidth: 1040 }}>

        {/* Title bar */}
        <div className="wiki-title-bar">
          <div className="wiki-breadcrumb">
            <Link to="/">Mapedia</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <span>Categories</span>
          </div>
          <h1>Categories</h1>
          <p>Community-maintained place categories, each with its own data schema and moderators.</p>
        </div>

        {/* Stats */}
        <div className="categories-stats">
          <div className="categories-stat">
            <span className="categories-stat-value">{stats.totalCategories}</span>
            <span className="categories-stat-label">Categories</span>
          </div>
          <div className="categories-stat">
            <span className="categories-stat-value">{stats.totalVenues.toLocaleString()}</span>
            <span className="categories-stat-label">Total Venues</span>
          </div>
          <div className="categories-stat">
            <span className="categories-stat-value">{categories.filter(c => c.venue_count > 0).length}</span>
            <span className="categories-stat-label">Active</span>
          </div>
        </div>

        <div className="wiki-portal">

          {/* ── LEFT: Table ── */}
          <div className="wiki-col-main">

            <div className="wiki-box">
              {/* Toolbar inside box header area */}
              <div className="categories-toolbar-wrap">
                <div className="categories-toolbar">
                  <input
                    type="text"
                    className="categories-search"
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select
                    className="categories-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="-venue_count">Most venues</option>
                    <option value="venue_count">Fewest venues</option>
                    <option value="name">Name A–Z</option>
                    <option value="-name">Name Z–A</option>
                    <option value="-field_count">Most fields</option>
                    <option value="-created">Newest</option>
                  </select>
                </div>
              </div>

              {/* Results info */}
              {search && (
                <div className="categories-results-info">
                  {filteredCategories.length} result{filteredCategories.length !== 1 ? 's' : ''} for "{search}"
                  <button className="categories-clear-search" onClick={() => setSearch('')}>Clear</button>
                </div>
              )}

              {/* Content */}
              {loading ? (
                <div style={{ padding: 24 }}><SkeletonPage /></div>
              ) : paginatedCategories.length === 0 ? (
                <div className="categories-empty">
                  {search ? (
                    <>
                      <p>No categories match "{search}"</p>
                      <button className="categories-clear-btn" onClick={() => setSearch('')}>Clear search</button>
                    </>
                  ) : (
                    <>
                      <p>No categories yet.</p>
                      <Link to="/create-category" className="categories-create-link">Create the first one →</Link>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="categories-table-wrapper">
                    <table className="categories-table" style={{ border: 'none' }}>
                      <thead>
                        <tr>
                          <th className="col-name">Category</th>
                          <th className="col-venues">Venues</th>
                          <th className="col-fields">Fields</th>
                          <th className="col-owner">Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCategories.map(cat => (
                          <tr key={cat.id} className={topCategories.includes(cat.id) ? 'top-category' : ''}>
                            <td className="col-name">
                              <Link to={`/category/${cat.slug}`} className="category-link">
                                {cat.icon && <span className="category-icon">{cat.icon}</span>}
                                <div className="category-info">
                                  <span className="category-name">{cat.name}</span>
                                  {cat.description && (
                                    <span className="category-desc">
                                      {cat.description.length > 80 ? cat.description.slice(0, 80) + '...' : cat.description}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            </td>
                            <td className="col-venues">
                              <span className={`venue-count ${cat.venue_count > 0 ? 'has-venues' : 'no-venues'}`}>
                                {cat.venue_count || 0}
                              </span>
                            </td>
                            <td className="col-fields">
                              <span className="field-count">
                                {cat.field_count || cat.field_definitions?.length || '—'}
                              </span>
                            </td>
                            <td className="col-owner">
                              {cat.owner_username ? (
                                <Link to={`/profile/${cat.owner_username}`} className="owner-link">
                                  @{cat.owner_username}
                                </Link>
                              ) : (
                                <span className="no-owner">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="categories-pagination">
                      <button
                        className="categories-page-btn"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        ← Prev
                      </button>
                      <div className="categories-page-numbers">
                        {getPageNumbers().map((num, i) =>
                          num === '...' ? (
                            <span key={`dots-${i}`} className="categories-page-dots">…</span>
                          ) : (
                            <button
                              key={num}
                              className={`categories-page-btn ${page === num ? 'categories-page-btn-active' : ''}`}
                              onClick={() => setPage(num)}
                            >
                              {num}
                            </button>
                          )
                        )}
                      </div>
                      <button
                        className="categories-page-btn"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next →
                      </button>
                      <span className="categories-page-info">
                        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sortedCategories.length)} of {sortedCategories.length}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="wiki-col-side">

            <div className="wiki-box">
              <div className="wiki-box-header wiki-box-header-accent">
                <h2>Contribute</h2>
              </div>
              <div className="wiki-side-actions">
                <Link to="/create-category" className="wiki-btn-primary">+ Create Category</Link>
                <Link to="/contribute" className="wiki-btn-secondary">Add a Venue</Link>
              </div>
            </div>

            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>About Categories</h2>
              </div>
              <div className="wiki-box-body">
                <p>
                  Categories on Mapedia are community-created and maintained. Each category
                  can define custom fields relevant to its type of places — for example, a
                  "Cafes" category might track Wi-Fi, outdoor seating, and price range.
                </p>
                <p>
                  Anyone can create a new category and become its owner and moderator.
                  All data is licensed under{' '}
                  <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>.
                </p>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  )
}

export default CategoriesPage
