"use client"

import { FormEvent, Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Loader2, Smartphone, UserPlus } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const DEFAULT_REDIRECT = "/analysis"

function sanitizeRedirect(path: string | null) {
  if (!path || !path.startsWith("/")) return DEFAULT_REDIRECT
  return path
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupPageSkeleton />}>
      <SignupPageContent />
    </Suspense>
  )
}

function SignupPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const redirectTo = sanitizeRedirect(searchParams.get("redirect"))

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [phone, setPhone] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState("")
  const [address, setAddress] = useState("")
  const [familyDetails, setFamilyDetails] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phoneOtp, setPhoneOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false)
  const [isVerifyingPhoneOtp, setIsVerifyingPhoneOtp] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
          phone,
          date_of_birth: dateOfBirth,
          gender,
          address,
          family_details: familyDetails,
        },
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    if (data.session) {
      router.replace(redirectTo)
      router.refresh()
      return
    }

    setMessage("Account created. Please check your email to verify your account, then log in.")
    setIsLoading(false)
  }

  const handleSendPhoneOtp = async () => {
    setError(null)
    setMessage(null)

    if (!phone.trim()) {
      setError("Please enter your phone number to receive OTP.")
      return
    }

    setIsSendingPhoneOtp(true)

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
      options: {
        shouldCreateUser: true,
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
          phone,
          date_of_birth: dateOfBirth,
          gender,
          address,
          family_details: familyDetails,
        },
      },
    })

    if (otpError) {
      setError(otpError.message)
      setIsSendingPhoneOtp(false)
      return
    }

    setMessage("OTP sent to your phone. Enter it below to complete signup.")
    setIsSendingPhoneOtp(false)
  }

  const handleVerifyPhoneOtp = async () => {
    setError(null)
    setMessage(null)

    if (!phone.trim() || !phoneOtp.trim()) {
      setError("Please enter both phone number and OTP.")
      return
    }

    setIsVerifyingPhoneOtp(true)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
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
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-foreground">Create your account</CardTitle>
            <CardDescription>Sign up to save your progress and access protected tools</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Profile picture URL (optional)</Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                />
              </div>

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
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of birth (optional)</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender (optional)</Label>
                <Input
                  id="gender"
                  type="text"
                  placeholder="e.g. Female"
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address (optional)</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="City, State"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyDetails">Family details (optional)</Label>
                <Input
                  id="familyDetails"
                  type="text"
                  placeholder="Any relevant family details"
                  value={familyDetails}
                  onChange={(event) => setFamilyDetails(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
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
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create account
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with phone OTP</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneOtp">Phone OTP</Label>
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
                      <UserPlus className="h-4 w-4" />
                      Verify OTP
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-medium text-primary hover:underline">
                  Log in
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

function SignupPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation logoOnly />
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border-border/50 bg-card">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10" />
            <div className="mx-auto h-7 w-44 rounded bg-secondary" />
            <div className="mx-auto h-4 w-64 rounded bg-secondary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 rounded bg-secondary" />
            <div className="h-10 rounded bg-secondary" />
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