"use client"

import { useState } from "react"
import { 
  Download, 
  FileJson, 
  FileText, 
  Printer, 
  Share2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { HoneypotSession, ExtractedEntity, IntelligenceReport } from "@/lib/types"

interface ReportPanelProps {
  session: HoneypotSession
  entities: ExtractedEntity[]
  report: IntelligenceReport | null
}

export function ReportPanel({ session, entities, report }: ReportPanelProps) {
  const [exporting, setExporting] = useState<string | null>(null)

  const generateJSONReport = () => {
    return JSON.stringify({
      metadata: {
        reportId: crypto.randomUUID(),
        generatedAt: new Date().toISOString(),
        sessionId: session.id,
        platform: "AI Honeypot System",
        version: "1.0.0",
      },
      session: {
        status: session.status,
        messageCount: session.messages.length,
        duration: session.updatedAt.getTime() - session.createdAt.getTime(),
        aiEngaged: session.aiTakeoverConsent,
      },
      intelligence: {
        riskScore: report?.riskScore || 0,
        scamType: report?.scamType || "Unknown",
        riskFactors: report?.riskFactors || [],
        summary: report?.conversationSummary || "",
      },
      extractedEntities: entities.map(e => ({
        type: e.type,
        value: e.value,
        confidence: e.confidence,
        timestamp: e.timestamp,
      })),
      conversationLog: session.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    }, null, 2)
  }

  const generateTextReport = () => {
    const lines = [
      "=" .repeat(60),
      "AI HONEYPOT INTELLIGENCE REPORT",
      "=" .repeat(60),
      "",
      `Report Generated: ${new Date().toLocaleString()}`,
      `Session ID: ${session.id}`,
      `Status: ${session.status.toUpperCase()}`,
      "",
      "-".repeat(60),
      "THREAT ASSESSMENT",
      "-".repeat(60),
      "",
      `Risk Score: ${report?.riskScore || 0}%`,
      `Scam Type: ${report?.scamType || "Unknown"}`,
      "",
      "Risk Factors:",
      ...(report?.riskFactors.map(f => `  - ${f}`) || ["  None detected"]),
      "",
      "-".repeat(60),
      "EXTRACTED INTELLIGENCE",
      "-".repeat(60),
      "",
    ]

    const groupedEntities = entities.reduce((acc, e) => {
      if (!acc[e.type]) acc[e.type] = []
      acc[e.type].push(e)
      return acc
    }, {} as Record<string, ExtractedEntity[]>)

    for (const [type, typeEntities] of Object.entries(groupedEntities)) {
      lines.push(`${type.toUpperCase().replace("_", " ")}:`)
      for (const entity of typeEntities) {
        lines.push(`  - ${entity.value} (${Math.round(entity.confidence * 100)}% confidence)`)
      }
      lines.push("")
    }

    if (entities.length === 0) {
      lines.push("No entities extracted")
      lines.push("")
    }

    lines.push("-".repeat(60))
    lines.push("CONVERSATION LOG")
    lines.push("-".repeat(60))
    lines.push("")

    for (const msg of session.messages) {
      lines.push(`[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.role.toUpperCase()}:`)
      lines.push(`  ${msg.content}`)
      lines.push("")
    }

    lines.push("=".repeat(60))
    lines.push("END OF REPORT")
    lines.push("=".repeat(60))

    return lines.join("\n")
  }

  const handleExport = (format: "json" | "text") => {
    setExporting(format)
    
    const content = format === "json" ? generateJSONReport() : generateTextReport()
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `honeypot-report-${session.id.slice(0, 8)}.${format === "json" ? "json" : "txt"}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setTimeout(() => setExporting(null), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Report Preview */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Intelligence Report Preview
          </CardTitle>
          <CardDescription>
            Review the extracted intelligence before exporting for law enforcement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Summary */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Session Duration</span>
              </div>
              <p className="text-lg font-semibold font-mono">
                {Math.round((session.updatedAt.getTime() - session.createdAt.getTime()) / 1000)}s
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Risk Level</span>
              </div>
              <Badge variant="outline" className={`${
                (report?.riskScore || 0) >= 60 
                  ? "bg-cyber-red/10 text-cyber-red border-cyber-red/30" 
                  : (report?.riskScore || 0) >= 30 
                    ? "bg-cyber-amber/10 text-cyber-amber border-cyber-amber/30"
                    : "bg-success/10 text-success border-success/30"
              }`}>
                {(report?.riskScore || 0) >= 60 ? "HIGH" : (report?.riskScore || 0) >= 30 ? "MEDIUM" : "LOW"}
              </Badge>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Entities Found</span>
              </div>
              <p className="text-lg font-semibold font-mono">{entities.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Messages</span>
              </div>
              <p className="text-lg font-semibold font-mono">{session.messages.length}</p>
            </div>
          </div>

          <Separator />

          {/* Key Findings */}
          <div>
            <h3 className="font-semibold mb-3">Key Findings</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Scam Type:</span>
                <Badge variant="outline">{report?.scamType || "Unknown"}</Badge>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm text-muted-foreground shrink-0">Summary:</span>
                <p className="text-sm">{report?.conversationSummary || "No analysis available yet."}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Extracted Entities Summary */}
          <div>
            <h3 className="font-semibold mb-3">Extracted Entities for Law Enforcement</h3>
            {entities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No entities extracted yet.</p>
            ) : (
              <div className="grid gap-2">
                {entities.map((entity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="uppercase text-xs">
                        {entity.type.replace("_", " ")}
                      </Badge>
                      <code className="text-sm font-mono">{entity.value}</code>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(entity.confidence * 100)}% confidence
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="w-5 h-5 text-primary" />
            Export Report
          </CardTitle>
          <CardDescription>
            Download the intelligence report in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 bg-transparent"
              onClick={() => handleExport("json")}
              disabled={exporting !== null}
            >
              <div className="flex items-center gap-2 w-full">
                <FileJson className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">JSON Format</span>
                {exporting === "json" && <CheckCircle className="w-4 h-4 text-success ml-auto" />}
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Structured data format for technical analysis and database import
              </p>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 bg-transparent"
              onClick={() => handleExport("text")}
              disabled={exporting !== null}
            >
              <div className="flex items-center gap-2 w-full">
                <FileText className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold">Text Report</span>
                {exporting === "text" && <CheckCircle className="w-4 h-4 text-success ml-auto" />}
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Human-readable format for law enforcement documentation
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
