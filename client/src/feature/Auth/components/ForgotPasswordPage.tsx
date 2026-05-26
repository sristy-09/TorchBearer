import { useState } from "react"
import axios from "axios"
import { Link } from "react-router"
import { Button } from "../../core/components/ui/button"
import { Input } from "../../core/components/ui/input"
import { Label } from "../../core/components/ui/label"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

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
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email })
      setSuccessMessage(res.data.message)
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message ?? "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12"
      style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm rounded-2xl p-8 border"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>

        {successMessage ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(16,185,129,0.1)" }}>
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Check your email</h1>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{successMessage}</p>
            <Link to="/login">
              <Button variant="outline" className="w-full h-11 rounded-xl"
                style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <ArrowLeft size={15} className="mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "var(--secondary)" }}>
                <Mail size={22} style={{ color: "var(--primary)" }} />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Forgot password?</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Remember your password?{" "}
              <Link to="/login" className="font-semibold transition-colors" style={{ color: "var(--primary)" }}>
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage
