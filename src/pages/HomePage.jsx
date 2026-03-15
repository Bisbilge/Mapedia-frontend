// src/pages/HomePage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // HELMET EKLENDİ
import Navbar from '../components/Navbar';
import api from '../api/client';
import '../styles/HomePage.css';

const MAX_FEATURED_CATEGORIES = 8;

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [recentRatings, setRecentRatings] = useState([]);
  const [stats, setStats] = useState({
    venues: 0,
    users: 0,
    categories: 0,
    ratings: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect içindeki document.title ayarını kaldırdık, çünkü artık Helmet kullanıyoruz.

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        const [categoriesRes, statsRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/stats/')
        ]);

        const allCategories = categoriesRes.data.results || categoriesRes.data;
        
        // En popüler kategorileri göster
        const sorted = [...allCategories].sort((a, b) => 
          (b.venue_count || 0) - (a.venue_count || 0)
        );
        setCategories(sorted.slice(0, MAX_FEATURED_CATEGORIES));
        
        // Stats
        setStats({
          venues: statsRes.data.venue_count || 0,
          users: statsRes.data.user_count || 0,
          categories: allCategories.length,
          ratings: statsRes.data.rating_count || 0
        });

      } catch (err) {
        console.error("Veri çekilirken hata oluştu:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // ==========================================
  // AI-SEO & SCHEMA (YAPISAL VERİ) OLUŞTURUCU
  // ==========================================
  const pageTitle = "Mapedia | The Community-Built Encyclopedia of Places";
  const pageDesc = "Mapedia is a community-maintained, open database of geographical locations. Discover, document, and share practical details about places worldwide under CC BY-SA 4.0.";

  // WebSite Şeması: Google'a sitenizin bir marka/ansiklopedi olduğunu belirtir.
  // Ayrıca Google arama sonuçlarında (Sitelinks) bir arama kutusu çıkma ihtimalini artırır.
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Mapedia",
    "alternateName": "The Free Encyclopedia of Places",
    "url": "https://mapedia.org",
    "description": pageDesc,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://mapedia.org/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="home-container">
      {/* HELMET İLE SEO ETİKETLERİNİ BASIYORUZ */}
      <Helmet>
        <title>Mapedia | The Community-Built Encyclopedia of Places</title>
        <meta name="description" content="Mapedia is a free, community-maintained open database of real-world venues. Discover water fountains, free toilets, cafes, parks and more — open data under CC BY-SA 4.0." />
        <link rel="canonical" href="https://mapedia.org" />

        <meta property="og:title" content="Mapedia | The Community-Built Encyclopedia of Places" />
        <meta property="og:description" content="5,700+ verified venues: water fountains, free toilets, laptop-friendly cafes and more. Community-built, open data under CC BY-SA 4.0. Free to use, forever." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mapedia.org" />
        <meta property="og:image" content="https://mapedia.org/og-image.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mapedia | The Community-Built Encyclopedia of Places" />
        <meta name="twitter:description" content="5,700+ verified venues: water fountains, free toilets, cafes and more. Open data, free forever." />
        <meta name="twitter:image" content="https://mapedia.org/og-image.png" />

        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      <Navbar />
      <main className="home-main">

        {/* HERO SECTION - Copywriting & AI SEO odaklı güncellendi */}
        <section className="home-hero">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="hero-title-map">Map</span>edia
            </h1>
            {/* Eskiden <p> olan alt başlığı SEO için <h2> yaptık */}
            <h2 className="hero-subtitle">The Free Encyclopedia of Places</h2>
            
            {/* Metin, AI botlarının "Mapedia nedir?" sorusuna net cevap vereceği şekilde düzenlendi */}
            <p className="hero-description">
              <strong>Mapedia is a community-maintained open database of geographical locations.</strong> We document the practical details that matter — entry procedures, accessibility info, available utilities, and the micro-data that no regular algorithm collects. All freely licensed under CC BY-SA 4.0.
            </p>
            <div className="hero-actions">
              <Link to="/contribute" className="hero-btn-primary">
                Contribute a Place
              </Link>
              <Link to="/about" className="hero-btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* STATS */}
        {!isLoading && !error && (
          <section className="home-stats-section">
            <div className="home-stats">
              <div className="stat">
                <span className="stat-number">{stats.venues.toLocaleString()}</span>
                <span className="stat-label">Places</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-number">{stats.users.toLocaleString()}</span>
                <span className="stat-label">Contributors</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-number">{stats.categories}</span>
                <span className="stat-label">Categories</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-number">{stats.ratings.toLocaleString()}</span>
                <span className="stat-label">Ratings</span>
              </div>
            </div>
          </section>
        )}

        {/* FEATURED CATEGORIES */}
        <section className="home-categories">
          <div className="section-header">
            {/* SEO için alt başlıklar semantic h2/h3 olarak kurgulanmalı */}
            <h2>Browse by Category</h2>
            <p className="section-sub">
              Each category is community-maintained with its own custom data fields.
            </p>
          </div>

          {isLoading ? (
            <div className="loading-spinner">Loading categories…</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : categories.length > 0 ? (
            <>
              <table className="home-categories-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="col-count">Places</th>
                    <th className="col-action"></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td>
                        <Link to={`/category/${cat.slug}`} className="home-category-link">
                          {cat.icon && <span className="home-category-icon">{cat.icon}</span>}
                          <span className="home-category-name">{cat.name}</span>
                          {cat.description && (
                            <span className="home-category-desc">
                              — {cat.description.length > 60 
                                ? cat.description.slice(0, 60) + '...' 
                                : cat.description}
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="col-count">
                        <span className={`home-venue-count ${cat.venue_count > 0 ? 'has-venues' : ''}`}>
                          {cat.venue_count || 0}
                        </span>
                      </td>
                      <td className="col-action">
                        <Link to={`/category/${cat.slug}`} className="home-browse-link">
                          Browse →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {stats.categories > MAX_FEATURED_CATEGORIES && (
                <div className="category-more">
                  <Link to="/categories" className="category-more-link">
                    View all {stats.categories} categories →
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>No categories yet.</p>
              <Link to="/create-category" className="empty-state-link">
                Create the first one →
              </Link>
            </div>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section className="home-how">
          <div className="section-header">
            <h2>How Mapedia Works</h2>
          </div>
          <div className="how-grid">
            <div className="how-item">
              <span className="how-number">1</span>
              <h3>Find or Create</h3>
              <p>Search for a place or create a new entry if it doesn't exist.</p>
            </div>
            <div className="how-item">
              <span className="how-number">2</span>
              <h3>Add Details</h3>
              <p>Fill in the structured fields: accessibility, amenities, hours, and more.</p>
            </div>
            <div className="how-item">
              <span className="how-number">3</span>
              <h3>Rate & Review</h3>
              <p>Share your experience with ratings and comments to help others.</p>
            </div>
            <div className="how-item">
              <span className="how-number">4</span>
              <h3>Stay Open</h3>
              <p>All data is CC BY-SA 4.0 — free to use, share, and build upon.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="home-cta">
          <div className="cta-inner">
            <div className="cta-text">
              <h2>Help Build the Encyclopedia</h2>
              <p>
                Every contribution matters. Add a café you discovered, 
                update accessibility info, or start a new category 
                for places that don't exist elsewhere.
              </p>
            </div>
            <div className="cta-actions">
              <Link to="/contribute" className="cta-btn-primary">
                Add a Place
              </Link>
              <Link to="/create-category" className="cta-btn-secondary">
                Create Category
              </Link>
            </div>
          </div>
        </section>

        {/* OPEN DATA PANEL */}
        <section className="home-opendata">
          <div className="opendata-inner">
            <div className="opendata-text">
              <h2>Open Data, Forever Free</h2>
              <p>
                Every place on Mapedia is published under{' '}
                <strong>Creative Commons Attribution-ShareAlike 4.0</strong>.
                The data belongs to everyone — free to use, build upon,
                and redistribute.
              </p>
              <Link to="/license" className="opendata-link">About the license →</Link>
            </div>
            <div className="opendata-badge">
              <span className="badge-cc">CC</span>
              <span className="badge-label">BY-SA 4.0</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default HomePage;