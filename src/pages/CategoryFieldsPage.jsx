import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/client'
import '../styles/CategoryFieldsPage.css'

const FIELD_TYPES = [
  { value: 'boolean',      label: 'Yes / No',       icon: '☑',  description: 'A simple on/off toggle.' },
  { value: 'string',       label: 'Short Text',      icon: '✏️',  description: 'One line of text.' },
  { value: 'text',         label: 'Long Text',       icon: '📝',  description: 'Multi-line notes.' },
  { value: 'integer',      label: 'Whole Number',    icon: '🔢',  description: 'e.g. number of stalls' },
  { value: 'decimal',      label: 'Decimal',         icon: '💰',  description: 'e.g. entry fee: 2.50' },
  { value: 'url',          label: 'Website Link',    icon: '🔗',  description: 'A URL starting with https://' },
  { value: 'choice',       label: 'Single Choice',   icon: '🔘',  description: 'Pick one from your list.' },
  { value: 'multi_choice', label: 'Multiple Choice', icon: '✅',  description: 'Pick one or more.' },
]

const CHOICE_TYPES = ['choice', 'multi_choice']

const EMPTY_FIELD = { name: '', label: '', field_type: 'boolean', is_required: false, is_public: true, help_text: '', order: 0 }
const EMPTY_CHOICE = { value: '', label: '', icon: '', order: 0 }

