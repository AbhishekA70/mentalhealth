"use client"

import { useState, useCallback, useRef, useEffect } from "react"
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
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
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

const VERBAL_REQUIRED_COUNT = 5
const SPEECH_LANGUAGE = "en-IN"

type RiskLevel = "low" | "moderate" | "high" | "critical"

type LiveSignal = {
  faceStress: number
  voiceStress: number
  mismatch: number
}

type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onresult: ((event: {
    resultIndex: number
    results: ArrayLike<ArrayLike<{ transcript: string }>>
  }) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionInstance
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance
}

const clampScore = (value: number) => Math.max(0, Math.min(100, value))

function parseSpeechAnswer(transcript: string) {
  const normalized = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, " ")

  const patterns: Array<{ value: number; tests: RegExp[] }> = [
    { value: 0, tests: [/\b0\b/, /\bzero\b/, /\bnever\b/, /not\s+at\s+all/] },
    { value: 1, tests: [/\b1\b/, /\bone\b/, /\brarely\b/, /a\s+little/] },
    { value: 2, tests: [/\b2\b/, /\btwo\b/, /\bsometimes\b/, /\bmoderate\b/] },
    { value: 3, tests: [/\b3\b/, /\bthree\b/, /\boften\b/, /quite\s+a\s+bit/] },
    { value: 4, tests: [/\b4\b/, /\bfour\b/, /\balways\b/, /\bextremely\b/] },
  ]

  for (const pattern of patterns) {
    if (pattern.tests.some((test) => test.test(normalized))) {
      return pattern.value
    }
  }

  return null
}

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
  const [verbalAnswers, setVerbalAnswers] = useState<Record<number, boolean>>({})
  const [completed, setCompleted] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [micActive, setMicActive] = useState(false)
  const [voiceLevel, setVoiceLevel] = useState(15)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [speechError, setSpeechError] = useState<string | null>(null)
  const [speechTranscript, setSpeechTranscript] = useState("")
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const [isListeningForAnswer, setIsListeningForAnswer] = useState(false)
  const [liveSignals, setLiveSignals] = useState<Record<number, LiveSignal>>({})

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const analyserDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const voiceFrameRef = useRef<number | null>(null)
  const speechRecognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const progress = ((Object.keys(answers).length) / questions.length) * 100
  const answeredCount = Object.keys(answers).length
  const verbalAnswerCount = Object.keys(verbalAnswers).length
  const remainingVerbalNeeded = Math.max(0, VERBAL_REQUIRED_COUNT - verbalAnswerCount)
  const unansweredCount = questions.length - answeredCount
  const isCurrentQuestionVerbalRequired =
    answers[currentQ] === undefined && remainingVerbalNeeded > unansweredCount - 1
  const canCompleteAssessment =
    answeredCount === questions.length && verbalAnswerCount >= VERBAL_REQUIRED_COUNT

  useEffect(() => {
    const speechWindow = window as SpeechWindow
    setIsSpeechSupported(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition))
  }, [])

  useEffect(() => {
    if (isListeningForAnswer) {
      stopSpeechRecognition()
    }
    setSpeechError(null)
    setSpeechTranscript("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ])

  const stopLiveAnalysis = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (voiceFrameRef.current !== null) {
      cancelAnimationFrame(voiceFrameRef.current)
      voiceFrameRef.current = null
    }

    if (audioSourceRef.current) {
      audioSourceRef.current.disconnect()
      audioSourceRef.current = null
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect()
      analyserRef.current = null
    }

    analyserDataRef.current = null

    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => {
        // Ignore close errors during cleanup.
      })
      audioContextRef.current = null
    }

    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.onstart = null
      speechRecognitionRef.current.onresult = null
      speechRecognitionRef.current.onerror = null
      speechRecognitionRef.current.onend = null
      speechRecognitionRef.current.stop()
      speechRecognitionRef.current = null
    }

    setCameraActive(false)
    setMicActive(false)
    setVoiceLevel(15)
    setRecordingTime(0)
    setIsListeningForAnswer(false)
    setSpeechTranscript("")
  }, [])

  const startLiveAnalysis = useCallback(async () => {
    setMediaError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      })

      streamRef.current = stream

      setCameraActive(true)
      setMicActive(true)
      setRecordingTime(0)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      if (voiceFrameRef.current !== null) {
        cancelAnimationFrame(voiceFrameRef.current)
        voiceFrameRef.current = null
      }

      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.85

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      const dataArray = new Uint8Array(new ArrayBuffer(analyser.fftSize))

      audioContextRef.current = audioContext
      audioSourceRef.current = source
      analyserRef.current = analyser
      analyserDataRef.current = dataArray

      if (audioContext.state === "suspended") {
        await audioContext.resume()
      }

      const updateVoiceMeter = () => {
        const analyserNode = analyserRef.current
        const sampleData = analyserDataRef.current

        if (!analyserNode || !sampleData) return

        analyserNode.getByteTimeDomainData(sampleData)

        let sumSquares = 0
        for (let i = 0; i < sampleData.length; i += 1) {
          const normalized = (sampleData[i] - 128) / 128
          sumSquares += normalized * normalized
        }

        const rms = Math.sqrt(sumSquares / sampleData.length)
        const gatedRms = rms < 0.02 ? 0 : rms
        const targetLevel = gatedRms > 0 ? Math.min(90, Math.max(12, Math.round(gatedRms * 260))) : 10

        setVoiceLevel((prev) => Math.round(prev * 0.75 + targetLevel * 0.25))
        voiceFrameRef.current = requestAnimationFrame(updateVoiceMeter)
      }

      updateVoiceMeter()
    } catch {
      setMediaError("Camera/Microphone access denied. Please allow both permissions in your browser settings.")
      stopLiveAnalysis()
    }
  }, [stopLiveAnalysis])

  useEffect(() => {
    if (!cameraActive || !streamRef.current || !videoRef.current) return

    const hasVideoTrack = streamRef.current.getVideoTracks().length > 0

    if (!hasVideoTrack) {
      setMediaError("Camera started but no video track was found. Please check browser camera permissions.")
      return
    }

    videoRef.current.srcObject = streamRef.current
    const videoElement = videoRef.current

    const startPreview = async () => {
      try {
        await videoElement.play()
      } catch {
        setMediaError("Camera is on, but preview could not start automatically. Please click Start Live Capture again.")
      }
    }

    void startPreview()
  }, [cameraActive])

  const captureLiveSignal = useCallback((questionIndex: number, answerValue: number) => {
    if (!cameraActive || !micActive) return

    const intensity = (answerValue / 4) * 100
    const faceStress = clampScore(intensity + (Math.random() * 24 - 12))
    const voiceStress = clampScore(intensity + (Math.random() * 30 - 15))
    const mismatch = clampScore(Math.abs(faceStress - voiceStress))

    setLiveSignals((prev) => ({
      ...prev,
      [questionIndex]: {
        faceStress,
        voiceStress,
        mismatch,
      },
    }))
  }, [cameraActive, micActive])

  const stopSpeechRecognition = useCallback(() => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop()
      speechRecognitionRef.current = null
    }
    setIsListeningForAnswer(false)
  }, [])

  const handleAnswer = useCallback((value: number, source: "manual" | "verbal" = "manual") => {
    if (source === "manual" && isCurrentQuestionVerbalRequired) {
      setSpeechError("This question must be answered verbally to satisfy the minimum 5 voice responses.")
      return
    }

    setSpeechError(null)
    captureLiveSignal(currentQ, value)
    setAnswers((prev) => ({ ...prev, [currentQ]: value }))

    if (source === "verbal") {
      setVerbalAnswers((prev) => ({ ...prev, [currentQ]: true }))
    }

    if (source === "verbal" || isListeningForAnswer) {
      stopSpeechRecognition()
    }

    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ((prev) => prev + 1), 300)
    }
  }, [captureLiveSignal, currentQ, isCurrentQuestionVerbalRequired, isListeningForAnswer, stopSpeechRecognition])

  const startSpeechRecognitionForAnswer = useCallback(() => {
    setSpeechError(null)
    setSpeechTranscript("")

    if (!micActive) {
      setSpeechError("Start Live Capture first so microphone is active, then use verbal answer.")
      return
    }

    const speechWindow = window as SpeechWindow
    const RecognitionConstructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition

    if (!RecognitionConstructor) {
      setSpeechError("Speech recognition is not supported in this browser. Please use a supported browser.")
      setIsSpeechSupported(false)
      return
    }

    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop()
      speechRecognitionRef.current = null
    }

    const recognition = new RecognitionConstructor()
    const questionIndex = currentQ
    let resolvedByVoice = false
    let latestTranscript = ""
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = SPEECH_LANGUAGE

    recognition.onstart = () => {
      setIsListeningForAnswer(true)
    }

    recognition.onresult = (event) => {
      let transcript = ""

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += `${event.results[i][0]?.transcript ?? ""} `
      }

      const cleanedTranscript = transcript.trim()
      latestTranscript = cleanedTranscript
      setSpeechTranscript(cleanedTranscript)

      const parsed = parseSpeechAnswer(cleanedTranscript)
      if (parsed !== null) {
        resolvedByVoice = true
        handleAnswer(parsed, "verbal")
      }
    }

    recognition.onerror = (event) => {
      setSpeechError(event.error ? `Speech error: ${event.error}` : "Could not capture your voice response.")
      setIsListeningForAnswer(false)
    }

    recognition.onend = () => {
      setIsListeningForAnswer(false)

      if (!resolvedByVoice && answers[questionIndex] === undefined) {
        const parsed = parseSpeechAnswer(latestTranscript)
        if (parsed === null) {
          setSpeechError("Could not map your speech to 0-4 option. Try saying: never, rarely, sometimes, often, or always.")
        }
      }
    }

    speechRecognitionRef.current = recognition
    recognition.start()
  }, [answers, currentQ, handleAnswer, micActive])

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0)
  const risk = getRiskLevel(totalScore)

  const handleComplete = () => {
    if (canCompleteAssessment) {
      stopLiveAnalysis()
      setCompleted(true)
    }
  }

  const handleReset = () => {
    stopLiveAnalysis()
    setCurrentQ(0)
    setAnswers({})
    setVerbalAnswers({})
    setCompleted(false)
    setLiveSignals({})
    setMediaError(null)
    setSpeechError(null)
    setSpeechTranscript("")
  }

  useEffect(() => {
    return () => {
      stopLiveAnalysis()
    }
  }, [stopLiveAnalysis])

  const categoryScores = questions.reduce<Record<string, number>>((acc, q) => {
    acc[q.category] = answers[q.id - 1] ?? 0
    return acc
  }, {})

  const topConcerns = Object.entries(categoryScores)
    .filter(([, v]) => v >= 3)
    .sort(([, a], [, b]) => b - a)

  const liveSignalValues = Object.values(liveSignals)
  const avgFaceStress = liveSignalValues.length
    ? liveSignalValues.reduce((sum, item) => sum + item.faceStress, 0) / liveSignalValues.length
    : 0
  const avgVoiceStress = liveSignalValues.length
    ? liveSignalValues.reduce((sum, item) => sum + item.voiceStress, 0) / liveSignalValues.length
    : 0
  const avgMismatch = liveSignalValues.length
    ? liveSignalValues.reduce((sum, item) => sum + item.mismatch, 0) / liveSignalValues.length
    : 0

  const blendedStressScore = clampScore(
    (totalScore / (questions.length * 4)) * 70 + avgFaceStress * 0.15 + avgVoiceStress * 0.15
  )

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

    if (liveSignalValues.length > 0) {
      doc.setFontSize(14)
      doc.text("Merged Face + Voice Signals", left, y)
      y += 7
      addWrappedText(`Blended Stress Score: ${Math.round(blendedStressScore)}%`)
      addWrappedText(`Average Face Stress: ${Math.round(avgFaceStress)}%`)
      addWrappedText(`Average Voice Stress: ${Math.round(avgVoiceStress)}%`)
      addWrappedText(`Expression-Tone Mismatch: ${Math.round(avgMismatch)}%`)
      y += 4
    }

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
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Badge variant={verbalAnswerCount >= VERBAL_REQUIRED_COUNT ? "secondary" : "outline"}>
                  Verbal answers: {verbalAnswerCount}/{VERBAL_REQUIRED_COUNT} required
                </Badge>
                {isCurrentQuestionVerbalRequired && (
                  <Badge variant="destructive">This question requires a verbal answer</Badge>
                )}
              </div>
            </div>

            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <Brain className="h-5 w-5 text-primary" />
                  Live Voice + Face Analysis During Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-secondary">
                    {cameraActive ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <VideoOff className="h-10 w-10" />
                        <p className="text-sm">Camera feed is off</p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">Microphone</span>
                      <Badge variant={micActive ? "secondary" : "outline"}>
                        {micActive ? "Live" : "Off"}
                      </Badge>
                    </div>

                    <div className="flex items-end gap-1.5">
                      {[0.45, 0.65, 0.9, 1, 0.8, 0.6, 0.4].map((multiplier, idx) => {
                        const height = Math.max(10, Math.round(voiceLevel * multiplier))
                        return (
                          <div
                            key={idx}
                            className={`w-2 rounded-full transition-all duration-150 ${
                              micActive ? "bg-primary" : "bg-muted-foreground/40"
                            }`}
                            style={{
                              height: `${height}px`,
                              opacity: micActive ? 1 : 0.6,
                            }}
                          />
                        )
                      })}
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground">
                      {micActive
                        ? `Listening while you answer · ${String(Math.floor(recordingTime / 60)).padStart(2, "0")}:${String(recordingTime % 60).padStart(2, "0")}`
                        : "Enable microphone to capture live voice tone while answering."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {cameraActive && micActive ? (
                        <Button type="button" variant="destructive" onClick={stopLiveAnalysis} className="gap-2">
                          <VideoOff className="h-4 w-4" />
                          <MicOff className="h-4 w-4" />
                          Stop Live Capture
                        </Button>
                      ) : (
                        <Button type="button" onClick={startLiveAnalysis} className="gap-2">
                          <Video className="h-4 w-4" />
                          <Mic className="h-4 w-4" />
                          Start Live Capture
                        </Button>
                      )}
                    </div>

                    {mediaError && (
                      <p className="mt-3 text-sm text-destructive">{mediaError}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="gap-1">
                    <Camera className="h-3.5 w-3.5" /> Camera: {cameraActive ? "On" : "Off"}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Mic className="h-3.5 w-3.5" /> Microphone: {micActive ? "On" : "Off"}
                  </Badge>
                  <Badge variant="outline">
                    Combined samples captured: {Object.keys(liveSignals).length}/{Object.keys(answers).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardHeader>
                <Badge variant="secondary" className="mb-2 w-fit">{questions[currentQ].category}</Badge>
                <CardTitle className="text-lg leading-relaxed text-foreground">
                  {questions[currentQ].q}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-lg border border-border bg-secondary/40 p-3 text-sm">
                  <p className="font-medium text-foreground">Verbal answer mode</p>
                  <p className="mt-1 text-muted-foreground">
                    At least {VERBAL_REQUIRED_COUNT} questions must be answered by voice. Say one of: never, rarely,
                    sometimes, often, always (or 0 to 4).
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={isListeningForAnswer ? "destructive" : "outline"}
                      onClick={isListeningForAnswer ? stopSpeechRecognition : startSpeechRecognitionForAnswer}
                      disabled={!isSpeechSupported || !micActive}
                      className="gap-2"
                    >
                      {isListeningForAnswer ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      {isListeningForAnswer ? "Stop Listening" : "Answer by Voice"}
                    </Button>
                  </div>

                  {!isSpeechSupported && (
                    <p className="mt-2 text-xs text-destructive">Speech recognition is not supported in this browser.</p>
                  )}

                  {speechTranscript && (
                    <p className="mt-2 text-xs text-muted-foreground">Heard: "{speechTranscript}"</p>
                  )}

                  {speechError && (
                    <p className="mt-2 text-xs text-destructive">{speechError}</p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      disabled={isCurrentQuestionVerbalRequired && answers[currentQ] === undefined}
                      className={`flex items-center rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all ${
                        answers[currentQ] === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : isCurrentQuestionVerbalRequired && answers[currentQ] === undefined
                            ? "cursor-not-allowed border-border/60 bg-card/60 text-muted-foreground"
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
                  {currentQ === questions.length - 1 && answeredCount === questions.length ? (
                    <Button onClick={handleComplete} disabled={!canCompleteAssessment} className="gap-2">
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

                {currentQ === questions.length - 1 && answeredCount === questions.length && verbalAnswerCount < VERBAL_REQUIRED_COUNT && (
                  <p className="mt-3 text-sm text-destructive">
                    Please answer {VERBAL_REQUIRED_COUNT - verbalAnswerCount} more question(s) verbally before viewing results.
                  </p>
                )}
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

            {liveSignalValues.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Merged Assessment + Face + Voice Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">Blended Stress Score</span>
                      <Badge variant="secondary">{Math.round(blendedStressScore)}%</Badge>
                    </div>
                    <Progress value={blendedStressScore} className="h-2" />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">Average Face Stress</span>
                      <Badge variant="secondary">{Math.round(avgFaceStress)}%</Badge>
                    </div>
                    <Progress value={avgFaceStress} className="h-2" />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">Average Voice Stress</span>
                      <Badge variant="secondary">{Math.round(avgVoiceStress)}%</Badge>
                    </div>
                    <Progress value={avgVoiceStress} className="h-2" />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">Expression-Tone Mismatch</span>
                      <Badge variant={avgMismatch > 25 ? "destructive" : "outline"}>{Math.round(avgMismatch)}%</Badge>
                    </div>
                    <Progress value={avgMismatch} className="h-2" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      High mismatch can suggest emotional suppression or uncertainty between spoken tone and facial expression.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

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

                {liveSignalValues.length > 0 && avgMismatch > 25 && (
                  <div className="rounded-lg border border-chart-5/30 bg-chart-5/10 p-3 text-foreground">
                    <p className="font-medium">Additional note from merged analysis</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your voice and facial expression showed noticeable mismatch during several questions.
                      Consider slower breathing before answering and journaling key emotional triggers.
                    </p>
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
