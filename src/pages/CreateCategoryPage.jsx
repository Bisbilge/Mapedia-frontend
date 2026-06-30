import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import api from '../api/client'
import '../styles/CreateCategoryPage.css'

function toSlug(value) {
  return value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function CreateCategoryPage() {
  const token = localStorage.getItem('access')
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [showSlugInput, setShowSlugInput] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '' })

  function handleChange(e) {
    const { name, value } = e.target
    const updates = { [name]: value }
    if (name === 'name' && !slugEdited) {
      updates.slug = toSlug(value)
    }
    if (name === 'slug') {
      setSlugEdited(true)
    }
    setForm(prev => ({ ...prev, ...updates }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    api.post('/categories/create/', form, {
      headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
      navigate('/category/' + res.data.slug + '/fields')
    }).catch(err => {
      const data = err.response?.data
      if (data?.slug) {
        setError(`A category with the URL "${form.slug}" already exists. Try a more specific name — for example, add your city or a descriptive word (e.g. "${form.slug}-istanbul").`)
      } else if (data?.name) {
        setError(`Name error: ${data.name}`)
      } else {
        setError('Something went wrong. Please try again.')
      }
      setLoading(false)
    })
  }

  if (!token) {
    return (
      <div>
        <Navbar />
        <div className="create-cat-page">
          <div className="create-cat-login-box">
            You need to <Link to="/login">log in</Link> to create a category.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Helmet>
        <title>Create a Category | Mapedia</title>
        <meta name="description" content="Create a new map category on Mapedia. Define what gets mapped, add fields, and grow a community around it." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />

      <div className="create-cat-page">

        <nav className="create-cat-breadcrumb">
          <Link to="/">Mapedia</Link>
          <span className="create-cat-breadcrumb-sep">›</span>
          <Link to="/categories">Categories</Link>
          <span className="create-cat-breadcrumb-sep">›</span>
          <span>Create</span>
        </nav>

        {/* Step indicator */}
        <div className="create-cat-steps">
          <div className="create-cat-step active">
            <div className="create-cat-step-num">1</div>
            <div className="create-cat-step-label">
              <strong>Name your category</strong>
              What are you mapping?
            </div>
          </div>
          <div className="create-cat-step">
            <div className="create-cat-step-num">2</div>
            <div className="create-cat-step-label">
              <strong>Add fields</strong>
              What info to collect?
            </div>
          </div>
        </div>

        <h1 className="create-cat-title">Create a Category</h1>
        <p className="create-cat-subtitle">
          You'll become the owner and moderator. Anyone can contribute places once it's live.
        </p>

        {error && <div className="create-cat-error">{error}</div>}

        <form onSubmit={handleSubmit} className="create-cat-form">

          {/* Name */}
          <div className="create-cat-field">
            <label htmlFor="cat-name">Category name *</label>
            <input
              id="cat-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Free Public Toilets"
              required
              autoFocus
            />
          </div>

          {/* Icon */}
          <div className="create-cat-field">
            <label htmlFor="cat-icon">Icon (emoji)</label>
            <div className="create-cat-icon-row">
              <input
                id="cat-icon"
                type="text"
                name="icon"
                value={form.icon}
                onChange={handleChange}
                placeholder="e.g. 🚻"
                className="create-cat-icon-input"
              />
              <div className="create-cat-icon-preview">
                {form.icon || <span style={{ fontSize: 14 }}>?</span>}
              </div>
            </div>
            <span className="create-cat-hint">Paste any emoji. Shown next to the category name.</span>
          </div>

          {/* Description */}
          <div className="create-cat-field">
            <label htmlFor="cat-desc">Description</label>
            <textarea
              id="cat-desc"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What kind of places does this category cover? Who is it for?"
            />
          </div>

          {/* URL preview / slug */}
          <div className="create-cat-field">
            <label>Category URL</label>
            {showSlugInput ? (
              <div className="create-cat-slug-input">
                <span className="create-cat-slug-prefix">mapedia.org/category/</span>
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="create-cat-slug-field"
                  placeholder="free-toilets"
                  required
                />
              </div>
            ) : (
              <div className="create-cat-url-preview">
                <span>mapedia.org/category/</span>
                <code>{form.slug || '…'}</code>
                <button
                  type="button"
                  className="create-cat-url-edit-btn"
                  onClick={() => setShowSlugInput(true)}
                >
                  change
                </button>
              </div>
            )}
            <span className="create-cat-hint">Auto-generated from the name. Only change it if you need something specific.</span>
          </div>

          <button type="submit" className="create-cat-submit" disabled={loading || !form.name.trim()}>
            {loading ? 'Creating…' : 'Create Category →'}
          </button>

        </form>
      </div>
    </div>
  )
}

export default CreateCategoryPage