function toKey(label) {
  return label.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

function FieldTypeGrid({ value, onChange, disabled }) {
  return (
    <div className="cf-type-grid">
      {FIELD_TYPES.map(t => (
        <button
          key={t.value}
          type="button"
          className={`cf-type-card${value === t.value ? ' cf-type-card--active' : ''}`}
          onClick={() => !disabled && onChange(t.value)}
          disabled={disabled}
          title={t.description}
        >
          <span className="cf-type-icon">{t.icon}</span>
          <span className="cf-type-name">{t.label}</span>
          <span className="cf-type-desc">{t.description}</span>
        </button>
      ))}
    </div>
  )
}

function ChoicesEditor({ choices, onChange, onAdd, onRemove, onMove, disableValue }) {
  return (
    <div className="cf-choices">
      <div className="cf-choices-header">
        <span>Options <small>(at least 2)</small></span>
        <button type="button" className="cf-choices-add" onClick={onAdd}>+ Add option</button>
      </div>
      {choices.map((choice, i) => (
        <div key={i} className="cf-choice-row">
          <div className="cf-choice-reorder">
            <button type="button" onClick={() => onMove(i, -1)} disabled={i === 0}>↑</button>
            <button type="button" onClick={() => onMove(i, 1)} disabled={i === choices.length - 1}>↓</button>
          </div>
          <input
            className="cf-input"
            placeholder="Label shown to users"
            value={choice.label}
            onChange={e => onChange(i, 'label', e.target.value)}
          />
          <input
            className="cf-input cf-input--narrow"
            placeholder="Emoji (optional)"
            value={choice.icon || ''}
            onChange={e => onChange(i, 'icon', e.target.value)}
            style={{ width: 90 }}
          />
          <button
            type="button"
            className="cf-choice-remove"
            onClick={() => onRemove(i)}
            disabled={choices.length <= 1}
          >✕</button>
        </div>
      ))}
    </div>
  )
}

function FieldForm({ form, choices, onFormChange, onChoiceChange, onChoiceAdd, onChoiceRemove, onChoiceMove, nameEdited, setNameEdited, isEdit }) {
  function handleLabelChange(e) {
    onFormChange({ label: e.target.value, ...(!nameEdited ? { name: toKey(e.target.value) } : {}) })
  }

  return (
    <div className="cf-field-form">

      {/* Label — first, most important */}
      <div className="cf-form-field">
        <label className="cf-label">Display name *
          <span className="cf-label-hint">Shown to contributors and on the venue page</span>
        </label>
        <input
          className="cf-input"
          placeholder="e.g. Is it free? / Opening hours / Condition"
          value={form.label}
          onChange={handleLabelChange}
          autoFocus={!isEdit}
        />
      </div>

      {/* Type picker */}
      <div className="cf-form-field">
        <label className="cf-label">Field type *
          {isEdit && <span className="cf-label-hint cf-label-locked">Cannot be changed after saving</span>}
        </label>
        <FieldTypeGrid
          value={form.field_type}
          onChange={val => onFormChange({ field_type: val })}
          disabled={isEdit}
        />
      </div>

      {/* Choice editor */}
      {CHOICE_TYPES.includes(form.field_type) && (
        <ChoicesEditor
          choices={choices}
          onChange={onChoiceChange}
          onAdd={onChoiceAdd}
          onRemove={onChoiceRemove}
          onMove={onChoiceMove}
          disableValue={isEdit}
        />
      )}

      {/* Advanced — collapsible feel but always visible */}
      <div className="cf-form-advanced">

        <div className="cf-form-field">
          <label className="cf-label">Help text
            <span className="cf-label-hint">Optional guidance shown when filling in this field</span>
          </label>
          <input
            className="cf-input"
            placeholder="e.g. Check the sign at the entrance"
            value={form.help_text}
            onChange={e => onFormChange({ help_text: e.target.value })}
          />
        </div>

        <div className="cf-checkboxes">
          <label className="cf-checkbox-label">
            <input type="checkbox" checked={form.is_required} onChange={e => onFormChange({ is_required: e.target.checked })} />
            <span><strong>Required</strong> — contributors must fill this in</span>
          </label>
          <label className="cf-checkbox-label">
            <input type="checkbox" checked={form.is_public} onChange={e => onFormChange({ is_public: e.target.checked })} />
            <span><strong>Public</strong> — visible to everyone</span>
          </label>
        </div>

        {/* Internal name — shown but tucked away */}
        <div className="cf-form-field cf-form-field--dimmed">
          <label className="cf-label">Internal key
            {isEdit && <span className="cf-label-hint cf-label-locked">Cannot be changed</span>}
          </label>
          <input
            className="cf-input cf-input--mono"
            placeholder="auto_generated"
            value={form.name}
            onChange={e => { setNameEdited(true); onFormChange({ name: e.target.value }) }}
            disabled={isEdit}
          />
          <span className="cf-hint">Used in the API. Auto-generated from the display name.</span>
        </div>

      </div>
    </div>
  )
}

function CategoryFieldsPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('access')

  const [fields, setFields]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [editingId, setEditingId]     = useState(null)
  const [editForm, setEditForm]       = useState(EMPTY_FIELD)
  const [editChoices, setEditChoices] = useState([])
  const [showAdd, setShowAdd]         = useState(false)
  const [addForm, setAddForm]         = useState(EMPTY_FIELD)
  const [addChoices, setAddChoices]   = useState([{ ...EMPTY_CHOICE }])
  const [addNameEdited, setAddNameEdited]   = useState(false)
  const [editNameEdited, setEditNameEdited] = useState(false)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => { loadFields() }, [slug])

  function loadFields() {
    setLoading(true)
    api.get(`/categories/${slug}/fields/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setFields(res.data))
      .catch(err => console.error('Failed to load fields:', err))
      .finally(() => setLoading(false))
  }

  // ── Choices helpers ────────────────────────────────────────────
  function choiceChange(list, setList, i, key, val) {
    setList(prev => prev.map((c, idx) => idx === i ? { ...c, [key]: val } : c))
  }
  function choiceAdd(list, setList) {
    setList(prev => [...prev, { ...EMPTY_CHOICE, order: prev.length }])
  }
  function choiceRemove(list, setList, i) {
    if (list.length > 1) setList(prev => prev.filter((_, idx) => idx !== i))
  }
  function choiceMove(list, setList, i, dir) {
    const n = i + dir
    if (n < 0 || n >= list.length) return
    const a = [...list]; [a[i], a[n]] = [a[n], a[i]]; a.forEach((c, idx) => c.order = idx)
    setList(a)
  }

  function buildPayload(form, choices) {
    return {
      ...form,
      choices: CHOICE_TYPES.includes(form.field_type)
        ? choices
            .filter(c => c.label.trim())
            .map((c, i) => ({
              ...c,
              value: c.value.trim() || toKey(c.label),
              order: i
            }))
        : []
    }
  }

  // ── Edit ──────────────────────────────────────────────────────
  function startEdit(field) {
    setEditingId(field.id)
    setEditForm({ name: field.name, label: field.label, field_type: field.field_type, is_required: field.is_required, is_public: field.is_public, help_text: field.help_text || '', order: field.order })
    setEditChoices(CHOICE_TYPES.includes(field.field_type) && field.choices?.length > 0 ? field.choices.map(c => ({ ...c })) : [{ ...EMPTY_CHOICE }])
    setEditNameEdited(true)
    setError('')
  }
  function cancelEdit() { setEditingId(null); setEditForm(EMPTY_FIELD); setEditChoices([]); setError('') }

  function saveEdit() {
    if (!editForm.label.trim()) { setError('Display name is required.'); return }
    if (CHOICE_TYPES.includes(editForm.field_type) && editChoices.filter(c => c.label.trim()).length < 2) { setError('At least 2 options are required.'); return }
    setSaving(true); setError('')
    api.patch(`/categories/${slug}/fields/${editingId}/edit/`, buildPayload(editForm, editChoices), { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { loadFields(); cancelEdit() })
      .catch(err => { const d = err.response?.data; setError(typeof d === 'string' ? d : JSON.stringify(d) || 'Error') })
      .finally(() => setSaving(false))
  }

  function deleteField(field) {
    if (!window.confirm(`Delete "${field.label}"? This cannot be undone.`)) return
    api.delete(`/categories/${slug}/fields/${field.id}/delete/`, { headers: { Authorization: `Bearer ${token}` } }).then(() => loadFields())
  }

  // ── Add ───────────────────────────────────────────────────────
  function openAdd() {
    setShowAdd(true)
    setAddForm({ ...EMPTY_FIELD, order: fields.length })
    setAddChoices([{ ...EMPTY_CHOICE }])
    setAddNameEdited(false)
    setError('')
  }
  function cancelAdd() { setShowAdd(false); setAddForm(EMPTY_FIELD); setAddChoices([]); setError('') }

  function saveAdd() {
    if (!addForm.label.trim()) { setError('Display name is required.'); return }
    if (!addForm.name.trim()) { setError('Internal key is required.'); return }
    if (CHOICE_TYPES.includes(addForm.field_type)) {
      const valid = addChoices.filter(c => c.label.trim())
      if (valid.length < 2) { setError('At least 2 options are required.'); return }
    }
    setSaving(true); setError('')
    api.post(`/categories/${slug}/fields/add/`, buildPayload(addForm, addChoices), { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { loadFields(); cancelAdd() })
      .catch(err => { const d = err.response?.data; setError(typeof d === 'string' ? d : Object.values(d).flat().join(' ') || 'Error') })
      .finally(() => setSaving(false))
  }

  return (
    <div>
      <Navbar />
      <main className="cf-page">

        <div className="cf-header">
          <div>
            <div className="cf-breadcrumb">
              <button type="button" className="cf-back-btn" onClick={() => navigate(`/category/${slug}`)}>
                ← Back to category
              </button>
            </div>
            <h1 className="cf-title">Add Fields — <span className="cf-slug">{slug}</span></h1>
            <p className="cf-subtitle">
              Fields define what information gets collected for each place in this category.
              Without fields, places only have a name and location.
            </p>
          </div>
          <div className="cf-step-badge">Step 2 of 2</div>
        </div>

        {/* Field list */}
        {loading ? (
          <p className="cf-empty">Loading…</p>
        ) : fields.length === 0 && !showAdd ? (
          <div className="cf-empty-state">
            <div className="cf-empty-icon">📋</div>
            <p>No fields yet.</p>
            <p className="cf-empty-hint">Fields define what contributors fill in — opening hours, a yes/no question, a condition rating, etc.</p>
          </div>
        ) : (
          <ul className="cf-list">
            {fields.map(field => (
              <li key={field.id} className="cf-item">
                {editingId === field.id ? (
                  <div className="cf-edit-wrapper">
                    <div className="cf-edit-title">Editing: {field.label}</div>
                    {error && <div className="cf-error">{error}</div>}
                    <FieldForm
                      form={editForm}
                      choices={editChoices}
                      onFormChange={updates => setEditForm(prev => ({ ...prev, ...updates }))}
                      onChoiceChange={(i, k, v) => choiceChange(editChoices, setEditChoices, i, k, v)}
                      onChoiceAdd={() => choiceAdd(editChoices, setEditChoices)}
                      onChoiceRemove={i => choiceRemove(editChoices, setEditChoices, i)}
                      onChoiceMove={(i, dir) => choiceMove(editChoices, setEditChoices, i, dir)}
                      nameEdited={editNameEdited}
                      setNameEdited={setEditNameEdited}
                      isEdit
                    />
                    <div className="cf-form-btns">
                      <button className="cf-btn-save" onClick={saveEdit} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
                      <button className="cf-btn-cancel" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="cf-field-row">
                    <div className="cf-field-info">
                      <span className="cf-field-label">{field.label}</span>
                      <span className="cf-field-type">
                        {FIELD_TYPES.find(t => t.value === field.field_type)?.icon}{' '}
                        {FIELD_TYPES.find(t => t.value === field.field_type)?.label || field.field_type}
                      </span>
                      {CHOICE_TYPES.includes(field.field_type) && field.choices_count > 0 && (
                        <span className="cf-field-meta">{field.choices_count} options</span>
                      )}
                      {field.is_required && <span className="cf-badge cf-badge--required">required</span>}
                      {field.help_text && <span className="cf-field-help">{field.help_text}</span>}
                    </div>
                    <div className="cf-field-btns">
                      <button className="cf-btn-edit" onClick={() => startEdit(field)}>Edit</button>
                      <button className="cf-btn-delete" onClick={() => deleteField(field)}>Delete</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Add form */}
        {showAdd ? (
          <div className="cf-add-wrapper">
            <div className="cf-edit-title">New field</div>
            {error && <div className="cf-error">{error}</div>}
            <FieldForm
              form={addForm}
              choices={addChoices}
              onFormChange={updates => setAddForm(prev => ({ ...prev, ...updates }))}
              onChoiceChange={(i, k, v) => choiceChange(addChoices, setAddChoices, i, k, v)}
              onChoiceAdd={() => choiceAdd(addChoices, setAddChoices)}
              onChoiceRemove={i => choiceRemove(addChoices, setAddChoices, i)}
              onChoiceMove={(i, dir) => choiceMove(addChoices, setAddChoices, i, dir)}
              nameEdited={addNameEdited}
              setNameEdited={setAddNameEdited}
              isEdit={false}
            />
            <div className="cf-form-btns">
              <button className="cf-btn-save" onClick={saveAdd} disabled={saving}>{saving ? 'Saving…' : 'Add Field'}</button>
              <button className="cf-btn-cancel" onClick={cancelAdd}>Cancel</button>
            </div>
          </div>
        ) : (
          !editingId && (
            <button className="cf-btn-add-field" onClick={openAdd}>+ Add a field</button>
          )
        )}

        {/* Done */}
        {!showAdd && !editingId && (
          <div className="cf-done-row">
            <button className="cf-btn-done" onClick={() => navigate(`/category/${slug}`)}>
              Done — go to category →
            </button>
          </div>
        )}

      </main>
    </div>
  )
}

export default CategoryFieldsPage
