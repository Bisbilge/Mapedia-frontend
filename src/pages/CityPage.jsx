import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import api from '../api/client';
import '../styles/wiki.css';
import '../styles/CityPage.css';

function CityPage() {
  const { cityName } = useParams();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState({});
  const PAGE_SIZE = 50;

  const displayName = cityName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  useEffect(() => {
    setLoading(true);
    api.get('/venues/', { params: { city: cityName.replace(/-/g, ' '), page, page_size: PAGE_SIZE } })
      .then(res => {
        const results = res.data.results || res.data;
        setVenues(results);
        setTotal(res.data.count || results.length);

        // Group by category
        const cats = {};
        results.forEach(v => {
          if (v.category_name) {
            if (!cats[v.category_slug]) cats[v.category_slug] = { name: v.category_name, count: 0 };
            cats[v.category_slug].count++;
          }
        });
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cityName, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <Helmet>
        <title>{displayName} Places | Mapedia</title>
        <meta name="description" content={`Browse ${total} documented places in ${displayName} on Mapedia — water fountains, cafes, toilets and more. Free, community-maintained open data.`} />
        <link rel="canonical" href={`https://mapedia.org/city/${cityName}`} />
        <meta property="og:title" content={`${displayName} Places | Mapedia`} />
        <meta property="og:description" content={`${total} venues documented in ${displayName}. Community-maintained, open data under CC BY-SA 4.0.`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `Places in ${displayName}`,
          "description": `${total} community-documented places in ${displayName}`,
          "url": `https://mapedia.org/city/${cityName}`,
        })}</script>
      </Helmet>
      <Navbar />

      <main className="wiki-page city-page">
        <div className="wiki-title-bar">
          <nav className="wiki-breadcrumb">
            <Link to="/">Mapedia</Link>
            <span className="wiki-breadcrumb-sep">›</span>
            <span>{displayName}</span>
          </nav>
          <h1>{displayName}</h1>
          {!loading && (
            <p style={{ color: 'var(--text-light)', fontSize: 14, margin: '4px 0 0' }}>
              {total.toLocaleString()} venues documented in this city
            </p>
          )}
        </div>

        <div className="wiki-portal">
          <div className="wiki-col-main">
            {loading ? (
              <p style={{ color: 'var(--text-light)' }}>Loading...</p>
            ) : venues.length === 0 ? (
              <p style={{ color: 'var(--text-light)' }}>No venues found in {displayName}.</p>
            ) : (
              <>
                <div className="wiki-box">
                  <table className="city-venues-table">
                    <thead>
                      <tr>
                        <th>Venue</th>
                        <th>Category</th>
                        <th>Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {venues.map(v => (
                        <tr key={v.id}>
                          <td>
                            <Link to={`/venue/${v.slug}`} className="city-venue-link">
                              {v.name}
                            </Link>
                          </td>
                          <td>
                            {v.category_slug ? (
                              <Link to={`/category/${v.category_slug}`} className="city-cat-link">
                                {v.category_name}
                              </Link>
                            ) : '—'}
                          </td>
                          <td className="city-address">
                            {v.address || v.country || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="city-pagination">
                    <button
                      className="city-page-btn"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      &larr; Prev
                    </button>
                    <span className="city-page-info">Page {page} of {totalPages}</span>
                    <button
                      className="city-page-btn"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next &rarr;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="wiki-col-side">
            <div className="wiki-infobox">
              <div className="wiki-infobox-title">{displayName}</div>
              <table>
                <tbody>
                  <tr><td>Total venues</td><td>{total.toLocaleString()}</td></tr>
                  <tr><td>Categories</td><td>{Object.keys(categories).length}</td></tr>
                </tbody>
              </table>
            </div>

            {Object.keys(categories).length > 0 && (
              <div className="wiki-box">
                <div className="wiki-box-header"><h2>Categories in {displayName}</h2></div>
                <div className="wiki-box-body" style={{ padding: 0 }}>
                  <ul className="city-cat-list">
                    {Object.entries(categories)
                      .sort((a, b) => b[1].count - a[1].count)
                      .map(([slug, cat]) => (
                        <li key={slug} className="city-cat-item">
                          <Link to={`/category/${slug}?city=${encodeURIComponent(cityName.replace(/-/g, ' '))}`} className="city-cat-item-link">
                            <span>{cat.name}</span>
                            <span className="city-cat-item-count">{cat.count}</span>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="wiki-box">
              <div className="wiki-box-body">
                <p style={{ fontSize: 13, color: 'var(--text-light)', margin: 0 }}>
                  Know a place in {displayName} that's missing?{' '}
                  <Link to="/contribute">Add it to Mapedia</Link>.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default CityPage;
