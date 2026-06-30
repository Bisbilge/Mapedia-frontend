import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import api from '../api/client';
import { getRecentlyViewed } from '../hooks/useRecentlyViewed';
import '../styles/HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ venues: 0, users: 0, categories: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [recentlyViewed] = useState(() => getRecentlyViewed());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, statsRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/stats/'),
        ]);
        const all = catRes.data.results || catRes.data;
        const sorted = [...all].sort((a, b) => (b.venue_count || 0) - (a.venue_count || 0));
        setCategories(sorted.slice(0, 8));
        setStats({
          venues: statsRes.data.venue_count || 0,
          users: statsRes.data.user_count || 0,
          categories: all.length,
        });
      } catch {
        // silently fail — page still renders
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNearMe = () => {
    if (!navigator.geolocation) return;
    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        navigate(`/search?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=5`);
        setNearbyLoading(false);
      },
      () => {
        setNearbyLoading(false);
        alert('Could not get your location. Please allow location access in your browser.');
      },
      { timeout: 8000 }
    );
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mapedia',
    alternateName: 'The Free Encyclopedia of Places',
    url: 'https://mapedia.org',
    description: 'Mapedia lets anyone create a public map category and contribute places. Free, open data under CC BY-SA 4.0.',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://mapedia.org/search?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="home-container">
      <Helmet>
        <title>Mapedia — Build a map for anything</title>
        <meta name="description" content="Anyone can create a public map category on Mapedia — water fountains, disaster shelters, parks, anything. Free and open forever under CC BY-SA 4.0." />
        <link rel="canonical" href="https://mapedia.org" />
        <meta property="og:title" content="Mapedia — Build a map for anything" />
        <meta property="og:description" content="Create a public map category, add places, share open data. Free forever." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mapedia.org" />
        <meta property="og:image" content="https://mapedia.org/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mapedia — Build a map for anything" />
        <meta name="twitter:description" content="Create a public map category, add places, share open data. Free forever." />
        <meta name="twitter:image" content="https://mapedia.org/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      <Navbar />

      <main className="home-main">

        {/* ── HERO ── */}
        <section className="home-hero">
          <div className="home-hero-inner">
            <h1 className="home-hero-title">
              Build a map<br />for anything.
            </h1>
            <p className="home-hero-sub">
              Anyone can create a public map category — water fountains, disaster assembly points,
              laptop-friendly cafes, anything. You define what gets mapped. Community fills it in.
              All data is free and open forever.
            </p>
            <div className="home-hero-actions">
              <Link to="/create-category" className="home-btn-primary">Create a Category</Link>
              <Link to="/categories" className="home-btn-secondary">Explore Maps</Link>
              <button
                className="home-btn-ghost"
                onClick={handleNearMe}
                disabled={nearbyLoading}
              >
                {nearbyLoading ? 'Locating…' : '📍 Near Me'}
              </button>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="home-how">
          <div className="home-how-step">
            <div className="home-how-num">1</div>
            <strong>Create a category</strong>
            <p>Define what you want to map. Set the fields: hours, accessibility, photos — whatever matters for your category.</p>
          </div>
          <div className="home-how-arrow">→</div>
          <div className="home-how-step">
            <div className="home-how-num">2</div>
            <strong>Add places</strong>
            <p>You and the community contribute locations. Every entry goes through moderation before it's published.</p>
          </div>
          <div className="home-how-arrow">→</div>
          <div className="home-how-step">
            <div className="home-how-num">3</div>
            <strong>Open for all</strong>
            <p>Your map is public, browsable, and accessible via API. Licensed CC BY-SA 4.0 — free to use forever.</p>
          </div>
        </section>

        {/* ── STATS ── */}
        {!isLoading && (
          <div className="home-stats">
            <div className="home-stat-item">
              <strong>{stats.venues.toLocaleString()}</strong>
              <span>Places documented</span>
            </div>
            <div className="home-stat-div" />
            <div className="home-stat-item">
              <strong>{stats.categories}</strong>
              <span>Categories</span>
            </div>
            <div className="home-stat-div" />
            <div className="home-stat-item">
              <strong>{stats.users.toLocaleString()}</strong>
              <span>Contributors</span>
            </div>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        <section className="home-cats-section">
          <div className="home-section-header">
            <h2>Example categories</h2>
            <Link to="/categories" className="home-see-all">
              See all {stats.categories > 0 ? stats.categories : ''} →
            </Link>
          </div>
          {isLoading ? (
            <p className="home-loading">Loading…</p>
          ) : categories.length > 0 ? (
            <div className="home-cat-grid">
              {categories.map(cat => (
                <Link key={cat.id} to={`/category/${cat.slug}`} className="home-cat-card">
                  {cat.icon && <span className="home-cat-card-icon">{cat.icon}</span>}
                  <span className="home-cat-card-name">{cat.name}</span>
                  {cat.venue_count > 0 && (
                    <span className="home-cat-card-count">{cat.venue_count.toLocaleString()} places</span>
                  )}
                </Link>
              ))}
            </div>
          ) : null}
        </section>

        {/* ── RECENTLY VIEWED ── */}
        {recentlyViewed.length > 0 && (
          <section className="home-recent-section">
            <div className="home-section-header">
              <h2>Recently viewed</h2>
            </div>
            <ul className="home-recent-list">
              {recentlyViewed.map(v => (
                <li key={v.slug} className="home-recent-item">
                  <Link to={`/venue/${v.slug}`} className="home-recent-link">{v.name}</Link>
                  {(v.city || v.country) && (
                    <span className="home-recent-meta">
                      {[v.city, v.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── BOTTOM CTA ── */}
        <section className="home-bottom-cta">
          <h2>Don't see what you need?</h2>
          <p>Create your own map category. It takes less than two minutes.</p>
          <Link to="/create-category" className="home-btn-primary">Create a Category</Link>
          <span className="home-bottom-or">or</span>
          <Link to="/contribute" className="home-bottom-link">add a place to an existing category →</Link>
        </section>

        {/* ── OPEN DATA NOTE ── */}
        <div className="home-license-row">
          <span>All place data is published under</span>
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">
            CC BY-SA 4.0
          </a>
          <span>— free to use, share, and build upon.</span>
          <Link to="/license">About the license →</Link>
        </div>

      </main>
    </div>
  );
}

export default HomePage;
