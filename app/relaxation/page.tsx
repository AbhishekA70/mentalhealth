"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Wind, Music, Brain, Play, Pause, RotateCcw, Volume2 } from "lucide-react"

const breathingPatterns = [
  { name: "Box Breathing", inhale: 4, hold1: 4, exhale: 4, hold2: 4, desc: "Equal intervals for calm focus" },
  { name: "4-7-8 Relaxing", inhale: 4, hold1: 7, exhale: 8, hold2: 0, desc: "Deep relaxation technique" },
  { name: "Energizing Breath", inhale: 6, hold1: 0, exhale: 2, hold2: 0, desc: "Quick energizing pattern" },
]

const soundscapes = [
  { name: "Ocean Waves", desc: "Rhythmic ocean waves", frequency: 174 },
  { name: "Rainforest", desc: "Gentle rain and birds", frequency: 285 },
  { name: "Tibetan Bowls", desc: "Resonant singing bowls", frequency: 396 },
  { name: "White Noise", desc: "Constant ambient noise", frequency: 528 },
  { name: "Deep Hum", desc: "Low frequency meditation", frequency: 432 },
  { name: "Night Crickets", desc: "Peaceful night sounds", frequency: 639 },
]

type BreathPhase = "inhale" | "hold1" | "exhale" | "hold2" | "idle"

function useBreathing(pattern: typeof breathingPatterns[number]) {
  const [phase, setPhase] = useState<BreathPhase>("idle")
  const [timer, setTimer] = useState(0)
  const [active, setActive] = useState(false)
  const [cycles, setCycles] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    setActive(false)
    setPhase("idle")
    setTimer(0)
    setCycles(0)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const start = useCallback(() => {
    setActive(true)
    setCycles(0)
    setPhase("inhale")
    setTimer(pattern.inhale)
  }, [pattern])

  useEffect(() => {
    if (!active) return
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setPhase((currentPhase) => {
            if (currentPhase === "inhale") {
              if (pattern.hold1 > 0) {
                setTimer(pattern.hold1)
                return "hold1"
              }
              setTimer(pattern.exhale)
              return "exhale"
            }
            if (currentPhase === "hold1") {
              setTimer(pattern.exhale)
              return "exhale"
            }
            if (currentPhase === "exhale") {
              if (pattern.hold2 > 0) {
                setTimer(pattern.hold2)
                return "hold2"
              }
              setCycles((c) => c + 1)
              setTimer(pattern.inhale)
              return "inhale"
            }
            if (currentPhase === "hold2") {
              setCycles((c) => c + 1)
              setTimer(pattern.inhale)
              return "inhale"
            }
            return currentPhase
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active, pattern])

  return { phase, timer, active, cycles, start, stop }
}

function useAudioContext() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const play = useCallback((frequency: number, vol: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      stop()
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(frequency, ctx.currentTime)
      gain.gain.setValueAtTime(vol * 0.15, ctx.currentTime)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      oscillatorRef.current = osc
      gainRef.current = gain
    } catch {
      // Audio not supported
    }
  }, [])

  const stop = useCallback(() => {
    try {
      oscillatorRef.current?.stop()
      oscillatorRef.current?.disconnect()
    } catch {}
    oscillatorRef.current = null
    gainRef.current = null
  }, [])

  const setVolume = useCallback((vol: number) => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setValueAtTime(vol * 0.15, audioCtxRef.current.currentTime)
    }
  }, [])

  useEffect(() => () => stop(), [stop])

  return { play, stop, setVolume }
}

const phaseLabels: Record<BreathPhase, string> = {
  inhale: "Breathe In",
  hold1: "Hold",
  exhale: "Breathe Out",
  hold2: "Hold",
  idle: "Ready",
}

const phaseColors: Record<BreathPhase, string> = {
  inhale: "text-chart-2",
  hold1: "text-chart-5",
  exhale: "text-primary",
  hold2: "text-chart-5",
  idle: "text-muted-foreground",
}

