import { useState } from "react"
import axios from "axios"
import { Link } from "react-router"
import { Button } from "../../core/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../core/components/ui/card"
import { Input } from "../../core/components/ui/input"
import { Label } from "../../core/components/ui/label"

const API_URL = import.meta.env.VITE_API_URL

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setSuccessMessage("")
    setErrorMessage("")
    setLoading(true)

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/forgot-password`,
        { email }
      )
      setSuccessMessage(res.data.message)
    } catch (error: any) {
      const msg =
        error.response?.data?.message ??
        "Something went wrong. Please try again."
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-4 py-3">
                {successMessage}
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link to="/login" className="text-blue-600 hover:underline">
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
