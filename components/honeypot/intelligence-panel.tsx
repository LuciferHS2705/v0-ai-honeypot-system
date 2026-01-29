'use client'

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Phone,
  Link2,
  CreditCard,
  Building2,
  Mail,
  Wallet,
  AlertTriangle,
  Shield,
  FileWarning,
  Copy,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { IntelligenceReport, ExtractedEntity } from '@/lib/types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface IntelligencePanelProps {
  report: IntelligenceReport | null
  isAnalyzing: boolean
}

const entityIcons: Record<ExtractedEntity['type'], React.ReactNode> = {
  upi_id: <Wallet className="w-4 h-4" />,
  phone_number: <Phone className="w-4 h-4" />,
  url: <Link2 className="w-4 h-4" />,
  bank_account: <CreditCard className="w-4 h-4" />,
  organization: <Building2 className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
}

const entityLabels: Record<ExtractedEntity['type'], string> = {
  upi_id: 'UPI ID',
  phone_number: 'Phone Number',
  url: 'URL',
  bank_account: 'Bank Account',
  organization: 'Organization',
  email: 'Email',
}

function getRiskColor(score: number): string {
  if (score < 30) return 'bg-chart-1'
  if (score < 60) return 'bg-chart-3'
  return 'bg-destructive'
}

function getRiskLabel(score: number): string {
  if (score < 30) return 'Low Risk'
  if (score < 60) return 'Medium Risk'
  return 'High Risk'
}

export function IntelligencePanel({ report, isAnalyzing }: IntelligencePanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = async (value: string, id: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Risk Score Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
            <Shield className="w-4 h-4 text-primary" />
            Threat Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : report ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-foreground">{report.riskScore}</span>
                <Badge
                  className={cn(
                    "text-foreground",
                    report.riskScore < 30 && "bg-chart-1/20 text-chart-1",
                    report.riskScore >= 30 && report.riskScore < 60 && "bg-chart-3/20 text-chart-3",
                    report.riskScore >= 60 && "bg-destructive/20 text-destructive"
                  )}
                >
                  {getRiskLabel(report.riskScore)}
                </Badge>
              </div>
              <Progress
                value={report.riskScore}
                className={cn("h-2", getRiskColor(report.riskScore))}
              />
              {report.scamType && (
                <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                  <FileWarning className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    {report.scamType}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm text-center">
                No analysis yet.<br />
                Start a conversation to extract intelligence.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted Entities */}
      <Card className="flex-1 bg-card border-border overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
            <CreditCard className="w-4 h-4 text-primary" />
            Extracted Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            {report && report.entities.length > 0 ? (
              <div className="p-4 space-y-2">
                {report.entities.map((entity, index) => (
                  <div
                    key={`${entity.type}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border hover:bg-secondary/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        {entityIcons[entity.type]}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {entityLabels[entity.type]}
                        </p>
                        <p className="font-mono text-sm text-foreground break-all">
                          {entity.value}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-border">
                        {Math.round(entity.confidence * 100)}%
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(entity.value, `${entity.type}-${index}`)}
                      >
                        {copiedId === `${entity.type}-${index}` ? (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                <p className="text-sm">No entities extracted yet</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      {report && report.riskFactors.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
              <AlertTriangle className="w-4 h-4 text-chart-3" />
              Risk Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.riskFactors.map((factor, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-chart-3">•</span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
