import { Button } from "../../core/components/ui/button";
import { Input } from "../../core/components/ui/input";
import { Label } from "../../core/components/ui/label";
import { FaGoogle } from "react-icons/fa";
import { Link } from "react-router";
import { useLogin } from "../hooks/useLogin";


function LoginPage() {
  const { myForm, handleChange, handleSubmit, errors } = useLogin();
  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm rounded-2xl p-8 border"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)" }}>
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <span className="font-semibold text-foreground">TorchBearer</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                name="email"
                value={myForm.email}
                onChange={handleChange}
                required
                className="rounded-xl h-11"
                style={{ background: "var(--background)", borderColor: "var(--border)" }}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <Link to="/forgot-password" className="text-xs font-medium transition-colors"
                  style={{ color: "var(--primary)" }}>
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                value={myForm.password}
                onChange={handleChange}
                required
                className="rounded-xl h-11"
                style={{ background: "var(--background)", borderColor: "var(--border)" }}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold text-white shadow-sm transition-all"
              style={{ background: "var(--primary)" }}
            >
              Sign in
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: "1px solid var(--border)" }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 text-muted-foreground" style={{ background: "var(--card)" }}>
                or continue with
              </span>
            </div>
          </div>

          <Button
            onClick={() => window.open(`${API_URL}/api/auth/google`, "_self")}
            variant="outline"
            className="w-full h-11 rounded-xl font-medium gap-2"
            style={{ borderColor: "var(--border)", background: "var(--background)" }}
          >
            <FaGoogle className="text-base" />
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold transition-colors" style={{ color: "var(--primary)" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
