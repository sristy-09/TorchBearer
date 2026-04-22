import { BrowserRouter as Router, Route, Routes } from "react-router";
import LoginPage from "./feature/Auth/components/LoginPage";
import AuthSuccess from "./feature/Auth/components/AuthSuccess";
import AuthRoute from "./feature/core/components/ProtectedRoutes";
import SignUpPage from "./feature/Auth/components/SignupPage";
import CompleteProfilePage from "./feature/Auth/components/CompleteProfilePage";

const App = () => {
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
import Homepage from "./pages/components/HomePage";

const App = () => {
  return <div><Homepage></Homepage></div>;
};

export default App;
