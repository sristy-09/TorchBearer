import { BrowserRouter as Router, Route, Routes } from "react-router";
import { useEffect } from "react";
import LoginPage from "./feature/Auth/components/LoginPage";
import AdminLoginPage from "./feature/Auth/components/AdminLoginPage";
import AuthSuccess from "./feature/Auth/components/AuthSuccess";
import AuthRoute from "./feature/core/components/ProtectedRoutes";
import SignUpPage from "./feature/Auth/components/SignupPage";
import CompleteProfilePage from "./feature/Auth/components/CompleteProfilePage";
import HomePage from "./pages/components/HomePage";
import LandingPage from "./pages/components/LandingPage";
import AdminDashboard from "./pages/components/AdminDashboard";
import AdminSpacesList from "./pages/components/admin/AdminSpacesList";
import AdminTopicsList from "./pages/components/admin/AdminTopicsList";
import AdminPostsList from "./pages/components/admin/AdminPostsList";
import AdminUsersList from "./pages/components/admin/AdminUsersList";
import AdminCreateSpace from "./pages/components/admin/AdminCreateSpace";
import AdminAdmitUsers from "./pages/components/admin/AdminAdmitUsers";
import AdminPendingRequests from "./pages/components/admin/AdminPendingRequests";
import SpaceTopicsPage from "./pages/components/SpaceTopicsPage";
import TopicPostsPage from "./pages/components/TopicPostsPage";
import SpaceMembersPage from "./pages/components/SpaceMembersPage";
import ProfilePage from "./feature/Profile/components/ProfilePage";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchCurrentUser } from "./store/Slice/authSlice";
import { socketService } from "./services/socket";
import { useNotificationPermission } from "./feature/Notifications/hooks/useNotifications";
import ErrorBoundary from "./feature/core/components/ErrorBoundary";
import RouteErrorBoundary from "./feature/core/components/RouteErrorBoundary";

const App = () => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  // Request notification permission
  useNotificationPermission();

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

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token);
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

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
            path="/admin/login"
            element={
              <ErrorBoundary level="page">
                <AdminLoginPage />
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/admin/dashboard"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="private">
                  <AdminDashboard />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/admin/spaces"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="private">
                  <AdminSpacesList />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/admin/topics"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="private">
                  <AdminTopicsList />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/admin/posts"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="private">
                  <AdminPostsList />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/admin/users"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="private">
                  <AdminUsersList />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/admin/create-space"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="private">
                  <AdminCreateSpace />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/admin/admit-users"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="private">
                  <AdminAdmitUsers />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/admin/pending-requests"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="private">
                  <AdminPendingRequests />
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
          <Route
            path="/profile"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="private">
                  <ProfilePage />
                </AuthRoute>
              </ErrorBoundary>
            }
            errorElement={<RouteErrorBoundary />}
          />
          <Route
            path="/profile/:userId"
            element={
              <ErrorBoundary level="page">
                <AuthRoute mode="private">
                  <ProfilePage />
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
