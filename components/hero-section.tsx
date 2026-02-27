"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Brain,
  ScanFace,
  Mic,
  Activity,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  { icon: Brain, label: "AI Assessment", desc: "Deep psychological analysis" },
  { icon: ScanFace, label: "Face Analysis", desc: "Micro-expression detection" },
  { icon: Mic, label: "Voice Analysis", desc: "Emotional tone detection" },
  { icon: Activity, label: "Health Monitor", desc: "Real-time vital tracking" },
  { icon: Shield, label: "Privacy First", desc: "Edge AI, no data stored" },
]

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            <Sparkles className="h-4 w-4" />
            AI-Powered Mental Health Analysis
          </div>

          <h1
            className={`max-w-4xl text-balance text-4xl font-bold leading-tight tracking-tight text-foreground transition-all delay-100 duration-700 md:text-6xl lg:text-7xl ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            Your Mind Deserves{" "}
            <span className="text-primary">Intelligent</span> Care
          </h1>

          <p
            className={`mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground transition-all delay-200 duration-700 md:text-xl ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            Advanced AI analyzes your psychological state through assessments, voice patterns,
            facial expressions, and behavioral learning to provide personalized mental health guidance.
          </p>

          <div
            className={`mt-10 flex flex-col items-center gap-4 transition-all delay-300 duration-700 sm:flex-row ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            <Button asChild size="lg" className="gap-2 rounded-full px-8 text-base">
              <Link href="/assessment">
                Start Assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 rounded-full px-8 text-base">
              <Link href="/chat">Talk to AI</Link>
            </Button>
          </div>

          <div
            className={`mt-20 grid w-full max-w-4xl grid-cols-2 gap-4 transition-all delay-500 duration-700 md:grid-cols-5 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            {features.map((feature, i) => (
              <div
                key={feature.label}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card hover:shadow-lg hover:shadow-primary/5"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">{feature.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
