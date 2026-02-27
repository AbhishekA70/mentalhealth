import Link from "next/link"
import { Brain, Shield, Lock } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">MIND GAMES AI</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              AI-powered mental health analysis platform. Your mind deserves intelligent care.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              <span>Privacy First - Edge AI Processing</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              <span>No raw media stored</span>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Features</h4>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li><Link href="/assessment" className="transition-colors hover:text-foreground">Assessment</Link></li>
              <li><Link href="/chat" className="transition-colors hover:text-foreground">Ask AI</Link></li>
              <li><Link href="/analysis" className="transition-colors hover:text-foreground">Voice & Face Analysis</Link></li>
              <li><Link href="/health" className="transition-colors hover:text-foreground">Health Monitoring</Link></li>
              <li><Link href="/relaxation" className="transition-colors hover:text-foreground">Relaxation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Resources</h4>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li><Link href="/knowledge" className="transition-colors hover:text-foreground">Knowledge Hub</Link></li>
              <li><Link href="/consultants" className="transition-colors hover:text-foreground">Consultants</Link></li>
              <li><Link href="/garden" className="transition-colors hover:text-foreground">Wellness Garden</Link></li>
              <li><Link href="/smokers-check" className="transition-colors hover:text-foreground">Lung Check</Link></li>
              <li><Link href="/dashboard" className="transition-colors hover:text-foreground">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Emergency</h4>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <a href="tel:112" className="transition-colors hover:text-foreground">
                  112 - National Emergency
                </a>
              </li>
              <li>
                <a href="tel:18005990019" className="transition-colors hover:text-foreground">
                  KIRAN Helpline: 1800-599-0019
                </a>
              </li>
              <li>
                <Link href="/emergency" className="transition-colors hover:text-foreground">
                  All Emergency Contacts
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/918797746887"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>
            MIND GAMES AI is not a substitute for professional medical advice. If you are in crisis, please
            contact emergency services immediately.
          </p>
        </div>
      </div>
    </footer>
  )
}
