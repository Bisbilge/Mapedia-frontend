import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'
import { setupMobile } from './mobile.js'

setupMobile()

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="752498002996-q2drjmjpg0qs764k2va9jlcgedaneitt.apps.googleusercontent.com">
    <HelmetProvider>
      <BrowserRouter>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--bg-elevated, #fff)',
              color: 'var(--text, #111)',
              border: '1px solid var(--border, #e0e0e0)',
              borderRadius: '6px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)