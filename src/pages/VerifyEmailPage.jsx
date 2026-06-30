import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/client'
import '../styles/wiki.css'

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token found.')
      return
    }
    api.get(`/auth/verify-email/?token=${token}`)
      .then(res => { setStatus('success'); setMessage(res.data.detail) })
      .catch(err => {
        setStatus('error')
        setMessage(err.response?.data?.detail || 'Verification failed.')
      })
  }, [token])

  return (
    <div>
      <Navbar />
      <main className="wiki-page" style={{ maxWidth: 520 }}>
        <div style={{ paddingTop: 40 }}>
          {status === 'loading' && (
            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>Email Verification</h2>
              </div>
              <div className="wiki-box-body">
                <p style={{ color: 'var(--text-light)' }}>Verifying your email address…</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="wiki-box">
              <div className="wiki-box-header wiki-box-header-accent">
                <h2>✓ Email Verified</h2>
              </div>
              <div className="wiki-box-body">
                <p>{message}</p>
                <p style={{ color: 'var(--text-light)', fontSize: 13 }}>
                  Your account is now active. You can log in and start contributing.
                </p>
              </div>
              <div className="wiki-side-actions">
                <Link to="/login" className="wiki-btn-primary">Log In</Link>
                <Link to="/" className="wiki-btn-secondary">Go to Home</Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="wiki-box">
              <div className="wiki-box-header">
                <h2>Verification Failed</h2>
              </div>
              <div className="wiki-box-body">
                <p style={{ color: '#c00' }}>{message}</p>
                <p style={{ color: 'var(--text-light)', fontSize: 13 }}>
                  The link may have expired or already been used. Try registering again if needed.
                </p>
              </div>
              <div className="wiki-side-actions">
                <Link to="/register" className="wiki-btn-secondary">Register Again</Link>
                <Link to="/" className="wiki-btn-secondary">Go to Home</Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default VerifyEmailPage
