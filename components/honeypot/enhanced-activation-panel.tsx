"use client"

import React from "react"

import { useState } from "react"
import { 
  Power, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Bot, 
  User,
  Settings,
  Sliders,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { HoneypotSession } from "@/lib/types"

interface ActivationPanelProps {
  session: HoneypotSession
  setSession: React.Dispatch<React.SetStateAction<HoneypotSession>>
}

export function ActivationPanel({ session, setSession }: ActivationPanelProps) {
  const [showConsentDialog, setShowConsentDialog] = useState(false)
  const [personaType, setPersonaType] = useState("elderly")
  const [responseDelay, setResponseDelay] = useState([2])
  const [autoExtract, setAutoExtract] = useState(true)

  const handleActivate = () => {
    if (!session.aiTakeoverConsent) {
      setShowConsentDialog(true)
    } else {
      toggleAIStatus()
    }
  }

  const toggleAIStatus = () => {
    setSession(prev => ({
      ...prev,
      status: prev.status === "ai_engaged" ? "monitoring" : "ai_engaged",
      updatedAt: new Date(),
    }))
  }

  const handleConsent = () => {
    setSession(prev => ({
      ...prev,
      aiTakeoverConsent: true,
      status: "ai_engaged",
      updatedAt: new Date(),
    }))
    setShowConsentDialog(false)
  }

  const isEngaged = session.status === "ai_engaged"

  return (
    <div className="space-y-6">
      {/* Main Control Card */}
      <Card className={`border-2 transition-all duration-300 ${
        isEngaged 
          ? "border-primary/50 bg-primary/5" 
          : "border-border/50 bg-card/50"
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isEngaged 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            }`}>
              <Power className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">AI Honeypot Control</h2>
              <p className="text-sm text-muted-foreground font-normal">
                {isEngaged ? "AI is actively engaging the scammer" : "AI is standing by"}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-3">
              <Bot className={`w-8 h-8 ${isEngaged ? "text-primary" : "text-muted-foreground"}`} />
              <div>
                <p className="font-medium">AI Engagement Status</p>
                <p className="text-sm text-muted-foreground">
                  {isEngaged ? "Responding to scammer messages" : "Manual mode - you control responses"}
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`px-4 py-2 text-sm ${
                isEngaged 
                  ? "bg-primary/10 text-primary border-primary/30" 
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isEngaged ? "ACTIVE" : "STANDBY"}
            </Badge>
          </div>

          <Button 
            size="lg" 
            className={`w-full h-14 text-lg font-semibold transition-all duration-300 ${
              isEngaged 
                ? "bg-destructive hover:bg-destructive/90" 
                : "bg-primary hover:bg-primary/90"
            }`}
            onClick={handleActivate}
          >
            {isEngaged ? (
              <>
                <Power className="w-5 h-5 mr-2" />
                Deactivate AI Honeypot
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Activate AI Honeypot
              </>
            )}
          </Button>

          {session.aiTakeoverConsent && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="w-4 h-4" />
              <span>Consent provided - AI can engage automatically</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Persona Settings */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-5 h-5 text-primary" />
              Persona Configuration
            </CardTitle>
            <CardDescription>
              Choose the AI victim persona for realistic engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Persona Type</Label>
              <Select value={personaType} onValueChange={setPersonaType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elderly">Elderly Person (60+)</SelectItem>
                  <SelectItem value="naive">Naive Young Adult</SelectItem>
                  <SelectItem value="busy">Busy Professional</SelectItem>
                  <SelectItem value="trusting">Overly Trusting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-sm">
              <p className="font-medium mb-1">Current Persona:</p>
              <p className="text-muted-foreground">
                {personaType === "elderly" && "Kamala Devi, 68, retired teacher with limited tech knowledge"}
                {personaType === "naive" && "Rahul Kumar, 22, college student easily impressed"}
                {personaType === "busy" && "Priya Sharma, 35, working professional in a hurry"}
                {personaType === "trusting" && "Mohan Lal, 55, trusts authority figures easily"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Behavior Settings */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sliders className="w-5 h-5 text-primary" />
              Behavior Settings
            </CardTitle>
            <CardDescription>
              Fine-tune the AI engagement behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Response Delay</Label>
                <span className="text-sm text-muted-foreground">{responseDelay[0]}s</span>
              </div>
              <Slider
                value={responseDelay}
                onValueChange={setResponseDelay}
                min={0}
                max={10}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Adds realistic human-like delay to responses
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Extract Intelligence</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically extract entities from messages
                </p>
              </div>
              <Switch checked={autoExtract} onCheckedChange={setAutoExtract} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Safety Notice */}
      <Card className="border-cyber-amber/30 bg-cyber-amber/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyber-amber shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-cyber-amber">Ethical Usage Guidelines</p>
              <p className="text-sm text-muted-foreground">
                This system is designed for legitimate scam research and law enforcement purposes only. 
                The AI will engage scammers ethically, without providing actual sensitive information. 
                All extracted intelligence should be shared with appropriate authorities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent Dialog */}
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Activate AI Honeypot
            </DialogTitle>
            <DialogDescription>
              Please review and consent to the following before activating:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Scam Detection Purpose</p>
                  <p className="text-xs text-muted-foreground">
                    I confirm this is being used to detect and document scam activities
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Ethical AI Usage</p>
                  <p className="text-xs text-muted-foreground">
                    The AI will not share real sensitive information
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Law Enforcement Cooperation</p>
                  <p className="text-xs text-muted-foreground">
                    Intelligence gathered may be shared with authorities
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConsentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConsent} className="gap-2">
              <Shield className="w-4 h-4" />
              I Consent & Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
