import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Wraps routes that need a logged-in user; remembers where the visitor was heading.
export default function ProtectedRoute({ admin = false }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <p className="page text-sm text-maroon/70">Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />; // customers can't open admin pages
  return <Outlet />;
}
