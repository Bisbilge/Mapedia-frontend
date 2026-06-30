import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import Navbar from '../components/Navbar'
import api from '../api/client'
import '../styles/AuthPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleGoogleSuccess(credentialResponse) {
    api.post('/auth/google/', { credential: credentialResponse.credential })
      .then(function(res) {
        localStorage.setItem('access', res.data.access)
        localStorage.setItem('refresh', res.data.refresh)
        toast.success('Welcome!')
        navigate('/')
      })
      .catch(function() {
        toast.error('Google login failed.')
      })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    api.post('/auth/login/', { username, password })
      .then(function(res) {
        localStorage.setItem('access', res.data.access)
        localStorage.setItem('refresh', res.data.refresh)
        toast.success('Welcome back!')
        navigate('/')
      })
      .catch(function(err) {
        const msg = (err.response?.data?.detail) || 'Invalid username or password.'
        setError(msg)
        setLoading(false)
      })
  }

  return (
    <div>
      <Helmet>
        <title>Log In | Mapedia</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />
      <main className="auth-main">
        <div className="auth-box">
          <h1 className="auth-title">Log in to Mapedia</h1>
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
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={function(e) { setUsername(e.target.value) }}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={function(e) { setPassword(e.target.value) }}
                  required
                />
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
            <p className="auth-switch">
              No account? <Link to="/register">Create one</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginPage