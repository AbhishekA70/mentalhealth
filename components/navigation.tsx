"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Brain,
  X,
  ClipboardList,
  MessageCircle,
  ScanFace,
  Heart,
  Cigarette,
  Gamepad2,
  BookOpen,
  Phone,
  Stethoscope,
  LayoutDashboard,
  Wind,
  LogIn,
  UserPlus,
  User,
  LogOut,
  PanelRightOpen,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/", label: "Home", icon: Brain },
  { href: "/assessment", label: "Assessment", icon: ClipboardList },
  { href: "/chat", label: "Ask AI", icon: MessageCircle },
  { href: "/analysis", label: "Analysis", icon: ScanFace },
  { href: "/health", label: "Health", icon: Heart },
  { href: "/smokers-check", label: "Lung Check", icon: Cigarette },
  { href: "/relaxation", label: "Relax", icon: Wind },
  { href: "/garden", label: "Wellness", icon: Gamepad2 },
  { href: "/knowledge", label: "Learn", icon: BookOpen },
  { href: "/emergency", label: "Emergency", icon: Phone },
  { href: "/consultants", label: "Consult", icon: Stethoscope },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
]

const topMenuItems = navItems.filter((item) =>
  ["/analysis", "/health", "/smokers-check", "/relaxation", "/dashboard"].includes(item.href)
)

function getDisplayName(user: {
  email?: string | null
  user_metadata?: {
    full_name?: unknown
  }
} | null) {
  if (!user) return null

  const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : ""

  if (fullName) return fullName

  if (user.email) {
    return user.email.split("@")[0]
  }

  return "User"
}

interface NavigationProps {
  logoOnly?: boolean
}

export function Navigation({ logoOnly = false }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let mounted = true

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!mounted) return

      setDisplayName(getDisplayName(user))
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setDisplayName(getDisplayName(session?.user ?? null))
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    await supabase.auth.signOut()

    setDisplayName(null)
    setOpen(false)
    router.replace("/auth/login")
    router.refresh()
    setIsLoggingOut(false)
  }

  if (logoOnly) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">MIND GAMES AI</span>
          </Link>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            MIND GAMES AI
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {topMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {displayName ? (
            <div className="relative hidden lg:block">
              <div className="group">
                <Button size="sm" variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  {displayName}
                </Button>
                <div className="invisible absolute right-0 top-full z-50 mt-2 w-44 rounded-md border border-border bg-popover p-1 opacity-0 shadow-md transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground transition-colors hover:bg-accent"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link href="/auth/signup" className="hidden lg:block">
                <Button size="sm" variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign up
                </Button>
              </Link>
              <Link href="/auth/login" className="hidden lg:block">
                <Button size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            </>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <PanelRightOpen className="h-4 w-4" />
                <span className="hidden sm:inline">All Menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72 bg-background p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex h-16 items-center justify-between border-b border-border px-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Brain className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-foreground">MIND GAMES AI</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-col gap-1 p-4" aria-label="Mobile navigation">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                {displayName ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                    >
                      <LogOut className="h-5 w-5" />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setOpen(false)}
                      className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      <LogIn className="h-5 w-5" />
                      Login
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      <UserPlus className="h-5 w-5" />
                      Sign up
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
