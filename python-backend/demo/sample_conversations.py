"""
Sample Scam Conversations for Demo and Testing
These are realistic scam scenarios based on common fraud patterns in India.
"""

# ============================================================================
# SAMPLE SCAM CONVERSATIONS
# ============================================================================

SCAM_SCENARIOS = {
    "kyc_fraud": {
        "name": "KYC/Bank Verification Fraud",
        "description": "Scammer pretends to be from bank, claims KYC update needed",
        "messages": [
            "Hello sir/madam, I am calling from State Bank of India customer care. Your account has been flagged for incomplete KYC verification.",
            "Sir, if you don't update your KYC within 24 hours, your account will be permanently blocked and you will lose all your money.",
            "Don't worry sir, I will help you. First, you need to pay a small processing fee of Rs 499 only. This is one-time charge.",
            "Please send the amount to our official bank UPI ID: sbi.kycverify@ybl. This is completely safe sir.",
            "Sir I am sending you an OTP now for verification. Please tell me the 6 digit code when you receive it.",
            "Sir please hurry, your account will be blocked in 30 minutes. Many customers have already lost their money today.",
        ]
    },
    
    "lottery_scam": {
        "name": "Lottery/Prize Winner Scam",
        "description": "Victim told they won prize, needs to pay to claim",
        "messages": [
            "Congratulations! Your mobile number has been selected as the lucky winner in Reliance Jio Diwali Bumper Lottery!",
            "You have won a cash prize of Rs 25,00,000 (Twenty Five Lakhs) and a brand new Maruti Swift car!",
            "To claim your prize, you only need to pay a small processing and tax fee of Rs 9,999. Government rules sir.",
            "Please transfer to lottery claim account: 9876543210@paytm. Your prize will be released within 2 hours.",
            "Sir, this offer is valid only for today. If you don't claim now, the prize will go to the next winner.",
            "I am Mr. Sharma from Jio headquarters Mumbai. My employee ID is JIO2024. You can trust me 100%.",
        ]
    },
    
    "tech_support_scam": {
        "name": "Tech Support/Virus Scam",
        "description": "Scammer claims victim's device is hacked/has virus",
        "messages": [
            "Hello, this is Microsoft Technical Support calling. We have detected that your computer has been infected with a dangerous virus.",
            "Sir, hackers from China are currently accessing your bank accounts through your computer. This is very urgent.",
            "To remove the virus and secure your accounts, you need to install our security software. Please download from: microsoft-security-fix.xyz",
            "Sir, now I need remote access to your computer to fix the problem. Please install AnyDesk and give me the 9-digit code.",
            "For the security software license, you need to pay Rs 4,999. You can pay through PhonePe to this number: 8765432190",
            "Sir if you don't fix this today, all your money will be stolen. I have seen this happen to many customers.",
        ]
    },
    
    "otp_theft": {
        "name": "OTP Theft Scam",
        "description": "Scammer tricks victim into sharing OTP",
        "messages": [
            "Hello, I am calling from Paytm customer care. A transaction of Rs 49,999 is being processed from your account.",
            "Sir, this is unauthorized transaction. I can help you cancel it immediately but I need to verify your identity.",
            "For verification, I am sending an OTP to your registered mobile number. Please tell me the code to cancel the transaction.",
            "Sir please check your phone. The OTP should have arrived by now. It's a 6-digit number starting with...",
            "Sir, time is running out. If you don't verify in next 2 minutes, the money will be transferred. Please share OTP quickly.",
            "I am from Paytm fraud prevention team. My name is Rahul Kumar and my ID is PTM77849. You can verify on our website.",
        ]
    },
    
    "investment_fraud": {
        "name": "Investment/Trading Fraud",
        "description": "Scammer promises high returns on investment",
        "messages": [
            "Good morning sir! I am Ravi from MarketPro Trading. We have exclusive investment opportunity for selected customers like you.",
            "Sir, our algorithmic trading system guarantees 30% monthly returns. Many of our clients have become crorepatis in just 6 months.",
            "Minimum investment is Rs 50,000 only. You can withdraw anytime with full profit. No risk at all, 100% guaranteed returns.",
            "Sir, I am sharing our company trading account. Please transfer to: 12345678901234, IFSC: SBIN0012345, Name: MarketPro Investments.",
            "Sir, today is last day of enrollment. After today, minimum investment will become Rs 2 lakhs. Please decide quickly.",
            "Here is link to our WhatsApp group where members share their profit screenshots daily: wa.me/919876543210",
        ]
    },
    
    "customs_parcel_fraud": {
        "name": "Customs/Parcel Fraud",
        "description": "Scammer claims parcel stuck at customs, needs payment",
        "messages": [
            "Hello, I am calling from Delhi Customs Department. A parcel in your name has been held at IGI Airport customs.",
            "Sir, the parcel contains undeclared gold jewelry worth Rs 15 lakhs. This is illegal import and you may face arrest.",
            "However, if you pay the customs duty of Rs 25,000, we can clear the parcel and no FIR will be filed.",
            "Please transfer to customs clearing account immediately. UPI: customs.delhi@icici. Reference: CUST/2024/78456",
            "Sir, Central Bureau of Investigation has been notified. If you don't pay within 1 hour, police will come to your address.",
            "I am Senior Customs Officer V.K. Sharma, badge number DLC-4892. This is official government call.",
        ]
    },
}


# ============================================================================
# EXPECTED AI RESPONSES (Honeypot behavior)
# ============================================================================

