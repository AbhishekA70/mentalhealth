"use client"

import { useState, useCallback } from "react"
import jsPDF from "jspdf"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Shield,
  Download,
  RotateCcw,
} from "lucide-react"

const questions = [
  { id: 1, category: "Overthinking", q: "How often do you find yourself caught in repetitive loops of thought that you can't seem to stop?" },
  { id: 2, category: "Depression", q: "Over the past two weeks, how often have you felt little interest or pleasure in doing things?" },
  { id: 3, category: "Anxiety", q: "How frequently do you experience excessive worry that is difficult to control?" },
  { id: 4, category: "Loneliness", q: "How often do you feel isolated or disconnected from the people around you?" },
  { id: 5, category: "Fear", q: "Do you experience intense fear or nervousness in situations that others find normal?" },
  { id: 6, category: "Trauma", q: "Are you troubled by repeated, disturbing memories or dreams of a past stressful experience?" },
  { id: 7, category: "Panic Attacks", q: "How often do you experience sudden episodes of intense fear with physical symptoms like racing heart or difficulty breathing?" },
  { id: 8, category: "Phobias", q: "Do you avoid specific situations, places, or objects due to intense irrational fear?" },
  { id: 9, category: "Addiction", q: "Do you find it difficult to control the use of any substance or behavior (social media, gaming, etc.) despite negative consequences?" },
  { id: 10, category: "FOMO", q: "How often does fear of missing out on social events or online activities affect your mood or decisions?" },
  { id: 11, category: "Social Bullying", q: "Have you experienced persistent teasing, exclusion, or intimidation in social settings?" },
  { id: 12, category: "Cyber Bullying", q: "Have you been subjected to harassment, threats, or humiliation through digital platforms?" },
  { id: 13, category: "Relationships", q: "How much has a relationship breakup or conflict affected your daily functioning recently?" },
  { id: 14, category: "Sleep", q: "How often do you have difficulty falling asleep, staying asleep, or experience poor sleep quality?" },
  { id: 15, category: "Eating", q: "Do you frequently avoid food, skip meals, or experience a significant change in appetite?" },
  { id: 16, category: "Headaches", q: "How often do you experience tension headaches or migraines that affect your daily activities?" },
  { id: 17, category: "Smoking", q: "If you smoke, how concerned are you about the health impact of your smoking habits?" },
  { id: 18, category: "Bad Habits", q: "Do you engage in habits (nail biting, skin picking, excessive caffeine) that you feel unable to stop?" },
  { id: 19, category: "Emotional Instability", q: "How often do you experience rapid or intense mood swings that feel difficult to manage?" },
  { id: 20, category: "Self-Awareness", q: "Overall, how would you rate your current emotional and mental well-being?" },
]

const options = [
  { label: "Never / Not at all", value: 0 },
  { label: "Rarely / A little", value: 1 },
  { label: "Sometimes / Moderate", value: 2 },
  { label: "Often / Quite a bit", value: 3 },
  { label: "Always / Extremely", value: 4 },
]

type RiskLevel = "low" | "moderate" | "high" | "critical"

function getRiskLevel(score: number): { level: RiskLevel; label: string; color: string; icon: typeof CheckCircle } {
  const pct = (score / (questions.length * 4)) * 100
  if (pct <= 25) return { level: "low", label: "Low Risk", color: "text-chart-4", icon: CheckCircle }
  if (pct <= 50) return { level: "moderate", label: "Moderate Risk", color: "text-chart-5", icon: AlertTriangle }
  if (pct <= 75) return { level: "high", label: "High Risk", color: "text-destructive", icon: AlertCircle }
  return { level: "critical", label: "Critical - Seek Help", color: "text-destructive", icon: AlertCircle }
}

