// src/pages/LeaderboardPage.jsx

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import api from '../api/client'
import '../styles/wiki.css'
import '../styles/LeaderboardPage.css'

const PAGE_SIZE = 20

function LeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1')
  const ordering = searchParams.get('ordering') || '-contribution_count'

  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/users/list/', { params: { page, page_size: PAGE_SIZE, ordering } })
      .then(res => {
        setUsers(res.data.results || [])
        setTotal(res.data.count || 0)
        setTotalPages(res.data.total_pages || 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, ordering])

  const setOrdering = (ord) => {
    setSearchParams({ ordering: ord, page: '1' })
  }

  const getPageUrl = (p) => {
    const params = new URLSearchParams({ ordering, page: p.toString() })
    return `/leaderboard?${params.toString()}`
  }

  const rank = (idx) => (page - 1) * PAGE_SIZE + idx + 1

  const SORT_OPTIONS = [
    { value: '-contribution_count', label: 'Contributions' },
    { value: '-ratings_count', label: 'Ratings' },
    { value: '-date_joined', label: 'Newest members' },
  ]

  return (
    <div>
      <Helmet>
        <title>Leaderboard | Mapedia</title>
        <meta name="description" content="Top contributors on Mapedia — community members who have added the most venues and ratings." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />

      <main className="wiki-page" style={{ maxWidth: 900 }}>
        <div className="wiki-title-bar">
          <nav className="wiki-breadcrumb">
            <Link to="/">Mapedia</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <span>Leaderboard</span>
          </nav>
          <h1>Contributor Leaderboard</h1>
          {!loading && <p>{total.toLocaleString()} contributors</p>}
        </div>

        <div className="wiki-box">
          <div style={{ padding: '10px 14px', background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`search-type-btn ${ordering === opt.value ? 'active' : ''}`}
                onClick={() => setOrdering(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-light)' }}>Loading…</div>
          ) : users.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-light)' }}>No users found.</div>
          ) : (
            <table className="lb-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Contributions</th>
                  <th>Ratings</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={rank(i) <= 3 ? `lb-top-${rank(i)}` : ''}>
                    <td className="lb-rank">
                      {rank(i) === 1 ? '1st' : rank(i) === 2 ? '2nd' : rank(i) === 3 ? '3rd' : rank(i)}
                    </td>
                    <td className="lb-user">
                      {u.avatar && (
                        <img src={u.avatar} alt="" className="lb-avatar" />
                      )}
                      <Link to={`/profile/${u.username}`} className="lb-username">
                        @{u.username}
                      </Link>
                      {u.is_trusted && (
                        <span className="lb-trusted">Trusted</span>
                      )}
                    </td>
                    <td className="lb-num">{u.contribution_count.toLocaleString()}</td>
                    <td className="lb-num">{u.ratings_count.toLocaleString()}</td>
                    <td className="lb-date">{new Date(u.date_joined).getFullYear()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="search-pagination" style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
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
        </div>
      </main>
    </div>
  )
}

export default LeaderboardPage
