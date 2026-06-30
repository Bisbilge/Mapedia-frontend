import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import Navbar from '../components/Navbar'
import api from '../api/client'
import '../styles/AuthPage.css'

function getPasswordStrength(pw) {
  if (!pw) return null
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { label: 'Weak', color: '#dc2626', width: '20%' }
  if (score <= 2) return { label: 'Fair', color: '#d97706', width: '40%' }
  if (score <= 3) return { label: 'Good', color: '#2563eb', width: '65%' }
  return { label: 'Strong', color: '#16a34a', width: '100%' }
}

function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  function handleGoogleSuccess(credentialResponse) {
    api.post('/auth/google/', { credential: credentialResponse.credential })
      .then(function(res) {
        localStorage.setItem('access', res.data.access)
        localStorage.setItem('refresh', res.data.refresh)
        toast.success(res.data.created ? 'Account created!' : 'Welcome back!')
        navigate('/')
      })
      .catch(function() {
        toast.error('Google login failed.')
      })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy to register.')
      return
    }

    setLoading(true)
    api.post('/auth/register/', {
      username,
      email,
      password,
      password2: confirmPassword,
      accept_terms: acceptTerms,
    })
      .then(() => {
        setEmailSent(true)
        setLoading(false)
        toast.success('Account created! Check your email.')
      })
      .catch(err => {
        const data = err.response?.data
        const msg = data ? Object.values(data).flat().join(' ') : 'Registration failed.'
        setError(msg)
        setLoading(false)
      })
  }

  if (emailSent) {
    return (
      <div>
        <Navbar />
        <main className="auth-main">
          <div className="auth-box">
            <h1 className="auth-title">Check your email</h1>
            <div className="auth-form-body">
              <p>
                We sent a verification link to <strong>{email}</strong>.
                Please click the link to activate your account.
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 12 }}>
                Didn't receive it? Check your spam folder.
              </p>
              <div style={{ marginTop: 24 }}>
                <Link to="/" className="auth-btn" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>Go to Home</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Helmet>
        <title>Create an Account | Mapedia</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />
      <main className="auth-main">
        <div className="auth-box">
          <h1 className="auth-title">Create an account</h1>
          <div className="auth-form-body">
            <div className="auth-google">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google login failed.')}
                width="100%"
                text="continue_with"
              />
            </div>
            <div className="auth-divider"><span>or</span></div>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label>Username *</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                {password && (() => {
                  const strength = getPasswordStrength(password)
                  return (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ height: 4, background: 'var(--border)' }}>
                        <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'width 0.3s, background 0.3s' }} />
                      </div>
                      <span style={{ fontSize: 11, color: strength.color, marginTop: 2, display: 'block' }}>{strength.label}</span>
                    </div>
                  )
                })()}
              </div>
              <div className="auth-field">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                />
                <label htmlFor="acceptTerms" style={{ fontSize: 13, cursor: 'pointer' }}>
                  I agree to the{' '}
                  <Link to="/terms" target="_blank">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" target="_blank">Privacy Policy</Link>
                </label>
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
            <p className="auth-switch">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RegisterPage
