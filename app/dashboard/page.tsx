"use client"

import { useEffect, useState } from "react"
import jsPDF from "jspdf"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LayoutDashboard,
  Brain,
  Activity,
  Moon,
  Heart,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Download,
  X,
  Fingerprint,
  Shield,
  Bell,
  BarChart3,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts"

const stressHistory = [
  { day: "Mon", stress: 45, anxiety: 38, mood: 62 },
  { day: "Tue", stress: 52, anxiety: 45, mood: 55 },
  { day: "Wed", stress: 38, anxiety: 30, mood: 72 },
  { day: "Thu", stress: 65, anxiety: 58, mood: 40 },
  { day: "Fri", stress: 55, anxiety: 42, mood: 52 },
  { day: "Sat", stress: 30, anxiety: 25, mood: 78 },
  { day: "Sun", stress: 35, anxiety: 28, mood: 75 },
]

const sleepData = [
  { day: "Mon", hours: 6.5, quality: 70 },
  { day: "Tue", hours: 7.2, quality: 82 },
  { day: "Wed", hours: 5.8, quality: 55 },
  { day: "Thu", hours: 7.0, quality: 78 },
  { day: "Fri", hours: 6.2, quality: 62 },
  { day: "Sat", hours: 8.1, quality: 90 },
  { day: "Sun", hours: 7.5, quality: 85 },
]

const emotionalProfile = [
  { name: "Calm", value: 65, fill: "var(--color-chart-2)" },
  { name: "Anxious", value: 35, fill: "var(--color-chart-1)" },
  { name: "Happy", value: 55, fill: "var(--color-chart-4)" },
  { name: "Stressed", value: 42, fill: "var(--color-chart-5)" },
]

const warningSignals = [
  {
    type: "sleep",
    message: "Sleep quality dropped 20% below your baseline on Wednesday",
    severity: "warning",
    time: "2 days ago",
  },
  {
    type: "stress",
    message: "Stress spike detected on Thursday - 40% above your weekly average",
    severity: "alert",
    time: "1 day ago",
  },
  {
    type: "pattern",
    message: "Your sleep tends to drop before anxiety increases - watch for this pattern",
    severity: "info",
    time: "Pattern detected",
  },
]

const lifestyleAdvice = [
  {
    category: "Sleep",
    advice: "Your average sleep is 6.9 hours. Aim for 7-8 hours. Try winding down 30 minutes before bed.",
    score: 68,
  },
  {
    category: "Stress Management",
    advice: "Your stress peaks mid-week. Consider adding a 10-minute meditation break on Wednesday.",
    score: 55,
  },
  {
    category: "Physical Activity",
    advice: "Your mood improves on active days. Try to exercise at least 3 times per week.",
    score: 72,
  },
  {
    category: "Social Connection",
    advice: "Weekend mood scores are higher - maintain social activities on weekdays too.",
    score: 60,
  },
]

