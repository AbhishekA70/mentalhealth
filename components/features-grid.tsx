"use client"

import Link from "next/link"
import {
  ClipboardList,
  MessageCircle,
  ScanFace,
  Heart,
  Cigarette,
  Wind,
  Gamepad2,
  CircleDot,
  BookOpen,
  Phone,
  Stethoscope,
  LayoutDashboard,
  Fingerprint,
  ArrowRight,
} from "lucide-react"

const sections = [
  {
    icon: ClipboardList,
    title: "Deep Assessment",
    desc: "20+ psychological questions covering overthinking, depression, anxiety, trauma, phobias, addiction, and more with AI-driven risk scoring.",
    href: "/assessment",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
  },
  {
    icon: ScanFace,
    title: "Voice & Face Analysis",
    desc: "Camera and microphone-based AI detection of stress, anxiety, suppressed sadness, micro-expressions, and fatigue signals.",
    href: "/analysis",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    icon: MessageCircle,
    title: "Ask AI Companion",
    desc: "Chat-based AI mental health support that detects emotional tone and provides coping mechanisms and supportive guidance.",
    href: "/chat",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
  {
    icon: Heart,
    title: "Health Monitoring",
    desc: "Track heart rate, blood pressure, panic detection, and sleep cycle patterns with AI-powered analysis.",
    href: "/health",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
  {
    icon: Cigarette,
    title: "Lung Damage Check",
    desc: "Questionnaire and voice-based breath pattern analysis to assess smoking damage risk with recovery suggestions.",
    href: "/smokers-check",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    icon: Wind,
    title: "Relaxation Suite",
    desc: "Soothing music, guided breathing exercises, and meditation mode to calm your mind and reduce stress.",
    href: "/relaxation",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    icon: Gamepad2,
    title: "Gamified Wellness",
    desc: "Nurture a digital garden or AI pet that grows as your mental wellness improves. Make healing fun.",
    href: "/garden",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
  {
    icon: CircleDot,
    title: "Stress Pop Bubble",
    desc: "Calm endless bubble-popping game to gently release tension, improve focus, and support mindful breathing.",
    href: "/stress-relief-game",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    icon: Fingerprint,
    title: "Psychological Signature",
    desc: "AI learns your unique distress patterns and provides 24-hour early warning alerts before emotional breakdowns.",
    href: "/dashboard",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: BookOpen,
    title: "Knowledge Hub",
    desc: "Comprehensive guides on anxiety, depression, OCD, PTSD, bipolar, addiction, and trauma with symptoms and treatments.",
    href: "/knowledge",
    color: "text-chart-5",
    bg: "bg-chart-5/10",
  },
  {
    icon: Phone,
    title: "Emergency Support",
    desc: "Instant access to emergency contacts including 112, KIRAN Mental Health Helpline, and suicide prevention services.",
    href: "/emergency",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    icon: Stethoscope,
    title: "Consultant Directory",
    desc: "Connect with top online psychiatrists when your stress level is high. Download your assessment for consultations.",
    href: "/consultants",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
  },
  {
    icon: LayoutDashboard,
    title: "Results Dashboard",
    desc: "Download stress scores, risk levels, sleep patterns, emotional graphs, and lifestyle advice reports.",
    href: "/dashboard",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
]

export function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-12 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Complete Mental Health Ecosystem
        </h2>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          Everything you need for your mental well-being, powered by cutting-edge AI
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="group relative flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-border hover:shadow-lg hover:shadow-primary/5"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${section.bg}`}>
              <section.icon className={`h-5 w-5 ${section.color}`} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.desc}</p>
            </div>
            <div className="mt-auto flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Explore <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
