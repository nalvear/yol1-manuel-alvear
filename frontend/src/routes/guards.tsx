import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/auth';

/** Solo con sesión activa; si no, redirige a /login recordando el destino. */
export function ProtectedRoute() {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** Solo sin sesión (ej. /login); con sesión, redirige a la consulta. */
export function PublicOnlyRoute() {
  const { session } = useAuth();
  return session ? <Navigate to="/score" replace /> : <Outlet />;
}
