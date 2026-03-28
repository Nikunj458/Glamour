import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show spinner while verifying token with server
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
        <p className="font-sans text-xs text-mink tracking-widest uppercase">Verifying session…</p>
      </div>
    </div>
  );

  // Not logged in — redirect to login, remember where they were trying to go
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Logged in but not admin — redirect home
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}