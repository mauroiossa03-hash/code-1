import { Navigate, useLocation } from "react-router-dom";

/* Requires an authenticated + premium user, otherwise redirects to /pricing. */
export default function PremiumRoute({ user, isPremium, children }) {
  const location = useLocation();
  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (!isPremium) {
    return <Navigate to="/pricing" replace />;
  }
  return children;
}
