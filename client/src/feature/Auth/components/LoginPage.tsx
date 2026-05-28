import { useState } from "react"; 
import { Button } from "../../core/components/ui/button";
import { Input } from "../../core/components/ui/input";
import { Label } from "../../core/components/ui/label";
import { FaGoogle } from "react-icons/fa";
import { Link } from "react-router";
import { useLogin } from "../hooks/useLogin";
import { Eye, EyeOff } from "lucide-react"; 

function LoginPage() {
  // 1. Destructure 'loading' from your updated useLogin hook
  const { myForm, handleChange, handleSubmit, errors, loading } = useLogin();
  const API_URL = import.meta.env.VITE_API_URL;
  
  const [showPassword, setShowPassword] = useState(false);

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
                disabled={loading} // 2. Disable input during loading states
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
              
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={myForm.password}
                  onChange={handleChange}
                  required
                  disabled={loading} // 3. Disable input during loading states
                  className="rounded-xl h-11 pr-10" 
                  style={{ background: "var(--background)", borderColor: "var(--border)" }}
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* 4. Update the submit button text dynamically based on loading state */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl font-semibold text-white shadow-sm transition-all"
              style={{ background: "var(--primary)" }}
            >
              {loading ? "Signing in..." : "Sign in"}
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
            disabled={loading} // 5. Block social login interaction if form is currently submitting
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