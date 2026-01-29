import type { ExtractedEntity, IntelligenceReport, Message } from './types'

// Regex patterns for entity extraction
const PATTERNS = {
  upi_id: /[a-zA-Z0-9._-]+@[a-zA-Z0-9]+/gi,
  phone_number: /(?:\+91[-\s]?)?(?:\d{10}|\d{5}[-\s]?\d{5}|\d{4}[-\s]?\d{3}[-\s]?\d{3})/g,
  url: /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
  bank_account: /\b\d{9,18}\b/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  organization: /(?:SBI|HDFC|ICICI|Axis|Kotak|PNB|BOB|Canara|Union|IDBI|Yes Bank|IndusInd|RBL|Federal|Bandhan|AU Small Finance|Paytm|PhonePe|Google Pay|GPay|Amazon Pay|BHIM|Razorpay|Mobikwik|Freecharge|Airtel Payments|JioMoney|WhatsApp Pay)/gi,
}

// Keywords that indicate scam behavior
const SCAM_INDICATORS = {
  urgency: ['urgent', 'immediately', 'right now', 'within hours', 'deadline', 'expires', 'limited time', 'act fast'],
  fear: ['blocked', 'suspended', 'illegal', 'fraud', 'arrest', 'police', 'court', 'legal action', 'FIR'],
  reward: ['won', 'prize', 'lottery', 'cashback', 'reward', 'bonus', 'lucky', 'selected', 'congratulations'],
  authority: ['RBI', 'bank official', 'customer care', 'government', 'income tax', 'CBI', 'ED', 'telecom'],
  request: ['share OTP', 'send OTP', 'verify', 'update KYC', 'link Aadhaar', 'transfer', 'send money', 'pay'],
}

// Extract entities from text
export function extractEntities(text: string, messageId: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = []
  const seen = new Set<string>()

  for (const [type, pattern] of Object.entries(PATTERNS)) {
    const matches = text.match(pattern) || []
    for (const match of matches) {
      const normalizedValue = match.toLowerCase().trim()
      
      // Skip duplicates and common false positives
      if (seen.has(normalizedValue)) continue
      if (type === 'url' && !match.includes('.')) continue
      if (type === 'bank_account' && (match.length < 9 || match.length > 18)) continue
      if (type === 'email' && type === 'upi_id') continue // Prevent duplicate extraction
      
      seen.add(normalizedValue)
      
      entities.push({
        type: type as ExtractedEntity['type'],
        value: match,
        confidence: calculateConfidence(type, match, text),
        source: messageId,
        timestamp: new Date(),
      })
    }
  }

  return entities
}

// Calculate confidence score for an extracted entity
function calculateConfidence(type: string, value: string, context: string): number {
  let confidence = 0.5

  // Boost confidence based on context
  const contextLower = context.toLowerCase()
  
  switch (type) {
    case 'upi_id':
      if (contextLower.includes('upi') || contextLower.includes('pay') || contextLower.includes('transfer')) {
        confidence += 0.3
      }
      if (value.includes('@')) confidence += 0.1
      break
    case 'phone_number':
      if (contextLower.includes('call') || contextLower.includes('contact') || contextLower.includes('mobile')) {
        confidence += 0.3
      }
      if (value.startsWith('+91') || value.length === 10) confidence += 0.1
      break
    case 'url':
      if (contextLower.includes('click') || contextLower.includes('visit') || contextLower.includes('link')) {
        confidence += 0.3
      }
      if (value.startsWith('http')) confidence += 0.1
      break
    case 'bank_account':
      if (contextLower.includes('account') || contextLower.includes('bank') || contextLower.includes('transfer')) {
        confidence += 0.3
      }
      break
    case 'organization':
      confidence += 0.4 // Organizations are usually reliable matches
      break
  }

  return Math.min(confidence, 1)
}

