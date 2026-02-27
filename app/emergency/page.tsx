"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Phone,
  AlertTriangle,
  Heart,
  Shield,
  ExternalLink,
  MessageCircle,
} from "lucide-react"

const emergencyContacts = [
  {
    name: "National Emergency Number",
    number: "112",
    description: "For any life-threatening emergency. Available 24/7 across India.",
    type: "critical",
  },
  {
    name: "KIRAN Mental Health Helpline",
    number: "1800-599-0019",
    description: "Government of India's 24/7 toll-free mental health helpline providing counseling in 13 languages.",
    type: "primary",
  },
  {
    name: "Vandrevala Foundation",
    number: "1860-2662-345",
    description: "24/7 mental health support providing free counseling in multiple Indian languages.",
    type: "primary",
  },
  {
    name: "iCall Psychosocial Helpline",
    number: "9152987821",
    description: "Professional counseling service by TISS. Monday-Saturday, 8am-10pm.",
    type: "secondary",
  },
  {
    name: "AASRA",
    number: "91-22-27546669",
    description: "Crisis intervention center for emotional distress and suicidal feelings. 24/7 availability.",
    type: "critical",
  },
  {
    name: "Snehi",
    number: "044-24640050",
    description: "Emotional support and suicide prevention helpline. Available daily 8am-10pm.",
    type: "secondary",
  },
  {
    name: "Connecting Trust",
    number: "1800-599-0019",
    description: "Suicide prevention and emotional crisis support. 24/7 toll-free service.",
    type: "primary",
  },
  {
    name: "Samaritans Mumbai",
    number: "91-22-25700050",
    description: "Confidential emotional support for those in distress. Daily 5pm-8pm.",
    type: "secondary",
  },
]

const typeStyles = {
  critical: { badge: "destructive" as const, border: "border-destructive/30", bg: "bg-destructive/5" },
  primary: { badge: "default" as const, border: "border-primary/30", bg: "bg-primary/5" },
  secondary: { badge: "secondary" as const, border: "border-border", bg: "bg-card" },
}

export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <Phone className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Emergency Support</h1>
          <p className="mt-2 text-muted-foreground">
            Immediate help when you need it most. All services are confidential.
          </p>
        </div>

        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-destructive" />
            <div>
              <p className="font-bold text-foreground">If you are in immediate danger</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Call <a href="tel:112" className="font-bold text-destructive underline">112</a> immediately.
                You are not alone. Help is available and you deserve support.
              </p>
              <Button asChild className="mt-3 gap-2" variant="destructive">
                <a href="tel:112">
                  <Phone className="h-4 w-4" /> Call 112 Now
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {emergencyContacts.map((contact) => {
            const style = typeStyles[contact.type as keyof typeof typeStyles]
            return (
              <Card key={contact.name} className={`${style.border} ${style.bg}`}>
                <CardContent className="flex items-center justify-between gap-4 py-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{contact.name}</h3>
                        <Badge variant={style.badge} className="text-xs">
                          {contact.type === "critical" ? "24/7 Critical" : contact.type === "primary" ? "24/7" : "Support"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{contact.description}</p>
                      <p className="mt-2 font-mono text-lg font-bold text-foreground">{contact.number}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="icon" className="shrink-0">
                    <a href={`tel:${contact.number.replace(/[^0-9+]/g, "")}`} aria-label={`Call ${contact.name}`}>
                      <Phone className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <MessageCircle className="h-5 w-5 text-primary" /> WhatsApp Support
            </CardTitle>
            <CardDescription>Reach out via WhatsApp for quick support</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="gap-2" style={{ backgroundColor: "#25D366", color: "#fff" }}>
              <a href="https://wa.me/918797746887" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center">
          <Shield className="mx-auto mb-3 h-8 w-8 text-primary" />
          <p className="font-medium text-foreground">Your Privacy Matters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            All helplines maintain strict confidentiality. Your conversations are private and
            you can remain anonymous. Seeking help is a sign of strength.
          </p>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
