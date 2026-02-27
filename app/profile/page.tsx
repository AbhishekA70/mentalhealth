"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, Loader2, PencilLine, Save, User, X } from "lucide-react"

type ProfileRecord = {
  full_name: string
  email: string
  avatar_url: string
  phone: string
  date_of_birth: string
  gender: string
  address: string
  family_details: string
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/)
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "U"
}

const emptyProfile: ProfileRecord = {
  full_name: "",
  email: "",
  avatar_url: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  address: "",
  family_details: "",
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<ProfileRecord>(emptyProfile)
  const [draftProfile, setDraftProfile] = useState<ProfileRecord>(emptyProfile)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/auth/login?redirect=/profile")
        return
      }

      setUserId(user.id)

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email, avatar_url, phone, date_of_birth, gender, address, family_details")
        .eq("id", user.id)
        .maybeSingle()

      if (!mounted) return

      const resolvedProfile: ProfileRecord = {
        full_name:
          profileData?.full_name ||
          (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : ""),
        email: profileData?.email || user.email || "",
        avatar_url:
          profileData?.avatar_url ||
          (typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : ""),
        phone:
          profileData?.phone ||
          (typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : ""),
        date_of_birth:
          profileData?.date_of_birth ||
          (typeof user.user_metadata?.date_of_birth === "string" ? user.user_metadata.date_of_birth : ""),
        gender:
          profileData?.gender ||
          (typeof user.user_metadata?.gender === "string" ? user.user_metadata.gender : ""),
        address:
          profileData?.address ||
          (typeof user.user_metadata?.address === "string" ? user.user_metadata.address : ""),
        family_details:
          profileData?.family_details ||
          (typeof user.user_metadata?.family_details === "string" ? user.user_metadata.family_details : ""),
      }

      setProfile(resolvedProfile)
      setDraftProfile(resolvedProfile)
      setIsLoading(false)
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [router, supabase])

  const fullName = (isEditing ? draftProfile.full_name : profile.full_name) || "User"
  const email = profile.email || "-"

  const handleStartEdit = () => {
    setDraftProfile(profile)
    setIsEditing(true)
    setError(null)
    setMessage(null)
  }

  const handleCancelEdit = () => {
    setDraftProfile(profile)
    setIsEditing(false)
    setError(null)
    setMessage(null)
  }

  const updateDraftField = (field: keyof ProfileRecord, value: string) => {
    setDraftProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    if (!userId) return

    setError(null)
    setMessage(null)
    setIsSaving(true)

    const normalized = {
      full_name: draftProfile.full_name.trim(),
      email: profile.email,
      avatar_url: draftProfile.avatar_url.trim() || null,
      phone: draftProfile.phone.trim() || null,
      date_of_birth: draftProfile.date_of_birth || null,
      gender: draftProfile.gender.trim() || null,
      address: draftProfile.address.trim() || null,
      family_details: draftProfile.family_details.trim() || null,
    }

    const { error: profileUpdateError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        ...normalized,
      },
      { onConflict: "id" }
    )

    if (profileUpdateError) {
      setError(profileUpdateError.message)
      setIsSaving(false)
      return
    }

    await supabase.auth.updateUser({
      data: {
        full_name: normalized.full_name,
        avatar_url: normalized.avatar_url,
        phone: normalized.phone,
        date_of_birth: normalized.date_of_birth,
        gender: normalized.gender,
        address: normalized.address,
        family_details: normalized.family_details,
      },
    })

    const updatedProfile: ProfileRecord = {
      full_name: normalized.full_name,
      email: profile.email,
      avatar_url: normalized.avatar_url || "",
      phone: normalized.phone || "",
      date_of_birth: normalized.date_of_birth || "",
      gender: normalized.gender || "",
      address: normalized.address || "",
      family_details: normalized.family_details || "",
    }

    setProfile(updatedProfile)
    setDraftProfile(updatedProfile)
    setIsEditing(false)
    setIsSaving(false)
    setMessage("Profile updated successfully.")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Card className="border-border/50 bg-card">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <User className="h-6 w-6 text-primary" />
                Profile
              </CardTitle>
              <CardDescription>Your account and personal details</CardDescription>
            </div>
            {!isLoading && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving} className="gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {isSaving ? "Saving..." : "Save profile"}
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleStartEdit} className="gap-2">
                    <PencilLine className="h-4 w-4" />
                    Edit profile
                  </Button>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-20 w-20 rounded-full bg-secondary" />
                <div className="h-5 w-40 rounded bg-secondary" />
                <div className="h-4 w-64 rounded bg-secondary" />
              </div>
            ) : (
              <>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <Avatar className="h-20 w-20 border border-border">
                    <AvatarImage src={(isEditing ? draftProfile.avatar_url : profile.avatar_url) || ""} alt={fullName} />
                    <AvatarFallback className="text-lg font-semibold">{getInitials(fullName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{fullName}</h2>
                    <p className="text-muted-foreground">{email}</p>
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

                {isEditing ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="avatarUrl">Profile picture URL (optional)</Label>
                      <Input
                        id="avatarUrl"
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        value={draftProfile.avatar_url}
                        onChange={(event) => updateDraftField("avatar_url", event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full name</Label>
                      <Input
                        id="fullName"
                        value={draftProfile.full_name}
                        onChange={(event) => updateDraftField("full_name", event.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        value={draftProfile.phone}
                        onChange={(event) => updateDraftField("phone", event.target.value)}
                        placeholder="+91 9876543210"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of birth (optional)</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={draftProfile.date_of_birth}
                        onChange={(event) => updateDraftField("date_of_birth", event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender (optional)</Label>
                      <Input
                        id="gender"
                        value={draftProfile.gender}
                        onChange={(event) => updateDraftField("gender", event.target.value)}
                        placeholder="e.g. Male"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address">Address (optional)</Label>
                      <Input
                        id="address"
                        value={draftProfile.address}
                        onChange={(event) => updateDraftField("address", event.target.value)}
                        placeholder="City, State"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="familyDetails">Family details (optional)</Label>
                      <Textarea
                        id="familyDetails"
                        value={draftProfile.family_details}
                        onChange={(event) => updateDraftField("family_details", event.target.value)}
                        placeholder="Any relevant family details"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <DetailItem label="Phone" value={profile.phone} />
                      <DetailItem label="Date of Birth" value={profile.date_of_birth} />
                      <DetailItem label="Gender" value={profile.gender} />
                      <DetailItem label="Address" value={profile.address} />
                    </div>

                    <div className="rounded-lg border border-border p-4">
                      <p className="text-sm font-medium text-foreground">Family details (optional)</p>
                      <p className="mt-1 text-sm text-muted-foreground">{profile.family_details || "Not provided"}</p>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value || "Not provided"}</p>
    </div>
  )
}