export default function AssessmentPage() {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [completed, setCompleted] = useState(false)

  const progress = ((Object.keys(answers).length) / questions.length) * 100

  const handleAnswer = useCallback((value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQ]: value }))
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ((prev) => prev + 1), 300)
    }
  }, [currentQ])

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0)
  const risk = getRiskLevel(totalScore)

  const handleComplete = () => {
    if (Object.keys(answers).length === questions.length) {
      setCompleted(true)
    }
  }

  const handleReset = () => {
    setCurrentQ(0)
    setAnswers({})
    setCompleted(false)
  }

  const categoryScores = questions.reduce<Record<string, number>>((acc, q) => {
    acc[q.category] = answers[q.id - 1] ?? 0
    return acc
  }, {})

  const topConcerns = Object.entries(categoryScores)
    .filter(([, v]) => v >= 3)
    .sort(([, a], [, b]) => b - a)

  const handleDownloadResults = () => {
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
      const lines = doc.splitTextToSize(text, maxWidth)
      lines.forEach((line: string) => {
        ensureSpace(lineGap)
        doc.text(line, left, y)
        y += lineGap
      })
    }

    doc.setFontSize(18)
    doc.text("Mind Games AI - Assessment Report", left, y)
    y += 10

    doc.setFontSize(11)
    doc.text(`Generated: ${new Date().toLocaleString()}`, left, y)
    y += 8

    doc.setFontSize(12)
    doc.text(`Risk Level: ${risk.label}`, left, y)
    y += 6
    doc.text(`Total Score: ${totalScore} / ${questions.length * 4}`, left, y)
    y += 10

    doc.setFontSize(14)
    doc.text("Top Concerns", left, y)
    y += 7

    if (topConcerns.length === 0) {
      addWrappedText("No high-priority concern areas detected in this assessment.")
    } else {
      topConcerns.forEach(([category, score], index) => {
        addWrappedText(`${index + 1}. ${category}: ${score}/4`)
      })
    }

    y += 4
    ensureSpace(10)
    doc.setFontSize(14)
    doc.text("Category Scores", left, y)
    y += 7

    Object.entries(categoryScores).forEach(([category, score]) => {
      addWrappedText(`${category}: ${score}/4`)
    })

    y += 4
    ensureSpace(10)
    doc.setFontSize(14)
    doc.text("Recommendations", left, y)
    y += 7

    const recommendations =
      risk.level === "critical" || risk.level === "high"
        ? [
            "We recommend seeking professional help.",
            "Contact the KIRAN Mental Health Helpline: 1800-599-0019 (24/7, toll-free).",
          ]
        : risk.level === "moderate"
          ? [
              "Practice daily mindfulness or meditation for at least 10 minutes.",
              "Maintain a regular sleep schedule and aim for 7-8 hours.",
              "Engage in physical exercise at least 3 times a week.",
              "Consider talking to a counselor for ongoing support.",
            ]
          : [
              "Continue maintaining healthy habits and lifestyle.",
              "Practice regular self-check-ins and mindfulness.",
              "Stay connected with supportive relationships.",
            ]

    recommendations.forEach((item, index) => {
      addWrappedText(`${index + 1}. ${item}`)
    })

    doc.save("mindgames-assessment.pdf")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Psychological Assessment</h1>
          <p className="mt-2 text-muted-foreground">
            20 deep psychological questions to analyze your mental health
          </p>
        </div>

        {!completed ? (
          <>
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>Question {currentQ + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card className="border-border/50 bg-card">
              <CardHeader>
                <Badge variant="secondary" className="mb-2 w-fit">{questions[currentQ].category}</Badge>
                <CardTitle className="text-lg leading-relaxed text-foreground">
                  {questions[currentQ].q}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      className={`flex items-center rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all ${
                        answers[currentQ] === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-secondary"
                      }`}
                    >
                      <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border border-current text-xs">
                        {opt.value}
                      </span>
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                    disabled={currentQ === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Previous
                  </Button>
                  {currentQ === questions.length - 1 && Object.keys(answers).length === questions.length ? (
                    <Button onClick={handleComplete} className="gap-2">
                      See Results <CheckCircle className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
                      disabled={answers[currentQ] === undefined}
                      className="gap-2"
                    >
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex flex-wrap gap-2">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQ(i)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                    i === currentQ
                      ? "bg-primary text-primary-foreground"
                      : answers[i] !== undefined
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <Card className="border-border/50 bg-card">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
                    risk.level === "low" ? "bg-chart-4/10" :
                    risk.level === "moderate" ? "bg-chart-5/10" :
                    "bg-destructive/10"
                  }`}>
                    <risk.icon className={`h-10 w-10 ${risk.color}`} />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{risk.label}</h2>
                  <p className="mt-2 text-muted-foreground">
                    Score: {totalScore} / {questions.length * 4}
                  </p>
                  <div className="mt-4 w-full max-w-xs">
                    <Progress value={(totalScore / (questions.length * 4)) * 100} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {topConcerns.length > 0 && (
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Areas of Concern</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {topConcerns.map(([cat, score]) => (
                      <Badge key={cat} variant={score >= 4 ? "destructive" : "secondary"}>
                        {cat} ({score}/4)
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {risk.level === "critical" || risk.level === "high" ? (
                  <>
                    <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-4 text-foreground">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                      <div>
                        <p className="font-semibold">We recommend seeking professional help.</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Your assessment indicates significant concerns. Please reach out to a mental health professional.
                        </p>
                      </div>
                    </div>
                    <p>Consider contacting the KIRAN Mental Health Helpline: 1800-599-0019 (24/7, toll-free)</p>
                  </>
                ) : risk.level === "moderate" ? (
                  <div className="space-y-2">
                    <p>Practice daily mindfulness or meditation for at least 10 minutes</p>
                    <p>Maintain a regular sleep schedule and aim for 7-8 hours</p>
                    <p>Engage in physical exercise at least 3 times a week</p>
                    <p>Consider talking to a counselor for ongoing support</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p>Continue maintaining your healthy habits and lifestyle</p>
                    <p>Practice regular self-check-ins and mindfulness</p>
                    <p>Stay connected with supportive relationships</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" /> Retake Assessment
              </Button>
              <Button className="gap-2" onClick={handleDownloadResults}>
                <Download className="h-4 w-4" /> Download Results
              </Button>
            </div>

            {(risk.level === "high" || risk.level === "critical") && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="flex items-center gap-3 pt-6">
                  <Shield className="h-5 w-5 text-destructive" />
                  <p className="text-sm text-foreground">
                    If you are in immediate danger, call <a href="tel:112" className="font-bold underline">112</a> or
                    the KIRAN helpline at <a href="tel:18005990019" className="font-bold underline">1800-599-0019</a>
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
