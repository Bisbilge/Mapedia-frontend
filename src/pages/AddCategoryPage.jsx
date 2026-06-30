import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/client'
import '../styles/wiki.css'
import '../styles/AddCategoryPage.css'

function AddCategoryPage() {
  const { venueSlug } = useParams()
  const navigate = useNavigate()

  const [venue, setVenue] = useState(null)
  const [venueLoading, setVenueLoading] = useState(true)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categoryFields, setCategoryFields] = useState([])
  const [fieldsLoading, setFieldsLoading] = useState(false)

  const [fieldValues, setFieldValues] = useState({})

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const fetchVenue = useCallback(async () => {
    try {
      const res = await api.get(`/venues/${venueSlug}/`)
      setVenue(res.data)
    } catch (err) {
      console.error('Failed to fetch venue:', err)
    } finally {
      setVenueLoading(false)
    }
  }, [venueSlug])

  useEffect(() => { fetchVenue() }, [fetchVenue])

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const t = setTimeout(() => {
      setSearchLoading(true)
      api.get(`/categories/?search=${encodeURIComponent(query)}`)
        .then(res => {
          const categories = res.data.results || res.data
          const existingSlugs = venue?.categories?.map(c => c.category_slug) || []
          const filtered = categories.filter(cat => !existingSlugs.includes(cat.slug))
          setResults(filtered)
        })
        .catch(() => {})
        .finally(() => setSearchLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [query, venue])

  const handleSelectCategory = async (category) => {
    setSelectedCategory(category)
    setFieldValues({})
    setError('')
    setFieldsLoading(true)

    try {
      const res = await api.get(`/categories/${category.slug}/fields/`)
      const fields = res.data.results || res.data
      setCategoryFields(fields)

      const initialValues = {}
      fields.forEach(field => { initialValues[field.name] = '' })
      setFieldValues(initialValues)
    } catch (err) {
      console.error('Failed to fetch fields:', err)
      setError('Could not load category fields.')
      setCategoryFields([])
    } finally {
      setFieldsLoading(false)
    }
  }

  const handleFieldChange = (fieldName, value) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: value }))
  }

  const handleSubmit = async () => {
    if (!selectedCategory || !venue) return

    setSubmitting(true)
    setError('')

    try {
      const fieldValuesObj = {}
      Object.entries(fieldValues).forEach(([fieldName, value]) => {
        if (value !== '' && value !== null) {
          fieldValuesObj[fieldName] = String(value)
        }
      })

      await api.post(`/contributions/venue/${venue.id}/add-category/`, {
        category_slug: selectedCategory.slug,
        field_values: fieldValuesObj
      })

      setSuccess(true)
    } catch (err) {
      console.error('Submission failed:', err)
      setError(err.response?.data?.detail || err.response?.data?.message || 'Could not submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackToSearch = () => {
    setSelectedCategory(null)
    setCategoryFields([])
    setFieldValues({})
    setError('')
  }

  const renderFieldInput = (field) => {
    const value = fieldValues[field.name] || ''

    switch (field.field_type) {
      case 'boolean':
        return (
          <div className="field-boolean-group">
            <label className={`field-boolean-option ${value === 'true' ? 'selected' : ''}`}>
              <input type="radio" name={`field-${field.name}`} value="true" checked={value === 'true'} onChange={() => handleFieldChange(field.name, 'true')} />
              <span className="bool-label yes">Yes</span>
            </label>
            <label className={`field-boolean-option ${value === 'false' ? 'selected' : ''}`}>
              <input type="radio" name={`field-${field.name}`} value="false" checked={value === 'false'} onChange={() => handleFieldChange(field.name, 'false')} />
              <span className="bool-label no">No</span>
            </label>
            <label className={`field-boolean-option ${value === '' ? 'selected' : ''}`}>
              <input type="radio" name={`field-${field.name}`} value="" checked={value === ''} onChange={() => handleFieldChange(field.name, '')} />
              <span className="bool-label unknown">Unknown</span>
            </label>
          </div>
        )
      case 'number':
        return <input type="number" className="field-input" value={value} onChange={e => handleFieldChange(field.name, e.target.value)} placeholder={`Enter ${field.label.toLowerCase()}...`} />
      case 'url':
        return <input type="url" className="field-input" value={value} onChange={e => handleFieldChange(field.name, e.target.value)} placeholder="https://..." />
      case 'text':
      default:
        return <input type="text" className="field-input" value={value} onChange={e => handleFieldChange(field.name, e.target.value)} placeholder={`Enter ${field.label.toLowerCase()}...`} />
    }
  }

  if (venueLoading) {
    return (
      <div>
        <Navbar />
        <div className="venue-loading">Loading…</div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div>
        <Navbar />
        <main className="wiki-page">
          <div className="wiki-box" style={{ padding: 24 }}>
            <h2>Venue not found</h2>
            <p>The link might be broken or the venue is no longer active.</p>
            <Link to="/" className="wiki-btn-secondary" style={{ display: 'inline-block', width: 'auto', marginTop: 8 }}>Back to Home</Link>
          </div>
        </main>
      </div>
    )
  }

  if (success) {
    return (
      <div>
        <Navbar />
        <main className="wiki-page">
          <div className="wiki-title-bar">
            <nav className="wiki-breadcrumb">
              <Link to="/">Mapedia</Link>
              <span className="wiki-breadcrumb-sep">›</span>
              <Link to={`/venue/${venueSlug}`}>{venue.name}</Link>
              <span className="wiki-breadcrumb-sep">›</span>
              <span>Add Category</span>
            </nav>
            <h1>Contribution Submitted</h1>
          </div>
          <div className="wiki-box">
            <div className="wiki-box-body">
              <div className="success-container">
                <div className="success-icon">✓</div>
                <h2>Contribution Submitted</h2>
                <p>
                  Your request to add <strong>{venue.name}</strong> to{' '}
                  <strong>{selectedCategory.name}</strong> has been submitted for review.
                </p>
                <p className="success-hint">A moderator will review your contribution shortly.</p>
                <div className="success-actions">
                  <button className="wiki-btn-primary" style={{ display: 'inline-block', width: 'auto' }} onClick={() => navigate(`/venue/${venueSlug}`)}>
                    Back to {venue.name}
                  </button>
                  <button className="wiki-btn-secondary" style={{ display: 'inline-block', width: 'auto' }} onClick={() => {
                    setSuccess(false)
                    setSelectedCategory(null)
                    setCategoryFields([])
                    setFieldValues({})
                    setQuery('')
                  }}>
                    Add Another Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
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
            <Link to={`/venue/${venueSlug}`}>{venue.name}</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <span>Add Category</span>
          </nav>
          <h1>Add Category to {venue.name}</h1>
          <p>Add this venue to another category. Fill in the category-specific details and submit for review.</p>
        </div>

        <div className="wiki-portal">

          {/* ── LEFT: Steps ── */}
          <div className="wiki-col-main">

            {/* Step 1: Category search */}
            {!selectedCategory && (
              <div className="wiki-box">
                <div className="wiki-box-header">
                  <h2>Step 1: Select a Category</h2>
                </div>
                <div className="wiki-box-body">
                  <input
                    autoFocus
                    type="text"
                    className="filter-input add-category-input"
                    placeholder="Search categories…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{ width: '100%', marginBottom: 12 }}
                  />

                  {searchLoading && <p className="search-hint">Searching…</p>}

                  {!searchLoading && query.length >= 2 && results.length === 0 && (
                    <p className="search-hint">No categories found. Try a different search term.</p>
                  )}

                  {results.length > 0 && (
                    <ul className="category-results">
                      {results.map(cat => (
                        <li key={cat.slug} className="category-result-item">
                          <div className="category-result-info">
                            <span className="category-result-name">{cat.name}</span>
                            {cat.description && (
                              <span className="category-result-desc">{cat.description}</span>
                            )}
                          </div>
                          <button className="btn-apply" onClick={() => handleSelectCategory(cat)}>Select</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Fill fields */}
            {selectedCategory && (
              <div className="wiki-box">
                <div className="wiki-box-header">
                  <h2>Step 2: Fill in Details for {selectedCategory.name}</h2>
                </div>
                <div className="wiki-box-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <p className="selected-category-hint" style={{ margin: 0, fontSize: 13, color: 'var(--text-light)' }}>
                      Fill in the fields below. You can leave fields empty if you don't know the answer.
                    </p>
                    <button className="btn-back" onClick={handleBackToSearch}>← Change Category</button>
                  </div>

                  {fieldsLoading && <div className="fields-loading">Loading fields…</div>}

                  {!fieldsLoading && categoryFields.length === 0 && (
                    <div className="no-fields-message">
                      <p>This category doesn't have any custom fields.</p>
                      <p>You can submit directly to add {venue.name} to {selectedCategory.name}.</p>
                    </div>
                  )}

                  {!fieldsLoading && categoryFields.length > 0 && (
                    <div className="fields-form">
                      {categoryFields.map(field => (
                        <div key={field.name} className="field-row">
                          <label className="field-label-text">
                            {field.label}
                            {field.required && <span className="required-mark">*</span>}
                          </label>
                          {renderFieldInput(field)}
                        </div>
                      ))}
                    </div>
                  )}

                  {error && <p className="add-category-error">{error}</p>}

                  <div className="submit-section" style={{ marginTop: 16 }}>
                    <button
                      className="wiki-btn-primary"
                      style={{ display: 'inline-block', width: 'auto' }}
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting…' : 'Submit Contribution'}
                    </button>
                    <p className="submit-hint">Your contribution will be reviewed before it becomes visible.</p>
                  </div>
                </div>
              </div>
            )}

            {!selectedCategory && (
              <div style={{ marginTop: 12 }}>
                <button className="wiki-btn-secondary" style={{ display: 'inline-block', width: 'auto' }} onClick={() => navigate(`/venue/${venueSlug}`)}>
                  ← Back to {venue.name}
                </button>
              </div>
            )}

          </div>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="wiki-col-side">

            <div className="wiki-box">
              <div className="wiki-box-header wiki-box-header-accent">
                <h2>Venue</h2>
              </div>
              <div className="wiki-side-actions">
                <Link to={`/venue/${venueSlug}`} className="wiki-btn-secondary">← Back to {venue.name}</Link>
              </div>
            </div>

            {venue.categories?.length > 0 && (
              <div className="wiki-box">
                <div className="wiki-box-header">
                  <h2>Current Categories</h2>
                </div>
                <div className="wiki-box-body">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {venue.categories.map(cat => (
                      <Link key={cat.category_slug} to={`/category/${cat.category_slug}`} className="venue-tag">
                        {cat.category_name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="wiki-infobox">
              <div className="wiki-infobox-title">Venue Info</div>
              <table>
                <tbody>
                  <tr><td>Name</td><td>{venue.name}</td></tr>
                  {venue.city && <tr><td>City</td><td>{venue.city}</td></tr>}
                  {venue.country && <tr><td>Country</td><td>{venue.country}</td></tr>}
                  <tr><td>Categories</td><td>{venue.categories?.length || 0}</td></tr>
                </tbody>
              </table>
            </div>

          </aside>
        </div>
      </main>
    </div>
  )
}

export default AddCategoryPage
