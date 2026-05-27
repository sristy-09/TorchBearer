import { Button } from "../../core/components/ui/button";
import { Input } from "../../core/components/ui/input";
import { Label } from "../../core/components/ui/label";
import { useAdminLogin } from "../hooks/useAdminLogin";
import { ShieldCheck } from "lucide-react";

function AdminLoginPage() {
  const { myForm, handleChange, handleSubmit, errors } = useAdminLogin();

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12"
      style={{ background: "#18171F" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)" }}>
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Admin Portal</h1>
          <p className="text-sm mt-1" style={{ color: "#C9C5D3" }}>
            Sign in to access the admin dashboard
          </p>
        </div>

        <div className="rounded-2xl p-7 space-y-5"
          style={{ background: "#2A2736", border: "1px solid rgba(255,255,255,0.08)" }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium" style={{ color: "#C9C5D3" }}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                name="email"
                value={myForm.email}
                onChange={handleChange}
                required
                className="rounded-xl h-11 text-white placeholder:text-white/30"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium" style={{ color: "#C9C5D3" }}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={myForm.password}
                onChange={handleChange}
                required
                className="rounded-xl h-11 text-white"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}
              />
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold text-white shadow-sm transition-all"
              style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)" }}
            >
              Sign in as Admin
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
