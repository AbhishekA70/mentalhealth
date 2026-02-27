"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Brain,
  AlertCircle,
  Stethoscope,
  Shield,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

const conditions = [
  {
    id: "anxiety",
    name: "Anxiety Disorders",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
    symptoms: [
      "Excessive worry and fear disproportionate to situations",
      "Restlessness, feeling on edge, or inability to relax",
      "Racing thoughts and difficulty concentrating",
      "Physical symptoms: rapid heartbeat, sweating, trembling",
      "Sleep disturbances and chronic fatigue",
      "Avoidance of triggering situations",
    ],
    causes: [
      "Genetic predisposition and family history",
      "Brain chemistry imbalances (serotonin, norepinephrine)",
      "Traumatic life events or chronic stress",
      "Medical conditions (thyroid disorders, heart disease)",
      "Substance use or withdrawal",
    ],
    treatments: [
      "Cognitive Behavioral Therapy (CBT)",
      "Medication: SSRIs, SNRIs, or benzodiazepines",
      "Exposure therapy for specific phobias",
      "Mindfulness-Based Stress Reduction (MBSR)",
      "Regular exercise and lifestyle modifications",
    ],
    prevention: [
      "Regular physical activity (30 minutes daily)",
      "Mindfulness and meditation practice",
      "Adequate sleep (7-9 hours)",
      "Limiting caffeine and alcohol intake",
      "Building a strong social support network",
    ],
    habits: [
      "Practice deep breathing for 5 minutes every morning",
      "Journal your worries and challenge negative thoughts",
      "Use the 5-4-3-2-1 grounding technique when anxious",
      "Set boundaries with stressful situations and people",
      "Engage in creative activities for emotional expression",
    ],
  },
  {
    id: "depression",
    name: "Depression",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    symptoms: [
      "Persistent sadness or emptiness lasting 2+ weeks",
      "Loss of interest in previously enjoyed activities",
      "Significant changes in appetite and weight",
      "Sleep disturbances (insomnia or oversleeping)",
      "Fatigue and loss of energy",
      "Feelings of worthlessness or excessive guilt",
      "Difficulty thinking, concentrating, or making decisions",
    ],
    causes: [
      "Neurotransmitter imbalances (serotonin, dopamine)",
      "Genetic vulnerability",
      "Major life changes, trauma, or loss",
      "Chronic illness or certain medications",
      "Hormonal changes (postpartum, menopause)",
    ],
    treatments: [
      "Psychotherapy (CBT, interpersonal therapy)",
      "Antidepressant medication (SSRIs, SNRIs)",
      "Combination of therapy and medication",
      "Electroconvulsive therapy (for severe cases)",
      "Transcranial magnetic stimulation (TMS)",
    ],
    prevention: [
      "Maintain regular exercise routine",
      "Build and maintain social connections",
      "Develop healthy sleep hygiene",
      "Learn stress management techniques",
      "Seek early help when symptoms appear",
    ],
    habits: [
      "Set one small achievable goal each day",
      "Spend 15 minutes outdoors in natural light",
      "Connect with one person daily, even briefly",
      "Practice gratitude journaling before bed",
      "Engage in physical movement, even a short walk",
    ],
  },
  {
    id: "ocd",
    name: "OCD",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    symptoms: [
      "Intrusive, unwanted thoughts (obsessions)",
      "Repetitive behaviors or mental acts (compulsions)",
      "Excessive hand washing, checking, or counting",
      "Need for symmetry or order",
      "Fear of contamination or harm",
      "Significant time consumed by rituals (1+ hours daily)",
    ],
    causes: [
      "Abnormalities in serotonin pathways",
      "Genetic factors",
      "Childhood trauma or stress",
      "Autoimmune responses (PANDAS)",
      "Learned behaviors from family environment",
    ],
    treatments: [
      "Exposure and Response Prevention (ERP)",
      "Cognitive Behavioral Therapy (CBT)",
      "SSRI medications (higher doses than for depression)",
      "Combination therapy approaches",
      "Deep brain stimulation (for severe cases)",
    ],
    prevention: [
      "Early identification and intervention",
      "Stress management practices",
      "Regular mental health check-ups",
      "Avoiding reassurance-seeking behaviors",
      "Building tolerance for uncertainty",
    ],
    habits: [
      "Practice sitting with discomfort for brief periods",
      "Gradually delay or reduce compulsive behaviors",
      "Use mindfulness to observe thoughts without reacting",
      "Challenge perfectionism with intentional imperfection",
      "Maintain a structured daily routine",
    ],
  },
  {
    id: "ptsd",
    name: "PTSD",
    color: "text-destructive",
    bg: "bg-destructive/10",
    symptoms: [
      "Flashbacks and intrusive memories of trauma",
      "Nightmares and sleep disturbances",
      "Avoidance of trauma-related triggers",
      "Emotional numbness or detachment",
      "Hypervigilance and exaggerated startle response",
      "Difficulty concentrating and irritability",
    ],
    causes: [
      "Experiencing or witnessing traumatic events",
      "Combat exposure or military service",
      "Physical or sexual assault",
      "Natural disasters or accidents",
      "Childhood abuse or neglect",
    ],
    treatments: [
      "Trauma-focused Cognitive Processing Therapy",
      "EMDR (Eye Movement Desensitization and Reprocessing)",
      "Prolonged Exposure Therapy",
      "SSRI medications",
      "Group therapy with other trauma survivors",
    ],
    prevention: [
      "Early psychological debriefing after trauma",
      "Strong social support system",
      "Resilience training and coping skills",
      "Professional help within first month of trauma",
      "Avoiding self-medication with substances",
    ],
    habits: [
      "Practice grounding techniques during flashbacks",
      "Maintain a safe and predictable daily routine",
      "Engage in gentle physical activity",
      "Use creative expression (art, writing, music)",
      "Connect with support groups and communities",
    ],
  },
  {
    id: "bipolar",
    name: "Bipolar Disorder",
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    symptoms: [
      "Manic episodes: elevated mood, decreased sleep need",
      "Increased energy, activity, and goal-directed behavior",
      "Depressive episodes: deep sadness, fatigue",
      "Rapid mood cycling between highs and lows",
      "Impulsive behavior and poor decision-making during mania",
      "Difficulty maintaining relationships and work",
    ],
    causes: [
      "Strong genetic component",
      "Brain structure and chemistry differences",
      "Hormonal imbalances",
      "High-stress life events",
      "Disrupted circadian rhythms",
    ],
    treatments: [
      "Mood stabilizers (lithium, valproate)",
      "Atypical antipsychotics",
      "Psychotherapy (CBT, family therapy)",
      "Interpersonal and social rhythm therapy",
      "Electroconvulsive therapy for severe episodes",
    ],
    prevention: [
      "Strict medication adherence",
      "Regular sleep schedule",
      "Mood tracking and early warning sign recognition",
      "Avoiding triggers (stress, substance use)",
      "Regular psychiatric follow-ups",
    ],
    habits: [
      "Maintain a consistent daily sleep-wake schedule",
      "Track your mood daily in a journal or app",
      "Avoid alcohol and recreational drugs",
      "Build a crisis plan with your care team",
      "Practice stress reduction techniques daily",
    ],
  },
  {
    id: "addiction",
    name: "Addiction",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    symptoms: [
      "Inability to stop using despite wanting to",
      "Increased tolerance requiring more of the substance",
      "Withdrawal symptoms when not using",
      "Neglecting responsibilities and relationships",
      "Continuing use despite negative consequences",
      "Spending excessive time obtaining and using",
    ],
    causes: [
      "Genetic predisposition",
      "Brain reward system dysfunction",
      "Peer pressure and social environment",
      "Mental health co-occurring disorders",
      "Trauma and adverse childhood experiences",
    ],
    treatments: [
      "Medically supervised detoxification",
      "Behavioral therapies (CBT, contingency management)",
      "Medication-assisted treatment",
      "12-step programs and support groups",
      "Residential rehabilitation programs",
    ],
    prevention: [
      "Education about risks of substance use",
      "Building healthy coping mechanisms",
      "Strong family and social bonds",
      "Early mental health intervention",
      "Avoiding high-risk environments",
    ],
    habits: [
      "Identify and avoid personal triggers",
      "Build a daily routine with healthy activities",
      "Attend regular support group meetings",
      "Practice urge surfing when cravings arise",
      "Develop new hobbies and interests",
    ],
  },
  {
    id: "trauma",
    name: "Trauma & Stress",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
    symptoms: [
      "Difficulty trusting others",
      "Emotional dysregulation and outbursts",
      "Chronic feelings of emptiness",
      "Self-destructive behaviors",
      "Difficulty with identity and self-perception",
      "Somatic symptoms (headaches, stomach issues)",
    ],
    causes: [
      "Childhood abuse or neglect",
      "Domestic violence",
      "Community violence or war",
      "Sudden loss of loved one",
      "Prolonged bullying or harassment",
    ],
    treatments: [
      "Trauma-informed therapy approaches",
      "Somatic experiencing therapy",
      "Internal Family Systems (IFS)",
      "Art and music therapy",
      "Neurofeedback training",
    ],
    prevention: [
      "Creating safe and stable environments",
      "Teaching emotional regulation skills early",
      "Building resilience through positive relationships",
      "Prompt intervention after traumatic events",
      "Community support systems",
    ],
    habits: [
      "Practice body-based calming techniques",
      "Create and maintain safety anchors",
      "Express emotions through creative outlets",
      "Build trust gradually with safe people",
      "Honor your healing journey without rushing",
    ],
  },
]

