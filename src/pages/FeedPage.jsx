import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import api from '../api/client'
import '../styles/FeedPage.css'

/* ── Star picker ── */
function Stars({ value, onChange, readonly = false }) {
  return (
    <div className="feed-stars">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`feed-star ${n <= value ? 'feed-star-on' : ''}`}
          onClick={() => !readonly && onChange && onChange(n)}
          disabled={readonly}
          aria-label={`${n} star`}
        >★</button>
      ))}
    </div>
  )
}

/* ── Comment popup ── */
function CommentPopup({ venue, onClose }) {
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const backdropRef = useRef(null)

  function handleBackdrop(e) {
    if (e.target === backdropRef.current) onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!score) { toast.error('Please select a rating'); return }
    setSubmitting(true)
    try {
      await api.post(`/venues/${venue.slug}/rate/`, { score, comment })
      toast.success('Rating submitted!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="feed-popup-backdrop" ref={backdropRef} onClick={handleBackdrop}>
      <div className="feed-popup">
        <div className="feed-popup-header">
          <span>Rate & Comment</span>
          <button className="feed-popup-close" onClick={onClose}>✕</button>
        </div>
        <div className="feed-popup-venue">
          <Link to={`/venue/${venue.slug}`} onClick={onClose}>{venue.name}</Link>
          {(venue.city || venue.country) && (
            <span className="feed-popup-loc">{[venue.city, venue.country].filter(Boolean).join(', ')}</span>
          )}
        </div>
        <form onSubmit={handleSubmit} className="feed-popup-form">
          <div className="feed-popup-section">
            <label className="feed-popup-label">Your rating</label>
            <Stars value={score} onChange={setScore} />
          </div>
          <div className="feed-popup-section">
            <label className="feed-popup-label">Comment <span className="feed-popup-optional">(optional)</span></label>
            <textarea
              className="feed-popup-textarea"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience…"
              maxLength={500}
              rows={3}
            />
            <span className="feed-popup-charcount">{comment.length}/500</span>
          </div>
          <button type="submit" className="feed-popup-submit" disabled={submitting || !score}>
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── Reviews popup ── */
function ReviewsPopup({ venue, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const backdropRef = useRef(null)

  function handleBackdrop(e) {
    if (e.target === backdropRef.current) onClose()
  }

  useEffect(() => {
    api.get(`/venues/${venue.slug}/ratings/`)
      .then(res => { setData(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [venue.slug])

  return (
    <div className="feed-popup-backdrop" ref={backdropRef} onClick={handleBackdrop}>
      <div className="feed-popup feed-popup-reviews">
        <div className="feed-popup-header">
          <span>Reviews</span>
          <button className="feed-popup-close" onClick={onClose}>✕</button>
        </div>
        <div className="feed-popup-venue">
          <Link to={`/venue/${venue.slug}`} onClick={onClose}>{venue.name}</Link>
        </div>
        {loading ? (
          <div className="feed-popup-loading">Loading…</div>
        ) : !data || data.results.length === 0 ? (
          <div className="feed-popup-empty">No reviews yet.</div>
        ) : (
          <>
            <div className="feed-reviews-summary">
              <span className="feed-reviews-avg">
                {data.average_rating ? Number(data.average_rating).toFixed(1) : '—'}
              </span>
              <Stars value={Math.round(data.average_rating || 0)} readonly />
              <span className="feed-reviews-total">{data.rating_count} review{data.rating_count !== 1 ? 's' : ''}</span>
            </div>
            <div className="feed-reviews-list">
              {data.results.map(r => (
                <div key={r.id} className="feed-review-item">
                  <div className="feed-review-meta">
                    <Link to={`/profile/${r.username}`} className="feed-review-user" onClick={onClose}>
                      {r.username}
                    </Link>
                    <Stars value={r.score} readonly />
                    <span className="feed-review-date">
                      {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {r.comment && <p className="feed-review-comment">{r.comment}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Feed card ── */
function VenueCard({ venue }) {
  const [showComment, setShowComment] = useState(false)
  const [showReviews, setShowReviews] = useState(false)
  const isLoggedIn = !!localStorage.getItem('access')
  const navigate = useNavigate()

  function openComment() {
    if (!isLoggedIn) { navigate('/login'); return }
    setShowComment(true)
  }

  const timeAgo = (() => {
    const diff = Date.now() - new Date(venue.created_at)
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days}d ago`
    if (days < 365) return `${Math.floor(days / 30)}mo ago`
    return `${Math.floor(days / 365)}y ago`
  })()

  return (
    <article className="feed-card">

      {/* Top: categories + time */}
      <div className="feed-card-top">
        <div className="feed-card-cats">
          {venue.categories.map(cat => (
            <Link key={cat.slug} to={`/category/${cat.slug}`} className="feed-cat-tag">
              {cat.icon && <span>{cat.icon}</span>}
              {cat.name}
            </Link>
          ))}
        </div>
        <span className="feed-card-time">{timeAgo}</span>
      </div>

      {/* Venue name */}
      <Link to={`/venue/${venue.slug}`} className="feed-card-name">
        {venue.name}
      </Link>

      {/* Location */}
      {(venue.city || venue.country) && (
        <div className="feed-card-location">
          {[venue.city, venue.country].filter(Boolean).join(', ')}
        </div>
      )}

      {/* Description */}
      {venue.description && (
        <p className="feed-card-desc">{venue.description.slice(0, 160)}{venue.description.length > 160 ? '…' : ''}</p>
      )}

      {/* Field values */}
      {venue.field_values && venue.field_values.length > 0 && (
        <div className="feed-card-fields">
          {venue.field_values.slice(0, 6).map((fv, i) => (
            <div key={i} className="feed-card-field">
              <span className="feed-field-label">{fv.label}</span>
              <span className={`feed-field-value ${fv.type === 'boolean' ? (fv.value === 'Yes' ? 'feed-field-yes' : 'feed-field-no') : ''}`}>
                {fv.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Rating summary */}
      {venue.rating_count > 0 && (
        <div className="feed-card-rating">
          <Stars value={Math.round(venue.average_rating || 0)} readonly />
          <span className="feed-card-rating-text">
            {Number(venue.average_rating).toFixed(1)} · {venue.rating_count} review{venue.rating_count !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Preview comments */}
      {venue.preview_comments && venue.preview_comments.length > 0 && (
        <div className="feed-preview-comments">
          {venue.preview_comments.map((c, i) => (
            <div key={i} className="feed-preview-comment">
              <div className="feed-preview-comment-meta">
                <Link to={`/profile/${c.username}`} className="feed-preview-comment-user">{c.username}</Link>
                <Stars value={c.score} readonly />
              </div>
              <p className="feed-preview-comment-text">{c.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="feed-card-actions">
        <button className="feed-action-btn" onClick={openComment}>
          Leave a comment
        </button>
        <button className="feed-action-btn" onClick={() => setShowReviews(true)}>
          Read comments
          {venue.rating_count > 0 && <span className="feed-action-count">{venue.rating_count}</span>}
        </button>
        <Link to={`/venue/${venue.slug}`} className="feed-action-btn feed-action-link">
          View page →
        </Link>
      </div>

      {showComment && <CommentPopup venue={venue} onClose={() => setShowComment(false)} />}
      {showReviews && <ReviewsPopup venue={venue} onClose={() => setShowReviews(false)} />}
    </article>
  )
}

/* ── Main page ── */
export default function FeedPage() {
  const isLoggedIn = !!localStorage.getItem('access')
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [followedCount, setFollowedCount] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchFeed = useCallback(async (p = 1, append = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true)
    try {
      const res = await api.get(`/feed/?page=${p}`)
      setVenues(prev => append ? [...prev, ...res.data.results] : res.data.results)
      setHasMore(res.data.has_more)
      setFollowedCount(res.data.followed_count)
    } catch {}
    finally { setLoading(false); setLoadingMore(false) }
  }, [])

  useEffect(() => {
    if (isLoggedIn) fetchFeed(1)
    else setLoading(false)
  }, [fetchFeed, isLoggedIn])

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchFeed(next, true)
  }

  if (!isLoggedIn) {
    return (
      <div>
        <Helmet><title>Feed | Mapedia</title></Helmet>
        <Navbar />
        <main className="feed-main">
          <div className="feed-empty-state">
            <p>Please <Link to="/login">log in</Link> to see your feed.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Helmet>
        <title>Feed | Mapedia</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />
      <main className="feed-main">
        <div className="feed-header">
          <h1>Your Feed</h1>
          {followedCount > 0 && (
            <p className="feed-subheader">
              Following {followedCount} {followedCount === 1 ? 'category' : 'categories'}
            </p>
          )}
        </div>

        {loading ? (
          <div className="feed-loading">Loading…</div>
        ) : followedCount === 0 ? (
          <div className="feed-empty-state">
            <p>You're not following any categories yet.</p>
            <p>Visit a <Link to="/categories">category page</Link> and click Follow.</p>
          </div>
        ) : venues.length === 0 ? (
          <div className="feed-empty-state">
            <p>No venues yet in the categories you follow.</p>
          </div>
        ) : (
          <>
            {venues.map(v => <VenueCard key={v.id} venue={v} />)}
            {hasMore && (
              <div className="feed-more">
                <button className="feed-more-btn" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
