"use client"

import React from "react"

import { 
  CreditCard, 
  Phone, 
  Link as LinkIcon, 
  Building2, 
  Mail, 
  Wallet,
  AlertTriangle,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ExtractedEntity, IntelligenceReport } from "@/lib/types"

interface IntelligencePanelProps {
  entities: ExtractedEntity[]
  report: IntelligenceReport | null
  threatLevel: "low" | "medium" | "high" | "critical"
}

const entityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  upi_id: Wallet,
  phone_number: Phone,
  url: LinkIcon,
  bank_account: CreditCard,
  organization: Building2,
  email: Mail,
}

const entityColors: Record<string, string> = {
  upi_id: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  phone_number: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  url: "bg-red-500/10 text-red-500 border-red-500/30",
  bank_account: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  organization: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  email: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
}

export function IntelligencePanel({ entities, report, threatLevel }: IntelligencePanelProps) {
  const threatColors = {
    low: { bg: "bg-success", text: "text-success", border: "border-success/30" },
    medium: { bg: "bg-cyber-amber", text: "text-cyber-amber", border: "border-cyber-amber/30" },
    high: { bg: "bg-cyber-red", text: "text-cyber-red", border: "border-cyber-red/30" },
    critical: { bg: "bg-cyber-red", text: "text-cyber-red", border: "border-cyber-red/50" },
  }

  const groupedEntities = entities.reduce((acc, entity) => {
    if (!acc[entity.type]) acc[entity.type] = []
    acc[entity.type].push(entity)
    return acc
  }, {} as Record<string, ExtractedEntity[]>)

  return (
    <div className="space-y-6">
      {/* Threat Assessment */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-5 h-5 text-primary" />
            Threat Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Risk Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Score</span>
                <span className={`text-2xl font-bold font-mono ${threatColors[threatLevel].text}`}>
                  {report?.riskScore || 0}%
                </span>
              </div>
              <Progress 
                value={report?.riskScore || 0} 
                className={`h-2 ${threatLevel === "critical" ? "animate-pulse" : ""}`}
              />
              <Badge variant="outline" className={`${threatColors[threatLevel].text} ${threatColors[threatLevel].border}`}>
                {threatLevel.toUpperCase()} RISK
              </Badge>
            </div>

            {/* Scam Type */}
            <div className="space-y-3">
              <span className="text-sm text-muted-foreground">Detected Scam Type</span>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${threatColors[threatLevel].text}`} />
                <span className="font-semibold">{report?.scamType || "Unknown"}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on conversation patterns and extracted indicators
              </p>
            </div>

            {/* Summary Stats */}
            <div className="space-y-3">
              <span className="text-sm text-muted-foreground">Intelligence Summary</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-muted/30 text-center">
                  <span className="text-lg font-bold font-mono">{entities.length}</span>
                  <p className="text-xs text-muted-foreground">Entities</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/30 text-center">
                  <span className="text-lg font-bold font-mono">{report?.riskFactors.length || 0}</span>
                  <p className="text-xs text-muted-foreground">Risk Factors</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Extracted Entities */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-primary" />
              Extracted Entities
              <Badge variant="secondary" className="ml-auto">{entities.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {entities.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                    <AlertTriangle className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No entities extracted yet. Continue the conversation to gather intelligence.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(groupedEntities).map(([type, typeEntities]) => {
                    const Icon = entityIcons[type] || AlertTriangle
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${entityColors[type]?.split(" ")[1] || "text-muted-foreground"}`} />
                          <span className="text-sm font-medium capitalize">
                            {type.replace("_", " ")}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {typeEntities.length}
                          </Badge>
                        </div>
                        {typeEntities.map((entity) => (
                          <div
                            key={`${entity.type}-${entity.value}`}
                            className={`p-3 rounded-lg border ${entityColors[entity.type] || "bg-muted/30 border-border/50"}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <code className="text-sm font-mono break-all">{entity.value}</code>
                              <Badge variant="outline" className="text-xs shrink-0">
                                {Math.round(entity.confidence * 100)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-cyber-amber" />
              Risk Factors
              <Badge variant="secondary" className="ml-auto">{report?.riskFactors.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {!report?.riskFactors.length ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-3">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No risk factors detected. The conversation appears safe so far.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {report.riskFactors.map((factor, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-cyber-amber/5 border border-cyber-amber/20"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-cyber-amber shrink-0 mt-0.5" />
                        <span className="text-sm">{factor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Summary */}
      {report && (
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-5 h-5 text-primary" />
              Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.conversationSummary}
            </p>
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span>Last updated: {new Date(report.extractedAt).toLocaleString()}</span>
              <span>Session ID: {report.sessionId.slice(0, 8)}...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
