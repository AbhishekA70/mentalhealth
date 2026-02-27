"use client"

import { useState, useEffect, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Heart,
  Activity,
  Moon,
  AlertTriangle,
  Bluetooth,
  Watch,
  Wifi,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"

function useSimulatedVital(min: number, max: number, interval: number) {
  const [value, setValue] = useState(Math.floor((min + max) / 2))
  const [active, setActive] = useState(false)
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable")

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      setValue((prev) => {
        const change = (Math.random() - 0.5) * 6
        const newVal = Math.max(min, Math.min(max, prev + change))
        setTrend(newVal > prev + 1 ? "up" : newVal < prev - 1 ? "down" : "stable")
        return Math.round(newVal)
      })
    }, interval)
    return () => clearInterval(id)
  }, [active, min, max, interval])

  return { value, active, setActive, trend }
}

const sleepData = [
  { day: "Mon", hours: 6.5, quality: 70 },
  { day: "Tue", hours: 7.2, quality: 82 },
  { day: "Wed", hours: 5.8, quality: 55 },
  { day: "Thu", hours: 7.0, quality: 78 },
  { day: "Fri", hours: 6.2, quality: 62 },
  { day: "Sat", hours: 8.1, quality: 90 },
  { day: "Sun", hours: 7.5, quality: 85 },
]

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-destructive" />
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-chart-4" />
  return <Minus className="h-4 w-4 text-muted-foreground" />
}

export default function HealthPage() {
  const heartRate = useSimulatedVital(60, 100, 1500)
  const systolic = useSimulatedVital(110, 140, 3000)
  const diastolic = useSimulatedVital(70, 90, 3000)
  const [panicDetected, setPanicDetected] = useState(false)

  useEffect(() => {
    if (heartRate.value > 95 && heartRate.active) {
      setPanicDetected(true)
      const timer = setTimeout(() => setPanicDetected(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [heartRate.value, heartRate.active])

  const startAll = useCallback(() => {
    heartRate.setActive(true)
    systolic.setActive(true)
    diastolic.setActive(true)
  }, [heartRate, systolic, diastolic])

  const stopAll = useCallback(() => {
    heartRate.setActive(false)
    systolic.setActive(false)
    diastolic.setActive(false)
  }, [heartRate, systolic, diastolic])

  const anyActive = heartRate.active || systolic.active || diastolic.active

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Heart className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Health Monitoring</h1>
          <p className="mt-2 text-muted-foreground">
            Track your vitals, detect panic episodes, and monitor sleep patterns
          </p>
        </div>

        {panicDetected && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-foreground animate-slide-up">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-semibold">Elevated Heart Rate Detected</p>
              <p className="text-sm text-muted-foreground">
                Your heart rate is elevated. Try taking slow deep breaths. If you feel unwell, seek medical attention.
              </p>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button onClick={anyActive ? stopAll : startAll} className="gap-2">
            <Activity className="h-4 w-4" />
            {anyActive ? "Stop Monitoring" : "Start Monitoring"}
          </Button>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            <Bluetooth className="h-4 w-4" /> Bluetooth
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            <Watch className="h-4 w-4" /> Wearable
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            <Wifi className="h-4 w-4" /> Wireless
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base text-foreground">
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-destructive" /> Heart Rate
                </span>
                <TrendIcon trend={heartRate.trend} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${heartRate.active ? "text-foreground" : "text-muted-foreground"}`}>
                  {heartRate.active ? heartRate.value : "--"}
                </span>
                <span className="text-sm text-muted-foreground">bpm</span>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>60</span><span>80</span><span>100</span>
                </div>
                <Progress value={heartRate.active ? ((heartRate.value - 60) / 40) * 100 : 0} className="h-2" />
              </div>
              <Badge variant={heartRate.active ? (heartRate.value > 90 ? "destructive" : "secondary") : "outline"} className="mt-3">
                {heartRate.active ? (heartRate.value > 90 ? "Elevated" : "Normal") : "Inactive"}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base text-foreground">
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Blood Pressure
                </span>
                <TrendIcon trend={systolic.trend} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${systolic.active ? "text-foreground" : "text-muted-foreground"}`}>
                  {systolic.active ? systolic.value : "--"}
                </span>
                <span className="text-lg text-muted-foreground">/</span>
                <span className={`text-2xl font-bold ${diastolic.active ? "text-foreground" : "text-muted-foreground"}`}>
                  {diastolic.active ? diastolic.value : "--"}
                </span>
                <span className="text-sm text-muted-foreground">mmHg</span>
              </div>
              <div className="mt-3">
                <Progress value={systolic.active ? ((systolic.value - 90) / 60) * 100 : 0} className="h-2" />
              </div>
              <Badge variant={systolic.active ? (systolic.value > 135 ? "destructive" : "secondary") : "outline"} className="mt-3">
                {systolic.active ? (systolic.value > 135 ? "High" : "Normal") : "Inactive"}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <AlertTriangle className="h-4 w-4 text-chart-5" /> Panic Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${panicDetected ? "text-destructive" : heartRate.active ? "text-chart-4" : "text-muted-foreground"}`}>
                  {!heartRate.active ? "--" : panicDetected ? "ALERT" : "CLEAR"}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {panicDetected
                  ? "Elevated heart rate detected. Triggering calming intervention..."
                  : heartRate.active
                    ? "Monitoring for panic episodes..."
                    : "Start monitoring to enable panic detection"}
              </p>
              <Badge variant={panicDetected ? "destructive" : heartRate.active ? "secondary" : "outline"} className="mt-3">
                {panicDetected ? "Panic Detected" : heartRate.active ? "Monitoring" : "Inactive"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Moon className="h-5 w-5 text-primary" /> Sleep Cycle Tracking
            </CardTitle>
            <CardDescription>Your weekly sleep patterns and quality scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {sleepData.map((day) => (
                <div key={day.day} className="flex flex-col items-center gap-2">
                  <div className="relative h-32 w-full">
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg bg-primary/20 transition-all"
                      style={{ height: `${(day.hours / 10) * 100}%` }}
                    >
                      <div
                        className="absolute bottom-0 w-full rounded-t-lg bg-primary transition-all"
                        style={{ height: `${day.quality}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-foreground">{day.day}</p>
                    <p className="text-xs text-muted-foreground">{day.hours}h</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-sm bg-primary" /> Quality
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-sm bg-primary/20" /> Duration
              </span>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
