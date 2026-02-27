"use client"

import { useState, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Gamepad2,
  Flower2,
  Heart,
  Droplets,
  Sun,
  Sparkles,
  TreePine,
  Check,
} from "lucide-react"

interface Plant {
  id: string
  name: string
  icon: string
  growth: number
  health: number
  watered: boolean
}

interface WellnessTask {
  id: string
  label: string
  done: boolean
  points: number
}

export default function GardenPage() {
  const [plants, setPlants] = useState<Plant[]>([
    { id: "1", name: "Calm Lotus", icon: "lotus", growth: 45, health: 80, watered: false },
    { id: "2", name: "Joy Sunflower", icon: "sunflower", growth: 30, health: 65, watered: false },
    { id: "3", name: "Peace Fern", icon: "fern", growth: 60, health: 90, watered: false },
    { id: "4", name: "Hope Orchid", icon: "orchid", growth: 15, health: 50, watered: false },
  ])

  const [tasks, setTasks] = useState<WellnessTask[]>([
    { id: "t1", label: "Complete a breathing exercise", done: false, points: 10 },
    { id: "t2", label: "Write 3 things you are grateful for", done: false, points: 15 },
    { id: "t3", label: "Take a 10-minute walk", done: false, points: 20 },
    { id: "t4", label: "Drink a glass of water", done: false, points: 5 },
    { id: "t5", label: "Practice 5 minutes of meditation", done: false, points: 15 },
    { id: "t6", label: "Reach out to a friend", done: false, points: 20 },
    { id: "t7", label: "Avoid screens for 30 minutes", done: false, points: 10 },
    { id: "t8", label: "Listen to calming music", done: false, points: 10 },
  ])

  const [petMood, setPetMood] = useState(60)
  const [petEnergy, setPetEnergy] = useState(75)

  const totalPoints = tasks.filter((t) => t.done).reduce((a, t) => a + t.points, 0)
  const level = Math.floor(totalPoints / 30) + 1

  const waterPlant = useCallback((id: string) => {
    setPlants((prev) =>
      prev.map((p) =>
        p.id === id && !p.watered
          ? { ...p, watered: true, growth: Math.min(100, p.growth + 10), health: Math.min(100, p.health + 5) }
          : p
      )
    )
  }, [])

  const completeTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
    setPetMood((prev) => Math.min(100, prev + 5))
    setPetEnergy((prev) => Math.min(100, prev + 3))
  }, [])

  const plantIcons: Record<string, string> = {
    lotus: "🪷",
    sunflower: "🌻",
    fern: "🌿",
    orchid: "🌸",
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-chart-4/10">
            <Gamepad2 className="h-7 w-7 text-chart-4" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Gamified Mental Fitness</h1>
          <p className="mt-2 text-muted-foreground">
            Your mental wellness grows your digital world
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Badge variant="secondary" className="gap-1 text-sm">
              <Sparkles className="h-3.5 w-3.5" /> Level {level}
            </Badge>
            <Badge variant="outline" className="gap-1 text-sm">
              {totalPoints} points
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="garden" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="garden" className="gap-2">
              <Flower2 className="h-4 w-4" /> Garden
            </TabsTrigger>
            <TabsTrigger value="pet" className="gap-2">
              <Heart className="h-4 w-4" /> AI Pet
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <Check className="h-4 w-4" /> Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="garden" className="space-y-6">
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TreePine className="h-5 w-5 text-chart-4" /> Your Digital Garden
                </CardTitle>
                <CardDescription>Water your plants and watch them grow with your wellness progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {plants.map((plant) => (
                    <div
                      key={plant.id}
                      className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-chart-4/10 text-3xl">
                        {plantIcons[plant.icon] || "🌱"}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{plant.name}</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Sun className="h-3 w-3 text-chart-5" />
                            <span className="w-12 text-muted-foreground">Growth</span>
                            <Progress value={plant.growth} className="h-1.5 flex-1" />
                            <span className="text-muted-foreground">{plant.growth}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Heart className="h-3 w-3 text-destructive" />
                            <span className="w-12 text-muted-foreground">Health</span>
                            <Progress value={plant.health} className="h-1.5 flex-1" />
                            <span className="text-muted-foreground">{plant.health}%</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={plant.watered ? "secondary" : "outline"}
                          disabled={plant.watered}
                          onClick={() => waterPlant(plant.id)}
                          className="mt-2 gap-1"
                        >
                          <Droplets className="h-3.5 w-3.5" />
                          {plant.watered ? "Watered" : "Water"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pet" className="space-y-6">
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Your AI Companion</CardTitle>
                <CardDescription>Take care of your virtual pet by completing wellness tasks</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="flex h-40 w-40 items-center justify-center rounded-full bg-primary/10 text-7xl">
                    {petMood > 80 ? "😸" : petMood > 50 ? "🐱" : petMood > 30 ? "😿" : "🙀"}
                  </div>
                  {petMood > 70 && (
                    <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-chart-4/20 text-sm">
                      {"💚"}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {petMood > 80 ? "Luna is thriving!" : petMood > 50 ? "Luna is doing okay" : "Luna needs attention"}
                </h3>
                <div className="mt-4 w-full max-w-xs space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Mood</span>
                      <span className="text-foreground">{petMood}%</span>
                    </div>
                    <Progress value={petMood} className="h-2" />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Energy</span>
                      <span className="text-foreground">{petEnergy}%</span>
                    </div>
                    <Progress value={petEnergy} className="h-2" />
                  </div>
                </div>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Complete wellness tasks to keep Luna happy and energized
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Daily Wellness Tasks</CardTitle>
                <CardDescription>
                  Complete tasks to earn points, grow your garden, and care for your pet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => completeTask(task.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                      task.done
                        ? "border-chart-4/30 bg-chart-4/5"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      task.done ? "border-chart-4 bg-chart-4" : "border-muted-foreground"
                    }`}>
                      {task.done && <Check className="h-3.5 w-3.5 text-background" />}
                    </div>
                    <span className={`flex-1 text-sm ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {task.label}
                    </span>
                    <Badge variant="outline" className="text-xs">+{task.points}</Badge>
                  </button>
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
