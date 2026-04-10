import { BrowserRouter as Router, Route, Routes } from "react-router";
import LoginPage from "./feature/Auth/components/LoginPage";
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
        </Routes>
      </Router>
    </div>
  );
};

export default App;
