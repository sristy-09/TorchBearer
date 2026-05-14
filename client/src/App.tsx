import { BrowserRouter as Router, Route, Routes } from "react-router";
import { useEffect } from "react";
import LoginPage from "./feature/Auth/components/LoginPage";
import AuthSuccess from "./feature/Auth/components/AuthSuccess";
import AuthRoute from "./feature/core/components/ProtectedRoutes";
import SignUpPage from "./feature/Auth/components/SignupPage";
import CompleteProfilePage from "./feature/Auth/components/CompleteProfilePage";
import HomePage from "./pages/components/HomePage";
import LandingPage from "./pages/components/LandingPage";
import SpaceTopicsPage from "./pages/components/SpaceTopicsPage";
import TopicPostsPage from "./pages/components/TopicPostsPage";
import SpaceMembersPage from "./pages/components/SpaceMembersPage";
import { useAppDispatch } from "./store/hooks";
import { fetchCurrentUser } from "./store/Slice/authSlice";
import ErrorBoundary from "./feature/core/components/ErrorBoundary";
import RouteErrorBoundary from "./feature/core/components/RouteErrorBoundary";

const App = () => {
  const dispatch = useAppDispatch();

  // Verify token on app load
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        // Verify the token is still valid by fetching current user
        await dispatch(fetchCurrentUser());
      }
    };

    verifyToken();
  }, [dispatch]);

  return (
    <ErrorBoundary level="app">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="guest">
                  <LandingPage />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/dashboard"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="private">
                  <HomePage />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/space/:spaceId/topics"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="private">
                  <SpaceTopicsPage />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/space/:spaceId/members"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="private">
                  <SpaceMembersPage />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/space/:spaceId/topic/:topicId/posts"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="private">
                  <TopicPostsPage />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/signup"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="guest">
                  <SignUpPage />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/login"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="guest">
                  <LoginPage />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/auth/callback"
            element={
              <ErrorBoundary level="page">
                <AuthSuccess />
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/complete-profile"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="profile-incomplete">
                  <CompleteProfilePage />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
