import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

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
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'

function PageLoader() {
  return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>Loading…</div>
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryDetailPage />} />
          <Route path="/category/:slug/map" element={<CategoryMapPage />} />
          <Route path="/category/:slug/fields" element={<CategoryFieldsPage />} />
          <Route path="/category/:slug/venues" element={<CategoryVenuesPage />} />
          <Route path="/venue/:venueSlug" element={<VenuePage />} />
          <Route path="/venue/:venueSlug/edit" element={<EditVenuePage />} />
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </ErrorBoundary>
  )
}

export default App
