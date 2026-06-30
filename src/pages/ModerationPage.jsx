import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/client'
import '../styles/wiki.css'
import '../styles/ModerationPage.css'

const FIELD_TYPES = [
  { value: 'boolean', label: 'Boolean (Yes/No)' },
  { value: 'string', label: 'Short Text' },
  { value: 'text', label: 'Long Text' },
  { value: 'integer', label: 'Integer' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'url', label: 'URL' },
  { value: 'choice', label: 'Single Choice' },
  { value: 'multi_choice', label: 'Multiple Choice' },
]

const CHOICE_FIELD_TYPES = ['choice', 'multi_choice']

const EMPTY_FIELD_FORM = {
  name: '',
  label: '',
  field_type: 'string',
  is_required: false,
  is_public: true,
  help_text: '',
  order: 0,
}

const EMPTY_CHOICE = { value: '', label: '', icon: '', order: 0 }

// ─── FIELD MANAGER ───────────────────────────────────────────
function FieldManager({ categorySlug, token }) {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [form, setForm] = useState(EMPTY_FIELD_FORM)
  const [choices, setChoices] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadFields() }, [categorySlug])

  const loadFields = () => {
    setLoading(true)
    api.get(`/categories/${categorySlug}/fields/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setFields(res.data))
      .catch(err => console.error('Failed to load fields:', err))
      .finally(() => setLoading(false))
  }

  const openAddForm = () => {
    setEditingField(null)
    setForm(EMPTY_FIELD_FORM)
    setChoices([{ ...EMPTY_CHOICE }])
    setError('')
    setShowForm(true)
  }

  const openEditForm = (field) => {
    setEditingField(field)
    setForm({
      name: field.name,
      label: field.label,
      field_type: field.field_type,
      is_required: field.is_required,
      is_public: field.is_public,
      help_text: field.help_text || '',
      order: field.order,
    })
    if (CHOICE_FIELD_TYPES.includes(field.field_type) && field.choices) {
      setChoices(field.choices.length > 0
        ? field.choices.map(c => ({ ...c }))
        : [{ ...EMPTY_CHOICE }]
      )
    } else {
      setChoices([{ ...EMPTY_CHOICE }])
    }
    setError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingField(null)
    setForm(EMPTY_FIELD_FORM)
    setChoices([])
    setError('')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (name === 'field_type') {
      if (CHOICE_FIELD_TYPES.includes(value)) {
        setChoices([{ ...EMPTY_CHOICE }])
      } else {
        setChoices([])
      }
    }
  }

  const handleChoiceChange = (index, key, value) => {
    setChoices(prev => prev.map((c, i) => i === index ? { ...c, [key]: value } : c))
  }

  const addChoice = () => {
    setChoices(prev => [...prev, { ...EMPTY_CHOICE, order: prev.length }])
  }

  const removeChoice = (index) => {
    if (choices.length <= 1) return
    setChoices(prev => prev.filter((_, i) => i !== index))
  }

  const moveChoice = (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= choices.length) return
    const arr = [...choices]
    ;[arr[index], arr[newIndex]] = [arr[newIndex], arr[index]]
    arr.forEach((c, i) => c.order = i)
    setChoices(arr)
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.label.trim()) {
      setError('Name and Label are required.')
      return
    }

    if (CHOICE_FIELD_TYPES.includes(form.field_type)) {
      const validChoices = choices.filter(c => c.value.trim() && c.label.trim())
      if (validChoices.length < 2) {
        setError('At least 2 options with value and label are required.')
        return
      }
      const values = validChoices.map(c => c.value.trim().toLowerCase())
      if (new Set(values).size !== values.length) {
        setError('Option values must be unique.')
        return
      }
    }

    setSaving(true)
    setError('')

    const payload = {
      ...form,
      choices: CHOICE_FIELD_TYPES.includes(form.field_type)
        ? choices
            .filter(c => c.value.trim() && c.label.trim())
            .map((c, i) => ({ ...c, order: i }))
        : []
    }

    const request = editingField
      ? api.patch(`/categories/${categorySlug}/fields/${editingField.id}/edit/`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      : api.post(`/categories/${categorySlug}/fields/add/`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })

    request
      .then(() => { loadFields(); closeForm() })
      .catch(err => {
        const data = err.response?.data
        setError(data ? (typeof data === 'string' ? data : Object.values(data).flat().join(' ')) : 'Something went wrong.')
      })
      .finally(() => setSaving(false))
  }

  const handleDelete = (field) => {
    if (!window.confirm(`Delete field "${field.label}"? This cannot be undone.`)) return
    api.delete(`/categories/${categorySlug}/fields/${field.id}/delete/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => loadFields())
  }

  const isChoiceField = (type) => CHOICE_FIELD_TYPES.includes(type)

  if (loading) return <p className="mod-empty">Loading fields...</p>

  return (
    <div className="field-manager">
      <div className="field-manager-header">
        <h3>Category Fields</h3>
        <button className="field-btn-add" onClick={openAddForm}>+ Add Field</button>
      </div>

      {fields.length === 0 ? (
        <p className="mod-empty">No fields defined for this category yet.</p>
      ) : (
        <table className="field-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Name</th>
              <th>Label</th>
              <th>Type</th>
              <th>Required</th>
              <th>Help Text</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fields.map(f => (
              <tr key={f.id}>
                <td>{f.order}</td>
                <td><code>{f.name}</code></td>
                <td>{f.label}</td>
                <td>
                  {FIELD_TYPES.find(t => t.value === f.field_type)?.label || f.field_type}
                  {isChoiceField(f.field_type) && f.choices_count > 0 && (
                    <span className="field-choices-count"> ({f.choices_count})</span>
                  )}
                </td>
                <td>{f.is_required ? '✅' : '—'}</td>
                <td className="field-help-text">{f.help_text || '—'}</td>
                <td className="field-actions">
                  <button className="field-btn-edit" onClick={() => openEditForm(f)}>Edit</button>
                  <button className="field-btn-delete" onClick={() => handleDelete(f)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="field-modal-overlay" onClick={closeForm}>
          <div className={`field-modal ${isChoiceField(form.field_type) ? 'field-modal-large' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="field-modal-header">
              <h3>{editingField ? 'Edit Field' : 'Add New Field'}</h3>
              <button className="field-modal-close" onClick={closeForm}>✕</button>
            </div>

            {error && <p className="field-error">{error}</p>}

            <div className="field-form-grid">
              <div className="field-form-group">
                <label>Field Name <span className="field-required">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. wifi_speed" disabled={!!editingField} />
                {editingField && <small>Name cannot be changed after creation.</small>}
              </div>

              <div className="field-form-group">
                <label>Display Label <span className="field-required">*</span></label>
                <input name="label" value={form.label} onChange={handleChange} placeholder="e.g. WiFi Speed (Mbps)" />
              </div>

              <div className="field-form-group">
                <label>Field Type</label>
                <select name="field_type" value={form.field_type} onChange={handleChange} disabled={!!editingField}>
                  {FIELD_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {editingField && <small>Type cannot be changed after creation.</small>}
              </div>

              <div className="field-form-group">
                <label>Order</label>
                <input name="order" type="number" value={form.order} onChange={handleChange} min="0" />
              </div>

              <div className="field-form-group field-form-full">
                <label>Help Text</label>
                <input name="help_text" value={form.help_text} onChange={handleChange} placeholder="Hint shown to users filling in this field" />
              </div>

              <div className="field-form-group field-form-checkboxes">
                <label>
                  <input type="checkbox" name="is_required" checked={form.is_required} onChange={handleChange} />
                  Required
                </label>
                <label>
                  <input type="checkbox" name="is_public" checked={form.is_public} onChange={handleChange} />
                  Public
                </label>
              </div>
            </div>

            {isChoiceField(form.field_type) && (
              <div className="field-choices-section">
                <div className="field-choices-header">
                  <h4>{form.field_type === 'choice' ? '📋 Options (Select One)' : '☑️ Options (Select Multiple)'}</h4>
                  <button type="button" className="field-btn-add-choice" onClick={addChoice}>+ Add Option</button>
                </div>
                <p className="field-choices-hint">
                  {form.field_type === 'choice' ? 'Users will select ONE option from this list.' : 'Users can select MULTIPLE options from this list.'}
                </p>
                <div className="field-choices-list">
                  {choices.map((choice, index) => (
                    <div key={index} className="field-choice-row">
                      <div className="field-choice-order">
                        <button type="button" className="field-choice-move" onClick={() => moveChoice(index, -1)} disabled={index === 0}>↑</button>
                        <button type="button" className="field-choice-move" onClick={() => moveChoice(index, 1)} disabled={index === choices.length - 1}>↓</button>
                      </div>
                      <input type="text" className="field-choice-value" placeholder="value" value={choice.value} onChange={(e) => handleChoiceChange(index, 'value', e.target.value)} disabled={editingField && choice.id} />
                      <input type="text" className="field-choice-label" placeholder="Label" value={choice.label} onChange={(e) => handleChoiceChange(index, 'label', e.target.value)} />
                      <input type="text" className="field-choice-icon" placeholder="icon" value={choice.icon || ''} onChange={(e) => handleChoiceChange(index, 'icon', e.target.value)} />
                      <button type="button" className="field-choice-remove" onClick={() => removeChoice(index)} disabled={choices.length <= 1}>✕</button>
                    </div>
                  ))}
                </div>
                <p className="field-choices-note">
                  <strong>value:</strong> internal key (no spaces) &nbsp;|&nbsp;
                  <strong>Label:</strong> shown to users &nbsp;|&nbsp;
                  <strong>icon:</strong> emoji or icon class (optional)
                </p>
              </div>
            )}

            <div className="field-modal-actions">
              <button className="field-btn-cancel" onClick={closeForm}>Cancel</button>
              <button className="field-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingField ? 'Save Changes' : 'Add Field'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── VENUE MANAGER ───────────────────────────────────────────
function VenueManager({ categorySlug, token }) {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const PAGE_SIZE = 20

  useEffect(() => { setPage(1) }, [categorySlug, search])

  useEffect(() => { loadVenues() }, [categorySlug, page, search])

  const loadVenues = () => {
    setLoading(true)
    const params = new URLSearchParams({
      category: categorySlug,
      page: page.toString(),
      page_size: PAGE_SIZE.toString(),
    })
    if (search.trim()) params.append('search', search.trim())

    api.get(`/venues/?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.data.results !== undefined) {
          setVenues(res.data.results)
          setTotalCount(res.data.count)
        } else {
          setVenues(res.data)
          setTotalCount(res.data.length)
        }
      })
      .catch(err => console.error('Failed to load venues:', err))
      .finally(() => setLoading(false))
  }

  const handleDelete = (venue) => {
    if (!window.confirm(`Delete venue "${venue.name}"? This cannot be undone.`)) return
    api.delete(`/venues/${venue.slug}/delete/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => loadVenues())
      .catch(err => console.error('Delete failed:', err))
  }

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1) }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const getPageNumbers = () => {
    const delta = 2
    const range = []
    const left = Math.max(1, page - delta)
    const right = Math.min(totalPages, page + delta)
    for (let i = left; i <= right; i++) { range.push(i) }
    if (left > 2) range.unshift('...')
    if (left > 1) range.unshift(1)
    if (right < totalPages - 1) range.push('...')
    if (right < totalPages) range.push(totalPages)
    return range
  }

  return (
    <div className="venue-manager">
      <div className="field-manager-header">
        <h3>
          Venues{' '}
          <span className="venue-count">({totalCount} total{search ? ' · filtered' : ''})</span>
        </h3>
        <input className="venue-search" type="text" placeholder="Search venues..." value={search} onChange={handleSearch} />
      </div>

      {loading ? (
        <p className="mod-empty">Loading venues...</p>
      ) : venues.length === 0 ? (
        <p className="mod-empty">{search ? 'No results.' : 'No venues in this category yet.'}</p>
      ) : (
        <>
          <table className="field-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Country</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map(v => (
                <tr key={v.id}>
                  <td>
                    <Link to={`/venue/${v.slug.split('/').pop()}`} className="venue-manager-link">{v.name}</Link>
                  </td>
                  <td>{v.city || '—'}</td>
                  <td>{v.country || '—'}</td>
                  <td className="field-actions">
                    <Link to={`/venue/${v.slug.split('/').pop()}/edit`} className="field-btn-edit" style={{ textDecoration: 'none', display: 'inline-block' }}>Edit</Link>
                    <button className="field-btn-delete" onClick={() => handleDelete(v)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="venue-pagination">
              <button className="venue-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              <div className="venue-page-numbers">
                {getPageNumbers().map((num, i) =>
                  num === '...' ? (
                    <span key={`dots-${i}`} className="venue-page-dots">…</span>
                  ) : (
                    <button key={num} className={`venue-page-btn ${page === num ? 'venue-page-btn-active' : ''}`} onClick={() => setPage(num)}>{num}</button>
                  )
                )}
              </div>
              <button className="venue-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
              <span className="venue-page-info">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── CATEGORY SETTINGS ───────────────────────────────────────
function CategorySettings({ categorySlug, token }) {
  const [form, setForm] = useState({ name: '', description: '', icon: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/categories/${categorySlug}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setForm({
          name: res.data.name || '',
          description: res.data.description || '',
          icon: res.data.icon || '',
        })
      })
      .catch(() => setError('Could not load category.'))
      .finally(() => setLoading(false))
  }, [categorySlug])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setSuccess(false)
  }

  const handleSave = () => {
    setSaving(true)
    setError('')
    setSuccess(false)
    api.patch(`/categories/${categorySlug}/update/`, form, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => setSuccess(true))
      .catch(err => {
        const data = err.response?.data
        setError(data ? Object.values(data).flat().join(' ') : 'Something went wrong.')
      })
      .finally(() => setSaving(false))
  }

  if (loading) return <p className="mod-empty">Loading...</p>

  return (
    <div className="cat-settings">
      <div className="field-manager-header">
        <h3>Category Settings</h3>
      </div>
      {error && <p className="field-error">{error}</p>}
      {success && <p className="cat-settings-success">Saved successfully.</p>}
      <div className="cat-settings-form">
        <div className="field-form-group">
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} />
        </div>
        <div className="field-form-group">
          <label>Icon</label>
          <input name="icon" value={form.icon} onChange={handleChange} placeholder="e.g. 🍺 or fa-beer" />
        </div>
        <div className="field-form-group cat-settings-full">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="mod-reject-note" />
        </div>
      </div>
      <div className="field-modal-actions" style={{ justifyContent: 'flex-start', marginTop: 16 }}>
        <button className="field-btn-save" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// ─── HISTORY TAB ─────────────────────────────────────────────
function HistoryTab({ categorySlug, token }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get(`/contributions/?category=${categorySlug}&status=approved,rejected`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setHistory(res.data.results || res.data || []))
      .catch(() => setError('History not available.'))
      .finally(() => setLoading(false))
  }, [categorySlug])

  if (loading) return <div className="mod-empty-state"><p>Loading history…</p></div>
  if (error) return <div className="mod-empty-state"><p>{error}</p></div>
  if (history.length === 0) return <div className="mod-empty-state"><p>No moderation history yet.</p></div>

  return (
    <div className="mod-history">
      <table className="mod-history-table">
        <thead>
          <tr>
            <th>Venue</th>
            <th>Type</th>
            <th>Contributor</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {history.map(c => (
            <tr key={c.id}>
              <td>{c.payload?.name || '—'}</td>
              <td><span className="mod-item-type" style={{ fontSize: 11 }}>{c.contribution_type?.replace('_', ' ')}</span></td>
              <td style={{ fontSize: 12 }}>{c.contributor}</td>
              <td>
                <span className={`mod-history-status mod-history-${c.status}`}>
                  {c.status}
                </span>
              </td>
              <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {new Date(c.updated_at || c.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── MODERATION PAGE ─────────────────────────────────────────
function ModerationPage() {
  const navigate = useNavigate()
  const { categorySlug } = useParams()
  const token = localStorage.getItem('access')

  const [categories, setCategories] = useState([])
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [rejectNote, setRejectNote] = useState('')
  const [processing, setProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState('contributions')
  const [checkedIds, setCheckedIds] = useState(new Set())
  const [bulkRejectNote, setBulkRejectNote] = useState('')
  const [bulkProcessing, setBulkProcessing] = useState(false)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    setLoading(true)
    if (categorySlug) {
      loadContributions(categorySlug)
    } else {
      loadCategories()
    }
  }, [categorySlug, token])

  const loadCategories = () => {
    api.get('/contributions/pending/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to load categories:', err))
      .finally(() => setLoading(false))
  }

  const loadContributions = (slug) => {
    api.get(`/contributions/pending/?category=${slug}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setContributions(res.data))
      .catch(err => console.error('Failed to load contributions:', err))
      .finally(() => setLoading(false))
  }

  const handleDeleteCategory = (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? All venues and fields will also be deleted. This cannot be undone.`)) return
    api.delete(`/categories/${cat.slug}/delete/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => setCategories(prev => prev.filter(c => c.slug !== cat.slug)))
      .catch(err => alert(err.response?.data?.detail || 'Could not delete category.'))
  }

  const handleApprove = (id) => {
    if (!window.confirm('Approve this contribution?')) return
    setProcessing(true)
    api.post(`/contributions/${id}/approve/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => { setContributions(prev => prev.filter(c => c.id !== id)); setSelected(null) })
      .catch(err => console.error('Approval error:', err))
      .finally(() => setProcessing(false))
  }

  const handleReject = (id) => {
    if (!window.confirm('Reject this contribution?')) return
    setProcessing(true)
    api.post(`/contributions/${id}/reject/`, { note: rejectNote }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setContributions(prev => prev.filter(c => c.id !== id))
        setSelected(null)
        setRejectNote('')
      })
      .catch(err => console.error('Rejection error:', err))
      .finally(() => setProcessing(false))
  }

  const toggleCheck = (id) => {
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (checkedIds.size === contributions.length) {
      setCheckedIds(new Set())
    } else {
      setCheckedIds(new Set(contributions.map(c => c.id)))
    }
  }

  const handleBulkApprove = async () => {
    if (checkedIds.size === 0) return
    if (!window.confirm(`Approve ${checkedIds.size} contribution(s)?`)) return
    setBulkProcessing(true)
    try {
      await Promise.all([...checkedIds].map(id =>
        api.post(`/contributions/${id}/approve/`, {}, { headers: { Authorization: `Bearer ${token}` } })
      ))
      setContributions(prev => prev.filter(c => !checkedIds.has(c.id)))
      if (selected && checkedIds.has(selected.id)) setSelected(null)
      setCheckedIds(new Set())
    } catch (err) {
      console.error('Bulk approve error:', err)
    } finally {
      setBulkProcessing(false)
    }
  }

  const handleBulkReject = async () => {
    if (checkedIds.size === 0) return
    if (!window.confirm(`Reject ${checkedIds.size} contribution(s)?`)) return
    setBulkProcessing(true)
    try {
      await Promise.all([...checkedIds].map(id =>
        api.post(`/contributions/${id}/reject/`, { note: bulkRejectNote }, { headers: { Authorization: `Bearer ${token}` } })
      ))
      setContributions(prev => prev.filter(c => !checkedIds.has(c.id)))
      if (selected && checkedIds.has(selected.id)) setSelected(null)
      setCheckedIds(new Set())
      setBulkRejectNote('')
    } catch (err) {
      console.error('Bulk reject error:', err)
    } finally {
      setBulkProcessing(false)
    }
  }

  const renderFieldValue = (key, value) => {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) { return parsed.join(', ') }
    } catch { }
    return String(value)
  }

  const renderPayload = (payload) => {
    const skip = ['field_values']
    const fields = Object.entries(payload).filter(
      ([key, value]) => !skip.includes(key) && value !== '' && value !== null
    )

    return (
      <table className="mod-payload-table">
        <tbody>
          {fields.map(([key, value]) => (
            <tr key={key}>
              <td className="mod-payload-key">{key}</td>
              <td className="mod-payload-val">{String(value)}</td>
            </tr>
          ))}
          {payload.field_values && Object.keys(payload.field_values).length > 0 &&
            Object.entries(payload.field_values).map(([key, value]) => (
              <tr key={`fv-${key}`}>
                <td className="mod-payload-key mod-payload-field">{key}</td>
                <td className="mod-payload-val">{renderFieldValue(key, value)}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    )
  }

  if (loading) {
    return (<><Navbar /><div className="mod-loading">Loading...</div></>)
  }

  // Categories list view
  if (!categorySlug) {
    return (
      <div>
        <Navbar />
        <main className="wiki-page" style={{ maxWidth: 1040 }}>

          <div className="wiki-title-bar">
            <nav className="wiki-breadcrumb">
              <Link to="/">Mapedia</Link>
              <span className="wiki-breadcrumb-sep">›</span>
              <span>Moderation</span>
            </nav>
            <h1>Moderation Center</h1>
            <p>Select a category to review pending contributions.</p>
          </div>

          <div className="wiki-portal">
            <div className="wiki-col-main">
              {categories.length === 0 ? (
                <div className="wiki-box">
                  <div className="wiki-box-body">
                    <p className="mod-empty">You don't have moderation permissions for any category.</p>
                  </div>
                </div>
              ) : (
                <div className="wiki-box">
                  <div className="wiki-box-header">
                    <h2>Your Categories</h2>
                  </div>
                  <div className="mod-categories-grid">
                    {categories.map(cat => (
                      <div key={cat.id} className="mod-category-card">
                        <Link to={`/moderation/${cat.slug}`} className="mod-category-link">
                          <span className="mod-category-name">{cat.name}</span>
                          <span className={`mod-category-count ${cat.pending_count > 0 ? 'mod-category-count-active' : ''}`}>
                            {cat.pending_count} pending
                          </span>
                        </Link>
                        <div className="mod-category-actions">
                          {cat.is_owner && (
                            <Link to={`/moderation/${cat.slug}/moderators`} className="mod-manage-mods">
                              Manage Moderators
                            </Link>
                          )}
                          {cat.is_owner && (
                            <button className="mod-delete-category-btn" onClick={() => handleDeleteCategory(cat)}>
                              Delete Category
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="wiki-col-side">
              <div className="wiki-box">
                <div className="wiki-box-header wiki-box-header-accent">
                  <h2>Actions</h2>
                </div>
                <div className="wiki-side-actions">
                  <Link to="/create-category" className="wiki-btn-primary">+ Create Category</Link>
                </div>
              </div>

              <div className="wiki-infobox">
                <div className="wiki-infobox-title">Overview</div>
                <table>
                  <tbody>
                    <tr><td>Categories</td><td>{categories.length}</td></tr>
                    <tr><td>Total pending</td><td>{categories.reduce((sum, c) => sum + (c.pending_count || 0), 0)}</td></tr>
                  </tbody>
                </table>
              </div>
            </aside>
          </div>
        </main>
      </div>
    )
  }

  // Category detail view
  return (
    <div>
      <Navbar />
      <main className="wiki-page" style={{ maxWidth: 1200 }}>

        <div className="wiki-title-bar">
          <nav className="wiki-breadcrumb">
            <Link to="/">Mapedia</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <Link to="/moderation">Moderation</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <span>{categorySlug}</span>
          </nav>
          <h1>Moderation: {categorySlug}</h1>
        </div>

        <main className="mod-main">
          <div className="mod-layout">
            <aside className="mod-sidebar">
              <div className="mod-back">
                <Link to="/moderation">← Back to Categories</Link>
              </div>
              <h2>Pending Review</h2>
              <p className="mod-count">
                {contributions.length} contribution{contributions.length !== 1 ? 's' : ''}
              </p>
              {contributions.length === 0 ? (
                <p className="mod-empty">No pending items.</p>
              ) : (
                <>
                  <div className="mod-bulk-bar">
                    <label className="mod-check-all">
                      <input
                        type="checkbox"
                        checked={checkedIds.size === contributions.length}
                        onChange={toggleAll}
                      />
                      {checkedIds.size > 0 ? `${checkedIds.size} selected` : 'Select all'}
                    </label>
                    {checkedIds.size > 0 && (
                      <div className="mod-bulk-actions">
                        <button
                          className="mod-btn-approve mod-btn-sm"
                          onClick={handleBulkApprove}
                          disabled={bulkProcessing}
                        >
                          {bulkProcessing ? '…' : `Approve (${checkedIds.size})`}
                        </button>
                        <button
                          className="mod-btn-reject mod-btn-sm"
                          onClick={handleBulkReject}
                          disabled={bulkProcessing}
                        >
                          {bulkProcessing ? '…' : `Reject (${checkedIds.size})`}
                        </button>
                      </div>
                    )}
                  </div>
                  <ul className="mod-list">
                    {contributions.map(c => (
                      <li key={c.id} className="mod-list-row">
                        <input
                          type="checkbox"
                          className="mod-list-check"
                          checked={checkedIds.has(c.id)}
                          onChange={() => toggleCheck(c.id)}
                        />
                        <button
                          className={`mod-list-item ${selected?.id === c.id ? 'mod-list-item-active' : ''}`}
                          onClick={() => { setSelected(c); setActiveTab('contributions') }}
                        >
                          <span className="mod-item-type">{c.contribution_type.replace('_', ' ')}</span>
                          <span className="mod-item-name">{c.payload.name || 'Unnamed Entry'}</span>
                          <span className="mod-item-meta">
                            by {c.contributor} · {new Date(c.created_at).toLocaleDateString()}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </aside>

            <section className="mod-content">
              <div className="mod-tabs">
                <button className={`mod-tab ${activeTab === 'contributions' ? 'mod-tab-active' : ''}`} onClick={() => setActiveTab('contributions')}>
                  Contributions
                  {contributions.length > 0 && (
                    <span className="mod-tab-badge">{contributions.length}</span>
                  )}
                </button>
                <button className={`mod-tab ${activeTab === 'venues' ? 'mod-tab-active' : ''}`} onClick={() => setActiveTab('venues')}>Venues</button>
                <button className={`mod-tab ${activeTab === 'fields' ? 'mod-tab-active' : ''}`} onClick={() => setActiveTab('fields')}>Manage Fields</button>
                <button className={`mod-tab ${activeTab === 'settings' ? 'mod-tab-active' : ''}`} onClick={() => setActiveTab('settings')}>Category Settings</button>
                <button className={`mod-tab ${activeTab === 'history' ? 'mod-tab-active' : ''}`} onClick={() => setActiveTab('history')}>History</button>
              </div>

              {activeTab === 'contributions' && (
                !selected ? (
                  <div className="mod-empty-state">
                    <p>Select a contribution to start reviewing</p>
                  </div>
                ) : (
                  <div className="mod-detail">
                    <div className="mod-detail-header">
                      <h2>{selected.payload.name || 'Review Submission'}</h2>
                      <span className="mod-badge">{selected.contribution_type.replace('_', ' ')}</span>
                    </div>
                    <p className="mod-contributor">
                      Submitted by <strong>{selected.contributor}</strong> on {new Date(selected.created_at).toLocaleString()}
                    </p>
                    <div className="mod-section">
                      <h3>Submitted Data</h3>
                      {renderPayload(selected.payload)}
                    </div>
                    {selected.payload.latitude && selected.payload.longitude && (
                      <div className="mod-section">
                        <h3>Location</h3>
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${selected.payload.latitude}&mlon=${selected.payload.longitude}&zoom=16`}
                          target="_blank" rel="noreferrer" className="mod-osm-link"
                        >
                          View on OpenStreetMap
                        </a>
                      </div>
                    )}
                    <div className="mod-section">
                      <h3>Rejection Note (optional)</h3>
                      <textarea
                        className="mod-reject-note"
                        placeholder="Provide a reason if rejecting..."
                        value={rejectNote}
                        onChange={e => setRejectNote(e.target.value)}
                      />
                    </div>
                    <div className="mod-actions">
                      <button className="mod-btn-approve" onClick={() => handleApprove(selected.id)} disabled={processing}>
                        {processing ? 'Saving...' : 'Approve'}
                      </button>
                      <button className="mod-btn-reject" onClick={() => handleReject(selected.id)} disabled={processing}>
                        Reject
                      </button>
                    </div>
                  </div>
                )
              )}

              {activeTab === 'venues' && (
                <VenueManager categorySlug={categorySlug} token={token} />
              )}

              {activeTab === 'fields' && (
                <FieldManager categorySlug={categorySlug} token={token} />
              )}

              {activeTab === 'settings' && (
                <CategorySettings categorySlug={categorySlug} token={token} />
              )}

              {activeTab === 'history' && (
                <HistoryTab categorySlug={categorySlug} token={token} />
              )}
            </section>
          </div>
        </main>
      </main>
    </div>
  )
}

export default ModerationPage
