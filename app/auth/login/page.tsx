"use client"

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2, LogIn, Smartphone } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const DEFAULT_REDIRECT = "/"

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginPageContent />
    </Suspense>
  )
}

function LoginPageContent() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const redirectTo = DEFAULT_REDIRECT

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneOtp, setPhoneOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false)
  const [isVerifyingPhoneOtp, setIsVerifyingPhoneOtp] = useState(false)

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user && mounted) {
        router.replace(redirectTo)
      }
    }

    checkSession()

    return () => {
      mounted = false
    }
  }, [router, redirectTo, supabase])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setIsLoading(false)
      return
    }

    router.replace(redirectTo)
    router.refresh()
  }

  const handleForgotPassword = async () => {
    setError(null)
    setMessage(null)

    if (!email.trim()) {
      setError("Please enter your email address first, then click Forgot password.")
      return
    }

    setIsResettingPassword(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/login`,
    })

    if (resetError) {
      setError(resetError.message)
      setIsResettingPassword(false)
      return
    }

    setMessage("Password reset link sent. Please check your email inbox.")
    setIsResettingPassword(false)
  }

  const handleSendPhoneOtp = async () => {
    setError(null)
    setMessage(null)

    if (!phoneNumber.trim()) {
      setError("Please enter your phone number to receive OTP.")
      return
    }

    setIsSendingPhoneOtp(true)

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: phoneNumber.trim(),
      options: {
        shouldCreateUser: false,
      },
    })

    if (otpError) {
      setError(otpError.message)
      setIsSendingPhoneOtp(false)
      return
    }

    setMessage("OTP sent to your phone. Enter it below to sign in.")
    setIsSendingPhoneOtp(false)
  }

  const handleVerifyPhoneOtp = async () => {
    setError(null)
    setMessage(null)

    if (!phoneNumber.trim() || !phoneOtp.trim()) {
      setError("Please enter both phone number and OTP.")
      return
    }

    setIsVerifyingPhoneOtp(true)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: phoneNumber.trim(),
      token: phoneOtp.trim(),
      type: "sms",
    })

    if (verifyError) {
      setError(verifyError.message)
      setIsVerifyingPhoneOtp(false)
      return
    }

    router.replace(redirectTo)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation logoOnly />
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border-border/50 bg-card">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-foreground">Welcome back</CardTitle>
            <CardDescription>Sign in to continue your mental health journey</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isResettingPassword}
                    className="text-sm font-medium text-primary hover:underline disabled:opacity-60"
                  >
                    {isResettingPassword ? "Sending reset link..." : "Forgot password?"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
                  {message}
                </div>
              )}

              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or sign in with phone</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 9876543210"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneOtp">OTP</Label>
                <Input
                  id="phoneOtp"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter SMS OTP"
                  value={phoneOtp}
                  onChange={(event) => setPhoneOtp(event.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={handleSendPhoneOtp}
                  disabled={isSendingPhoneOtp}
                >
                  {isSendingPhoneOtp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-4 w-4" />
                      Send OTP
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  className="gap-2"
                  onClick={handleVerifyPhoneOtp}
                  disabled={isVerifyingPhoneOtp}
                >
                  {isVerifyingPhoneOtp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Verify OTP
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Need an account?{" "}
                <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                  Create one
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

function LoginPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation logoOnly />
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border-border/50 bg-card">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10" />
            <div className="mx-auto h-7 w-40 rounded bg-secondary" />
            <div className="mx-auto h-4 w-64 rounded bg-secondary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 rounded bg-secondary" />
            <div className="h-10 rounded bg-secondary" />
            <div className="h-9 rounded bg-secondary" />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}