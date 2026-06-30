// src/pages/ProfilePage.jsx

import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import api from '../api/client';
import '../styles/wiki.css';
import '../styles/ProfilePage.css';

const MapIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });

const TABS = [
  { key: 'contributions', label: 'Contributions' },
  { key: 'venues', label: 'Contributed Venues' },
  { key: 'ratings', label: 'Ratings' },
  { key: 'categories', label: 'Categories' },
  { key: 'stats', label: 'Stats' },
  { key: 'map', label: 'Map' },
];

const PAGE_SIZE = 15;

// ─── PAGINATION COMPONENT ───────────────────────────────────────
function Pagination({ currentPage, totalPages, totalCount, pageSize, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (left > 2) range.unshift('...');
    if (left > 1) range.unshift(1);
    if (right < totalPages - 1) range.push('...');
    if (right < totalPages) range.push(totalPages);

    return range;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="profile-pagination">
      <button
        className="profile-page-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &larr; Prev
      </button>

      <div className="profile-page-numbers">
        {getPageNumbers().map((num, i) =>
          num === '...' ? (
            <span key={`dots-${i}`} className="profile-page-dots">…</span>
          ) : (
            <button
              key={num}
              className={`profile-page-btn ${currentPage === num ? 'profile-page-btn-active' : ''}`}
              onClick={() => onPageChange(num)}
            >
              {num}
            </button>
          )
        )}
      </div>

      <button
        className="profile-page-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next &rarr;
      </button>

      <span className="profile-page-info">
        {startItem}–{endItem} of {totalCount}
      </span>
    </div>
  );
}

