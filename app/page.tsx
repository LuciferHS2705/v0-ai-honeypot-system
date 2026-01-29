import Link from "next/link"
import { 
  Shield, 
  Bot, 
  Database, 
  FileText, 
  ArrowRight, 
  CheckCircle,
  Zap,
  Lock,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">AI Honeypot</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild variant="ghost">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyber-cyan/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <Badge variant="outline" className="mb-6 px-4 py-2 text-sm bg-primary/5 border-primary/20">
            <Zap className="w-4 h-4 mr-2 text-primary" />
            AI-Powered Scam Defense
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Intelligent AI Honeypot for{" "}
            <span className="text-primary">Scam Detection</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            Deploy an AI agent that engages scammers with realistic human personas, 
            extracts valuable intelligence, and generates reports for law enforcement.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="gap-2 h-12 px-8">
              <Link href="/auth/sign-up">
                Launch Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 h-12 px-8 bg-transparent">
              <Link href="/auth/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Three-Layer Intelligence System</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive approach to scam detection and intelligence extraction
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Conversational Agent</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  GPT-powered agent that role-plays realistic victim personas to keep scammers engaged 
                  while avoiding real harm.
                </p>
                <ul className="space-y-2">
                  {["Configurable personas", "Human-like delays", "Contextual responses"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-cyber-cyan/10 flex items-center justify-center mb-4 border border-cyber-cyan/20">
                  <Database className="w-6 h-6 text-cyber-cyan" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Intelligence Extraction</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Real-time NLP-based extraction of UPI IDs, phone numbers, URLs, and bank 
                  account details with confidence scoring.
                </p>
                <ul className="space-y-2">
                  {["Pattern recognition", "Entity classification", "Risk scoring"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-cyber-amber/10 flex items-center justify-center mb-4 border border-cyber-amber/20">
                  <FileText className="w-6 h-6 text-cyber-amber" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Law Enforcement Reports</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Generate structured intelligence reports ready for submission to 
                  cybercrime units and regulatory authorities.
                </p>
                <ul className="space-y-2">
                  {["JSON/Text export", "Evidence timeline", "Scam classification"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-6 bg-muted/20 border-y border-border/50">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 bg-success/10 text-success border-success/30">
                <Lock className="w-3 h-3 mr-1" />
                Secure & Ethical
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Built with Ethics in Mind</h2>
              <p className="text-muted-foreground mb-6">
                The AI Honeypot system is designed with strict ethical guidelines. 
                The AI never shares real sensitive information and all intelligence 
                is used solely for scam detection and law enforcement purposes.
              </p>
              <ul className="space-y-3">
                {[
                  "Consent-based AI activation",
                  "No real personal data exposure",
                  "Secure session management",
                  "Audit trail for all actions",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Real-time Monitoring</span>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-primary/50 rounded-full" />
                  </div>
                  <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-cyber-cyan/50 rounded-full" />
                  </div>
                  <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                    <div className="h-full w-5/6 bg-cyber-amber/50 rounded-full" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 flex justify-between text-sm text-muted-foreground">
                  <span>Risk Score: 67%</span>
                  <span>Entities: 5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Fight Scams?</h2>
          <p className="text-muted-foreground mb-8">
            Join the AI-powered defense against cybercrime. Start monitoring and extracting 
            intelligence from scam attempts today.
          </p>
          <Button asChild size="lg" className="gap-2 h-12 px-8">
            <Link href="/auth/sign-up">
              <Shield className="w-5 h-5" />
              Get Started Free
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">AI Honeypot System</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built for ethical scam detection and law enforcement intelligence
          </p>
        </div>
      </footer>
    </div>
  )
}
