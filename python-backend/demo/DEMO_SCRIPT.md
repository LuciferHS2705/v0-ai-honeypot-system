# AI Honeypot System - Demo Script

## 2-Minute Demo Script

### Opening (15 seconds)
"Good morning everyone. We've built an AI-powered honeypot system that protects citizens from financial scams by engaging scammers with realistic AI personas while extracting intelligence for law enforcement."

### Problem Statement (20 seconds)
"Every year, millions of Indians lose crores to phone and online scams. Scammers use urgency and fear to steal bank details, UPI credentials, and OTPs. Current solutions block calls AFTER damage is done. Our system intercepts scams IN PROGRESS."

### Live Demo (60 seconds)

**Step 1: Show the Dashboard**
"Here's our command center. Notice the cybersecurity-themed interface with real-time threat monitoring."

**Step 2: Activate AI Honeypot**
"When a user detects a suspicious call, they can hand off to our AI with one click. Watch as I paste a real scam message..."

*Paste this message:*
```
Hello sir, this is calling from State Bank of India customer care. 
Your account has been blocked due to incomplete KYC verification. 
Please pay Rs 500 processing fee to UPI ID sbi.kyc@ybl immediately 
or your account will be permanently closed within 2 hours.
```

**Step 3: Show AI Response**
"Our AI responds as Kamala Sharma, a 68-year-old retired teacher. Notice how she's cooperative but confused - asking the scammer to repeat details, claiming technical difficulties."

**Step 4: Show Intelligence Extraction**
"In real-time, our NLP engine extracts:
- UPI ID: sbi.kyc@ybl
- Phone numbers mentioned
- Urgency indicators
- Risk score: 85/100
- Scam type: KYC Fraud"

**Step 5: Generate Report**
"With one click, we generate a detailed intelligence report ready for law enforcement - complete with extracted entities, conversation transcript, and threat assessment."

### Technical Highlights (20 seconds)
"Under the hood:
- AI SDK with GPT-4o for natural conversation
- Regex + NLP for entity extraction
- Supabase for secure data storage
- Real-time risk scoring algorithm"

### Closing (15 seconds)
"Our system wastes scammers' time, extracts their payment details, and builds an intelligence database. Every minute a scammer spends with our AI is a minute they're NOT scamming a real victim. Thank you."

---

## Key Technical Highlights

### Architecture
1. **Frontend (Next.js 16)**: Professional dashboard with dark/light mode
2. **AI Layer**: GPT-4o-mini with goal-driven prompting
3. **Extraction Engine**: Regex patterns + spaCy NER
4. **Database**: Supabase with RLS policies
5. **Python Backend**: FastAPI for standalone deployment

### Unique Features
- **Goal-Driven AI**: The AI has secret objectives (extract payment info, keep engaged)
- **Multiple Personas**: Confused elderly, busy professional, trusting homemaker
- **Real-time Extraction**: UPI IDs, phone numbers, URLs, bank accounts
- **Risk Scoring**: Algorithm weighs urgency, fear tactics, payment requests
- **Law Enforcement Ready**: One-click report generation

### Scam Types Detected
- KYC/Verification Fraud
- Lottery/Prize Scams
- Tech Support Scams
- OTP Theft
- Investment Fraud
- Loan Fraud
- Job Scams
- Customs/Parcel Fraud

---

## Ethical Justification & Safety

### Why This Is Ethical
1. **Defensive Use Only**: System only engages when user explicitly activates it
2. **No Real Data**: AI never provides real bank details or personal info
3. **Consent-Based**: User must acknowledge they're dealing with a suspected scam
4. **Law Enforcement Purpose**: Data collected helps catch criminals
5. **Victim Protection**: Wastes scammers' time, preventing real fraud

### Safety Measures
1. **User Consent Dialog**: Must confirm suspected scam before activation
2. **No Actual Transactions**: AI stalls but never completes any payment
3. **Data Encryption**: All intelligence stored securely with RLS
4. **Audit Trail**: Every interaction logged for accountability
5. **Session Limits**: Auto-termination after extended periods

### Legal Considerations
- Scammers have no expectation of privacy when committing fraud
- Similar to law enforcement sting operations
- User explicitly consents to AI takeover
- Data retention follows local regulations

---

## Future Roadmap

### Phase 2 (3 months)
- Voice call integration via Twilio
- WhatsApp bot deployment
- Multi-language support (Hindi, Tamil, Bengali)

### Phase 3 (6 months)
- Federated learning across instances
- Scammer pattern database
- Integration with Cyber Crime portals
- Real-time alerts to banks

### Phase 4 (12 months)
- Mobile app for instant handoff
- Browser extension for phishing links
- AI that detects scams automatically
- Partnership with telecom providers

---

## Sample Questions & Answers

**Q: How does the AI avoid revealing it's not human?**
A: The AI uses natural delays, typos, confusion, and personal anecdotes that mirror how real elderly victims behave on calls.

**Q: What if the scammer realizes it's AI?**
A: Even if they disconnect, we've already extracted valuable intelligence. Every second wasted is a win.

**Q: How accurate is the entity extraction?**
A: Our regex patterns achieve 95%+ accuracy on UPI IDs and phone numbers. spaCy NER adds organization detection.

**Q: Can this be misused?**
A: The system requires explicit user consent and only works when user initiates. We don't auto-engage anyone.

**Q: What's the business model?**
A: B2G (government cyber cells), B2B (banks, telecom), and B2C (premium consumer protection).
