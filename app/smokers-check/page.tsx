"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Cigarette,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Heart,
  Wind,
  Leaf,
  RotateCcw,
} from "lucide-react"

const questions = [
  { q: "How many cigarettes do you smoke per day?", options: ["None", "1-5", "6-10", "11-20", "20+"], weights: [0, 1, 2, 3, 4] },
  { q: "How many years have you been smoking?", options: ["Never", "Less than 1", "1-5", "5-15", "15+"], weights: [0, 1, 2, 3, 4] },
  { q: "Do you experience shortness of breath during normal activities?", options: ["Never", "Rarely", "Sometimes", "Often", "Always"], weights: [0, 1, 2, 3, 4] },
  { q: "Do you cough regularly, especially in the morning?", options: ["Never", "Rarely", "Sometimes", "Often", "Always"], weights: [0, 1, 2, 3, 4] },
  { q: "Do you experience chest tightness or wheezing?", options: ["Never", "Rarely", "Sometimes", "Often", "Always"], weights: [0, 1, 2, 3, 4] },
  { q: "How often do you exercise?", options: ["Daily", "3-5 times/week", "1-2 times/week", "Rarely", "Never"], weights: [0, 1, 2, 3, 4] },
  { q: "Do you live or work in a polluted environment?", options: ["Not at all", "Slightly", "Moderate", "High", "Very High"], weights: [0, 1, 2, 3, 4] },
  { q: "Have you noticed reduced stamina or energy levels?", options: ["Not at all", "Slightly", "Moderate", "Significant", "Severe"], weights: [0, 1, 2, 3, 4] },
  { q: "Do you experience frequent respiratory infections?", options: ["Never", "Once a year", "2-3 times", "Quarterly", "Monthly"], weights: [0, 1, 2, 3, 4] },
  { q: "Have any family members had lung-related diseases?", options: ["None", "Distant relatives", "Grandparents", "Parents", "Multiple family members"], weights: [0, 1, 2, 3, 4] },
]

function getRisk(score: number) {
  const pct = (score / (questions.length * 4)) * 100
  if (pct <= 20) return { level: "Minimal Risk", color: "text-chart-4", bg: "bg-chart-4/10", icon: CheckCircle }
  if (pct <= 40) return { level: "Low Risk", color: "text-chart-2", bg: "bg-chart-2/10", icon: CheckCircle }
  if (pct <= 60) return { level: "Moderate Risk", color: "text-chart-5", bg: "bg-chart-5/10", icon: AlertCircle }
  if (pct <= 80) return { level: "High Risk", color: "text-destructive", bg: "bg-destructive/10", icon: AlertCircle }
  return { level: "Critical Risk", color: "text-destructive", bg: "bg-destructive/10", icon: AlertCircle }
}

const suggestions = [
  { icon: Heart, title: "Quit Smoking", text: "Consult a doctor about nicotine replacement therapy. Even reducing by one cigarette a day helps." },
  { icon: Wind, title: "Breathing Exercises", text: "Practice deep breathing for 10 minutes daily. Use our Relaxation Suite for guided sessions." },
  { icon: Leaf, title: "Clean Environment", text: "Use air purifiers at home. Spend time in green spaces. Avoid secondhand smoke exposure." },
]

export default function SmokersCheckPage() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [done, setDone] = useState(false)

  const score = Object.entries(answers).reduce((acc, [idx, optIdx]) => acc + questions[Number(idx)].weights[optIdx], 0)
  const risk = getRisk(score)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <Cigarette className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Lung Damage Risk Check</h1>
          <p className="mt-2 text-muted-foreground">
            Questionnaire and lifestyle analysis for smoking damage assessment
          </p>
        </div>

        {!done ? (
          <>
            <div className="mb-6">
              <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                <span>Question {current + 1} / {questions.length}</span>
                <span>{Math.round((Object.keys(answers).length / questions.length) * 100)}%</span>
              </div>
              <Progress value={(Object.keys(answers).length / questions.length) * 100} className="h-2" />
            </div>

            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-lg leading-relaxed text-foreground">{questions[current].q}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {questions[current].options.map((opt, i) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, [current]: i }))
                      if (current < questions.length - 1) setTimeout(() => setCurrent(current + 1), 300)
                    }}
                    className={`flex w-full items-center rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                      answers[current] === i
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-secondary"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
                <div className="flex justify-between pt-4">
                  <Button variant="ghost" disabled={current === 0} onClick={() => setCurrent(current - 1)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  {current === questions.length - 1 && Object.keys(answers).length === questions.length ? (
                    <Button onClick={() => setDone(true)} className="gap-2">
                      See Results <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" disabled={answers[current] === undefined} onClick={() => setCurrent(current + 1)} className="gap-2">
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="space-y-6">
            <Card className="border-border/50 bg-card">
              <CardContent className="flex flex-col items-center py-8">
                <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${risk.bg}`}>
                  <risk.icon className={`h-10 w-10 ${risk.color}`} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{risk.level}</h2>
                <p className="mt-1 text-muted-foreground">Score: {score} / {questions.length * 4}</p>
                <Progress value={(score / (questions.length * 4)) * 100} className="mt-4 h-3 w-48" />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Recovery Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestions.map((s) => (
                  <div key={s.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{s.title}</p>
                      <p className="text-sm text-muted-foreground">{s.text}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button variant="outline" onClick={() => { setCurrent(0); setAnswers({}); setDone(false) }} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Retake
            </Button>
          </div>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
