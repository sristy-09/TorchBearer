import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import { Button } from "../../core/components/ui/button";
import { Input } from "../../core/components/ui/input";
import { Label } from "../../core/components/ui/label";
import { KeyRound } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/reset-password/${token}`, { password });
      navigate("/login", {
        state: { message: "Password reset successful. You can now log in." },
      });
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12"
      style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm">

        <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "var(--secondary)" }}>
            <KeyRound size={22} style={{ color: "var(--primary)" }} />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Reset password</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl h-11"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-red-500 rounded-lg px-3 py-2"
              style={{ background: "rgba(239,68,68,0.08)" }}>
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold text-white shadow-sm"
            style={{ background: "var(--primary)" }}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold transition-colors" style={{ color: "var(--primary)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
