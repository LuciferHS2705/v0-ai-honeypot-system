'use client'

import { useState, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ChatInterface } from './chat-interface'
import { IntelligencePanel } from './intelligence-panel'
import { ActivationControl } from './activation-control'
import { ScenarioSelector } from './scenario-selector'
import { ReportExport } from './report-export'
import { Button } from '@/components/ui/button'
import { Shield, RotateCcw, Activity } from 'lucide-react'
import type { Message, IntelligenceReport, ScamScenario } from '@/lib/types'

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function HoneypotDashboard() {
  const [sessionId] = useState(() => generateId())
  const [aiEnabled, setAiEnabled] = useState(false)
  const [hasConsent, setHasConsent] = useState(false)
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [intelligence, setIntelligence] = useState<IntelligenceReport | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/chat',
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          messages,
          id,
          aiEnabled,
        },
      }),
    }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Extract text from message parts
  const getMessageText = (msg: { parts?: Array<{ type: string; text?: string }> }): string => {
    if (!msg.parts) return ''
    return msg.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('')
  }

  // Analyze conversation for intelligence
  const analyzeConversation = useCallback(async (msgs: Message[]) => {
    if (msgs.length === 0) return
    
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messages: msgs }),
      })
      
      if (response.ok) {
        const report = await response.json()
        setIntelligence(report)
      }
    } catch (error) {
      console.error('[v0] Failed to analyze conversation:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [sessionId])

  // Handle scammer message (trigger AI response if enabled)
  const handleScammerMessage = useCallback(async (content: string) => {
    const newMessage: Message = {
      id: generateId(),
      role: 'scammer',
      content,
      timestamp: new Date(),
    }
    
    const updatedMessages = [...localMessages, newMessage]
    setLocalMessages(updatedMessages)
    
    // Analyze after each scammer message
    analyzeConversation(updatedMessages)
    
    if (aiEnabled) {
      // Send to AI for response
      await sendMessage({ text: content })
    }
  }, [localMessages, aiEnabled, sendMessage, analyzeConversation])

  // Handle manual response (when AI is disabled)
  const handleManualResponse = useCallback((content: string) => {
    const newMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    }
    
    const updatedMessages = [...localMessages, newMessage]
    setLocalMessages(updatedMessages)
    analyzeConversation(updatedMessages)
  }, [localMessages, analyzeConversation])

  // Sync AI messages to local state
  const syncedMessages: Message[] = [
    ...localMessages,
    ...messages
      .filter(m => m.role === 'assistant')
      .map(m => ({
        id: m.id,
        role: 'assistant' as const,
        content: getMessageText(m),
        timestamp: new Date(),
      }))
      .filter(m => !localMessages.some(lm => lm.id === m.id)),
  ]

  // Update local messages when AI responds
  if (messages.length > 0) {
    const lastAiMessage = messages[messages.length - 1]
    if (lastAiMessage.role === 'assistant' && status === 'ready') {
      const text = getMessageText(lastAiMessage)
      if (text && !localMessages.some(m => m.id === lastAiMessage.id)) {
        const aiMessage: Message = {
          id: lastAiMessage.id,
          role: 'assistant',
          content: text,
          timestamp: new Date(),
        }
        setLocalMessages(prev => [...prev, aiMessage])
        analyzeConversation([...localMessages, aiMessage])
      }
    }
  }

  // Handle scenario selection
  const handleSelectScenario = useCallback((scenario: ScamScenario) => {
    handleScammerMessage(scenario.initialMessage)
  }, [handleScammerMessage])

  // Reset session
  const handleReset = useCallback(() => {
    setLocalMessages([])
    setMessages([])
    setIntelligence(null)
    setAiEnabled(false)
  }, [setMessages])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AI Honeypot System</h1>
                <p className="text-xs text-muted-foreground">Scam Intelligence Extraction Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Session: </span>
                <code className="text-xs font-mono text-foreground">{sessionId.slice(0, 8)}</code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="border-border text-foreground bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Controls */}
          <aside className="lg:col-span-3 space-y-4">
            <ActivationControl
              aiEnabled={aiEnabled}
              onToggleAI={setAiEnabled}
              hasConsent={hasConsent}
              onProvideConsent={() => setHasConsent(true)}
            />
            <ScenarioSelector
              onSelectScenario={handleSelectScenario}
              disabled={isLoading}
            />
            <ReportExport
              report={intelligence}
              messages={syncedMessages}
            />
          </aside>

          {/* Center - Chat Interface */}
          <section className="lg:col-span-5 h-[calc(100vh-12rem)]">
            <ChatInterface
              messages={syncedMessages}
              onSendMessage={handleManualResponse}
              onSendScammerMessage={handleScammerMessage}
              aiEnabled={aiEnabled}
              isLoading={isLoading}
            />
          </section>

          {/* Right Sidebar - Intelligence */}
          <aside className="lg:col-span-4">
            <IntelligencePanel
              report={intelligence}
              isAnalyzing={isAnalyzing}
            />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>AI Honeypot System - For Law Enforcement Use Only</p>
            <p>Ethical safeguards enabled. User consent required for AI automation.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
