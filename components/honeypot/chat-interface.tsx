'use client'

import React from "react"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message } from '@/lib/types'

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  onSendScammerMessage: (content: string) => void
  aiEnabled: boolean
  isLoading: boolean
}

export function ChatInterface({
  messages,
  onSendMessage,
  onSendScammerMessage,
  aiEnabled,
  isLoading,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isScammerMode, setIsScammerMode] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (isScammerMode) {
      onSendScammerMessage(input)
    } else {
      onSendMessage(input)
    }
    setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            aiEnabled ? "bg-primary animate-pulse" : "bg-muted-foreground"
          )} />
          <span className="font-medium text-card-foreground">
            {aiEnabled ? 'AI Honeypot Active' : 'Manual Mode'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-center">
                No messages yet. Start by entering a suspicious message<br />
                or select a demo scenario.
              </p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2",
                  message.role === 'assistant'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-destructive/20 text-foreground border border-destructive/30'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "text-xs font-medium",
                    message.role === 'assistant' ? 'text-primary' : 'text-destructive'
                  )}>
                    {message.role === 'assistant' ? 'Honeypot AI' : 'Scammer'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'scammer' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-destructive" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-secondary rounded-lg px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <Button
            type="button"
            size="sm"
            variant={isScammerMode ? 'default' : 'outline'}
            onClick={() => setIsScammerMode(true)}
            className={cn(
              "text-xs",
              isScammerMode && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            Send as Scammer
          </Button>
          <Button
            type="button"
            size="sm"
            variant={!isScammerMode ? 'default' : 'outline'}
            onClick={() => setIsScammerMode(false)}
            disabled={aiEnabled}
            className="text-xs"
          >
            Manual Response
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isScammerMode ? "Enter scammer's message..." : "Type your response..."}
            disabled={isLoading}
            className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
