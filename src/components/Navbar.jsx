import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import '../styles/Navbar.css'

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return [dark, setDark]
}

function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('access')
  const username = localStorage.getItem('username')
  const [dark, setDark] = useDarkMode()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ categories: [], venues: [], users: [], cities: [], countries: [] })
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const searchRef = useRef(null)
  const searchTimeout = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [navigate])

  function handleLogout() {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('username')
    navigate('/')
    setMenuOpen(false)
  }

  function handleSearchChange(e) {
    const val = e.target.value
    setQuery(val)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (val.length < 2) {
      setResults({ categories: [], venues: [], users: [], cities: [], countries: [] })
      setShowResults(false)
      return
    }
    searchTimeout.current = setTimeout(() => performSearch(val), 250)
  }

  async function performSearch(searchQuery) {
    setLoading(true)
    const q = searchQuery.toLowerCase()
    try {
      const [catRes, venRes, userRes, cityRes, countryRes] = await Promise.all([
        api.get(`/categories/?search=${encodeURIComponent(searchQuery)}`),
        api.get(`/venues/?search=${encodeURIComponent(searchQuery)}&page_size=5`),
        api.get(`/users/?search=${encodeURIComponent(searchQuery)}`).catch(() => ({ data: [] })),
        api.get(`/cities/?search=${encodeURIComponent(searchQuery)}`),
        api.get(`/countries/?search=${encodeURIComponent(searchQuery)}`),
      ])
      const matchedCities = (cityRes.data || []).slice(0, 4)
      const matchedCountries = (countryRes.data || []).slice(0, 3)
      setResults({
        categories: (catRes.data.results || catRes.data).slice(0, 4),
        venues: (venRes.data.results || venRes.data).slice(0, 4),
        users: (userRes.data.results || userRes.data || []).slice(0, 3),
        cities: matchedCities,
        countries: matchedCountries,
      })
      setShowResults(true)
    } catch {}
    finally { setLoading(false) }
  }

  function handleSelect(type, slug) {
    clearSearch()
    if (type === 'category') navigate(`/category/${slug}`)
    else if (type === 'venue') navigate(`/venue/${slug}`)
    else if (type === 'user') navigate(`/profile/${slug}`)
    else if (type === 'city') navigate(`/city/${slug}`)
    else if (type === 'country') navigate(`/country/${slug}`)
  }

  function clearSearch() {
    setQuery('')
    setResults({ categories: [], venues: [], users: [], cities: [], countries: [] })
    setShowResults(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') clearSearch()
    else if (e.key === 'Enter' && query.trim().length >= 2) {
      clearSearch()
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const hasResults = results.categories.length > 0 || results.venues.length > 0 || results.users.length > 0 || results.cities.length > 0 || results.countries.length > 0

  return (
    <header className="navbar">

      {/* ── MAIN BAR ── */}
      <div className="navbar-main">
        <div className="navbar-main-inner">

          {/* LOGO */}
          <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
            <span className="logo-text">Mapedia</span>
            <span className="logo-tagline">The Free Encyclopedia of Places</span>
          </Link>

          {/* NAV LINKS */}
          <nav className="navbar-site-links">
            <Link to="/categories" className="navbar-site-link">Categories</Link>
            <Link to="/about" className="navbar-site-link">About</Link>
            {token && (
              <>
                <Link to="/feed" className="navbar-site-link">Feed</Link>
                <Link to="/contribute" className="navbar-site-link">Contribute</Link>
                <Link to="/create-category" className="navbar-site-link">New Category</Link>
                <Link to="/moderation" className="navbar-site-link navbar-site-link-mod">Moderation</Link>
              </>
            )}
          </nav>

          {/* SEARCH */}
          <div className="navbar-search" ref={searchRef}>
            <div className="search-wrapper">
              <input
                type="search"
                placeholder="Search places, categories…"
                value={query}
                onChange={handleSearchChange}
                onFocus={() => { if (hasResults) setShowResults(true) }}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                aria-label="Search Mapedia"
              />
              {query && (
                <button className="search-clear" onClick={clearSearch} aria-label="Clear">✕</button>
              )}
              {loading && <span className="search-spinner" />}

              {showResults && (
                <div className="search-dropdown">
                  {!hasResults && query.length >= 2 && !loading && (
                    <div className="search-empty">No results for "{query}"</div>
                  )}

                  {results.venues.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-header">Places</div>
                      {results.venues.map(v => (
                        <button key={`ven-${v.id}`} className="search-item" onClick={() => handleSelect('venue', v.slug)}>
                          <span className="search-item-name">{v.name}</span>
                          <span className="search-item-meta">{[v.city, v.country].filter(Boolean).join(', ')}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.categories.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-header">Categories</div>
                      {results.categories.map(c => (
                        <button key={`cat-${c.id}`} className="search-item" onClick={() => handleSelect('category', c.slug)}>
                          <span className="search-item-name">{c.icon && <span className="search-item-icon">{c.icon}</span>}{c.name}</span>
                          {c.venue_count > 0 && <span className="search-item-meta">{c.venue_count} places</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {results.cities.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-header">Cities</div>
                      {results.cities.map(c => (
                        <button key={`city-${c.city}`} className="search-item" onClick={() => handleSelect('city', c.city.toLowerCase().replace(/\s+/g, '-'))}>
                          <span className="search-item-name">{c.city}</span>
                          <span className="search-item-meta">{c.country} · {c.venue_count} places</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.countries.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-header">Countries</div>
                      {results.countries.map(c => (
                        <button key={`country-${c.country}`} className="search-item" onClick={() => handleSelect('country', c.country.toLowerCase().replace(/\s+/g, '-'))}>
                          <span className="search-item-name">{c.country}</span>
                          <span className="search-item-meta">{c.venue_count} places</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.users.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-header">Users</div>
                      {results.users.map(u => (
                        <button key={`user-${u.id}`} className="search-item" onClick={() => handleSelect('user', u.username)}>
                          <span className="search-item-name">
                            {u.avatar
                              ? <img src={u.avatar} alt="" className="search-user-avatar" />
                              : <span className="search-user-avatar-placeholder">{u.username[0].toUpperCase()}</span>
                            }
                            {u.username}
                          </span>
                          {u.contribution_count > 0 && <span className="search-item-meta">{u.contribution_count} contributions</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {hasResults && (
                    <div className="search-footer">
                      <button className="search-view-all" onClick={() => { clearSearch(); navigate(`/search?q=${encodeURIComponent(query)}`) }}>
                        View all results →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* USER TOOLS */}
          <div className="navbar-user-tools">
            <button
              className="navbar-theme-toggle"
              onClick={() => setDark(d => !d)}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? '☀' : '🌙'}
            </button>
            {token ? (
              <>
                <Link to="/profile" className="navbar-user-link">
                  <span className="navbar-user-initial">{username ? username[0].toUpperCase() : '?'}</span>
                  {username || 'Profile'}
                </Link>
                <button className="navbar-tool-btn" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-tool-link">Log in</Link>
                <Link to="/register" className="navbar-join-link">Join free</Link>
              </>
            )}
          </div>

          {/* HAMBURGER */}
          <button
            className={`navbar-menu-btn ${menuOpen ? 'navbar-menu-btn-open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>

        </div>
      </div>

      {/* ── MOBILE PANEL ── */}
      <nav className={`navbar-mobile-panel ${menuOpen ? 'navbar-mobile-panel-open' : ''}`}>
        <Link to="/categories" className="mobile-link" onClick={() => setMenuOpen(false)}>Categories</Link>
        <Link to="/about" className="mobile-link" onClick={() => setMenuOpen(false)}>About</Link>
        {token && (
          <>
            <Link to="/feed" className="mobile-link" onClick={() => setMenuOpen(false)}>Feed</Link>
            <Link to="/contribute" className="mobile-link" onClick={() => setMenuOpen(false)}>Contribute</Link>
            <Link to="/create-category" className="mobile-link" onClick={() => setMenuOpen(false)}>New Category</Link>
            <Link to="/moderation" className="mobile-link" onClick={() => setMenuOpen(false)}>Moderation</Link>
          </>
        )}
        <div className="mobile-divider" />
        {token ? (
          <>
            <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>
              {username || 'Profile'}
            </Link>
            <button className="mobile-link mobile-link-btn" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Log in</Link>
            <Link to="/register" className="mobile-link mobile-link-join" onClick={() => setMenuOpen(false)}>Join free</Link>
          </>
        )}
        <div className="mobile-divider" />
        <button className="mobile-link mobile-link-btn" onClick={() => setDark(d => !d)}>
          {dark ? '☀ Light mode' : '🌙 Dark mode'}
        </button>
      </nav>

      {menuOpen && <div className="navbar-overlay" onClick={() => setMenuOpen(false)} />}
    </header>
  )
}

export default Navbar