// Calculate overall risk score
export function calculateRiskScore(messages: Message[], entities: ExtractedEntity[]): { score: number; factors: string[] } {
  let score = 0
  const factors: string[] = []

  // Analyze all messages for scam indicators
  const allText = messages.map(m => m.content).join(' ').toLowerCase()

  for (const [category, keywords] of Object.entries(SCAM_INDICATORS)) {
    const matchedKeywords = keywords.filter(k => allText.includes(k.toLowerCase()))
    if (matchedKeywords.length > 0) {
      score += matchedKeywords.length * 10
      factors.push(`${category.toUpperCase()}: ${matchedKeywords.join(', ')}`)
    }
  }

  // Boost score based on extracted entities
  if (entities.some(e => e.type === 'upi_id')) {
    score += 15
    factors.push('UPI ID requested/shared')
  }
  if (entities.some(e => e.type === 'phone_number')) {
    score += 10
    factors.push('Phone number detected')
  }
  if (entities.some(e => e.type === 'url')) {
    score += 20
    factors.push('Suspicious URL detected')
  }
  if (entities.some(e => e.type === 'bank_account')) {
    score += 25
    factors.push('Bank account number detected')
  }

  return {
    score: Math.min(score, 100),
    factors,
  }
}

// Determine scam type
export function determineScamType(messages: Message[]): string | null {
  const allText = messages.map(m => m.content).join(' ').toLowerCase()

  if (allText.includes('kyc') || allText.includes('aadhaar') || allText.includes('pan')) {
    return 'KYC Fraud'
  }
  if (allText.includes('lottery') || allText.includes('prize') || allText.includes('won')) {
    return 'Lottery/Prize Scam'
  }
  if (allText.includes('otp') || allText.includes('verification code')) {
    return 'OTP Theft'
  }
  if (allText.includes('customer care') || allText.includes('support') || allText.includes('helpline')) {
    return 'Fake Customer Support'
  }
  if (allText.includes('investment') || allText.includes('returns') || allText.includes('profit')) {
    return 'Investment Fraud'
  }
  if (allText.includes('job') || allText.includes('work from home') || allText.includes('salary')) {
    return 'Job Scam'
  }
  if (allText.includes('loan') || allText.includes('credit') || allText.includes('emi')) {
    return 'Loan Fraud'
  }

  return 'Suspicious Activity'
}

// Generate full intelligence report
export function generateIntelligenceReport(
  sessionId: string,
  messages: Message[]
): IntelligenceReport {
  // Extract entities from all messages
  const allEntities: ExtractedEntity[] = []
  for (const message of messages) {
    const entities = extractEntities(message.content, message.id)
    allEntities.push(...entities)
  }

  // Deduplicate entities
  const uniqueEntities = deduplicateEntities(allEntities)

  // Calculate risk
  const { score, factors } = calculateRiskScore(messages, uniqueEntities)

  // Determine scam type
  const scamType = determineScamType(messages)

  // Generate summary
  const summary = generateSummary(messages, uniqueEntities, scamType)

  return {
    sessionId,
    entities: uniqueEntities,
    riskScore: score,
    riskFactors: factors,
    conversationSummary: summary,
    scamType,
    extractedAt: new Date(),
  }
}

// Deduplicate entities by value
function deduplicateEntities(entities: ExtractedEntity[]): ExtractedEntity[] {
  const seen = new Map<string, ExtractedEntity>()
  
  for (const entity of entities) {
    const key = `${entity.type}:${entity.value.toLowerCase()}`
    const existing = seen.get(key)
    
    if (!existing || entity.confidence > existing.confidence) {
      seen.set(key, entity)
    }
  }
  
  return Array.from(seen.values())
}

// Generate conversation summary
function generateSummary(
  messages: Message[],
  entities: ExtractedEntity[],
  scamType: string | null
): string {
  const messageCount = messages.length
  const entityCount = entities.length
  const entityTypes = [...new Set(entities.map(e => e.type))]
  
  let summary = `Analyzed ${messageCount} messages. `
  
  if (entityCount > 0) {
    summary += `Extracted ${entityCount} potential intelligence items including: ${entityTypes.join(', ')}. `
  }
  
  if (scamType) {
    summary += `Likely scam type: ${scamType}.`
  }
  
  return summary
}
