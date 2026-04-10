import { BrowserRouter as Router, Route, Routes } from "react-router";
import LoginPage from "./feature/Auth/components/LoginPage";
import AuthSuccess from "./feature/Auth/components/AuthSuccess";
import AuthRoute from "./feature/core/components/ProtectedRoutes";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <AuthRoute mode="guest">
                <LoginPage />
              </AuthRoute>
            }
          />
          <Route path="/auth/callback" element={<AuthSuccess />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