export default function DashboardPage() {
  const [showPaymentPopup, setShowPaymentPopup] = useState(false)
  const [paymentCountdown, setPaymentCountdown] = useState(10)

  const avgStress = Math.round(stressHistory.reduce((a, d) => a + d.stress, 0) / stressHistory.length)
  const avgMood = Math.round(stressHistory.reduce((a, d) => a + d.mood, 0) / stressHistory.length)
  const avgSleep = +(sleepData.reduce((a, d) => a + d.hours, 0) / sleepData.length).toFixed(1)

  const riskLevel = avgStress > 60 ? "High" : avgStress > 40 ? "Moderate" : "Low"
  const riskColor = avgStress > 60 ? "text-destructive" : avgStress > 40 ? "text-chart-5" : "text-chart-4"

  useEffect(() => {
    if (!showPaymentPopup) return
    if (paymentCountdown <= 0) {
      setShowPaymentPopup(false)
      return
    }

    const timeout = setTimeout(() => {
      setPaymentCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [showPaymentPopup, paymentCountdown])

  useEffect(() => {
    if (!showPaymentPopup) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowPaymentPopup(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showPaymentPopup])

  const handleDownloadReport = () => {
    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()
    const left = 14
    const right = 14
    const maxWidth = pageWidth - left - right
    let y = 20

    const ensureSpace = (needed = 8) => {
      if (y + needed > pageHeight - 15) {
        doc.addPage()
        y = 20
      }
    }

    const addWrappedText = (text: string, fontSize = 11, lineGap = 6) => {
      doc.setFontSize(fontSize)
      const lines = doc.splitTextToSize(text, maxWidth) as string[]
      lines.forEach((line) => {
        ensureSpace(lineGap)
        doc.text(line, left, y)
        y += lineGap
      })
    }

    doc.setFontSize(18)
    doc.text("Mind Games AI - Final Report", left, y)
    y += 10

    doc.setFontSize(11)
    doc.text(`Generated: ${new Date().toLocaleString()}`, left, y)
    y += 10

    doc.setFontSize(14)
    doc.text("Summary", left, y)
    y += 7
    addWrappedText(`Average Stress: ${avgStress}%`)
    addWrappedText(`Average Mood: ${avgMood}%`)
    addWrappedText(`Average Sleep: ${avgSleep}h`)
    addWrappedText(`Risk Level: ${riskLevel}`)

    y += 4
    ensureSpace(10)
    doc.setFontSize(14)
    doc.text("Warning Signals", left, y)
    y += 7
    warningSignals.forEach((signal, index) => {
      addWrappedText(`${index + 1}. ${signal.message}`)
    })

    y += 4
    ensureSpace(10)
    doc.setFontSize(14)
    doc.text("Lifestyle Advice", left, y)
    y += 7
    lifestyleAdvice.forEach((item, index) => {
      addWrappedText(`${index + 1}. ${item.category} (${item.score}%): ${item.advice}`)
    })

    doc.save("mindgames-report.pdf")
    setPaymentCountdown(10)
    setShowPaymentPopup(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              Results Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Your comprehensive mental health overview and insights
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={handleDownloadReport}
          >
            <Download className="h-4 w-4" /> Download Report
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stress Score</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{avgStress}%</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/10">
                  <Activity className="h-6 w-6 text-chart-1" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                <TrendingDown className="h-3.5 w-3.5 text-chart-4" />
                <span className="text-chart-4">-8% from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className={`mt-1 text-3xl font-bold ${riskColor}`}>{riskLevel}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-5/10">
                  <Shield className="h-6 w-6 text-chart-5" />
                </div>
              </div>
              <Progress value={avgStress} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Sleep</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{avgSleep}h</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Moon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-chart-4" />
                <span className="text-chart-4">+0.3h from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Mood Score</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{avgMood}%</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-4/10">
                  <Heart className="h-6 w-6 text-chart-4" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-chart-4" />
                <span className="text-chart-4">+5% from last week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="emotional" className="mt-6 space-y-6">
          <TabsList className="flex w-full flex-wrap">
            <TabsTrigger value="emotional" className="gap-1.5">
              <BarChart3 className="h-4 w-4" /> Emotional Graph
            </TabsTrigger>
            <TabsTrigger value="sleep" className="gap-1.5">
              <Moon className="h-4 w-4" /> Sleep Pattern
            </TabsTrigger>
            <TabsTrigger value="signature" className="gap-1.5">
              <Fingerprint className="h-4 w-4" /> Psychological Signature
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="gap-1.5">
              <Heart className="h-4 w-4" /> Lifestyle Advice
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emotional">
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Weekly Emotional Trends</CardTitle>
                <CardDescription>Stress, anxiety, and mood levels throughout the week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stressHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          borderColor: "var(--color-border)",
                          borderRadius: "8px",
                          color: "var(--color-foreground)",
                        }}
                      />
                      <Area type="monotone" dataKey="stress" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.1} strokeWidth={2} name="Stress" />
                      <Area type="monotone" dataKey="anxiety" stroke="var(--color-chart-5)" fill="var(--color-chart-5)" fillOpacity={0.1} strokeWidth={2} name="Anxiety" />
                      <Area type="monotone" dataKey="mood" stroke="var(--color-chart-4)" fill="var(--color-chart-4)" fillOpacity={0.1} strokeWidth={2} name="Mood" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sleep">
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Sleep Pattern Analysis</CardTitle>
                <CardDescription>Duration and quality of your sleep this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sleepData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          borderColor: "var(--color-border)",
                          borderRadius: "8px",
                          color: "var(--color-foreground)",
                        }}
                      />
                      <Bar dataKey="hours" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Hours" />
                      <Bar dataKey="quality" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} name="Quality %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signature">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Fingerprint className="h-5 w-5 text-primary" /> Your Digital Signature
                  </CardTitle>
                  <CardDescription>
                    AI-learned unique patterns of how you experience and express distress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="20%"
                        outerRadius="90%"
                        data={emotionalProfile}
                        startAngle={180}
                        endAngle={0}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar
                          dataKey="value"
                          cornerRadius={6}
                          background={{ fill: "var(--color-secondary)" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-card)",
                            borderColor: "var(--color-border)",
                            borderRadius: "8px",
                            color: "var(--color-foreground)",
                          }}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-3">
                    {emotionalProfile.map((e) => (
                      <div key={e.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.fill }} />
                        {e.name}: {e.value}%
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Bell className="h-5 w-5 text-chart-5" /> Early Warning Alerts
                  </CardTitle>
                  <CardDescription>
                    24-hour predictive alerts based on your behavioral patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {warningSignals.map((signal, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 rounded-xl border p-3 ${
                        signal.severity === "alert"
                          ? "border-destructive/30 bg-destructive/5"
                          : signal.severity === "warning"
                            ? "border-chart-5/30 bg-chart-5/5"
                            : "border-primary/30 bg-primary/5"
                      }`}
                    >
                      {signal.severity === "alert" ? (
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      ) : signal.severity === "warning" ? (
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-chart-5" />
                      ) : (
                        <Brain className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      )}
                      <div>
                        <p className="text-sm text-foreground">{signal.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{signal.time}</p>
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 rounded-xl border border-border bg-secondary p-4">
                    <p className="text-sm font-medium text-foreground">Your Pattern Signature</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Based on AI analysis: Your sleep quality typically drops 24-48 hours before anxiety spikes.
                      Voice pitch data suggests stress manifests as faster speech patterns. Facial analysis shows
                      fatigue signals increase on mid-week days.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lifestyle">
            <div className="grid gap-4 sm:grid-cols-2">
              {lifestyleAdvice.map((item) => (
                <Card key={item.category} className="border-border/50 bg-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{item.category}</h3>
                      <Badge variant={item.score >= 70 ? "secondary" : "outline"}>
                        {item.score}%
                      </Badge>
                    </div>
                    <Progress value={item.score} className="mt-3 h-2" />
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.advice}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {showPaymentPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/65 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Payment Option</h2>
                <button
                  type="button"
                  onClick={() => setShowPaymentPopup(false)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Close payment popup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground">To continue report services, you can pay via UPI:</p>
              <p className="mt-2 rounded-lg bg-secondary px-3 py-2 text-center font-mono text-sm font-medium text-foreground">
                8789919928@ptaxis
              </p>

              <p className="mt-3 text-xs text-muted-foreground">
                This popup will auto-close in {paymentCountdown}s. Press <span className="font-semibold">Esc</span> to close now.
              </p>

              <Button className="mt-4 w-full" variant="outline" onClick={() => setShowPaymentPopup(false)}>
                Close (Esc)
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
