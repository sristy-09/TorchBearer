import { FaGoogle } from "react-icons/fa";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../core/components/ui/card";
import { Button } from "../../core/components/ui/button";
import { Label } from "../../core/components/ui/label";
import { Input } from "../../core/components/ui/input";
import { useSignup } from "../hooks/useSignUp";
import { Link } from "react-router";

function SignUpPage() {
  const { handleSubmit, myForm, handleChange, loading, errors } = useSignup();
  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-neutral-50 px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Join the TorchBearer community</CardDescription>
            <CardAction>
              <Button
                variant="link"
                className="text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                <Link to={"/login"} className="cursor-pointer">Sign in</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    name="name"
                    value={myForm.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
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
                    disabled={loading}
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
                    required
                    value={myForm.password}
                    name="password"
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              onClick={() => window.open(`${API_URL}/api/auth/google`, "_self")}
              variant="outline"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              <FaGoogle />
              Continue with Google
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default SignUpPage;
