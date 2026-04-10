// src/routes/AuthRoute.tsx
import { Navigate } from "react-router";
import { useAppSelector } from "../../../store/hooks";

interface AuthRouteProps {
  children: React.ReactElement;
  mode: "guest" | "private";
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children, mode }) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  // Wait for auth state to resolve before redirecting
  // (prevents flash-redirect on page refresh while token is being validated)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (mode === "guest" && isAuthenticated) {
    // Logged-in user trying to access guest-only route
    return <Navigate to="/dashboard" replace />;
  }

  if (mode === "private" && !isAuthenticated) {
    // Not logged in, trying to access private route
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthRoute;