// ─── STATUS FILTER COMPONENT ───────────────────────────────────────
function StatusFilter({ value, onChange, counts }) {
  const filters = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'approved', label: 'Approved', count: counts.approved },
    { key: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  return (
    <div className="profile-status-filter">
      {filters.map(f => (
        <button
          key={f.key}
          className={`profile-filter-btn ${value === f.key ? 'profile-filter-btn-active' : ''}`}
          onClick={() => onChange(f.key)}
        >
          {f.label}
          {f.count > 0 && <span className="profile-filter-count">{f.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ─── CONTRIBUTIONS TAB ───────────────────────────────────────
function ContributionsTab({ contributions }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    setPage(1);
  }, [statusFilter, sortBy]);

  const counts = useMemo(() => {
    if (!contributions) return { all: 0, pending: 0, approved: 0, rejected: 0 };
    return {
      all: contributions.length,
      pending: contributions.filter(c => c.status === 'pending').length,
      approved: contributions.filter(c => c.status === 'approved').length,
      rejected: contributions.filter(c => c.status === 'rejected').length,
    };
  }, [contributions]);

  const filteredContributions = useMemo(() => {
    if (!contributions) return [];

    let result = [...contributions];

    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'date_asc') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

    return result;
  }, [contributions, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredContributions.length / PAGE_SIZE);
  const paginatedContributions = filteredContributions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (!contributions || contributions.length === 0) {
    return <p className="profile-empty">No contributions yet.</p>;
  }

  return (
    <div className="profile-contributions">
      <div className="profile-toolbar">
        <StatusFilter value={statusFilter} onChange={setStatusFilter} counts={counts} />

        <select
          className="profile-sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="name">By name</option>
        </select>
      </div>

      {paginatedContributions.length === 0 ? (
        <p className="profile-empty">No {statusFilter} contributions.</p>
      ) : (
        <table className="profile-contributions-table">
          <thead>
            <tr>
              <th>Venue</th>
              <th>Category</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedContributions.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.venue_slug ? (
                    <Link to={`/venue/${c.venue_slug}`} className="profile-link">
                      {c.name || 'Unnamed'}
                    </Link>
                  ) : (
                    <span>{c.name || 'Unnamed'}</span>
                  )}
                </td>
                <td>
                  {c.category_slug ? (
                    <Link to={`/category/${c.category_slug}`} className="profile-category-link">
                      {c.category_slug}
                    </Link>
                  ) : '—'}
                </td>
                <td className="contrib-type">{c.type?.replace('_', ' ') || '—'}</td>
                <td>
                  <span className={`contrib-status contrib-status-${c.status}`}>
                    {c.status}
                  </span>
                </td>
                <td className="contrib-date">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={filteredContributions.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}

// ─── VENUES TAB ───────────────────────────────────────
function VenuesTab({ venues }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredVenues = useMemo(() => {
    if (!venues) return [];
    if (!search.trim()) return venues;

    const q = search.toLowerCase();
    return venues.filter(v =>
      v.name?.toLowerCase().includes(q) ||
      v.city?.toLowerCase().includes(q) ||
      v.country?.toLowerCase().includes(q) ||
      v.category_name?.toLowerCase().includes(q)
    );
  }, [venues, search]);

  const totalPages = Math.ceil(filteredVenues.length / PAGE_SIZE);
  const paginatedVenues = filteredVenues.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (!venues || venues.length === 0) {
    return <p className="profile-empty">Has not contributed to any venues yet.</p>;
  }

  return (
    <div className="profile-venues">
      <div className="profile-toolbar">
        <input
          type="text"
          className="profile-search"
          placeholder="Search venues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="profile-result-count">
          {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''}
          {search && ' found'}
        </span>
      </div>

      {paginatedVenues.length === 0 ? (
        <p className="profile-empty">No venues match your search.</p>
      ) : (
        <div className="profile-venues-grid">
          {paginatedVenues.map((v) => (
            <Link
              key={v.id}
              to={`/venue/${v.slug}`}
              className="profile-venue-card"
            >
              <span className="profile-venue-name">{v.name}</span>
              <span className="profile-venue-meta">
                {[v.city, v.country].filter(Boolean).join(', ') || 'Unknown location'}
              </span>
              {v.category_name && (
                <span className="profile-venue-category">{v.category_name}</span>
              )}
            </Link>
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={filteredVenues.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}

// ─── RATINGS TAB ───────────────────────────────────────
function RatingsTab({ ratings, username, isOwnProfile }) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('date_desc');
  const [filterScore, setFilterScore] = useState('all');

  useEffect(() => {
    setPage(1);
  }, [sortBy, filterScore]);

  const filteredRatings = useMemo(() => {
    if (!ratings) return [];

    let result = [...ratings];

    if (filterScore !== 'all') {
      const score = parseInt(filterScore);
      result = result.filter(r => r.score === score);
    }

    result.sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'date_asc') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'score_desc') return b.score - a.score;
      if (sortBy === 'score_asc') return a.score - b.score;
      return 0;
    });

    return result;
  }, [ratings, sortBy, filterScore]);

  const totalPages = Math.ceil(filteredRatings.length / PAGE_SIZE);
  const paginatedRatings = filteredRatings.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const stats = useMemo(() => {
    if (!ratings || ratings.length === 0) return null;

    const total = ratings.length;
    const sum = ratings.reduce((acc, r) => acc + r.score, 0);
    const avg = sum / total;
    const withComment = ratings.filter(r => r.comment && r.comment.trim()).length;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(r => distribution[r.score]++);

    let mostGiven = 5;
    let maxCount = 0;
    for (const [score, count] of Object.entries(distribution)) {
      if (count > maxCount) {
        maxCount = count;
        mostGiven = parseInt(score);
      }
    }

    return { total, avg: avg.toFixed(1), withComment, distribution, mostGiven };
  }, [ratings]);

  if (!ratings || ratings.length === 0) {
    return (
      <div className="profile-ratings-empty">
        <p className="profile-empty">
          {isOwnProfile ? "You haven't rated any venues yet." : `${username} hasn't rated any venues yet.`}
        </p>
        {isOwnProfile && (
          <Link to="/" className="profile-cta-btn">Explore venues to rate &rarr;</Link>
        )}
      </div>
    );
  }

  return (
    <div className="profile-ratings">
      <div className="ratings-summary">
        <div className="ratings-summary-main">
          <span className="ratings-summary-avg">{stats.avg}</span>
          <StarRating rating={Math.round(stats.avg)} />
          <span className="ratings-summary-count">{stats.total} ratings</span>
        </div>
        <div className="ratings-summary-details">
          <span>Most given: <strong>{stats.mostGiven} stars</strong></span>
          <span>With comments: <strong>{stats.withComment}</strong></span>
        </div>
      </div>

      <div className="profile-toolbar">
        <div className="profile-score-filter">
          <button
            className={`profile-filter-btn ${filterScore === 'all' ? 'profile-filter-btn-active' : ''}`}
            onClick={() => setFilterScore('all')}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map(score => (
            <button
              key={score}
              className={`profile-filter-btn ${filterScore === String(score) ? 'profile-filter-btn-active' : ''}`}
              onClick={() => setFilterScore(String(score))}
            >
              {score} stars <span className="filter-count-small">({stats.distribution[score]})</span>
            </button>
          ))}
        </div>

        <select
          className="profile-sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="score_desc">Highest rated</option>
          <option value="score_asc">Lowest rated</option>
        </select>
      </div>

      {paginatedRatings.length === 0 ? (
        <p className="profile-empty">No {filterScore}-star ratings.</p>
      ) : (
        <div className="profile-ratings-list">
          {paginatedRatings.map((r) => (
            <div key={r.id} className="profile-rating-card">
              <div className="profile-rating-header">
                <Link to={`/venue/${r.venue.slug}`} className="profile-rating-venue">
                  {r.venue.name}
                </Link>
                <StarRating rating={r.score} size="small" />
              </div>

              {r.venue.city && (
                <span className="profile-rating-location">
                  {r.venue.city}{r.venue.country ? `, ${r.venue.country}` : ''}
                </span>
              )}

              {r.comment && (
                <p className="profile-rating-comment">{r.comment}</p>
              )}

              <span className="profile-rating-date">
                {new Date(r.created_at).toLocaleDateString('en-GB', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </span>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={filteredRatings.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}

// ─── CATEGORIES TAB ───────────────────────────────────────
function CategoriesTab({ ownedCategories, moderatedCategories }) {
  const hasOwned = ownedCategories?.length > 0;
  const hasModerated = moderatedCategories?.length > 0;

  if (!hasOwned && !hasModerated) {
    return <p className="profile-empty">No categories yet.</p>;
  }

  return (
    <div className="profile-categories">
      {hasOwned && (
        <div className="profile-cat-section">
          <h3 className="profile-cat-title">
            Categories Owned
            <span className="profile-cat-count">{ownedCategories.length}</span>
          </h3>
          <div className="profile-cat-list">
            {ownedCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="profile-cat-card"
              >
                <span className="profile-cat-name">{cat.name}</span>
                {cat.venue_count !== undefined && (
                  <span className="profile-cat-venues">{cat.venue_count} venues</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {hasModerated && (
        <div className="profile-cat-section">
          <h3 className="profile-cat-title">
            Categories Moderated
            <span className="profile-cat-count">{moderatedCategories.length}</span>
          </h3>
          <div className="profile-cat-list">
            {moderatedCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="profile-cat-card"
              >
                <span className="profile-cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STATS TAB ───────────────────────────────────────
function StatsTab({ profile }) {
  const stats = useMemo(() => {
    if (!profile) return null;

    const joinDate = new Date(profile.date_joined);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const daysJoined = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const contribCount = profile.contribution_count || 0;
    const contribsPerDay = (contribCount / daysJoined).toFixed(2);

    let successRate = 0;
    let favoriteCat = null;
    let approvedCount = 0;
    let rejectedCount = 0;
    let pendingCount = 0;

    if (profile.contributions?.length > 0) {
      const catCounts = {};

      profile.contributions.forEach(c => {
        if (c.status === 'approved') approvedCount++;
        else if (c.status === 'rejected') rejectedCount++;
        else if (c.status === 'pending') pendingCount++;

        if (c.category_slug) {
          catCounts[c.category_slug] = (catCounts[c.category_slug] || 0) + 1;
        }
      });

      const totalDecided = approvedCount + rejectedCount;
      if (totalDecided > 0) {
        successRate = Math.round((approvedCount / totalDecided) * 100);
      } else if (approvedCount > 0) {
        successRate = 100;
      }

      let maxCount = 0;
      for (const [cat, count] of Object.entries(catCounts)) {
        if (count > maxCount) {
          maxCount = count;
          favoriteCat = cat;
        }
      }
    }

    const ratings = profile.recent_ratings || [];
    const ratingsCount = profile.ratings_given_count || ratings.length;
    const avgRating = profile.average_rating_given;

    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingsWithComment = 0;
    let mostGivenScore = null;
    let firstRatingDate = null;
    let lastRatingDate = null;

    if (ratings.length > 0) {
      ratings.forEach(r => {
        ratingDistribution[r.score] = (ratingDistribution[r.score] || 0) + 1;
        if (r.comment && r.comment.trim()) ratingsWithComment++;
      });

      let maxScoreCount = 0;
      for (const [score, count] of Object.entries(ratingDistribution)) {
        if (count > maxScoreCount) {
          maxScoreCount = count;
          mostGivenScore = parseInt(score);
        }
      }

      const sortedByDate = [...ratings].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      firstRatingDate = sortedByDate[0]?.created_at;
      lastRatingDate = sortedByDate[sortedByDate.length - 1]?.created_at;
    }

    let ratingPersonality = null;
    if (avgRating) {
      if (avgRating >= 4.2) ratingPersonality = { type: 'generous', label: 'Generous Rater', color: '#27ae60' };
      else if (avgRating <= 2.5) ratingPersonality = { type: 'tough', label: 'Tough Critic', color: '#e74c3c' };
      else if (avgRating >= 2.8 && avgRating <= 3.2) ratingPersonality = { type: 'balanced', label: 'Balanced Judge', color: '#3498db' };
      else if (avgRating >= 3.5) ratingPersonality = { type: 'positive', label: 'Positive Reviewer', color: '#9b59b6' };
      else ratingPersonality = { type: 'critical', label: 'Critical Thinker', color: '#f39c12' };
    }

    const badges = [];
    if (ratingsCount >= 100) badges.push({ label: 'Century Reviewer', desc: '100+ ratings' });
    else if (ratingsCount >= 50) badges.push({ label: 'Prolific Reviewer', desc: '50+ ratings' });
    else if (ratingsCount >= 10) badges.push({ label: 'Active Reviewer', desc: '10+ ratings' });

    if (ratingsWithComment >= 10) badges.push({ label: 'Comment Writer', desc: 'Leaves detailed feedback' });
    if (ratingDistribution[5] >= 20) badges.push({ label: '5-Star Fan', desc: 'Gave 20+ perfect scores' });
    if (ratingDistribution[1] >= 5) badges.push({ label: 'Honest Critic', desc: 'Not afraid to rate low' });
    if (contribCount >= 50 && ratingsCount >= 20) badges.push({ label: 'Power User', desc: 'Active contributor & reviewer' });

    const ratingsPerDay = ratingsCount > 0 && daysJoined > 0
      ? (ratingsCount / daysJoined).toFixed(2)
      : '0.00';

    return {
      daysJoined,
      contribsPerDay,
      successRate,
      favoriteCat,
      approvedCount,
      rejectedCount,
      pendingCount,
      totalContributions: contribCount,
      totalVenues: profile.my_venues?.length || 0,
      totalCategories: (profile.owned_categories?.length || 0) + (profile.moderated_categories?.length || 0),
      ratingsCount,
      avgRating,
      ratingDistribution,
      ratingsWithComment,
      mostGivenScore,
      ratingPersonality,
      badges,
      ratingsPerDay,
      firstRatingDate,
      lastRatingDate,
    };
  }, [profile]);

  if (!stats) return null;

  return (
    <div className="profile-stats-tab">
      {stats.badges.length > 0 && (
        <>
          <h3 className="profile-section-title">Badges Earned</h3>
          <div className="profile-badges">
            {stats.badges.map((badge, i) => (
              <div key={i} className="profile-badge">
                <span className="profile-badge-label">{badge.label}</span>
                <span className="profile-badge-desc">{badge.desc}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <h3 className="profile-section-title">Activity Overview</h3>
      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <div className="profile-stat-value">{stats.daysJoined}</div>
          <div className="profile-stat-label">Days on Mapedia</div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-value">{stats.contribsPerDay}</div>
          <div className="profile-stat-label">Contributions / Day</div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-value">{stats.totalContributions}</div>
          <div className="profile-stat-label">Total Contributions</div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-value">{stats.totalVenues}</div>
          <div className="profile-stat-label">Venues Contributed</div>
        </div>
      </div>

      {stats.ratingsCount > 0 && (
        <>
          <h3 className="profile-section-title" style={{ marginTop: 32 }}>Rating Stats</h3>

          {stats.ratingPersonality && (
            <div
              className="profile-personality-card"
              style={{ borderColor: stats.ratingPersonality.color }}
            >
              <span
                className="profile-personality-label"
                style={{ color: stats.ratingPersonality.color }}
              >
                {stats.ratingPersonality.label}
              </span>
              <span className="profile-personality-avg">
                Average rating: {stats.avgRating} / 5
              </span>
            </div>
          )}

          <div className="profile-stats-grid">
            <div className="profile-stat-card">
              <div className="profile-stat-value">{stats.ratingsCount}</div>
              <div className="profile-stat-label">Total Ratings</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-value" style={{ color: '#f5a623' }}>
                {stats.avgRating || '—'} / 5
              </div>
              <div className="profile-stat-label">Average Given</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-value">{stats.mostGivenScore} stars</div>
              <div className="profile-stat-label">Most Given Score</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-value">{stats.ratingsWithComment}</div>
              <div className="profile-stat-label">With Comments</div>
            </div>
          </div>

          <div className="profile-rating-distribution">
            <h4>Rating Distribution</h4>
            <div className="distribution-bars">
              {[5, 4, 3, 2, 1].map(score => {
                const count = stats.ratingDistribution[score] || 0;
                const percentage = stats.ratingsCount > 0 ? (count / stats.ratingsCount) * 100 : 0;
                return (
                  <div key={score} className="distribution-row">
                    <span className="distribution-label">{score} stars</span>
                    <div className="distribution-bar">
                      <div
                        className="distribution-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="distribution-count">{count}</span>
                    <span className="distribution-percent">({percentage.toFixed(0)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="profile-stats-grid" style={{ marginTop: 16 }}>
            <div className="profile-stat-card">
              <div className="profile-stat-value">{stats.ratingsPerDay}</div>
              <div className="profile-stat-label">Ratings / Day</div>
            </div>
            {stats.firstRatingDate && (
              <div className="profile-stat-card">
                <div className="profile-stat-value" style={{ fontSize: 16 }}>
                  {new Date(stats.firstRatingDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </div>
                <div className="profile-stat-label">First Rating</div>
              </div>
            )}
            {stats.lastRatingDate && (
              <div className="profile-stat-card">
                <div className="profile-stat-value" style={{ fontSize: 16 }}>
                  {new Date(stats.lastRatingDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </div>
                <div className="profile-stat-label">Last Rating</div>
              </div>
            )}
          </div>
        </>
      )}

      {stats.totalContributions > 0 && (
        <>
          <h3 className="profile-section-title" style={{ marginTop: 32 }}>Contribution Breakdown</h3>
          <div className="profile-stats-grid">
            <div className="profile-stat-card profile-stat-approved">
              <div className="profile-stat-value">{stats.approvedCount}</div>
              <div className="profile-stat-label">Approved</div>
            </div>
            <div className="profile-stat-card profile-stat-pending">
              <div className="profile-stat-value">{stats.pendingCount}</div>
              <div className="profile-stat-label">Pending</div>
            </div>
            <div className="profile-stat-card profile-stat-rejected">
              <div className="profile-stat-value">{stats.rejectedCount}</div>
              <div className="profile-stat-label">Rejected</div>
            </div>
            <div className="profile-stat-card">
              <div
                className="profile-stat-value"
                style={{ color: stats.successRate >= 70 ? '#27ae60' : stats.successRate >= 50 ? '#f39c12' : '#e74c3c' }}
              >
                {stats.successRate}%
              </div>
              <div className="profile-stat-label">Approval Rate</div>
            </div>
          </div>
        </>
      )}

      {stats.favoriteCat && (
        <>
          <h3 className="profile-section-title" style={{ marginTop: 32 }}>Favorite Category</h3>
          <Link to={`/category/${stats.favoriteCat}`} className="profile-favorite-cat">
            <span className="profile-favorite-cat-name">
              {stats.favoriteCat.replace(/-/g, ' ')}
            </span>
            <span className="profile-favorite-cat-hint">Most active in this category</span>
          </Link>
        </>
      )}

      {profile.contributions?.length > 0 && (
        <ContributionHeatmap contributions={profile.contributions} />
      )}
    </div>
  );
}

// ─── CONTRIBUTION HEATMAP ─────────────────────────────────────
function ContributionHeatmap({ contributions }) {
  const cellData = useMemo(() => {
    const counts = {};
    contributions.forEach(c => {
      const d = c.created_at?.slice(0, 10);
      if (d) counts[d] = (counts[d] || 0) + 1;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOffset = today.getDay();
    const totalDays = 52 * 7 + startOffset;
    const cells = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      cells.push({ date: key, count: counts[key] || 0 });
    }
    return cells;
  }, [contributions]);

  const maxCount = useMemo(() => Math.max(1, ...cellData.map(c => c.count)), [cellData]);

  const getLevel = (count) => {
    if (count === 0) return 0;
    if (count <= maxCount * 0.25) return 1;
    if (count <= maxCount * 0.5) return 2;
    if (count <= maxCount * 0.75) return 3;
    return 4;
  };

  const weeks = [];
  for (let i = 0; i < cellData.length; i += 7) {
    weeks.push(cellData.slice(i, i + 7));
  }

  const totalContribs = cellData.reduce((sum, c) => sum + c.count, 0);

  return (
    <>
      <h3 className="profile-section-title" style={{ marginTop: 32 }}>
        Contribution Activity
        <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 8, color: 'var(--text-muted, #888)' }}>
          {totalContribs} in the last year
        </span>
      </h3>
      <div className="contrib-heatmap-wrap">
        <div className="contrib-heatmap">
          {weeks.map((week, wi) => (
            <div key={wi} className="contrib-heatmap-col">
              {week.map((cell, di) => (
                <div
                  key={di}
                  className={`contrib-heatmap-cell contrib-heatmap-l${getLevel(cell.count)}`}
                  title={`${cell.date}: ${cell.count} contribution${cell.count !== 1 ? 's' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="contrib-heatmap-legend">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(l => (
            <div key={l} className={`contrib-heatmap-cell contrib-heatmap-l${l}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </>
  );
}

// ─── PROFILE CONTRIBUTION MAP ────────────────────────────────
function ProfileContribMap({ venues }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current.invalidateSize(), 100);
    }
  }, []);

  const withCoords = (venues || []).filter(v => v.latitude && v.longitude);
  if (withCoords.length === 0) {
    return <p style={{ color: 'var(--text-muted)', padding: '32px 0', textAlign: 'center' }}>No venues with location data.</p>;
  }
  const lat = withCoords.reduce((s, v) => s + parseFloat(v.latitude), 0) / withCoords.length;
  const lng = withCoords.reduce((s, v) => s + parseFloat(v.longitude), 0) / withCoords.length;
  return (
    <div style={{ height: 460, width: '100%' }}>
      <MapContainer ref={mapRef} center={[lat, lng]} zoom={4} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map(venue => (
          <Marker key={venue.slug} position={[parseFloat(venue.latitude), parseFloat(venue.longitude)]} icon={MapIcon}>
            <Popup>
              <Link to={`/venue/${venue.slug}`} style={{ color: '#0066cc', fontWeight: 600 }}>{venue.name}</Link>
              {(venue.city || venue.country) && (
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{[venue.city, venue.country].filter(Boolean).join(', ')}</div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

// ─── MAIN PROFILE PAGE ───────────────────────────────────────
function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('access');
  const myUsername = localStorage.getItem('username');

  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState('contributions');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwnProfile = !username || username === myUsername;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username && !token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const endpoint = username ? `/users/${username}/` : '/auth/profile/';
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await api.get(endpoint, { headers });
        setProfile(res.data);
        setBio(res.data.bio || '');

        const ratingsEndpoint = username ? `/users/${username}/ratings/` : '/my-ratings/';

        try {
          const ratingsRes = await api.get(ratingsEndpoint, { headers });
          setRatings(ratingsRes.data.results || []);
        } catch (err) {
          console.log('Ratings fetch error:', err);
          setRatings([]);
        }

      } catch (err) {
        console.error("Failed to load profile:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('username');
          navigate('/login');
        } else if (err.response?.status === 404) {
          navigate('/404');
        } else {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, token, navigate]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('bio', bio);
      if (avatar) formData.append('avatar', avatar);

      const res = await api.patch('/auth/profile/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      setProfile(prev => ({ ...prev, ...res.data, bio }));
      setSuccess(true);
      setEditing(false);
      setAvatar(null);
      toast.success('Profile saved!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/auth/delete-account/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.clear();
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <Navbar />
        <div className="profile-loading">Profile not found</div>
      </div>
    );
  }

  const avatarUrl = profile.avatar
    ? (profile.avatar.startsWith('http') ? profile.avatar : `https://mapedia.org${profile.avatar}`)
    : null;

  const contribCount = profile.contribution_count || 0;
  const ratingsCount = profile.ratings_given_count || ratings.length || 0;

  const sidebarBadges = [];
  if (contribCount >= 100) sidebarBadges.push({ label: 'Century Contributor', desc: '100+ venues added' });
  else if (contribCount >= 50) sidebarBadges.push({ label: 'Prolific Contributor', desc: '50+ venues added' });
  else if (contribCount >= 10) sidebarBadges.push({ label: 'Active Contributor', desc: '10+ venues added' });
  else if (contribCount >= 1) sidebarBadges.push({ label: 'First Contribution', desc: 'Added their first venue' });
  if (ratingsCount >= 100) sidebarBadges.push({ label: 'Century Reviewer', desc: '100+ ratings' });
  else if (ratingsCount >= 50) sidebarBadges.push({ label: 'Prolific Reviewer', desc: '50+ ratings' });
  else if (ratingsCount >= 10) sidebarBadges.push({ label: 'Active Reviewer', desc: '10+ ratings' });
  if (contribCount >= 50 && ratingsCount >= 20) sidebarBadges.push({ label: 'Power User', desc: 'Active contributor & reviewer' });
  if (profile.is_trusted) sidebarBadges.push({ label: 'Trusted Contributor', desc: 'Verified contributor' });
  if ((profile.owned_categories?.length || 0) >= 1) sidebarBadges.push({ label: 'Category Owner', desc: 'Created a category' });

  return (
    <div>
      <Helmet>
        <title>{profile.username} | Mapedia</title>
        <meta name="description" content={`${profile.username}'s profile on Mapedia. View their contributions, ratings, and moderated categories.`} />
        <link rel="canonical" href={`https://mapedia.org/profile/${profile.username}`} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />

      <main className="wiki-page profile-page">
        <div className="profile-portal">

          {/* ── LEFT: Profile sidebar ── */}
          <aside className="profile-sidebar">

            {/* Avatar + identity */}
            <div className="profile-card">
              <div className="profile-avatar-wrap">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {profile.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="profile-card-name">@{profile.username}</div>
              {profile.role && <div className="profile-card-role">{profile.role}</div>}
              {profile.is_trusted && (
                <div className="profile-card-trusted">Trusted Contributor</div>
              )}
              {profile.bio && !editing && (
                <p className="profile-card-bio">{profile.bio}</p>
              )}
            </div>

            {/* Quick stats */}
            <div className="profile-card profile-stats-row-card">
              <div className="profile-stats-row">
                <div className="profile-stat-cell">
                  <span className="profile-stat-num">{contribCount}</span>
                  <span className="profile-stat-lbl">Contributions</span>
                </div>
                <div className="profile-stat-cell">
                  <span className="profile-stat-num">{ratingsCount}</span>
                  <span className="profile-stat-lbl">Ratings</span>
                </div>
                <div className="profile-stat-cell">
                  <span className="profile-stat-num">{profile.my_venues?.length || 0}</span>
                  <span className="profile-stat-lbl">Venues</span>
                </div>
              </div>
            </div>

            {/* Badges */}
            {sidebarBadges.length > 0 && (
              <div className="profile-card">
                <div className="profile-card-section-title">Badges</div>
                <div className="profile-badges-list">
                  {sidebarBadges.map((b, i) => (
                    <div key={i} className="profile-badge-item">
                      <div className="profile-badge-item-label">{b.label}</div>
                      <div className="profile-badge-item-desc">{b.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User info */}
            <div className="profile-card">
              <div className="profile-card-section-title">User Info</div>
              <table className="profile-info-table">
                <tbody>
                  {isOwnProfile && profile.email && (
                    <tr>
                      <td>Email</td>
                      <td>{profile.email}</td>
                    </tr>
                  )}
                  <tr>
                    <td>Member since</td>
                    <td>{new Date(profile.date_joined).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })}</td>
                  </tr>
                  {profile.average_rating_given && (
                    <tr>
                      <td>Avg rating</td>
                      <td>{profile.average_rating_given} / 5</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Edit button */}
            {isOwnProfile && !editing && (
              <button className="profile-edit-btn" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            )}

            {/* Edit form */}
            {editing && isOwnProfile && (
              <div className="profile-card">
                <div className="profile-card-section-title">Edit Profile</div>
                <div className="profile-edit-form">
                  <div className="profile-field">
                    <label>Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Avatar</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatar(e.target.files[0])}
                    />
                  </div>
                  <div className="profile-edit-actions">
                    <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      className="profile-cancel-btn"
                      onClick={() => { setEditing(false); setBio(profile.bio || ''); setAvatar(null); }}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                  {success && <p className="profile-success">Profile updated!</p>}
                </div>
              </div>
            )}

            {/* Danger zone */}
            {isOwnProfile && (
              <div className="profile-card profile-danger-card">
                <div className="profile-card-section-title">Danger Zone</div>
                {!showDeleteConfirm ? (
                  <button className="profile-delete-btn" onClick={() => setShowDeleteConfirm(true)}>
                    Delete Account
                  </button>
                ) : (
                  <div className="profile-delete-confirm">
                    <p>Are you sure? This cannot be undone.</p>
                    <div className="profile-delete-actions">
                      <button className="profile-delete-confirm-btn" onClick={handleDeleteAccount} disabled={deleting}>
                        {deleting ? 'Deleting...' : 'Yes, delete'}
                      </button>
                      <button className="profile-delete-cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </aside>

          {/* ── RIGHT: Tabs + content ── */}
          <div className="profile-content">
            <div className="wiki-box">
              <div className="profile-content-header">
                <nav className="wiki-breadcrumb">
                  <Link to="/">Mapedia</Link>
                  <span className="wiki-breadcrumb-sep">›</span>
                  <span>@{profile.username}</span>
                </nav>
                <h1 className="profile-content-title">@{profile.username}</h1>
              </div>

              <div className="profile-tab-bar">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    className={`profile-tab ${activeTab === tab.key ? 'profile-tab-active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                    {tab.key === 'contributions' && profile.contributions?.length > 0 && (
                      <span className="profile-tab-count">{profile.contributions.length}</span>
                    )}
                    {tab.key === 'ratings' && ratingsCount > 0 && (
                      <span className="profile-tab-count">{ratingsCount}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="profile-tab-content" style={{ padding: activeTab === 'map' ? 0 : '16px' }}>
                {activeTab === 'contributions' && <ContributionsTab contributions={profile.contributions} />}
                {activeTab === 'venues' && <VenuesTab venues={profile.my_venues} />}
                {activeTab === 'ratings' && <RatingsTab ratings={ratings} username={profile.username} isOwnProfile={isOwnProfile} />}
                {activeTab === 'categories' && <CategoriesTab ownedCategories={profile.owned_categories} moderatedCategories={profile.moderated_categories} />}
                {activeTab === 'stats' && <StatsTab profile={{ ...profile, recent_ratings: ratings }} />}
                {activeTab === 'map' && <ProfileContribMap venues={profile.my_venues} />}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
