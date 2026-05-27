import { FaGoogle } from "react-icons/fa";
import { Button } from "../../core/components/ui/button";
import { Label } from "../../core/components/ui/label";
import { Input } from "../../core/components/ui/input";
import { useSignup } from "../hooks/useSignUp";
import { Link } from "react-router";


function SignUpPage() {
  const { handleSubmit, myForm, handleChange, loading, errors } = useSignup();
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
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Create an account</h1>
            <p className="text-muted-foreground text-sm mt-1">Join the TorchBearer community today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                name="name"
                value={myForm.name}
                onChange={handleChange}
                required
                disabled={loading}
                className="rounded-xl h-11"
                style={{ background: "var(--background)", borderColor: "var(--border)" }}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

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
                disabled={loading}
                className="rounded-xl h-11"
                style={{ background: "var(--background)", borderColor: "var(--border)" }}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={myForm.password}
                name="password"
                onChange={handleChange}
                disabled={loading}
                className="rounded-xl h-11"
                style={{ background: "var(--background)", borderColor: "var(--border)" }}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold text-white shadow-sm transition-all"
              style={{ background: "var(--primary)" }}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
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
            disabled={loading}
          >
            <FaGoogle className="text-base" />
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold transition-colors" style={{ color: "var(--primary)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
