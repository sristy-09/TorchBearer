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
import { useAppDispatch } from "./store/hooks";
import { fetchCurrentUser } from "./store/Slice/authSlice";

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
    <div>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <AuthRoute mode="guest">
                <LandingPage />
              </AuthRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthRoute mode="private">
                <HomePage />
              </AuthRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthRoute mode="private">
                <HomePage />
              </AuthRoute>
            }
          />
          <Route
            path="/space/:spaceId/topics"
            element={
              <AuthRoute mode="private">
                <SpaceTopicsPage />
              </AuthRoute>
            }
          />
          <Route
            path="/space/:spaceId/topic/:topicId/posts"
            element={
              <AuthRoute mode="private">
                <TopicPostsPage />
              </AuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRoute mode="guest">
                <SignUpPage />
              </AuthRoute>
            }
          />
          <Route
            path="/login"
            element={
              <AuthRoute mode="guest">
                <LoginPage />
              </AuthRoute>
            }
          />
          <Route path="/auth/callback" element={<AuthSuccess />} />

          <Route
            path="/complete-profile"
            element={
              <AuthRoute mode="profile-incomplete">
                <CompleteProfilePage />
              </AuthRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
