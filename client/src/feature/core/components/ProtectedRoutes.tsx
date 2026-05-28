// src/routes/AuthRoute.tsx
import { Navigate } from "react-router";
import { useAppSelector } from "../../../store/hooks";

interface AuthRouteProps {
  children: React.ReactElement;
  mode: "guest" | "private" | "profile-incomplete";
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children, mode }) => {
  const { isAuthenticated, loading, isProfileComplete } = useAppSelector(
    (state) => state.auth,
  );

  // Wait for auth state to resolve before redirecting on private/profile routes.
  // Guest routes (login, signup) don't need to block — if the token turns out
  // valid the redirect to /dashboard will happen once loading finishes.
  if (loading && mode !== "guest") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  // Guest-only routes: redirect logged-in users away
  if (mode === "guest" && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Private routes: must be logged in AND have a complete profile
  if (mode === "private" && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (mode === "private" && isAuthenticated && !isProfileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  // The complete-profile page itself: must be logged in but profile incomplete
  if (mode === "profile-incomplete" && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (mode === "profile-incomplete" && isProfileComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AuthRoute;
