"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Bot, User, Sparkles, Heart, RefreshCw } from "lucide-react"

type SentimentType = "positive" | "negative" | "neutral" | "distressed"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sentiment?: SentimentType
  timestamp: Date
}

function analyzeSentiment(text: string): SentimentType {
  const lower = text.toLowerCase()
  const distressWords = ["suicide", "kill", "die", "end it", "hopeless", "worthless", "can't go on", "no point", "give up"]
  const negativeWords = ["sad", "depressed", "anxious", "worried", "lonely", "scared", "angry", "stressed", "overwhelmed", "tired", "hate", "cry", "pain", "hurt", "afraid", "panic", "nervous", "terrible", "awful"]
  const positiveWords = ["happy", "good", "great", "better", "thanks", "grateful", "hope", "love", "calm", "peaceful", "joy", "excited", "proud", "confident"]

  if (distressWords.some((w) => lower.includes(w))) return "distressed"
  const negCount = negativeWords.filter((w) => lower.includes(w)).length
  const posCount = positiveWords.filter((w) => lower.includes(w)).length
  if (negCount > posCount) return "negative"
  if (posCount > negCount) return "positive"
  return "neutral"
}

function generateResponse(message: string, sentiment: SentimentType): string {
  if (sentiment === "distressed") {
    return "I'm deeply concerned about what you're sharing. You are not alone, and help is available right now. Please reach out to the KIRAN Mental Health Helpline at 1800-599-0019 (24/7, toll-free) or call 112 for immediate emergency assistance. Your life matters, and there are people who care about you and want to help. Would you like me to provide more resources?"
  }

  const responses: Record<string, string[]> = {
    anxiety: [
      "I hear that you're feeling anxious. Anxiety can feel overwhelming, but it's your body's way of responding to perceived threats. Try the 5-4-3-2-1 grounding technique: notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This can help bring you back to the present moment.",
      "Anxiety often stems from worrying about the future. One helpful approach is box breathing: breathe in for 4 counts, hold for 4, breathe out for 4, hold for 4. Repeat this cycle 4 times. Would you like to try our guided breathing exercise in the Relaxation section?",
    ],
    depression: [
      "I'm sorry you're going through this. Depression can make everything feel heavy and colorless. Remember that seeking help is a sign of strength, not weakness. Small steps matter — even getting out of bed or drinking water is progress. Would you like me to suggest some gentle activities that might help lift your mood?",
      "What you're feeling is valid. Depression often lies to us, telling us things won't get better — but they can and they do. Consider reaching out to a therapist or counselor. In the meantime, try to maintain basic routines: regular meals, some sunlight, and gentle movement. Our Knowledge Hub has more detailed guidance on coping with depression.",
    ],
    loneliness: [
      "Feeling lonely is deeply painful, and I want you to know that sharing this takes courage. Connection can be rebuilt gradually — consider reaching out to one person you trust today, even with a simple message. You might also explore community activities, volunteering, or support groups. You deserve meaningful connections.",
    ],
    sleep: [
      "Sleep difficulties can significantly impact mental health. Try establishing a wind-down routine: dim lights an hour before bed, avoid screens, and try deep breathing or gentle stretching. Keep your room cool and dark. Our Health Monitoring section can help you track your sleep patterns for better insights.",
    ],
    stress: [
      "Stress is your body signaling that it needs attention. Let's work on managing it. Progressive muscle relaxation is very effective — systematically tense and release each muscle group from your toes to your head. Regular exercise, even a 15-minute walk, can reduce stress hormones. What specific situations are causing you the most stress?",
    ],
    general_negative: [
      "Thank you for sharing what you're going through. Your feelings are valid, and it's okay not to be okay. I'm here to listen and help however I can. Would you like to explore specific coping strategies, try our relaxation exercises, or learn more about what you're experiencing through our Knowledge Hub?",
    ],
    general_positive: [
      "That's wonderful to hear! Maintaining positive mental health is just as important as addressing challenges. Keep nurturing the habits and relationships that bring you joy. Regular check-ins with yourself through our assessment tool can help you stay aware of your emotional state over time.",
    ],
    general: [
      "I'm here to support your mental well-being. You can share whatever is on your mind — I'll listen without judgment and offer guidance based on what you share. Whether you're feeling stressed, anxious, sad, or just need someone to talk to, I'm here. What would you like to discuss?",
    ],
  }

  const lower = message.toLowerCase()
  let category = "general"
  if (sentiment === "positive") category = "general_positive"
  else if (sentiment === "negative") category = "general_negative"

  if (lower.includes("anxi") || lower.includes("worry") || lower.includes("nervous") || lower.includes("panic")) category = "anxiety"
  else if (lower.includes("depress") || lower.includes("hopeless") || lower.includes("sad") || lower.includes("empty")) category = "depression"
  else if (lower.includes("lonely") || lower.includes("alone") || lower.includes("isolated")) category = "loneliness"
  else if (lower.includes("sleep") || lower.includes("insomnia") || lower.includes("tired")) category = "sleep"
  else if (lower.includes("stress") || lower.includes("overwhelm") || lower.includes("pressure")) category = "stress"

  const pool = responses[category] || responses.general
  return pool[Math.floor(Math.random() * pool.length)]
}

const sentimentBadge: Record<SentimentType, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  positive: { label: "Positive", variant: "default" },
  neutral: { label: "Neutral", variant: "secondary" },
  negative: { label: "Concerned", variant: "outline" },
  distressed: { label: "Urgent", variant: "destructive" },
}

const quickPrompts = [
  "I've been feeling anxious lately",
  "I can't sleep properly",
  "I feel lonely and disconnected",
  "I'm stressed about work",
  "I need coping strategies",
  "How can I improve my mood?",
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello, I'm your AI mental health companion. I'm here to listen, understand, and provide supportive guidance. Everything you share is processed privately. How are you feeling today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = useCallback(() => {
    if (!input.trim()) return
    const text = input.trim()
    setInput("")
    const sentiment = analyzeSentiment(text)

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      sentiment,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    setTimeout(() => {
      const response = generateResponse(text, sentiment)
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsTyping(false)
    }, 1000 + Math.random() * 1500)
  }, [input])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <MessageCircle className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Ask AI Companion</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-powered mental health support with emotional tone detection
          </p>
        </div>

        <Card className="flex flex-1 flex-col overflow-hidden border-border/50 bg-card">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    msg.role === "assistant" ? "bg-primary/10" : "bg-secondary"
                  }`}>
                    {msg.role === "assistant" ? (
                      <Bot className="h-5 w-5 text-primary" />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}>
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-2">
                      {msg.sentiment && (
                        <Badge variant={sentimentBadge[msg.sentiment].variant} className="text-xs">
                          <Sparkles className="mr-1 h-3 w-3" />
                          {sentimentBadge[msg.sentiment].label}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-2xl bg-secondary px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-border p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Share what's on your mind..."
                className="min-h-[44px] resize-none rounded-xl"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3 w-3" />
              <span>AI companion with real-time sentiment analysis. Not a substitute for professional help.</span>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
