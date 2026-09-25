import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeFor } from '../utils/nav';
import Loader from './Loader';

/** Requires login; optionally restricts to specific roles. Renders nested routes via <Outlet/>. */
export default function ProtectedRoute({ roles }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <Loader fullPage />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  const currentRole = String(user.role || '').toUpperCase();
  const allowedRoles = roles?.map((role) => String(role).toUpperCase());
  if (allowedRoles && !allowedRoles.includes(currentRole)) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}
