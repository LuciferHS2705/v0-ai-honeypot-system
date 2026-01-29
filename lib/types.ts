// Intelligence extraction types
export interface ExtractedEntity {
  type: 'upi_id' | 'phone_number' | 'url' | 'bank_account' | 'organization' | 'email'
  value: string
  confidence: number
  source: string // Message ID where this was found
  timestamp: Date
}

export interface IntelligenceReport {
  sessionId: string
  entities: ExtractedEntity[]
  riskScore: number
  riskFactors: string[]
  conversationSummary: string
  scamType: string | null
  extractedAt: Date
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'scammer'
  content: string
  timestamp: Date
}

export interface HoneypotSession {
  id: string
  status: 'inactive' | 'monitoring' | 'ai_engaged' | 'completed'
  messages: Message[]
  intelligence: IntelligenceReport | null
  aiTakeoverConsent: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PersonaConfig {
  name: string
  age: number
  occupation: string
  techSavviness: 'low' | 'medium' | 'high'
  personality: string[]
}

// Demo scenario types
export interface ScamScenario {
  id: string
  name: string
  description: string
  initialMessage: string
  expectedEntities: string[]
  scamType: string
}
