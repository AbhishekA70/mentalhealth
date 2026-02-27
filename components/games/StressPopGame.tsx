"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Sparkles, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Bubble = {
  id: number
  x: number
  y: number
  size: number
  speed: number
  drift: number
  phase: number
  color: string
  popped: boolean
  popAt?: number
}

type StressPopGameProps = {
  className?: string
}

const pastelBubbles = [
  "rgba(173, 216, 255, 0.72)",
  "rgba(255, 210, 226, 0.72)",
  "rgba(203, 255, 223, 0.72)",
  "rgba(255, 238, 196, 0.72)",
  "rgba(225, 220, 255, 0.72)",
]

const calmingMessages = ["Breathe and Pop", "Let it go", "Release the tension"]

const MAX_BUBBLES = 18
const SPAWN_INTERVAL_MS = 900
const POP_ANIMATION_MS = 320

export function StressPopGame({ className }: StressPopGameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bubbleIdRef = useRef(0)
  const boundsRef = useRef({ width: 720, height: 460 })
  const bubblesRef = useRef<Bubble[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)

  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [score, setScore] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    bubblesRef.current = bubbles
  }, [bubbles])

  const sparkles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: (i * 17) % 100,
        top: (i * 29) % 100,
        size: 3 + (i % 3),
        delay: `${(i % 7) * 0.6}s`,
        duration: `${5 + (i % 4)}s`,
      })),
    []
  )

  const updateBounds = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    boundsRef.current = {
      width: rect.width || 720,
      height: rect.height || 460,
    }
  }, [])

  const createBubble = useCallback((): Bubble => {
    const { width, height } = boundsRef.current
    const size = 44 + Math.random() * 56
    const x = size / 2 + Math.random() * Math.max(1, width - size)
    const y = height + size + Math.random() * 40

    return {
      id: bubbleIdRef.current++,
      x,
      y,
      size,
      speed: 0.45 + Math.random() * 0.55,
      drift: 0.5 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
      color: pastelBubbles[Math.floor(Math.random() * pastelBubbles.length)],
      popped: false,
    }
  }, [])

  const spawnBubbles = useCallback(
    (count = 1) => {
      setBubbles((prev) => {
        const activeCount = prev.filter((bubble) => !bubble.popped).length
        const availableSlots = Math.max(0, MAX_BUBBLES - activeCount)
        const toCreate = Math.min(count, availableSlots)
        if (toCreate <= 0) return prev

        const created = Array.from({ length: toCreate }, () => createBubble())
        return [...prev, ...created]
      })
    },
    [createBubble]
  )

  const playSoftPop = useCallback(() => {
    if (!soundEnabled) return

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current

      if (ctx.state === "suspended") {
        void ctx.resume()
      }

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(320 + Math.random() * 80, ctx.currentTime)

      gain.gain.setValueAtTime(0.001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.24)
    } catch {
      // Ignore audio errors on unsupported environments.
    }
  }, [soundEnabled])

  const popBubble = useCallback(
    (id: number) => {
      const target = bubblesRef.current.find((bubble) => bubble.id === id)
      if (!target || target.popped) return

      const now = performance.now()

      setBubbles((prev) =>
        prev.map((bubble) =>
          bubble.id === id
            ? {
                ...bubble,
                popped: true,
                popAt: now,
              }
            : bubble
        )
      )

      setScore((prev) => prev + 1)

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(12)
      }

      playSoftPop()
    },
    [playSoftPop]
  )

  useEffect(() => {
    updateBounds()
    spawnBubbles(9)

    const handleResize = () => updateBounds()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [spawnBubbles, updateBounds])

  useEffect(() => {
    const spawnTimer = setInterval(() => {
      spawnBubbles(1)
    }, SPAWN_INTERVAL_MS)

    return () => clearInterval(spawnTimer)
  }, [spawnBubbles])

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % calmingMessages.length)
    }, 4200)

    return () => clearInterval(messageTimer)
  }, [])

  useEffect(() => {
    let frameId = 0
    let lastTime = performance.now()

    const loop = (now: number) => {
      const dt = Math.max(0.6, Math.min(2.2, (now - lastTime) / 16.67))
      lastTime = now

      const { width } = boundsRef.current

      setBubbles((prev) => {
        const next: Bubble[] = []

        for (const bubble of prev) {
          if (bubble.popped) {
            if (bubble.popAt && now - bubble.popAt < POP_ANIMATION_MS) {
              next.push(bubble)
            }
            continue
          }

          const y = bubble.y - bubble.speed * dt * 2.2
          const driftOffset = Math.sin(now * 0.0012 + bubble.phase) * bubble.drift * dt
          const x = Math.min(width - bubble.size / 2, Math.max(bubble.size / 2, bubble.x + driftOffset))

          if (y + bubble.size < 0) {
            continue
          }

          next.push({ ...bubble, x, y })
        }

        return next
      })

      frameId = window.requestAnimationFrame(loop)
    }

    frameId = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        void audioCtxRef.current.close()
      }
    }
  }, [])

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-cyan-100/80 via-blue-100/60 to-violet-100/75 p-4 shadow-md dark:from-cyan-950/30 dark:via-blue-950/20 dark:to-violet-950/30",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl animate-breathe" />

        {sparkles.map((sparkle) => (
          <span
            key={sparkle.id}
            className="absolute rounded-full bg-white/70 dark:bg-white/30"
            style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              animation: `float ${sparkle.duration} ease-in-out ${sparkle.delay} infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-background/55 px-3 py-2 backdrop-blur-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Stress Pop Bubble</p>
          <p className="text-sm font-semibold text-foreground">Keep popping to release stress 🌿</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Score: {score}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => {
              setSoundEnabled((prev) => {
                const next = !prev
                if (next && audioCtxRef.current?.state === "suspended") {
                  void audioCtxRef.current.resume()
                }
                return next
              })
            }}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {soundEnabled ? "Sound On" : "Sound Off"}
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative h-[480px] w-full touch-manipulation select-none overflow-hidden rounded-2xl border border-white/30 bg-white/20"
      >
        {bubbles.map((bubble) => (
          <button
            key={bubble.id}
            type="button"
            aria-label="Pop stress bubble"
            onClick={() => popBubble(bubble.id)}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 shadow-lg transition-all duration-300",
              bubble.popped ? "scale-150 opacity-0 pointer-events-none" : "opacity-100 hover:scale-105"
            )}
            style={{
              left: bubble.x,
              top: bubble.y,
              width: bubble.size,
              height: bubble.size,
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.92), ${bubble.color})`,
              boxShadow: "0 10px 24px rgba(120, 150, 220, 0.25)",
            }}
          >
            <span className="absolute left-[24%] top-[20%] h-[16%] w-[16%] rounded-full bg-white/65" />
            {bubble.popped && <span className="absolute inset-0 rounded-full border-2 border-white/80 animate-ping" />}
          </button>
        ))}

        {bubbles.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="rounded-full bg-background/70 px-5 py-2 text-sm text-muted-foreground shadow-sm">
              Bubbles are drifting in…
            </p>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-background/55 px-3 py-2 backdrop-blur-sm">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          {calmingMessages[messageIndex]}
        </p>
        <p className="text-sm text-muted-foreground">Every pop is a step toward calmness</p>
      </div>
    </section>
  )
}
