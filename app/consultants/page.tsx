"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Stethoscope,
  Star,
  MapPin,
  Clock,
  Globe,
  ExternalLink,
  MessageCircle,
  Shield,
} from "lucide-react"

const consultants = [
  {
    name: "Dr. Priya Sharma",
    specialization: "Clinical Psychologist",
    experience: "15+ years",
    location: "Delhi, India",
    languages: ["Hindi", "English"],
    rating: 4.9,
    availability: "Mon-Sat, 10am-6pm",
    expertise: ["Anxiety", "Depression", "Trauma"],
  },
  {
    name: "Dr. Rajesh Kumar",
    specialization: "Psychiatrist",
    experience: "20+ years",
    location: "Mumbai, India",
    languages: ["Hindi", "English", "Marathi"],
    rating: 4.8,
    availability: "Mon-Fri, 9am-5pm",
    expertise: ["Bipolar", "OCD", "PTSD"],
  },
  {
    name: "Dr. Ananya Patel",
    specialization: "Counseling Psychologist",
    experience: "10+ years",
    location: "Bangalore, India",
    languages: ["English", "Kannada", "Hindi"],
    rating: 4.9,
    availability: "Mon-Sat, 11am-7pm",
    expertise: ["Addiction", "Relationships", "Stress"],
  },
  {
    name: "Dr. Mohammed Ali",
    specialization: "Neuropsychiatrist",
    experience: "18+ years",
    location: "Hyderabad, India",
    languages: ["English", "Hindi", "Telugu", "Urdu"],
    rating: 4.7,
    availability: "Mon-Fri, 10am-6pm",
    expertise: ["ADHD", "Sleep Disorders", "Anxiety"],
  },
  {
    name: "Dr. Sneha Reddy",
    specialization: "Child & Adolescent Psychologist",
    experience: "12+ years",
    location: "Chennai, India",
    languages: ["English", "Tamil", "Hindi"],
    rating: 4.8,
    availability: "Mon-Sat, 9am-5pm",
    expertise: ["Child Psychology", "ADHD", "Bullying"],
  },
  {
    name: "Dr. Vikram Singh",
    specialization: "Addiction Specialist",
    experience: "16+ years",
    location: "Jaipur, India",
    languages: ["Hindi", "English", "Rajasthani"],
    rating: 4.6,
    availability: "Tue-Sun, 10am-8pm",
    expertise: ["Substance Abuse", "Behavioral Addiction", "Recovery"],
  },
]

export default function ConsultantsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Stethoscope className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Consultant Directory</h1>
          <p className="mt-2 text-muted-foreground">
            Connect with top online psychiatrists and psychologists across India
          </p>
        </div>

        <div className="mb-6 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Recommended:</span> If your assessment indicates
            high stress levels, consulting a professional is strongly recommended. You can download your
            assessment results to share with your consultant.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {consultants.map((doc) => (
            <Card key={doc.name} className="border-border/50 bg-card transition-shadow hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                      {doc.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{doc.name}</h3>
                        <p className="text-sm text-primary">{doc.specialization}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-chart-5 text-chart-5" />
                        <span className="text-sm font-medium text-foreground">{doc.rating}</span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> {doc.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {doc.availability}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" /> {doc.languages.join(", ")}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {doc.expertise.map((exp) => (
                        <Badge key={exp} variant="secondary" className="text-xs">{exp}</Badge>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{doc.experience}</Badge>
                      <Button size="sm" variant="outline" className="ml-auto gap-1 text-xs">
                        <MessageCircle className="h-3.5 w-3.5" /> Consult
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Need Immediate Help?</CardTitle>
            <CardDescription>
              If your stress level is HIGH, do not delay seeking professional support
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild className="gap-2">
              <a href="/emergency">
                View Emergency Contacts
              </a>
            </Button>
            <Button asChild variant="outline" className="gap-2" style={{ backgroundColor: "#25D366", color: "#fff", borderColor: "#25D366" }}>
              <a href="https://wa.me/918797746887" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp Support
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
