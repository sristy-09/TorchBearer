import { Button } from "../../core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../core/components/ui/card";
import { Input } from "../../core/components/ui/input";
import { Label } from "../../core/components/ui/label";
import { useAdminLogin } from "../hooks/useAdminLogin";
import { FaShieldAlt } from "react-icons/fa";

function AdminLoginPage() {
  const { myForm, handleChange, handleSubmit, errors } = useAdminLogin();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <Card className="w-full max-w-sm border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-600/20 rounded-full">
              <FaShieldAlt className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-center text-white">Admin Portal</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  name="email"
                  value={myForm.email}
                  onChange={handleChange}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={myForm.password}
                  onChange={handleChange}
                  className="bg-slate-900/50 border-slate-600 text-white"
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign in as Admin
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminLoginPage;
