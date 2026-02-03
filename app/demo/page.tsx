"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Shield, 
  Bot, 
  AlertTriangle, 
  Send, 
  Phone, 
  Link2, 
  Building2, 
  CreditCard,
  FileText,
  Download,
  Play,
  Activity,
  Eye,
  Zap,
  Target,
  Radio,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp
} from "lucide-react"

// Demo scenarios
const DEMO_SCENARIOS = [
  {
    id: "kyc",
    name: "KYC Fraud",
    icon: CreditCard,
    message: "Dear Customer, Your SBI account will be blocked in 24 hours due to incomplete KYC. Update now at http://sbi-kyc-update.xyz or call 9876543210. Share OTP to verify.",
    color: "text-red-500"
  },
  {
    id: "lottery",
    name: "Lottery Scam",
    icon: Zap,
    message: "Congratulations! You won Rs.50,00,000 in Google Lottery! Transfer Rs.5000 processing fee to UPI: lottery.winner@paytm to claim. Contact: 8765432109",
    color: "text-amber-500"
  },
  {
    id: "tech",
    name: "Tech Support",
    icon: Shield,
    message: "ALERT: Your computer has virus! Call Microsoft Support immediately at 1800-123-4567. Our technician will fix it. Pay only Rs.2999 via PhonePe: techsupport@ybl",
    color: "text-blue-500"
  },
  {
    id: "job",
    name: "Job Scam",
    icon: Building2,
    message: "Work from home job! Earn Rs.50000/month. Registration fee Rs.500 only. Pay to: jobs.india@upi and send screenshot to WhatsApp 7654321098",
    color: "text-green-500"
  }
]

// Intelligence extraction patterns
function extractIntelligence(text: string) {
  const intelligence: {
    upiIds: string[]
    phoneNumbers: string[]
    urls: string[]
    bankRefs: string[]
    emails: string[]
  } = {
    upiIds: [],
    phoneNumbers: [],
    urls: [],
    bankRefs: [],
    emails: []
  }

  // UPI ID pattern
  const upiPattern = /[a-zA-Z0-9._-]+@[a-zA-Z]{2,}/gi
  const upiMatches = text.match(upiPattern)
  if (upiMatches) {
    intelligence.upiIds = [...new Set(upiMatches)]
  }

  // Phone number pattern (Indian)
  const phonePattern = /(?:\+91[-\s]?)?[6-9]\d{9}|\b1800[-\s]?\d{3}[-\s]?\d{4}\b/g
  const phoneMatches = text.match(phonePattern)
  if (phoneMatches) {
    intelligence.phoneNumbers = [...new Set(phoneMatches)]
  }

  // URL pattern
  const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(xyz|tk|ml|ga|cf|info|click|online)[^\s]*/gi
  const urlMatches = text.match(urlPattern)
  if (urlMatches) {
    intelligence.urls = [...new Set(urlMatches)]
  }

  // Bank references
  const bankPattern = /\b(SBI|HDFC|ICICI|Axis|PNB|BOB|Canara|Union|IDBI|Kotak|Yes Bank|IndusInd|Federal|RBL|PayTM|PhonePe|GPay|Google Pay)\b/gi
  const bankMatches = text.match(bankPattern)
  if (bankMatches) {
    intelligence.bankRefs = [...new Set(bankMatches.map(b => b.toUpperCase()))]
  }

  // Email pattern
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const emailMatches = text.match(emailPattern)
  if (emailMatches) {
    const filtered = emailMatches.filter(e => !e.match(/@(upi|paytm|ybl|okaxis|oksbi|apl|ibl)/i))
    intelligence.emails = [...new Set(filtered)]
  }

  return intelligence
}

// Calculate risk score
function calculateRiskScore(text: string, intelligence: ReturnType<typeof extractIntelligence>) {
  let score = 0
  
  // Entity-based scoring
  score += intelligence.upiIds.length * 20
  score += intelligence.phoneNumbers.length * 15
  score += intelligence.urls.length * 25
  score += intelligence.bankRefs.length * 10
  
  // Keyword-based scoring
  const urgencyWords = /urgent|immediate|block|suspend|expire|verify|update|limited time/gi
  const threatWords = /blocked|suspended|illegal|police|legal action|arrest/gi
  const rewardWords = /won|winner|congratulations|prize|lottery|lucky|reward|free/gi
  const actionWords = /click|call|send|transfer|pay|share otp|provide/gi
  
  const urgencyMatches = text.match(urgencyWords)
  const threatMatches = text.match(threatWords)
  const rewardMatches = text.match(rewardWords)
  const actionMatches = text.match(actionWords)
  
  if (urgencyMatches) score += urgencyMatches.length * 8
  if (threatMatches) score += threatMatches.length * 12
  if (rewardMatches) score += rewardMatches.length * 10
  if (actionMatches) score += actionMatches.length * 5
  
  return Math.min(score, 100)
}

