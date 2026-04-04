import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FavouriteProvider } from './context/FavouriteContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Collections from './pages/Collections';
import ProductDetail from './pages/ProductDetail';
import Favourites from './pages/Favourites';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Account from './pages/Account';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/common/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';

// ── Redirect logged-in users away from /login ────────────────────────────────
function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // wait for auth check

  // If logged in, go back to where they came from or home
  if (user) return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  return children;
}

// ── Favourites: prompt login for guests instead of showing empty ─────────────
function FavouritesRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Guests see their local favourites — no redirect needed
  // But we pass isGuest so Favourites page can show a "sign in to save" banner
  return <Favourites />;
}

// ── Main App ─────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Login — no layout wrapper */}
      <Route path="/login" element={
        <GuestRoute><Login /></GuestRoute>
      } />

      {/* All other pages — inside Layout */}
      <Route path="/" element={<Layout />}>
        <Route index                  element={<Home />} />
        <Route path="collections"     element={<Collections />} />
        <Route path="collections/:category" element={<Collections />} />
        <Route path="product/:id"     element={<ProductDetail />} />
        <Route path="favourites"      element={<FavouritesRoute />} />
        <Route path="contact"         element={<Contact />} />
        <Route path="account"         element={
          <ProtectedRoute><Account /></ProtectedRoute>
        } />
        <Route path="admin"           element={
          <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="forgot-password"  element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="*"               element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavouriteProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: '"Jost", sans-serif',
                fontSize: '13px',
                letterSpacing: '0.03em',
                background: '#2C2C2C',
                color: '#FAF7F2',
                borderRadius: '0',
              },
              duration: 2500,
            }}
          />
          <AppRoutes />
        </FavouriteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
