"use client"

import { useState, useEffect } from "react"
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Database, 
  Download, 
  Power, 
  Radio,
  FileText,
  Play
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatPanel } from "@/components/honeypot/chat-panel"
import { IntelligencePanel } from "@/components/honeypot/enhanced-intelligence-panel"
import { ActivationPanel } from "@/components/honeypot/enhanced-activation-panel"
import { ReportPanel } from "@/components/honeypot/report-panel"
import { ScenarioPanel } from "@/components/honeypot/scenario-panel"
import type { HoneypotSession, ExtractedEntity, IntelligenceReport } from "@/lib/types"

// Demo user for testing without authentication
const DEMO_USER = {
  email: "demo@honeypot.ai",
  user_metadata: {
    full_name: "Demo Agent"
  }
}

export default function DemoPage() {
  const [session, setSession] = useState<HoneypotSession>({
    id: crypto.randomUUID(),
    status: "inactive",
    messages: [],
    intelligence: null,
    aiTakeoverConsent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const [entities, setEntities] = useState<ExtractedEntity[]>([])
  const [report, setReport] = useState<IntelligenceReport | null>(null)
  const [activeTab, setActiveTab] = useState("monitor")
  const [threatLevel, setThreatLevel] = useState<"low" | "medium" | "high" | "critical">("low")

  useEffect(() => {
    if (report) {
      if (report.riskScore >= 80) setThreatLevel("critical")
      else if (report.riskScore >= 60) setThreatLevel("high")
      else if (report.riskScore >= 30) setThreatLevel("medium")
      else setThreatLevel("low")
    }
  }, [report])

  const threatColors = {
    low: "bg-success/10 text-success border-success/30",
    medium: "bg-cyber-amber/10 text-cyber-amber border-cyber-amber/30",
    high: "bg-cyber-red/10 text-cyber-red border-cyber-red/30",
    critical: "bg-cyber-red/20 text-cyber-red border-cyber-red/50 animate-pulse",
  }

  const statusColors = {
    inactive: "bg-muted text-muted-foreground",
    monitoring: "bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30",
    ai_engaged: "bg-primary/10 text-primary border-primary/30",
    completed: "bg-success/10 text-success border-success/30",
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                {session.status === "ai_engaged" && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">AI Honeypot System</h1>
                <p className="text-xs text-muted-foreground">Scam Intelligence Platform</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-cyber-amber/10 text-cyber-amber border-cyber-amber/30">
              <Play className="w-3 h-3 mr-1" />
              DEMO MODE
            </Badge>
          </div>

          <div className="flex items-center gap-6">
            {/* Status Indicators */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${session.status === "ai_engaged" ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                <span className="text-sm text-muted-foreground">AI Status:</span>
                <Badge variant="outline" className={statusColors[session.status]}>
                  {session.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Threat:</span>
                <Badge variant="outline" className={threatColors[threatLevel]}>
                  {threatLevel.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" asChild>
                <a href="/auth/login">Login</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 max-w-[1600px]">
        {/* Demo Notice */}
        <div className="mb-6 p-4 rounded-lg bg-cyber-amber/5 border border-cyber-amber/20">
          <p className="text-sm text-cyber-amber">
            <strong>Demo Mode:</strong> All features are available for testing. Data is not persisted. 
            <a href="/auth/sign-up" className="underline ml-2 hover:text-cyber-amber/80">Create an account</a> to save your sessions.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Messages</p>
                  <p className="text-2xl font-bold font-mono">{session.messages.length}</p>
                </div>
                <Activity className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Entities</p>
                  <p className="text-2xl font-bold font-mono">{entities.length}</p>
                </div>
                <Database className="w-8 h-8 text-cyber-cyan/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Risk Score</p>
                  <p className="text-2xl font-bold font-mono">{report?.riskScore || 0}%</p>
                </div>
                <AlertTriangle className={`w-8 h-8 ${threatLevel === "low" ? "text-success/50" : threatLevel === "medium" ? "text-cyber-amber/50" : "text-cyber-red/50"}`} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Scam Type</p>
                  <p className="text-lg font-semibold truncate">{report?.scamType || "Unknown"}</p>
                </div>
                <FileText className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50 p-1">
            <TabsTrigger value="monitor" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="w-4 h-4" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Database className="w-4 h-4" />
              Intelligence
            </TabsTrigger>
            <TabsTrigger value="control" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Power className="w-4 h-4" />
              AI Control
            </TabsTrigger>
            <TabsTrigger value="report" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Download className="w-4 h-4" />
              Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChatPanel
                  session={session}
                  setSession={setSession}
                  setEntities={setEntities}
                  setReport={setReport}
                />
              </div>
              <div>
                <ScenarioPanel
                  onSelectScenario={(message) => {
                    setSession(prev => ({
                      ...prev,
                      status: "monitoring",
                      messages: [
                        ...prev.messages,
                        {
                          id: crypto.randomUUID(),
                          role: "scammer",
                          content: message,
                          timestamp: new Date(),
                        },
                      ],
                      updatedAt: new Date(),
                    }))
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="intelligence" className="mt-6">
            <IntelligencePanel
              entities={entities}
              report={report}
              threatLevel={threatLevel}
            />
          </TabsContent>

          <TabsContent value="control" className="mt-6">
            <ActivationPanel
              session={session}
              setSession={setSession}
            />
          </TabsContent>

          <TabsContent value="report" className="mt-6">
            <ReportPanel
              session={session}
              entities={entities}
              report={report}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