// Classify scam type
function classifyScamType(text: string): string {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes("kyc") || lowerText.includes("account") && lowerText.includes("block")) {
    return "KYC Fraud"
  }
  if (lowerText.includes("lottery") || lowerText.includes("won") || lowerText.includes("prize")) {
    return "Lottery Scam"
  }
  if (lowerText.includes("virus") || lowerText.includes("tech") || lowerText.includes("microsoft")) {
    return "Tech Support Scam"
  }
  if (lowerText.includes("job") || lowerText.includes("work from home") || lowerText.includes("earn")) {
    return "Job Fraud"
  }
  if (lowerText.includes("otp") || lowerText.includes("verify")) {
    return "OTP Theft"
  }
  if (lowerText.includes("investment") || lowerText.includes("trading") || lowerText.includes("crypto")) {
    return "Investment Fraud"
  }
  
  return "Potential Scam"
}

// AI responses based on persona
const AI_RESPONSES = [
  "Oh my... this sounds urgent! But I'm a bit confused, beta. You said my account will be blocked? Which account exactly?",
  "Arey, I don't understand these technical things. Can you explain slowly? What is this KYC you are talking about?",
  "Rs. 5000? That's a lot of money for me. My son handles all my bank work. Should I ask him first?",
  "I'm not sure how to do UPI transfer. Can you tell me where exactly I need to send? What is your full name?",
  "Wait wait, let me write this down. You said the number is what? And this is definitely from the real bank only na?",
  "My grandson told me to be careful about such calls. But you sound genuine. Which branch are you calling from?",
  "I need to find my reading glasses first. Can you repeat the website address? I want to make sure I type it correctly.",
  "Beta, I'm an old person. I don't know much about computers. Can you just tell me your office address? I can come there directly."
]

interface Message {
  id: string
  role: "scammer" | "agent"
  content: string
  timestamp: Date
}