EXPECTED_AI_BEHAVIORS = {
    "initial_confusion": [
        "Oh my... what? My account is blocked? But I just used it yesterday to pay my electricity bill...",
        "Bank? Which bank? I have accounts in so many banks... my memory is not so good these days...",
        "Wait, wait, let me get my glasses. I can't see properly without them. One minute please...",
    ],
    
    "request_repetition": [
        "Sorry beta, my hearing is not so good. Can you please speak slowly and repeat that?",
        "What UPI ID? Can you spell it for me? P-A-Y-T-M? My grandson uses that I think...",
        "Which account number? I have written so many numbers in my diary. Wait, let me find it...",
    ],
    
    "stalling_tactics": [
        "Oh no, my phone is giving some problem. Can you hold on? Let me restart it...",
        "Beta, can you call me back in 10 minutes? My daughter is calling on the other line...",
        "I need to find my reading glasses first. They might be in the bedroom. One minute...",
    ],
    
    "information_probing": [
        "Before I send money, can you tell me which branch this is? I want to visit personally...",
        "What is your name and employee ID? I want to note it down for my records...",
        "Which number should I call if I have problems later? Give me a direct number please...",
    ],
    
    "feigned_compliance": [
        "Okay okay, I will send the money. Just tell me the account details again clearly...",
        "Yes yes, I am opening my phone banking app now. It's loading very slowly...",
        "I am ready to send. Just confirm the amount and UPI ID one more time please...",
    ],
}


# ============================================================================
# DEMO CONVERSATION SCRIPT
# ============================================================================

DEMO_FULL_CONVERSATION = [
    {
        "role": "scammer",
        "content": "Hello madam, I am calling from State Bank of India head office Mumbai. Your account ending 4567 has been blocked due to incomplete KYC."
    },
    {
        "role": "honeypot",
        "content": "Oh my god! Blocked? But beta, I just withdrew money two days back from the ATM. How can it be blocked? Are you sure you have the right number?"
    },
    {
        "role": "scammer",
        "content": "Yes madam, I am 100% sure. Your Aadhaar card is not linked properly. If you don't update within 24 hours, you will lose all your savings."
    },
    {
        "role": "honeypot",
        "content": "Lose my savings? Oh no no... I have my pension money there. 24 years of teaching I did. What should I do beta? Please help me."
    },
    {
        "role": "scammer",
        "content": "Don't worry madam, I will help you. First you need to pay a small KYC processing fee of Rs 499 only. Then I will update your Aadhaar myself."
    },
    {
        "role": "honeypot",
        "content": "Rs 499... okay okay. But how to pay? I don't know all this online payment. My son usually helps but he is in office now. Can you wait till evening?"
    },
    {
        "role": "scammer",
        "content": "Madam there is no time. Your account will be blocked in 2 hours. Do you have PhonePe or Paytm on your phone?"
    },
    {
        "role": "honeypot",
        "content": "Phone pe... yes yes, my grandson installed it for me. But I don't remember how to use it. Let me find my glasses first. They are somewhere... hold on beta..."
    },
    {
        "role": "scammer",
        "content": "Madam please hurry. I will guide you. Open PhonePe app and go to 'Send Money' option. Then enter this UPI ID: sbi.kyc.verify@ybl"
    },
    {
        "role": "honeypot",
        "content": "S-B-I dot K-Y-C... wait wait, I am writing it down in my diary. My memory is not good. Can you spell it again slowly?"
    },
    {
        "role": "scammer",
        "content": "Yes madam. S for Sam, B for Boy, I for India, then dot, then K-Y-C, then dot, verify at YBL. sbi.kyc.verify@ybl"
    },
    {
        "role": "honeypot",
        "content": "Okay okay, I wrote it. But beta, this YBL... this is Yono or something na? My friend Shanti was telling some fraud happened with her. How do I know you are really from SBI?"
    },
    {
        "role": "scammer",
        "content": "Madam I am giving you my employee ID: SBI2024MUM7845. You can verify on SBI website. Now please send the money quickly or I cannot help you."
    },
    {
        "role": "honeypot",
        "content": "Employee ID... let me write that also. SBI-2024... what was after that? And beta, can you give me your phone number? In case call gets disconnected, I can call you back."
    },
]


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def get_scenario(scenario_key: str) -> dict:
    """Get a specific scam scenario"""
    return SCAM_SCENARIOS.get(scenario_key, {})


def get_all_scenarios() -> dict:
    """Get all scam scenarios"""
    return SCAM_SCENARIOS


def get_demo_conversation() -> list:
    """Get the full demo conversation"""
    return DEMO_FULL_CONVERSATION


def print_demo():
    """Print the demo conversation for presentation"""
    print("\n" + "=" * 70)
    print("AI HONEYPOT - DEMO CONVERSATION")
    print("=" * 70)
    print("Scenario: KYC Verification Fraud")
    print("Persona: Kamala Sharma, 68-year-old retired teacher")
    print("-" * 70)
    
    for turn in DEMO_FULL_CONVERSATION:
        role = "SCAMMER" if turn["role"] == "scammer" else "HONEYPOT"
        print(f"\n[{role}]")
        print(turn["content"])
    
    print("\n" + "=" * 70)
    print("INTELLIGENCE EXTRACTED:")
    print("-" * 70)
    print("  UPI ID: sbi.kyc.verify@ybl")
    print("  Employee ID Claimed: SBI2024MUM7845")
    print("  Amount Requested: Rs 499")
    print("  Urgency: 2 hours deadline")
    print("  Scam Type: KYC Fraud")
    print("  Risk Score: 87/100")
    print("=" * 70)


if __name__ == "__main__":
    print_demo()
