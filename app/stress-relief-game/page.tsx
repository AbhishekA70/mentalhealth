"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { StressPopGame } from "@/components/games/StressPopGame"
import { Brain, Flower2 } from "lucide-react"

export default function StressReliefGamePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-chart-2/10">
            <Brain className="h-7 w-7 text-chart-2" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Stress Pop Bubble</h1>
          <p className="mt-2 text-muted-foreground">
            A calm, endless mini-game for gentle focus and stress release
          </p>
        </div>

        <StressPopGame />

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Flower2 className="h-4 w-4 text-chart-4" />
          Keep popping softly — no pressure, no game over, just calm.
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
