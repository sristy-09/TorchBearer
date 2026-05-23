import { Button } from "../../core/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../core/components/ui/card";
import { Input } from "../../core/components/ui/input";
import { Label } from "../../core/components/ui/label";
import { FaGoogle } from "react-icons/fa";
import { Link } from "react-router";
import { useLogin } from "../hooks/useLogin";

function LoginPage() {
  const { myForm, handleChange, handleSubmit, errors } = useLogin();

  const API_URL = import.meta.env.VITE_API_URL;
  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
          <CardAction>
            <Button
              variant="link"
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              <Link to={"/signup"} className="cursor-pointer">Create account</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  name="email"
                  value={myForm.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={myForm.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
                <div className="flex justify-end">
                  <Link
                  to= "/forgot-password"
                  className="text-sm text-blue-600 hover:undeline">Forgot Password?
                  </Link>

                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Sign in
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            onClick={() => window.open(`${API_URL}/api/auth/google`, "_self")}
            variant="outline"
            className="w-full cursor-pointer"
          >
            <FaGoogle />
            Continue with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;