const tabs = [
  { value: "symptoms", label: "Symptoms", icon: AlertCircle },
  { value: "causes", label: "Causes", icon: Brain },
  { value: "treatments", label: "Treatments", icon: Stethoscope },
  { value: "prevention", label: "Prevention", icon: Shield },
  { value: "habits", label: "Healthy Habits", icon: Lightbulb },
]

export default function KnowledgePage() {
  const [expanded, setExpanded] = useState<string | null>("anxiety")
  const [activeTab, setActiveTab] = useState("symptoms")

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Mental Health Knowledge Hub</h1>
          <p className="mt-2 text-muted-foreground">
            Comprehensive guides on symptoms, causes, treatments, and prevention
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="flex w-full flex-wrap">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                <tab.icon className="h-4 w-4" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {conditions.map((condition) => {
            const isOpen = expanded === condition.id
            const content = condition[activeTab as keyof typeof condition] as string[]

            return (
              <Card key={condition.id} className="border-border/50 bg-card overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : condition.id)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${condition.bg}`}>
                      <Brain className={`h-5 w-5 ${condition.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{condition.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {content.length} {activeTab} listed
                      </p>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {isOpen && (
                  <CardContent className="border-t border-border pt-4 pb-5">
                    <ul className="space-y-2">
                      {content.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${condition.bg.replace("/10", "")}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
