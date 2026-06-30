import { lazy, Suspense, useState, useEffect } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'

function RedirectVenueEdit() {
  const { venueSlug } = useParams()
  return <Navigate to={`/venue/${venueSlug}/edit`} replace />
}

const HomePage = lazy(() => import('./pages/HomePage'))
const CategoryDetailPage = lazy(() => import('./pages/CategoryDetailPage'))
const CategoryMapPage = lazy(() => import('./pages/CategoryMapPage'))
const CategoryFieldsPage = lazy(() => import('./pages/CategoryFieldsPage'))
const CategoryVenuesPage = lazy(() => import('./pages/CategoryVenuesPage'))
const VenuePage = lazy(() => import('./pages/VenuePage'))
const EditVenuePage = lazy(() => import('./pages/EditVenuePage'))
const AddCategoryPage = lazy(() => import('./pages/AddCategoryPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'))
const ContributePage = lazy(() => import('./pages/ContributePage'))
const CreateCategoryPage = lazy(() => import('./pages/CreateCategoryPage'))
const ModerationPage = lazy(() => import('./pages/ModerationPage'))
const ModeratorsPage = lazy(() => import('./pages/ModeratorsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const CommunityGuidelinesPage = lazy(() => import('./pages/CommunityGuidelinesPage'))
const OpenDataLicensePage = lazy(() => import('./pages/OpenDataLicensePage'))
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const FeedPage = lazy(() => import('./pages/FeedPage'))
const CityPage = lazy(() => import('./pages/CityPage'))
const CountryPage = lazy(() => import('./pages/CountryPage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const ApiDocsPage = lazy(() => import('./pages/ApiDocsPage'))

import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import BackToTop from './components/BackToTop'

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--text-light)' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--link)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: 14 }}>Loading…</span>
      </div>
    </div>
  )
}

function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)
  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  if (!offline) return null
  return (
    <div style={{ background: '#fef3c7', borderBottom: '1px solid #f59e0b', padding: '8px 16px', textAlign: 'center', fontSize: 13, color: '#92400e' }}>
      You are offline. Some features may not be available.
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <OfflineBanner />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryDetailPage />} />
          <Route path="/category/:slug/map" element={<CategoryMapPage />} />
          <Route path="/category/:slug/fields" element={<CategoryFieldsPage />} />
          <Route path="/category/:slug/venues" element={<CategoryVenuesPage />} />
          <Route path="/venue/:venueSlug" element={<VenuePage />} />
          <Route path="/venue/:venueSlug/edit" element={<EditVenuePage />} />
          <Route path="/venue/:categorySlug/:venueSlug/edit" element={<RedirectVenueEdit />} />
          <Route path="/venue/:venueSlug/add-category" element={<AddCategoryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/contribute" element={<ContributePage />} />
          <Route path="/create-category" element={<CreateCategoryPage />} />
          <Route path="/moderation" element={<ModerationPage />} />
          <Route path="/moderation/:categorySlug" element={<ModerationPage />} />
          <Route path="/moderation/:categorySlug/moderators" element={<ModeratorsPage />} />
          <Route path="/profile/:username?" element={<ProfilePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/guidelines" element={<CommunityGuidelinesPage />} />
          <Route path="/license" element={<OpenDataLicensePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/city/:cityName" element={<CityPage />} />
          <Route path="/country/:countryName" element={<CountryPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/api-docs" element={<ApiDocsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Footer />
      <BackToTop />
    </ErrorBoundary>
  )
}

export default App
