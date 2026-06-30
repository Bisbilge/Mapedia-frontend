import '../styles/Skeleton.css'

function Skeleton({ width, height, borderRadius, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '1em',
        borderRadius: borderRadius || 4,
      }}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({ lines = 3, lastLineWidth = '60%' }) {
  return (
    <div className="skeleton-text">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          height="1em"
        />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton height="20px" width="60%" />
      <SkeletonText lines={2} lastLineWidth="40%" />
    </div>
  )
}

export function SkeletonVenueRow() {
  return (
    <div className="skeleton-venue-row">
      <Skeleton width="40%" height="18px" />
      <Skeleton width="20%" height="14px" />
      <Skeleton width="15%" height="14px" />
    </div>
  )
}

export function SkeletonPage() {
  return (
    <div className="skeleton-page" aria-label="Loading...">
      <Skeleton height="32px" width="40%" className="skeleton-title" />
      <SkeletonText lines={3} />
      {[1, 2, 3, 4, 5].map(i => <SkeletonVenueRow key={i} />)}
    </div>
  )
}

export default Skeleton
