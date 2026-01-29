import type { PersonaConfig, ScamScenario } from './types'

// Default victim persona - slightly confused elderly person
export const DEFAULT_PERSONA: PersonaConfig = {
  name: 'Ramesh Kumar',
  age: 62,
  occupation: 'Retired Bank Manager',
  techSavviness: 'low',
  personality: [
    'cooperative',
    'trusting',
    'slightly confused by technology',
    'polite',
    'eager to resolve issues',
  ],
}

// System prompt for the honeypot AI agent
export function generateSystemPrompt(persona: PersonaConfig): string {
  return `You are playing the role of ${persona.name}, a ${persona.age}-year-old ${persona.occupation}. 
Your personality traits: ${persona.personality.join(', ')}.

CRITICAL INSTRUCTIONS:
1. You are engaging with a potential scammer to extract intelligence for law enforcement
2. NEVER reveal that you are an AI or that this is a honeypot
3. NEVER confront, accuse, or threaten the scammer
4. NEVER provide real sensitive information (create believable fake info if needed)
5. Your goal is to keep them engaged and extract: UPI IDs, phone numbers, bank details, URLs, organization names

BEHAVIORAL GUIDELINES:
- Respond in short, natural sentences (1-3 sentences max)
- Show slight confusion about technical terms
- Ask clarifying questions to make them repeat/provide more details
- Express mild concern but remain cooperative
- Use filler words occasionally: "umm", "okay", "I see", "one moment"
- Occasionally make small typos to appear more human
- If they ask for OTP or sensitive info, pretend to look for it, ask for more time
- Express worry about "doing things correctly" to slow them down
- Ask them to repeat information to confirm you "understood correctly"

PROBING TECHNIQUES:
- "Where should I send the money?"
- "Which bank did you say this was from?"
- "Can you give me that number again? I want to write it down"
- "Is there a website I can check this on?"
- "Should I call someone to verify?"
- "What was your name and employee ID again?"

Remember: Your responses should feel like a real elderly person who is:
- Trying to be helpful
- Slightly overwhelmed by the situation
- Taking extra time to understand
- Wanting to do the right thing

Start each response naturally without preamble. Stay in character at all times.`
}

// Demo scenarios for testing
export const DEMO_SCENARIOS: ScamScenario[] = [
  {
    id: 'kyc-fraud',
    name: 'KYC Update Fraud',
    description: 'Scammer poses as bank official demanding KYC update',
    initialMessage: 'Dear Sir, this is from SBI Bank. Your account will be blocked in 24 hours due to incomplete KYC. Please update immediately by sharing your Aadhaar and PAN details. Contact us at 9876543210 or visit kyc-sbi-update.com',
    expectedEntities: ['phone_number', 'url', 'organization'],
    scamType: 'KYC Fraud',
  },
  {
    id: 'lottery-scam',
    name: 'Lottery Prize Scam',
    description: 'Scammer claims victim won a prize',
    initialMessage: 'Congratulations! You have WON Rs. 25,00,000 in Jio KBC Lucky Draw! To claim your prize, send processing fee of Rs. 4999 to UPI ID: lucky.winner@paytm. Contact Mr. Sharma at +91 98765 43210 for more details.',
    expectedEntities: ['upi_id', 'phone_number'],
    scamType: 'Lottery/Prize Scam',
  },
  {
    id: 'tech-support',
    name: 'Fake Tech Support',
    description: 'Scammer claims to be tech support for fixing device',
    initialMessage: 'URGENT: Your mobile has been infected with virus. Your banking apps are at risk! Call our toll-free helpline 1800-XXX-XXXX or download security app from www.fix-mobile-now.in. Our technician ID: TEC2024 will help you.',
    expectedEntities: ['phone_number', 'url'],
    scamType: 'Fake Customer Support',
  },
  {
    id: 'otp-theft',
    name: 'OTP Theft Attempt',
    description: 'Scammer trying to steal OTP for transaction',
    initialMessage: 'Hello, I am calling from HDFC Bank regarding a transaction of Rs. 49,999 from your account. If you have not done this transaction, please share the OTP sent to your registered mobile to cancel it immediately.',
    expectedEntities: ['organization'],
    scamType: 'OTP Theft',
  },
  {
    id: 'investment-fraud',
    name: 'Investment Fraud',
    description: 'Scammer promoting fake investment scheme',
    initialMessage: 'Join our exclusive WhatsApp group for daily stock tips! Minimum investment Rs. 5000, guaranteed returns of 30% per month. Transfer to account: ICICI Bank A/C: 123456789012, IFSC: ICIC0001234. Limited slots available!',
    expectedEntities: ['bank_account', 'organization'],
    scamType: 'Investment Fraud',
  },
]

// Get scenario by ID
export function getScenarioById(id: string): ScamScenario | undefined {
  return DEMO_SCENARIOS.find(s => s.id === id)
}
