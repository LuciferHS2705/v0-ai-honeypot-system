'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, FileText, AlertCircle } from 'lucide-react'
import { DEMO_SCENARIOS } from '@/lib/persona'
import type { ScamScenario } from '@/lib/types'

interface ScenarioSelectorProps {
  onSelectScenario: (scenario: ScamScenario) => void
  disabled: boolean
}

export function ScenarioSelector({ onSelectScenario, disabled }: ScenarioSelectorProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
          <FileText className="w-4 h-4 text-primary" />
          Demo Scenarios
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Test the system with realistic scam scenarios
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="p-4 space-y-3">
            {DEMO_SCENARIOS.map((scenario) => (
              <div
                key={scenario.id}
                className="p-3 rounded-lg bg-secondary/50 border border-border hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-medium text-sm text-foreground">{scenario.name}</h4>
                    <p className="text-xs text-muted-foreground">{scenario.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-destructive/30 text-destructive shrink-0">
                    {scenario.scamType}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Expected: {scenario.expectedEntities.join(', ')}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-primary hover:text-primary-foreground bg-transparent"
                  onClick={() => onSelectScenario(scenario)}
                  disabled={disabled}
                >
                  <Play className="w-3 h-3 mr-2" />
                  Run Scenario
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
