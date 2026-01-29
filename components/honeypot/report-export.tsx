'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileJson, FileText, Printer } from 'lucide-react'
import type { IntelligenceReport, Message } from '@/lib/types'

interface ReportExportProps {
  report: IntelligenceReport | null
  messages: Message[]
}

export function ReportExport({ report, messages }: ReportExportProps) {
  const exportJSON = () => {
    if (!report) return
    
    const exportData = {
      report,
      conversationLog: messages,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `honeypot-report-${report.sessionId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportText = () => {
    if (!report) return
    
    let content = `HONEYPOT INTELLIGENCE REPORT
============================
Session ID: ${report.sessionId}
Generated: ${new Date(report.extractedAt).toLocaleString()}

THREAT ASSESSMENT
-----------------
Risk Score: ${report.riskScore}/100
Scam Type: ${report.scamType || 'Unknown'}

EXTRACTED INTELLIGENCE
----------------------
`
    
    for (const entity of report.entities) {
      content += `[${entity.type.toUpperCase()}] ${entity.value} (${Math.round(entity.confidence * 100)}% confidence)\n`
    }
    
    content += `
RISK FACTORS
------------
`
    for (const factor of report.riskFactors) {
      content += `• ${factor}\n`
    }
    
    content += `
CONVERSATION LOG
----------------
`
    for (const msg of messages) {
      content += `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.role.toUpperCase()}: ${msg.content}\n\n`
    }
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `honeypot-report-${report.sessionId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const printReport = () => {
    window.print()
  }

  const isDisabled = !report || report.entities.length === 0

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
          <Download className="w-4 h-4 text-primary" />
          Export Report
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Download intelligence for law enforcement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start border-border text-foreground hover:bg-secondary bg-transparent"
          onClick={exportJSON}
          disabled={isDisabled}
        >
          <FileJson className="w-4 h-4 mr-2" />
          Export as JSON
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start border-border text-foreground hover:bg-secondary bg-transparent"
          onClick={exportText}
          disabled={isDisabled}
        >
          <FileText className="w-4 h-4 mr-2" />
          Export as Text
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start border-border text-foreground hover:bg-secondary bg-transparent"
          onClick={printReport}
          disabled={isDisabled}
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Report
        </Button>
      </CardContent>
    </Card>
  )
}
