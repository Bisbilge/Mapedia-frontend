import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/client'
import '../styles/wiki.css'
import '../styles/ModeratorsPage.css'

function ModeratorsPage() {
  const { categorySlug } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('access')
  const [moderators, setModerators] = useState([])
  const [newUserId, setNewUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(function() {
    if (!token) {
      navigate('/login')
      return
    }
    loadModerators()
  }, [categorySlug])

  function loadModerators() {
    api.get('/categories/' + categorySlug + '/moderators/', {
      headers: { Authorization: 'Bearer ' + token }
    }).then(function(res) {
      setModerators(res.data)
      setLoading(false)
    }).catch(function(err) {
      if (err.response && err.response.status === 403) {
        navigate('/moderation')
      }
      setLoading(false)
    })
  }

  function handleAdd() {
    setError('')
    setSuccess('')
    if (!newUserId.trim()) return

    api.post('/categories/' + categorySlug + '/moderators/add/', {
      user_id: newUserId
    }, {
      headers: { Authorization: 'Bearer ' + token }
    }).then(function(res) {
      setSuccess(res.data.username + ' added as moderator.')
      setNewUserId('')
      loadModerators()
    }).catch(function(err) {
      setError(err.response ? JSON.stringify(err.response.data) : 'Error.')
    })
  }

  function handleRemove(userId, username) {
    setError('')
    setSuccess('')
    api.post('/categories/' + categorySlug + '/moderators/remove/', {
      user_id: userId
    }, {
      headers: { Authorization: 'Bearer ' + token }
    }).then(function() {
      setSuccess(username + ' removed.')
      loadModerators()
    }).catch(function(err) {
      setError(err.response ? JSON.stringify(err.response.data) : 'Error.')
    })
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="mods-loading">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <main className="wiki-page" style={{ maxWidth: 1040 }}>

        <div className="wiki-title-bar">
          <nav className="wiki-breadcrumb">
            <Link to="/">Mapedia</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <Link to="/moderation">Moderation</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <Link to={'/moderation/' + categorySlug}>{categorySlug}</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <span>Moderators</span>
          </nav>
          <h1>Manage Moderators</h1>
          <p>Category: <strong>{categorySlug}</strong></p>
        </div>

        <div className="wiki-portal">

          {/* ── LEFT: Main ── */}
          <div className="wiki-col-main">

            {error && <div className="mods-error" style={{ marginBottom: 12 }}>{error}</div>}
            {success && <div className="mods-success" style={{ marginBottom: 12 }}>{success}</div>}

            {/* Current Moderators */}
            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>Current Moderators</h2>
              </div>
              <div className="wiki-box-body">
                {moderators.length === 0 ? (
                  <p className="mods-empty">No moderators yet.</p>
                ) : (
                  <ul className="mods-list">
                    {moderators.map(function(mod) {
                      return (
                        <li key={mod.id} className="mods-list-item">
                          <span className="mods-username">{mod.username}</span>
                          <span className="mods-user-id">ID: {mod.id}</span>
                          <button
                            className="mods-remove-btn"
                            onClick={function() { handleRemove(mod.id, mod.username) }}
                          >
                            Remove
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Add Moderator */}
            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>Add Moderator</h2>
              </div>
              <div className="wiki-box-body">
                <p className="mods-hint" style={{ marginBottom: 12 }}>Enter the user ID of the person you want to add.</p>
                <div className="mods-add-row">
                  <input
                    type="number"
                    placeholder="User ID"
                    value={newUserId}
                    onChange={function(e) { setNewUserId(e.target.value) }}
                    className="mods-input"
                  />
                  <button onClick={handleAdd} className="mods-add-btn">Add</button>
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
                <Link to={'/moderation/' + categorySlug} className="wiki-btn-secondary">← Back to Moderation</Link>
                <Link to={'/category/' + categorySlug} className="wiki-btn-secondary">View Category</Link>
              </div>
            </div>

            <div className="wiki-infobox">
              <div className="wiki-infobox-title">About Moderators</div>
              <table>
                <tbody>
                  <tr><td>Category</td><td>{categorySlug}</td></tr>
                  <tr><td>Total mods</td><td>{moderators.length}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>Note</h2>
              </div>
              <div className="wiki-box-body">
                <p style={{ fontSize: 13, color: 'var(--text-light)', margin: 0 }}>
                  Moderators can approve and reject contributions. Only the category owner can add or remove moderators.
                </p>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  )
}

export default ModeratorsPage
