import { useState } from 'react'

function StarRating({ rating, size = 'medium', interactive = false, onRate = null }) {
  const [hoverRating, setHoverRating] = useState(0)
  const sizeClass = size === 'small' ? 'stars-small' : size === 'large' ? 'stars-large' : ''
  const displayRating = hoverRating || rating || 0

  return (
    <div
      className={`star-rating ${sizeClass} ${interactive ? 'interactive' : ''}`}
      onMouseLeave={() => interactive && setHoverRating(0)}
      role={interactive ? 'group' : undefined}
      aria-label={interactive ? 'Rate this venue' : `Rating: ${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`star ${star <= displayRating ? 'filled' : ''}`}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          role={interactive ? 'button' : undefined}
          aria-label={interactive ? `${star} star${star !== 1 ? 's' : ''}` : undefined}
          tabIndex={interactive ? 0 : undefined}
          onKeyDown={interactive ? (e) => e.key === 'Enter' && onRate && onRate(star) : undefined}
        >★</span>
      ))}
    </div>
  )
}

export default StarRating
