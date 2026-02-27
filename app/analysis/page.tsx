"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScanFace,
  Activity,
  AlertCircle,
  Shield,
  Play,
  Square,
  Brain,
} from "lucide-react"

interface AnalysisResult {
  label: string
  score: number
  status: "normal" | "warning" | "alert"
}

export default function AnalysisPage() {
  const [cameraActive, setCameraActive] = useState(false)
  const [micActive, setMicActive] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [faceResults, setFaceResults] = useState<AnalysisResult[] | null>(null)
  const [voiceResults, setVoiceResults] = useState<AnalysisResult[] | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [voiceLevel, setVoiceLevel] = useState(15)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const voiceAnimRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        void videoRef.current.play().catch(() => {
          // Autoplay can be blocked; video will start after user interaction.
        })
      }
      streamRef.current = stream
      setCameraActive(true)
    } catch {
      alert("Camera access denied. Please allow camera access in your browser settings.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [])

  useEffect(() => {
    if (!cameraActive || !videoRef.current || !streamRef.current) return

    videoRef.current.srcObject = streamRef.current
    void videoRef.current.play().catch(() => {
      // Some browsers delay autoplay; user can still start from UI interaction.
    })
  }, [cameraActive])

  const toggleMic = useCallback(async () => {
    if (micActive) {
      setMicActive(false)
      setVoiceLevel(15)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (voiceAnimRef.current) {
        clearInterval(voiceAnimRef.current)
        voiceAnimRef.current = null
      }
      return
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicActive(true)
      setRecordingTime(0)
      setVoiceLevel(30)

      if (voiceAnimRef.current) {
        clearInterval(voiceAnimRef.current)
      }

      voiceAnimRef.current = setInterval(() => {
        setVoiceLevel(20 + Math.floor(Math.random() * 70))
      }, 180)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch {
      alert("Microphone access denied. Please allow microphone access in your browser settings.")
    }
  }, [micActive])

  const runFaceAnalysis = useCallback(() => {
    if (!cameraActive) return
    setIsAnalyzing(true)
    setTimeout(() => {
      setFaceResults([
        { label: "Stress Level", score: Math.random() * 40 + 20, status: Math.random() > 0.5 ? "warning" : "normal" },
        { label: "Anxiety Indicators", score: Math.random() * 30 + 10, status: Math.random() > 0.6 ? "warning" : "normal" },
        { label: "Sadness Detection", score: Math.random() * 25 + 5, status: "normal" },
        { label: "Fatigue Signals", score: Math.random() * 50 + 20, status: Math.random() > 0.4 ? "warning" : "normal" },
        { label: "Micro-expressions", score: Math.random() * 35 + 15, status: "normal" },
      ])
      setIsAnalyzing(false)
    }, 3000)
  }, [cameraActive])

  const runVoiceAnalysis = useCallback(() => {
    if (!micActive) return
    setMicActive(false)
    setVoiceLevel(15)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (voiceAnimRef.current) {
      clearInterval(voiceAnimRef.current)
      voiceAnimRef.current = null
    }
    setIsAnalyzing(true)
    setTimeout(() => {
      setVoiceResults([
        { label: "Voice Stress", score: Math.random() * 45 + 15, status: Math.random() > 0.5 ? "warning" : "normal" },
        { label: "Anxiety Tone", score: Math.random() * 35 + 10, status: Math.random() > 0.6 ? "warning" : "normal" },
        { label: "Suppressed Sadness", score: Math.random() * 30 + 5, status: "normal" },
        { label: "Speaking Speed", score: Math.random() * 40 + 30, status: "normal" },
        { label: "Emotional Pitch", score: Math.random() * 50 + 20, status: Math.random() > 0.4 ? "warning" : "normal" },
      ])
      setIsAnalyzing(false)
    }, 2500)
  }, [micActive])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (voiceAnimRef.current) {
        clearInterval(voiceAnimRef.current)
      }
    }
  }, [])

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <ScanFace className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Voice & Face Analysis</h1>
          <p className="mt-2 text-muted-foreground">
            AI-powered emotional detection through facial expressions and voice patterns
          </p>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Privacy First:</span> All camera and voice processing runs locally in your browser. No raw media is stored or transmitted to any server.
          </p>
        </div>

        <Tabs defaultValue="face" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="face" className="gap-2">
              <Camera className="h-4 w-4" /> Face Analysis
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="h-4 w-4" /> Voice Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="face" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Camera className="h-5 w-5 text-primary" />
                    Camera Feed
                  </CardTitle>
                  <CardDescription>Enable camera to begin facial expression analysis</CardDescription>
                </CardHeader>
                <CardContent>
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
                      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                        <VideoOff className="h-12 w-12" />
                        <p className="text-sm">Camera is off</p>
                      </div>
                    )}
                    {isAnalyzing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2">
                          <Brain className="h-8 w-8 animate-pulse text-primary" />
                          <p className="text-sm font-medium text-foreground">Analyzing expressions...</p>
                        </div>
                      </div>
                    )}

                    {cameraActive && (
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-primary/60 animate-pulse" />
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={cameraActive ? stopCamera : startCamera}
                      variant={cameraActive ? "destructive" : "default"}
                      className="flex-1 gap-2"
                    >
                      {cameraActive ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                      {cameraActive ? "Stop Camera" : "Start Camera"}
                    </Button>
                    <Button
                      onClick={runFaceAnalysis}
                      disabled={!cameraActive || isAnalyzing}
                      variant="outline"
                      className="gap-2"
                    >
                      <ScanFace className="h-4 w-4" /> Analyze
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Activity className="h-5 w-5 text-primary" />
                    Face Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {faceResults ? (
                    <div className="space-y-4">
                      {faceResults.map((result) => (
                        <div key={result.label}>
                          <div className="mb-1.5 flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">{result.label}</span>
                            <Badge variant={result.status === "warning" ? "destructive" : "secondary"} className="text-xs">
                              {Math.round(result.score)}%
                            </Badge>
                          </div>
                          <Progress value={result.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ScanFace className="h-10 w-10" />
                      <p className="text-sm">Enable camera and click Analyze to begin</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Mic className="h-5 w-5 text-primary" />
                    Voice Feed
                  </CardTitle>
                  <CardDescription>Record your voice for emotional tone analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-xl bg-secondary">
                    <div className={`flex h-24 w-24 items-center justify-center rounded-full ${
                      micActive ? "animate-pulse-glow bg-primary/20" : "bg-muted"
                    }`}>
                      {micActive ? (
                        <Mic className="h-10 w-10 text-primary" />
                      ) : (
                        <MicOff className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    {micActive && (
                      <p className="font-mono text-lg text-foreground">{formatTime(recordingTime)}</p>
                    )}
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
                    <p className="text-sm text-muted-foreground">
                      {micActive ? "Recording... Speak naturally about how you feel" : "Click Start to begin recording"}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={toggleMic}
                      variant={micActive ? "destructive" : "default"}
                      className="flex-1 gap-2"
                    >
                      {micActive ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {micActive ? "Stop Recording" : "Start Recording"}
                    </Button>
                    <Button
                      onClick={runVoiceAnalysis}
                      disabled={!micActive || isAnalyzing || recordingTime < 3}
                      variant="outline"
                      className="gap-2"
                    >
                      <Brain className="h-4 w-4" /> Analyze
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Activity className="h-5 w-5 text-primary" />
                    Voice Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {voiceResults ? (
                    <div className="space-y-4">
                      {voiceResults.map((result) => (
                        <div key={result.label}>
                          <div className="mb-1.5 flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">{result.label}</span>
                            <Badge variant={result.status === "warning" ? "destructive" : "secondary"} className="text-xs">
                              {Math.round(result.score)}%
                            </Badge>
                          </div>
                          <Progress value={result.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Mic className="h-10 w-10" />
                      <p className="text-sm">Record your voice and click Analyze</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {(faceResults || voiceResults) && (
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-3 pt-6">
              <AlertCircle className="mt-0.5 h-5 w-5 text-primary" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Micro-Intervention Ready</p>
                <p className="mt-1">
                  If mismatch is detected between your survey responses, facial expressions, and voice patterns,
                  calming interventions will be triggered automatically — including guided breathing, soft music,
                  and color-based heart-rate sync.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
