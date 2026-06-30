import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import api from '../api/client'
import '../styles/wiki.css'
import '../styles/ContributePage.css'

function ContributePage() {
  const token = localStorage.getItem('access')
  const [searchParams] = useSearchParams()
  const preselectedCategory = searchParams.get('category') || ''

  const [categorySearch, setCategorySearch] = useState('')
  const [categoryResults, setCategoryResults] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categoryLoading, setCategoryLoading] = useState(false)
  const categorySearchRef = useRef(null)

  const [fieldDefs, setFieldDefs] = useState([])
  const [fieldValues, setFieldValues] = useState({})

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [duplicates, setDuplicates] = useState([])
  const dupTimerRef = useRef(null)
  const [form, setForm] = useState({
    name: '',
    city: '',
    country: '',
    address: '',
    latitude: '',
    longitude: '',
    map_url: '',
  })

  useEffect(() => {
    if (preselectedCategory) {
      setCategoryLoading(true)
      api.get(`/categories/${preselectedCategory}/`)
        .then((res) => {
          const cat = res.data
          setSelectedCategory({ slug: cat.slug, name: cat.name })
          setCategorySearch(cat.name)
          setFieldDefs(cat.field_definitions || [])
        })
        .catch((err) => { console.error("Failed to load category:", err) })
        .finally(() => { setCategoryLoading(false) })
    }
  }, [preselectedCategory])

  useEffect(() => {
    if (selectedCategory) return
    if (categorySearch.length < 2) { setCategoryResults([]); return }

    const timer = setTimeout(() => {
      api.get(`/categories/?search=${encodeURIComponent(categorySearch)}`)
        .then((res) => { setCategoryResults(res.data.results || res.data) })
        .catch(() => { setCategoryResults([]) })
    }, 300)

    return () => clearTimeout(timer)
  }, [categorySearch, selectedCategory])

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat)
    setCategorySearch(cat.name)
    setCategoryResults([])
    setFieldValues({})
    api.get(`/categories/${cat.slug}/`)
      .then((res) => { setFieldDefs(res.data.field_definitions || []) })
      .catch(() => { setFieldDefs([]) })
  }

  const handleClearCategory = () => {
    setSelectedCategory(null)
    setCategorySearch('')
    setFieldDefs([])
    setFieldValues({})
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => {
      const updated = { ...prev, [name]: value }
      // Debounce duplicate check when name or coords change
      if (name === 'name' || name === 'latitude' || name === 'longitude') {
        clearTimeout(dupTimerRef.current)
        dupTimerRef.current = setTimeout(() => {
          const n = updated.name.trim()
          const lat = updated.latitude.trim()
          const lng = updated.longitude.trim()
          if (n.length >= 3) {
            const params = { search: n, page_size: '5' }
            if (lat && lng) { params.lat = lat; params.lng = lng; params.radius = '0.5' }
            api.get('/venues/', { params })
              .then(res => {
                const results = (res.data.results || res.data || []).filter(
                  v => v.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(v.name.toLowerCase())
                )
                setDuplicates(results.slice(0, 3))
              })
              .catch(() => {})
          } else {
            setDuplicates([])
          }
        }, 600)
      }
      return updated
    })
  }

  function handleFieldValue(fieldName, value) {
    setFieldValues((prev) => ({ ...prev, [fieldName]: value }))
  }

  function handleMultiChoiceToggle(fieldName, choiceValue) {
    setFieldValues((prev) => {
      const current = prev[fieldName] || []
      const arr = Array.isArray(current) ? current : []
      if (arr.includes(choiceValue)) {
        return { ...prev, [fieldName]: arr.filter(v => v !== choiceValue) }
      } else {
        return { ...prev, [fieldName]: [...arr, choiceValue] }
      }
    })
  }

  function resetForm() {
    setSuccess(false)
    setError('')
    setFieldValues({})
    setForm({ name: '', city: '', country: '', address: '', latitude: '', longitude: '', map_url: '' })
    if (!preselectedCategory) { handleClearCategory() }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!selectedCategory) { setError('Please select a category.'); return }

    setLoading(true)
    setError('')

    const currentToken = localStorage.getItem('access')

    const processedFieldValues = {}
    for (const [key, value] of Object.entries(fieldValues)) {
      if (Array.isArray(value)) {
        processedFieldValues[key] = JSON.stringify(value)
      } else {
        processedFieldValues[key] = value
      }
    }

    const payload = {
      name: form.name,
      city: form.city,
      country: form.country,
      address: form.address,
      category: selectedCategory.slug,
      latitude: form.latitude || '',
      longitude: form.longitude || '',
      map_url: form.map_url || '',
      field_values: processedFieldValues,
    }

    api.post('/contributions/venue/', payload, {
      headers: { Authorization: `Bearer ${currentToken}` }
    }).then(() => {
      setSuccess(true)
      setLoading(false)
      toast.success('Contribution submitted! Awaiting moderation.')
    }).catch((err) => {
      const msg = err.response?.data?.detail || JSON.stringify(err.response?.data) || 'An error occurred.'
      setError(msg)
      toast.error(msg)
      setLoading(false)
    })
  }

  function renderFieldInput(field) {
    const value = fieldValues[field.name]

    if (field.field_type === 'boolean') {
      const boolValue = value || ''
      return (
        <div className="field-boolean-group">
          <label className={`field-boolean-option ${boolValue === 'true' ? 'selected' : ''}`}>
            <input type="radio" name={`field-${field.name}`} checked={boolValue === 'true'} onChange={() => handleFieldValue(field.name, 'true')} />
            <span className="bool-label yes">Yes</span>
          </label>
          <label className={`field-boolean-option ${boolValue === 'false' ? 'selected' : ''}`}>
            <input type="radio" name={`field-${field.name}`} checked={boolValue === 'false'} onChange={() => handleFieldValue(field.name, 'false')} />
            <span className="bool-label no">No</span>
          </label>
          <label className={`field-boolean-option ${boolValue === '' ? 'selected' : ''}`}>
            <input type="radio" name={`field-${field.name}`} checked={boolValue === ''} onChange={() => handleFieldValue(field.name, '')} />
            <span className="bool-label unknown">Unknown</span>
          </label>
        </div>
      )
    }

    if (field.field_type === 'choice') {
      const choices = field.choices || []
      const selectedValue = value || ''
      if (choices.length <= 5) {
        return (
          <div className="field-choice-group">
            {choices.map((choice) => (
              <label key={choice.value} className={`field-choice-option ${selectedValue === choice.value ? 'selected' : ''}`}>
                <input type="radio" name={`field-${field.name}`} value={choice.value} checked={selectedValue === choice.value} onChange={() => handleFieldValue(field.name, choice.value)} />
                {choice.icon && <span className="choice-icon">{choice.icon}</span>}
                <span className="choice-label">{choice.label}</span>
              </label>
            ))}
            {!field.is_required && selectedValue && (
              <button type="button" className="field-choice-clear" onClick={() => handleFieldValue(field.name, '')}>Clear</button>
            )}
          </div>
        )
      }
      return (
        <select className="field-select" value={selectedValue} onChange={(e) => handleFieldValue(field.name, e.target.value)} required={field.is_required}>
          <option value="">-- Select --</option>
          {choices.map((choice) => (
            <option key={choice.value} value={choice.value}>{choice.label}</option>
          ))}
        </select>
      )
    }

    if (field.field_type === 'multi_choice') {
      const choices = field.choices || []
      const selectedValues = Array.isArray(value) ? value : []
      return (
        <div className="field-multichoice-group">
          {choices.map((choice) => (
            <label key={choice.value} className={`field-multichoice-option ${selectedValues.includes(choice.value) ? 'selected' : ''}`}>
              <input type="checkbox" value={choice.value} checked={selectedValues.includes(choice.value)} onChange={() => handleMultiChoiceToggle(field.name, choice.value)} />
              {choice.icon && <span className="choice-icon">{choice.icon}</span>}
              <span className="choice-label">{choice.label}</span>
            </label>
          ))}
          {selectedValues.length > 0 && (
            <div className="field-multichoice-summary">{selectedValues.length} selected</div>
          )}
        </div>
      )
    }

    if (field.field_type === 'text') {
      return <textarea className="field-textarea" value={value || ''} onChange={(e) => handleFieldValue(field.name, e.target.value)} required={field.is_required} />
    }

    if (field.field_type === 'integer' || field.field_type === 'decimal' || field.field_type === 'number') {
      return <input type="number" className="field-input" value={value || ''} onChange={(e) => handleFieldValue(field.name, e.target.value)} required={field.is_required} step={field.field_type === 'decimal' ? '0.01' : '1'} />
    }

    if (field.field_type === 'url') {
      return <input type="url" className="field-input" value={value || ''} placeholder="https://..." onChange={(e) => handleFieldValue(field.name, e.target.value)} required={field.is_required} />
    }

    return <input type="text" className="field-input" value={value || ''} onChange={(e) => handleFieldValue(field.name, e.target.value)} required={field.is_required} />
  }

  if (!token) {
    return (
      <div>
        <Navbar />
        <main className="wiki-page">
          <div className="wiki-title-bar">
            <nav className="wiki-breadcrumb">
              <Link to="/">Mapedia</Link>
              <span className="wiki-breadcrumb-sep">›</span>
              <span>Contribute</span>
            </nav>
            <h1>Contribute a Venue</h1>
          </div>
          <div className="wiki-box" style={{ padding: 24 }}>
            <p>You need to <Link to="/login">log in</Link> to contribute.</p>
          </div>
        </main>
      </div>
    )
  }

  if (success) {
    return (
      <div>
        <Helmet>
          <title>Contribution Submitted | Mapedia</title>
        </Helmet>
        <Navbar />
        <main className="wiki-page">
          <div className="wiki-title-bar">
            <nav className="wiki-breadcrumb">
              <Link to="/">Mapedia</Link>
              <span className="wiki-breadcrumb-sep">›</span>
              <span>Contribute</span>
            </nav>
            <h1>Thank You!</h1>
          </div>
          <div className="wiki-box">
            <div className="wiki-box-body">
              <div className="success-container">
                <div className="success-icon">✓</div>
                <h2>Contribution Submitted</h2>
                <p>Your contribution has been submitted and is pending review by a moderator.</p>
                <div className="success-actions">
                  {selectedCategory && (
                    <Link to={`/category/${selectedCategory.slug}`} className="wiki-btn-primary">
                      Back to {selectedCategory.name}
                    </Link>
                  )}
                  <button className="wiki-btn-secondary" onClick={resetForm}>
                    Add Another Venue
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
      <Helmet>
        <title>Contribute a Venue | Mapedia</title>
        <meta name="description" content="Add a new venue to Mapedia. Your contribution will be reviewed by a moderator before being published." />
        <link rel="canonical" href="https://mapedia.org/contribute" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />

      <main className="wiki-page" style={{ maxWidth: 1040 }}>

        <div className="wiki-title-bar">
          <nav className="wiki-breadcrumb">
            <Link to="/">Mapedia</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <span>Contribute</span>
          </nav>
          <h1>Contribute a Venue</h1>
          <p>Submit a new location to the community database. All data is released under CC BY-SA 4.0.</p>
        </div>

        <div className="wiki-portal">

          {/* ── LEFT: Form ── */}
          <div className="wiki-col-main">
            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>Venue Details</h2>
              </div>
              <div className="wiki-box-body">

                {error && <div className="contribute-error">{error}</div>}

                <form onSubmit={handleSubmit} className="contribute-form">

                  {/* Category */}
                  <h3 className="contribute-section-title">Category</h3>
                  <div className="auth-field contribute-cat-field" ref={categorySearchRef}>
                    <label>Select Category <span className="required">*</span></label>
                    <div className="category-search-wrap">
                      <input
                        type="text"
                        placeholder="Search for a category..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        disabled={!!selectedCategory}
                        className={selectedCategory ? 'input-selected' : ''}
                        autoComplete="off"
                      />
                      {selectedCategory && (
                        <button type="button" className="category-clear-btn" onClick={handleClearCategory} title="Change category">✕</button>
                      )}
                    </div>
                    {!selectedCategory && categoryResults.length > 0 && (
                      <ul className="category-suggestions">
                        {categoryResults.map((cat) => (
                          <li key={cat.slug} className="category-suggestion-item" onMouseDown={() => handleSelectCategory(cat)}>
                            <span className="suggestion-name">{cat.name}</span>
                            {cat.venue_count !== undefined && (
                              <span className="suggestion-count">{cat.venue_count} venues</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    {!selectedCategory && categorySearch.length >= 2 && categoryResults.length === 0 && !categoryLoading && (
                      <p className="category-no-results">No categories found.</p>
                    )}
                  </div>

                  {/* Basic info */}
                  <h3 className="contribute-section-title">Basic Information</h3>

                  <div className="auth-field">
                    <label>Venue Name <span className="required">*</span></label>
                    <input type="text" name="name" className="field-input" value={form.name} onChange={handleChange} required />
                    {duplicates.length > 0 && (
                      <div className="duplicate-warning">
                        <strong>Similar venues already exist — check before adding:</strong>
                        <ul>
                          {duplicates.map(v => (
                            <li key={v.id}>
                              <Link to={`/venue/${v.slug}`} target="_blank" rel="noopener noreferrer">{v.name}</Link>
                              {v.city ? ` — ${v.city}` : ''}
                              {v.country ? `, ${v.country}` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="auth-field">
                      <label>City</label>
                      <input type="text" name="city" className="field-input" value={form.city} onChange={handleChange} placeholder="e.g. Istanbul" />
                      <small className="field-hint">Leave blank — auto-filled from your coordinates</small>
                    </div>
                    <div className="auth-field">
                      <label>Country</label>
                      <input type="text" name="country" className="field-input" value={form.country} onChange={handleChange} placeholder="e.g. Turkey" />
                      <small className="field-hint">Leave blank — auto-filled from your coordinates</small>
                    </div>
                  </div>

                  <div className="auth-field">
                    <label>Address</label>
                    <input type="text" name="address" className="field-input" value={form.address} onChange={handleChange} placeholder="Street address (optional)" />
                  </div>

                  {/* Location */}
                  <h3 className="contribute-section-title contribute-section-title--top">Location</h3>
                  <p className="contribute-hint">Paste a Google Maps link <em>or</em> enter coordinates manually. Coordinates are required.</p>

                  <div className="auth-field">
                    <label>Google Maps URL</label>
                    <input type="text" name="map_url" className="field-input" value={form.map_url} onChange={handleChange} placeholder="https://maps.google.com/..." />
                    <small className="field-hint">Paste any Google Maps link — latitude &amp; longitude will be extracted automatically</small>
                  </div>

                  <div className="form-row">
                    <div className="auth-field">
                      <label>Latitude <span className="required">*</span></label>
                      <input type="text" name="latitude" className="field-input" value={form.latitude} onChange={handleChange} placeholder="41.015137" />
                    </div>
                    <div className="auth-field">
                      <label>Longitude <span className="required">*</span></label>
                      <input type="text" name="longitude" className="field-input" value={form.longitude} onChange={handleChange} placeholder="28.979530" />
                    </div>
                  </div>

                  {/* Category fields */}
                  {selectedCategory && fieldDefs.length > 0 && (
                    <div className="contribute-fields">
                      <h3 className="contribute-section-title contribute-section-title--top">{selectedCategory.name} Details</h3>
                      {fieldDefs.map((field) => (
                        <div key={field.id} className="auth-field">
                          <label>
                            {field.label}
                            {field.is_required && <span className="required">*</span>}
                          </label>
                          {field.help_text && <small className="field-help">{field.help_text}</small>}
                          {renderFieldInput(field)}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedCategory && fieldDefs.length === 0 && (
                    <p className="no-fields-hint">This category doesn't have any additional fields.</p>
                  )}

                  <div className="contribute-actions">
                    <button type="submit" className="wiki-btn-primary" disabled={loading || !selectedCategory}>
                      {loading ? 'Submitting...' : 'Submit Contribution'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="wiki-col-side">

            <div className="wiki-box">
              <div className="wiki-box-header wiki-box-header-accent">
                <h2>Guidelines</h2>
              </div>
              <div className="wiki-box-body">
                <ul className="contribute-sidebar-list">
                  <li>Only submit places you have direct knowledge of</li>
                  <li>No fake venues or incorrect coordinates</li>
                  <li>All data is licensed under CC BY-SA 4.0</li>
                  <li>Your submission will be reviewed before publishing</li>
                </ul>
              </div>
            </div>

            <div className="wiki-infobox">
              <div className="wiki-infobox-title">Submission Info</div>
              <table>
                <tbody>
                  <tr><td>Review</td><td>By moderator</td></tr>
                  <tr><td>License</td><td><a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a></td></tr>
                  <tr><td>Attribution</td><td>Required</td></tr>
                </tbody>
              </table>
            </div>

            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>Related</h2>
              </div>
              <div className="wiki-box-body">
                <ul className="contribute-related-list">
                  <li><Link to="/categories">Browse Categories</Link></li>
                  <li><Link to="/guidelines">Community Guidelines</Link></li>
                  <li><Link to="/license">Open Data License</Link></li>
                </ul>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  )
}

export default ContributePage
