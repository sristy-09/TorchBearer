import { BrowserRouter as Router, Route, Routes } from "react-router";
import { useEffect } from "react";
import LoginPage from "./feature/Auth/components/LoginPage";
import AuthSuccess from "./feature/Auth/components/AuthSuccess";
import AuthRoute from "./feature/core/components/ProtectedRoutes";
import SignUpPage from "./feature/Auth/components/SignupPage";
import CompleteProfilePage from "./feature/Auth/components/CompleteProfilePage";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchCurrentUser } from "./store/Slice/authSlice";

const App = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

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