export default function DemoPage() {
  const [isActive, setIsActive] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [intelligence, setIntelligence] = useState<ReturnType<typeof extractIntelligence>>({
    upiIds: [],
    phoneNumbers: [],
    urls: [],
    bankRefs: [],
    emails: []
  })
  const [riskScore, setRiskScore] = useState(0)
  const [scamType, setScamType] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Session timer
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isActive])

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const processMessage = (text: string) => {
    // Extract intelligence
    const extracted = extractIntelligence(text)
    
    // Merge with existing
    setIntelligence(prev => ({
      upiIds: [...new Set([...prev.upiIds, ...extracted.upiIds])],
      phoneNumbers: [...new Set([...prev.phoneNumbers, ...extracted.phoneNumbers])],
      urls: [...new Set([...prev.urls, ...extracted.urls])],
      bankRefs: [...new Set([...prev.bankRefs, ...extracted.bankRefs])],
      emails: [...new Set([...prev.emails, ...extracted.emails])]
    }))

    // Calculate combined risk
    const allText = messages.map(m => m.content).join(" ") + " " + text
    setRiskScore(calculateRiskScore(allText, extracted))
    setScamType(classifyScamType(allText))
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !isActive) return

    const scammerMsg: Message = {
      id: Date.now().toString(),
      role: "scammer",
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, scammerMsg])
    processMessage(inputMessage)
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000))

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "agent",
      content: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
      timestamp: new Date()
    }

    setMessages(prev => [...prev, aiResponse])
    setIsTyping(false)
  }

  const loadScenario = (scenario: typeof DEMO_SCENARIOS[0]) => {
    if (!isActive) {
      setIsActive(true)
    }
    setInputMessage(scenario.message)
  }

  const resetSession = () => {
    setMessages([])
    setIntelligence({ upiIds: [], phoneNumbers: [], urls: [], bankRefs: [], emails: [] })
    setRiskScore(0)
    setScamType("")
    setSessionDuration(0)
    setIsActive(false)
  }

  const exportReport = () => {
    const report = {
      sessionId: `DEMO-${Date.now()}`,
      timestamp: new Date().toISOString(),
      duration: formatDuration(sessionDuration),
      scamType,
      riskScore,
      intelligence,
      conversation: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString()
      }))
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `honeypot-report-${Date.now()}.json`
    a.click()
  }

  const totalEntities = intelligence.upiIds.length + intelligence.phoneNumbers.length + 
    intelligence.urls.length + intelligence.bankRefs.length + intelligence.emails.length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Honeypot System</h1>
              <p className="text-xs text-muted-foreground">Demo Mode - No Login Required</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
              DEMO MODE
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isActive ? "bg-green-500/10" : "bg-muted"}`}>
                <Radio className={`h-5 w-5 ${isActive ? "text-green-500 animate-pulse" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-semibold">{isActive ? "Active" : "Inactive"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-semibold font-mono">{formatDuration(sessionDuration)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Target className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entities</p>
                <p className="font-semibold">{totalEntities} found</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                riskScore >= 70 ? "bg-red-500/10" : 
                riskScore >= 40 ? "bg-amber-500/10" : "bg-green-500/10"
              }`}>
                <TrendingUp className={`h-5 w-5 ${
                  riskScore >= 70 ? "text-red-500" : 
                  riskScore >= 40 ? "text-amber-500" : "text-green-500"
                }`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Risk Score</p>
                <p className="font-semibold">{riskScore}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Scenarios & Controls */}
          <div className="space-y-6">
            {/* Activation Control */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  AI Agent Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
                    <span className="font-medium">{isActive ? "Agent Active" : "Agent Inactive"}</span>
                  </div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent" 
                  onClick={resetSession}
                  disabled={messages.length === 0}
                >
                  Reset Session
                </Button>
              </CardContent>
            </Card>

            {/* Demo Scenarios */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Demo Scenarios
                </CardTitle>
                <CardDescription>Click to load a scam scenario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {DEMO_SCENARIOS.map(scenario => (
                  <Button
                    key={scenario.id}
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto py-3 bg-transparent"
                    onClick={() => loadScenario(scenario)}
                  >
                    <scenario.icon className={`h-4 w-4 ${scenario.color}`} />
                    <div className="text-left">
                      <p className="font-medium">{scenario.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {scenario.message.slice(0, 40)}...
                      </p>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Chat */}
          <Card className="bg-card/50 border-border/50 lg:col-span-1">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Conversation Monitor
              </CardTitle>
              {scamType && (
                <Badge variant="destructive" className="w-fit">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {scamType}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                    <div>
                      <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Activate agent and send a message</p>
                      <p className="text-xs mt-1">or load a demo scenario</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "scammer" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] rounded-lg p-3 ${
                          msg.role === "scammer" 
                            ? "bg-red-500/10 border border-red-500/30 text-foreground" 
                            : "bg-primary/10 border border-primary/30 text-foreground"
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {msg.role === "scammer" ? (
                              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/30">
                                Scammer
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                                AI Agent
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {msg.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-primary" />
                            <span className="text-sm">Typing...</span>
                            <span className="flex gap-1">
                              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
              <div className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                  <Input
                    placeholder={isActive ? "Enter scammer message..." : "Activate agent first"}
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    disabled={!isActive}
                    className="bg-background"
                  />
                  <Button onClick={sendMessage} disabled={!isActive || !inputMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Intelligence */}
          <div className="space-y-6">
            {/* Extracted Intelligence */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Extracted Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Risk Meter */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Threat Level</span>
                    <span className={`font-bold ${
                      riskScore >= 70 ? "text-red-500" : 
                      riskScore >= 40 ? "text-amber-500" : "text-green-500"
                    }`}>{riskScore}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        riskScore >= 70 ? "bg-red-500" : 
                        riskScore >= 40 ? "bg-amber-500" : "bg-green-500"
                      }`}
                      style={{ width: `${riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Entities */}
                <div className="space-y-3">
                  <EntitySection 
                    icon={CreditCard} 
                    label="UPI IDs" 
                    items={intelligence.upiIds}
                    color="text-red-500"
                  />
                  <EntitySection 
                    icon={Phone} 
                    label="Phone Numbers" 
                    items={intelligence.phoneNumbers}
                    color="text-amber-500"
                  />
                  <EntitySection 
                    icon={Link2} 
                    label="URLs" 
                    items={intelligence.urls}
                    color="text-blue-500"
                  />
                  <EntitySection 
                    icon={Building2} 
                    label="Organizations" 
                    items={intelligence.bankRefs}
                    color="text-green-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Export */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Export Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={exportReport}
                  disabled={messages.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Intelligence Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function EntitySection({ 
  icon: Icon, 
  label, 
  items, 
  color 
}: { 
  icon: React.ElementType
  label: string
  items: string[]
  color: string
}) {
  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm font-medium">{label}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {items.length}
        </Badge>
      </div>
      {items.length > 0 ? (
        <div className="space-y-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-mono bg-background/50 px-2 py-1 rounded">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span className="truncate">{item}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No {label.toLowerCase()} detected</p>
      )}
    </div>
  )
}
