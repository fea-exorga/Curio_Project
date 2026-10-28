import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar, BottomNav, MobileHeader } from './components/layout/Sidebar.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { Spinner } from './components/ui/States.jsx';

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const ExplorePage = lazy(() => import('./pages/ExplorePage.jsx'));
const ReelsPage = lazy(() => import('./pages/ReelsPage.jsx'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const SavedPage = lazy(() => import('./pages/SavedPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));

export default function App() {
  const { isAuthenticated, initialized } = useAuth();

  // While auth state is loading, show a full-screen spinner
  if (!initialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-offwhite">
        <Spinner />
      </div>
    );
  }

  const PrivateRoute = ({ children }) =>
    isAuthenticated ? children : <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-dvh bg-offwhite">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">
        <MobileHeader />
        <Suspense fallback={<div className="p-8"><Spinner /></div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/reels" element={<ReelsPage />} />
            <Route path="/saved" element={<PrivateRoute><SavedPage /></PrivateRoute>} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/admin/*" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            {/* Catch‑all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  );
}
