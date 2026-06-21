import { Navigate, useLocation } from "react-router-dom";

/* Redirects to /login?next=... when there is no authenticated user. */
export default function ProtectedRoute({ user, children }) {
  const location = useLocation();
  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return children;
}
