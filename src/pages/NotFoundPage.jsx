import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'

function NotFoundPage() {
  return (
    <div>
      <Helmet>
        <title>Page Not Found | Mapedia</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />
      <main style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 8 }}>404</h1>
        <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 24, color: 'var(--text-light)' }}>Page not found</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: 32, maxWidth: 400 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/" style={{ padding: '10px 24px', background: 'var(--link)', color: 'white', textDecoration: 'none' }}>
            Go home
          </Link>
          <Link to="/categories" style={{ padding: '10px 24px', border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)' }}>
            Browse categories
          </Link>
        </div>
      </main>
    </div>
  )
}

export default NotFoundPage