export default function RelaxationPage() {
  const [selectedPattern, setSelectedPattern] = useState(0)
  const breathing = useBreathing(breathingPatterns[selectedPattern])
  const audio = useAudioContext()
  const [playingSound, setPlayingSound] = useState<number | null>(null)
  const [volume, setVolumeState] = useState(50)

  const handleSoundToggle = useCallback(
    (index: number) => {
      if (playingSound === index) {
        audio.stop()
        setPlayingSound(null)
      } else {
        audio.play(soundscapes[index].frequency, volume / 100)
        setPlayingSound(index)
      }
    },
    [playingSound, audio, volume]
  )

  const handleVolumeChange = useCallback(
    (val: number[]) => {
      setVolumeState(val[0])
      audio.setVolume(val[0] / 100)
    },
    [audio]
  )

  const breathScale = breathing.phase === "inhale" ? 1.3 : breathing.phase === "exhale" ? 0.8 : 1

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Wind className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Relaxation Suite</h1>
          <p className="mt-2 text-muted-foreground">
            Guided breathing, soothing sounds, and meditation mode
          </p>
        </div>

        <Tabs defaultValue="breathing" className="space-y-6">
          <TabsList className="grid h-14 w-full grid-cols-3">
            <TabsTrigger value="breathing" className="gap-2 text-base">
              <Wind className="h-5 w-5" /> Breathing
            </TabsTrigger>
            <TabsTrigger value="sounds" className="gap-2 text-base">
              <Music className="h-5 w-5" /> Sounds
            </TabsTrigger>
            <TabsTrigger value="meditation" className="gap-2 text-base">
              <Brain className="h-5 w-5" /> Meditation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="breathing" className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {breathingPatterns.map((p, i) => (
                <Button
                  key={p.name}
                  variant={selectedPattern === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    breathing.stop()
                    setSelectedPattern(i)
                  }}
                >
                  {p.name}
                </Button>
              ))}
            </div>

            <Card className="border-border/50 bg-card">
              <CardContent className="flex flex-col items-center py-16">
                <div
                  className="flex h-56 w-56 items-center justify-center rounded-full border-4 border-primary/30 transition-all duration-1000 ease-in-out sm:h-64 sm:w-64"
                  style={{ transform: `scale(${breathScale})`, backgroundColor: `oklch(0.55 0.2 250 / ${breathing.active ? 0.1 : 0.05})` }}
                >
                  <div className="flex flex-col items-center">
                    <p className={`text-3xl font-bold ${phaseColors[breathing.phase]}`}>
                      {phaseLabels[breathing.phase]}
                    </p>
                    {breathing.active && (
                      <p className="mt-1 text-5xl font-bold text-foreground">{breathing.timer}</p>
                    )}
                  </div>
                </div>

                <p className="mt-6 text-base text-muted-foreground">
                  {breathingPatterns[selectedPattern].desc}
                </p>
                {breathing.active && (
                  <p className="mt-2 text-base text-muted-foreground">Cycles completed: {breathing.cycles}</p>
                )}

                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={breathing.active ? breathing.stop : breathing.start}
                    className="gap-2"
                  >
                    {breathing.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {breathing.active ? "Pause" : "Start"}
                  </Button>
                  <Button variant="outline" onClick={breathing.stop} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sounds" className="space-y-6">
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">{volume}%</span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {soundscapes.map((sound, i) => (
                <Card
                  key={sound.name}
                  className={`cursor-pointer border-border/50 transition-all hover:shadow-md ${
                    playingSound === i ? "border-primary bg-primary/5" : "bg-card"
                  }`}
                  onClick={() => handleSoundToggle(i)}
                >
                  <CardContent className="flex items-center gap-4 py-8">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                      playingSound === i ? "bg-primary/20" : "bg-secondary"
                    }`}>
                      {playingSound === i ? (
                        <Pause className="h-5 w-5 text-primary" />
                      ) : (
                        <Play className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">{sound.name}</p>
                      <p className="text-sm text-muted-foreground">{sound.desc} - {sound.frequency}Hz</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="meditation">
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Guided Meditation</CardTitle>
                <CardDescription className="text-base">Find a comfortable position and follow along</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { step: 1, title: "Find Your Space", text: "Sit or lie down in a comfortable position. Close your eyes gently. Feel the surface beneath you supporting your body." },
                  { step: 2, title: "Body Scan", text: "Starting from your toes, slowly notice each part of your body. Release any tension you find. Let your muscles soften and relax." },
                  { step: 3, title: "Focus on Breath", text: "Bring your attention to your breathing. Don't try to change it, just observe. Notice the air flowing in and out naturally." },
                  { step: 4, title: "Release Thoughts", text: "When thoughts arise, acknowledge them without judgment. Imagine placing each thought on a leaf floating down a gentle stream." },
                  { step: 5, title: "Gratitude", text: "Think of three things you're grateful for today. Feel the warmth of gratitude spreading through your body." },
                  { step: 6, title: "Return Gently", text: "Slowly bring your awareness back to the room. Wiggle your fingers and toes. Open your eyes when you're ready." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 rounded-xl border border-border/60 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-base leading-relaxed text-muted-foreground">{item.text}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
