"use client"

import React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Bot, User, AlertCircle, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { extractEntities, generateIntelligenceReport } from "@/lib/extraction-engine"
import type { HoneypotSession, ExtractedEntity, IntelligenceReport, Message } from "@/lib/types"

interface ChatPanelProps {
  session: HoneypotSession
  setSession: React.Dispatch<React.SetStateAction<HoneypotSession>>
  setEntities: React.Dispatch<React.SetStateAction<ExtractedEntity[]>>
  setReport: React.Dispatch<React.SetStateAction<IntelligenceReport | null>>
}

export function ChatPanel({ session, setSession, setEntities, setReport }: ChatPanelProps) {
  const [scammerInput, setScammerInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [session.messages, streamingContent])

  // Process extraction when messages change
  useEffect(() => {
    if (session.messages.length > 0) {
      const allEntities: ExtractedEntity[] = []
      for (const msg of session.messages) {
        const extracted = extractEntities(msg.content, msg.id)
        allEntities.push(...extracted)
      }
      setEntities(allEntities)

      const report = generateIntelligenceReport(session.id, session.messages)
      setReport(report)
    }
  }, [session.messages, session.id, setEntities, setReport])

  const generateAIResponse = useCallback(async (scammerMessage: string) => {
    setIsLoading(true)
    setStreamingContent("")

    try {
      const conversationHistory = [
        ...session.messages.map(m => ({
          role: m.role === "scammer" ? "user" : "assistant",
          content: m.content,
        })),
        { role: "user", content: scammerMessage },
      ]

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationHistory.map((m, i) => ({
            id: `msg-${i}`,
            role: m.role,
            parts: [{ type: "text", text: m.content }],
          })),
        }),
      })

      if (!response.ok) throw new Error("Failed to get AI response")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const data = line.slice(5).trim()
            if (data === "[DONE]") continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === "text-delta" && parsed.delta) {
                fullContent += parsed.delta
                setStreamingContent(fullContent)
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      if (fullContent) {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: fullContent,
          timestamp: new Date(),
        }
        setSession(prev => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
          updatedAt: new Date(),
        }))
      }
    } catch (error) {
      console.error("AI response error:", error)
    } finally {
      setIsLoading(false)
      setStreamingContent("")
    }
  }, [session.messages, setSession])

  const handleScammerMessage = async () => {
    if (!scammerInput.trim()) return

    const messageContent = scammerInput.trim()
    setScammerInput("")

    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: "scammer",
      content: messageContent,
      timestamp: new Date(),
    }

    setSession(prev => ({
      ...prev,
      status: prev.status === "inactive" ? "monitoring" : prev.status,
      messages: [...prev.messages, newMessage],
      updatedAt: new Date(),
    }))

    // If AI is engaged, generate response
    if (session.aiTakeoverConsent && session.status === "ai_engaged") {
      await generateAIResponse(messageContent)
    }
  }

  return (
    <Card className="h-[600px] flex flex-col border-border/50 bg-card/50">
      <CardHeader className="border-b border-border/50 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="w-5 h-5 text-primary" />
            Conversation Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            {session.status === "ai_engaged" && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Engaged
              </Badge>
            )}
            <Badge variant="outline" className="text-muted-foreground">
              {session.messages.length} messages
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {session.messages.length === 0 && !streamingContent ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                No conversation yet. Enter a scammer message below or select a demo scenario to begin monitoring.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {session.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "assistant" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      message.role === "scammer"
                        ? "bg-destructive/10 border border-destructive/30"
                        : "bg-primary/10 border border-primary/30"
                    }`}
                  >
                    {message.role === "scammer" ? (
                      <User className="w-4 h-4 text-destructive" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div
                    className={`flex-1 max-w-[80%] ${message.role === "assistant" ? "text-right" : ""}`}
                  >
                    <div className={`flex items-center gap-2 mb-1 ${message.role === "assistant" ? "justify-end" : ""}`}>
                      <span className="text-xs font-medium">
                        {message.role === "scammer" ? "Scammer" : "AI Honeypot"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg p-3 text-sm inline-block ${
                        message.role === "scammer"
                          ? "bg-destructive/5 border border-destructive/20 text-left"
                          : "bg-primary/5 border border-primary/20 text-left"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {streamingContent && (
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 border border-primary/30">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 max-w-[80%] text-right">
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <span className="text-xs font-medium">AI Honeypot</span>
                      <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                    </div>
                    <div className="rounded-lg p-3 text-sm bg-primary/5 border border-primary/20 text-left inline-block">
                      {streamingContent}
                    </div>
                  </div>
                </div>
              )}
              {isLoading && !streamingContent && (
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 border border-primary/30">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI is thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Textarea
              value={scammerInput}
              onChange={(e) => setScammerInput(e.target.value)}
              placeholder="Enter scammer message (simulating incoming scam)..."
              className="min-h-[80px] resize-none bg-muted/30 border-border/50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleScammerMessage()
                }
              }}
            />
            <Button
              onClick={handleScammerMessage}
              disabled={!scammerInput.trim() || isLoading}
              className="h-[80px] px-6"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send. Shift+Enter for new line.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
