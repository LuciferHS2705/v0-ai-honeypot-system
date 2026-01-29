'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Bot, ShieldAlert, UserCheck, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivationControlProps {
  aiEnabled: boolean
  onToggleAI: (enabled: boolean) => void
  hasConsent: boolean
  onProvideConsent: () => void
}

export function ActivationControl({
  aiEnabled,
  onToggleAI,
  hasConsent,
  onProvideConsent,
}: ActivationControlProps) {
  const [showConsentDialog, setShowConsentDialog] = useState(false)

  const handleToggle = (checked: boolean) => {
    if (checked && !hasConsent) {
      setShowConsentDialog(true)
    } else {
      onToggleAI(checked)
    }
  }

  const handleConsent = () => {
    onProvideConsent()
    onToggleAI(true)
    setShowConsentDialog(false)
  }

  return (
    <Card className={cn(
      "bg-card border-border transition-all duration-300",
      aiEnabled && "glow-success border-primary/50"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
          <Bot className="w-4 h-4 text-primary" />
          AI Honeypot Control
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Activate AI to automatically engage with scammers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Indicator */}
        <div className={cn(
          "flex items-center justify-between p-4 rounded-lg border",
          aiEnabled
            ? "bg-primary/10 border-primary/30"
            : "bg-secondary border-border"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              aiEnabled ? "bg-primary/20" : "bg-muted"
            )}>
              {aiEnabled ? (
                <Zap className="w-5 h-5 text-primary" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {aiEnabled ? 'AI Engaged' : 'Manual Mode'}
              </p>
              <p className="text-xs text-muted-foreground">
                {aiEnabled
                  ? 'AI is responding to scammer messages'
                  : 'You control all responses'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="ai-toggle" className="sr-only">
              Toggle AI
            </Label>
            <Switch
              id="ai-toggle"
              checked={aiEnabled}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>

        {/* Consent Badge */}
        {hasConsent && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <UserCheck className="w-4 h-4 text-primary" />
            <span>User consent provided for AI automation</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <AlertDialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent"
                disabled={aiEnabled}
              >
                Enable AI
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-card-foreground">Activate AI Honeypot?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground space-y-3">
                  <p>
                    You are about to activate the AI honeypot system. The AI will:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Automatically respond to scammer messages</li>
                    <li>Maintain a realistic human persona</li>
                    <li>Extract intelligence (UPI IDs, phone numbers, URLs)</li>
                    <li>Keep scammers engaged without revealing automation</li>
                  </ul>
                  <p className="font-medium text-foreground">
                    The AI will NEVER share real sensitive information.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border text-foreground">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConsent} className="bg-primary text-primary-foreground">
                  I Understand, Activate AI
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent"
            onClick={() => onToggleAI(false)}
            disabled={!aiEnabled}
          >
            Disable AI
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
