"use client"

import { 
  Play, 
  CreditCard, 
  Gift, 
  Headphones, 
  Key, 
  TrendingUp,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ScenarioPanelProps {
  onSelectScenario: (message: string) => void
}

const scenarios = [
  {
    id: "kyc",
    name: "KYC Fraud",
    icon: CreditCard,
    description: "Fake bank KYC verification request",
    severity: "high",
    message: "Dear Customer, Your SBI account KYC has expired. Your account will be blocked in 24 hours. To update KYC, click here: http://sbi-kyc-update.xyz/verify. Share your Aadhaar number and OTP to complete verification. Call 9876543210 for help. - SBI Customer Care",
  },
  {
    id: "lottery",
    name: "Lottery Scam",
    icon: Gift,
    description: "Fake prize/lottery winning notification",
    severity: "medium",
    message: "CONGRATULATIONS! You have won Rs. 25,00,000 in Jio KBC Lucky Draw! To claim your prize, transfer Rs. 5,000 processing fee to UPI: lucky.winner@paytm. Share your bank account details for direct transfer. Call +91-8765432109 immediately!",
  },
  {
    id: "support",
    name: "Tech Support",
    icon: Headphones,
    description: "Fake customer support impersonation",
    severity: "high",
    message: "This is Microsoft Technical Support. We detected virus in your computer which is stealing your bank data. Download TeamViewer and share access code to fix. Give us your credit card to verify identity. Call toll-free 1800-XXX-XXXX now!",
  },
  {
    id: "otp",
    name: "OTP Theft",
    icon: Key,
    description: "Attempt to steal one-time passwords",
    severity: "critical",
    message: "Hi, I am from Paytm verification team. There was unauthorized transaction of Rs. 49,999 from your account. To cancel this transaction, please share the OTP you just received. This is urgent, you have only 2 minutes!",
  },
  {
    id: "investment",
    name: "Investment Fraud",
    icon: TrendingUp,
    description: "Fake investment scheme promises",
    severity: "medium",
    message: "Earn Rs. 50,000 daily from home! Join our WhatsApp group for guaranteed stock tips. Initial investment only Rs. 10,000. 100% profit guaranteed! Transfer to: invest.profit@ybl. Contact: https://wa.me/919999888877",
  },
]

const severityColors = {
  medium: "bg-cyber-amber/10 text-cyber-amber border-cyber-amber/30",
  high: "bg-cyber-red/10 text-cyber-red border-cyber-red/30",
  critical: "bg-cyber-red/20 text-cyber-red border-cyber-red/50",
}

export function ScenarioPanel({ onSelectScenario }: ScenarioPanelProps) {
  return (
    <Card className="border-border/50 bg-card/50 h-[600px] flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="w-5 h-5 text-cyber-amber" />
          Demo Scenarios
        </CardTitle>
        <CardDescription>
          Select a pre-built scam scenario to test the system
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto space-y-3">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon
          return (
            <div
              key={scenario.id}
              className="p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{scenario.name}</span>
                    <Badge variant="outline" className={severityColors[scenario.severity]}>
                      {scenario.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {scenario.description}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 bg-transparent"
                    onClick={() => onSelectScenario(scenario.message)}
                  >
                    <Play className="w-3 h-3" />
                    Run Scenario
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
