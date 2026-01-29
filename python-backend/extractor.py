"""
NLP Intelligence Extraction Module
Extracts UPI IDs, phone numbers, URLs, bank accounts, and organizations
from conversation text using regex patterns and spaCy NER.
"""

import re
import json
from typing import Optional
from dataclasses import dataclass, field
from datetime import datetime
from collections import defaultdict

# Try to import spaCy
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    spacy = None


# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class ExtractedEntity:
    """Represents a single extracted entity"""
    entity_type: str
    value: str
    confidence: float
    source_text: str
    position: tuple[int, int] = (0, 0)
    metadata: dict = field(default_factory=dict)


@dataclass
class ExtractionResult:
    """Complete extraction result with all entities and scores"""
    entities: list[ExtractedEntity]
    risk_score: float
    scam_indicators: list[str]
    scam_type: Optional[str]
    confidence_score: float
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def to_dict(self) -> dict:
        return {
            "entities": [
                {
                    "type": e.entity_type,
                    "value": e.value,
                    "confidence": e.confidence,
                    "source": e.source_text,
                    "metadata": e.metadata
                }
                for e in self.entities
            ],
            "risk_score": self.risk_score,
            "scam_indicators": self.scam_indicators,
            "scam_type": self.scam_type,
            "confidence_score": self.confidence_score,
            "timestamp": self.timestamp,
            "summary": {
                "total_entities": len(self.entities),
                "entity_breakdown": self._get_entity_breakdown()
            }
        }
    
    def _get_entity_breakdown(self) -> dict:
        breakdown = defaultdict(int)
        for e in self.entities:
            breakdown[e.entity_type] += 1
        return dict(breakdown)


# ============================================================================
# REGEX PATTERNS
# ============================================================================

PATTERNS = {
    # UPI ID patterns (user@bank format)
    "upi_id": [
        r'\b[a-zA-Z0-9._-]+@(?:upi|paytm|gpay|phonepe|ybl|oksbi|okicici|okaxis|okhdfcbank|axl|ibl|sbi|icici|hdfc|axis|kotak|indus|federal|rbl|yes|idbi|pnb|bob|union|canara|boi|cbi|indian|iob|uco|syndicate|andhra|allahabad|vijaya|dena|corp)\b',
        r'\b[a-zA-Z0-9._-]+@[a-zA-Z]{2,10}\b(?=.*(?:upi|pay|send|transfer))',
    ],
    
    # Indian phone numbers
    "phone_number": [
        r'\b(?:\+91[-\s]?)?[6-9]\d{9}\b',
        r'\b(?:\+91[-\s]?)?\d{5}[-\s]?\d{5}\b',
        r'\b91[6-9]\d{9}\b',
    ],
    
    # URLs
    "url": [
        r'https?://[^\s<>"{}|\\^`\[\]]+',
        r'www\.[^\s<>"{}|\\^`\[\]]+',
        r'\b[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:/[^\s]*)?',
    ],
    
    # Bank account numbers
    "bank_account": [
        r'\b\d{9,18}\b(?=.*(?:account|a/c|ac|acct))',
        r'(?:account|a/c|ac|acct)[\s:]*(\d{9,18})\b',
    ],
    
    # IFSC codes
    "ifsc_code": [
        r'\b[A-Z]{4}0[A-Z0-9]{6}\b',
    ],
    
    # Email addresses
    "email": [
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    ],
    
    # Aadhaar numbers (masked detection)
    "aadhaar": [
        r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
    ],
    
    # PAN numbers
    "pan_number": [
        r'\b[A-Z]{5}\d{4}[A-Z]\b',
    ],
    
    # OTP patterns
    "otp_mention": [
        r'\b(?:otp|one[-\s]?time[-\s]?password)[\s:]*(\d{4,8})?\b',
        r'\b\d{4,6}\b(?=.*(?:otp|code|verify))',
    ],
    
    # Card numbers (partial detection)
    "card_number": [
        r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
        r'\b\d{16}\b',
    ],
    
    # CVV mentions
    "cvv_mention": [
        r'\b(?:cvv|cvc|security[-\s]?code)[\s:]*(\d{3,4})?\b',
    ],
}

# Scam indicator patterns
SCAM_INDICATORS = {
    "urgency": [
        r'\b(?:urgent|immediately|right\s*now|asap|hurry|quick|fast|today|within\s*\d+\s*(?:hour|minute|min))\b',
        r'\b(?:deadline|expir|block|suspend|deactivat|terminat)\w*\b',
    ],
    "fear": [
        r'\b(?:illegal|fraud|arrest|police|court|legal\s*action|complain|fir|case)\b',
        r'\b(?:hack|compromis|breach|unauthori[sz]ed|suspicious\s*activity)\b',
    ],
    "authority_impersonation": [
        r'\b(?:rbi|reserve\s*bank|government|ministry|cyber\s*cell|income\s*tax)\b',
        r'\b(?:bank\s*manager|senior\s*officer|executive|department)\b',
    ],
    "reward_lure": [
        r'\b(?:won|winner|prize|lottery|jackpot|reward|cashback|bonus|gift)\b',
        r'\b(?:lucky|selected|chosen|congratulat)\b',
    ],
    "payment_request": [
        r'\b(?:pay|send|transfer|deposit|fee|charge|tax|processing)\b',
        r'\b(?:upi|neft|imps|rtgs|paytm|gpay|phonepe)\b',
    ],
    "kyc_verification": [
        r'\b(?:kyc|verification|verify|update|link\s*aadhaar|pan)\b',
        r'\b(?:document|identity|proof)\b',
    ],
    "link_sharing": [
        r'\b(?:click|tap|open|visit|link|url|website)\b',
        r'(?:http|www\.)',
    ],
    "otp_request": [
        r'\b(?:otp|one[-\s]?time|code|pin|password)\b',
        r'\b(?:share|tell|send|provide).*(?:otp|code|pin)\b',
    ],
}

# Known scam types
SCAM_TYPES = {
    "kyc_fraud": ["kyc", "verification", "update", "bank", "account blocked"],
    "lottery_scam": ["won", "prize", "lottery", "winner", "claim"],
    "tech_support": ["virus", "hack", "compromised", "security", "remote"],
    "otp_theft": ["otp", "code", "verify", "transaction"],
    "investment_fraud": ["invest", "return", "profit", "scheme", "double"],
    "loan_fraud": ["loan", "approved", "instant", "low interest", "processing fee"],
    "job_scam": ["job", "offer", "work from home", "salary", "registration"],
    "customs_fraud": ["customs", "parcel", "courier", "clearance", "duty"],
}

# Known organization names for validation
KNOWN_BANKS = [
    "sbi", "state bank", "hdfc", "icici", "axis", "kotak", "pnb", "punjab national",
    "bank of baroda", "bob", "canara", "union bank", "idbi", "yes bank", "rbl",
    "federal bank", "indusind", "bandhan", "paytm payments bank", "airtel payments"
]

KNOWN_PAYMENT_APPS = [
    "paytm", "phonepe", "google pay", "gpay", "amazon pay", "bhim", "mobikwik",
    "freecharge", "whatsapp pay", "cred"
]


# ============================================================================
# EXTRACTOR CLASS
# ============================================================================

class IntelligenceExtractor:
    """
    Extracts intelligence from conversation text using
    regex patterns and optional spaCy NER.
    """
    
    def __init__(self, use_spacy: bool = True, spacy_model: str = "en_core_web_sm"):
        """
        Initialize the extractor.
        
        Args:
            use_spacy: Whether to use spaCy NER
            spacy_model: spaCy model to load
        """
        self.nlp = None
        if use_spacy and SPACY_AVAILABLE:
            try:
                self.nlp = spacy.load(spacy_model)
            except OSError:
                print(f"Warning: spaCy model '{spacy_model}' not found. Run: python -m spacy download {spacy_model}")
                self.nlp = None
    
    def extract(self, text: str) -> ExtractionResult:
        """
        Extract all intelligence from text.
        
        Args:
            text: Input text to analyze
            
        Returns:
            ExtractionResult with all extracted entities and scores
        """
        entities = []
        
        # Extract using regex patterns
        entities.extend(self._extract_with_regex(text))
        
        # Extract using spaCy NER
        if self.nlp:
            entities.extend(self._extract_with_spacy(text))
        
        # Deduplicate entities
        entities = self._deduplicate_entities(entities)
        
        # Detect scam indicators
        scam_indicators = self._detect_scam_indicators(text)
        
        # Classify scam type
        scam_type = self._classify_scam_type(text)
        
        # Calculate scores
        risk_score = self._calculate_risk_score(entities, scam_indicators)
        confidence_score = self._calculate_confidence_score(entities)
        
        return ExtractionResult(
            entities=entities,
            risk_score=risk_score,
            scam_indicators=scam_indicators,
            scam_type=scam_type,
            confidence_score=confidence_score
        )
    
    def _extract_with_regex(self, text: str) -> list[ExtractedEntity]:
        """Extract entities using regex patterns"""
        entities = []
        text_lower = text.lower()
        
        for entity_type, patterns in PATTERNS.items():
            for pattern in patterns:
                try:
                    for match in re.finditer(pattern, text, re.IGNORECASE):
                        value = match.group(1) if match.lastindex else match.group(0)
                        
                        # Validate and clean the value
                        value = self._clean_value(entity_type, value)
                        if not value:
                            continue
                        
                        # Calculate confidence based on pattern specificity
                        confidence = self._calculate_pattern_confidence(entity_type, value, text_lower)
                        
                        entities.append(ExtractedEntity(
                            entity_type=entity_type,
                            value=value,
                            confidence=confidence,
                            source_text=match.group(0),
                            position=(match.start(), match.end()),
                            metadata={"extraction_method": "regex"}
                        ))
                except re.error:
                    continue
        
        return entities
    
    def _extract_with_spacy(self, text: str) -> list[ExtractedEntity]:
        """Extract entities using spaCy NER"""
        entities = []
        doc = self.nlp(text)
        
        for ent in doc.ents:
            entity_type = None
            confidence = 0.7
            
            # Map spaCy entity types
            if ent.label_ == "ORG":
                # Check if it's a known bank or payment app
                ent_lower = ent.text.lower()
                if any(bank in ent_lower for bank in KNOWN_BANKS):
                    entity_type = "bank_organization"
                    confidence = 0.9
                elif any(app in ent_lower for app in KNOWN_PAYMENT_APPS):
                    entity_type = "payment_app"
                    confidence = 0.9
                else:
                    entity_type = "organization"
                    confidence = 0.7
            
            elif ent.label_ == "PERSON":
                entity_type = "person_name"
                confidence = 0.6
            
            elif ent.label_ == "MONEY":
                entity_type = "money_amount"
                confidence = 0.85
            
            elif ent.label_ == "DATE":
                entity_type = "date_reference"
                confidence = 0.75
            
            if entity_type:
                entities.append(ExtractedEntity(
                    entity_type=entity_type,
                    value=ent.text,
                    confidence=confidence,
                    source_text=ent.text,
                    position=(ent.start_char, ent.end_char),
                    metadata={"extraction_method": "spacy", "spacy_label": ent.label_}
                ))
        
        return entities
    
    def _clean_value(self, entity_type: str, value: str) -> Optional[str]:
        """Clean and validate extracted value"""
        if not value:
            return None
        
        value = value.strip()
        
        if entity_type == "phone_number":
            # Remove non-digit characters for validation
            digits = re.sub(r'\D', '', value)
            if len(digits) < 10 or len(digits) > 13:
                return None
            return value
        
        if entity_type == "upi_id":
            if "@" not in value:
                return None
            return value.lower()
        
        if entity_type == "url":
            if len(value) < 5:
                return None
            return value
        
        if entity_type == "bank_account":
            digits = re.sub(r'\D', '', value)
            if len(digits) < 9 or len(digits) > 18:
                return None
            return digits
        
        return value
    
    def _calculate_pattern_confidence(self, entity_type: str, value: str, text_lower: str) -> float:
        """Calculate confidence score based on pattern and context"""
        base_confidence = 0.7
        
        # High confidence entities
        if entity_type in ["upi_id", "ifsc_code", "pan_number"]:
            base_confidence = 0.95
        
        elif entity_type == "phone_number":
            # Higher confidence if mentioned with context
            if any(kw in text_lower for kw in ["call", "number", "mobile", "phone", "contact"]):
                base_confidence = 0.9
            else:
                base_confidence = 0.75
        
        elif entity_type == "url":
            # Lower confidence for common domains
            if any(d in value.lower() for d in ["google.com", "facebook.com", "youtube.com"]):
                base_confidence = 0.5
            else:
                base_confidence = 0.85
        
        elif entity_type in ["otp_mention", "cvv_mention"]:
            base_confidence = 0.8
        
        return base_confidence
    
    def _deduplicate_entities(self, entities: list[ExtractedEntity]) -> list[ExtractedEntity]:
        """Remove duplicate entities, keeping highest confidence"""
        seen = {}
        for entity in entities:
            key = (entity.entity_type, entity.value)
            if key not in seen or entity.confidence > seen[key].confidence:
                seen[key] = entity
        return list(seen.values())
    
    def _detect_scam_indicators(self, text: str) -> list[str]:
        """Detect scam indicators in text"""
        indicators = []
        text_lower = text.lower()
        
        for indicator_type, patterns in SCAM_INDICATORS.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    indicators.append(indicator_type)
                    break
        
        return list(set(indicators))
    
    def _classify_scam_type(self, text: str) -> Optional[str]:
        """Classify the type of scam based on keywords"""
        text_lower = text.lower()
        scores = {}
        
        for scam_type, keywords in SCAM_TYPES.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            if score > 0:
                scores[scam_type] = score
        
        if scores:
            return max(scores, key=scores.get)
        return None
    
    def _calculate_risk_score(self, entities: list[ExtractedEntity], indicators: list[str]) -> float:
        """Calculate overall risk score (0-100)"""
        score = 0.0
        
        # Entity-based scoring
        entity_weights = {
            "upi_id": 25,
            "phone_number": 15,
            "url": 20,
            "bank_account": 25,
            "ifsc_code": 15,
            "otp_mention": 20,
            "cvv_mention": 25,
            "card_number": 25,
            "bank_organization": 10,
            "payment_app": 10,
        }
        
        for entity in entities:
            weight = entity_weights.get(entity.entity_type, 5)
            score += weight * entity.confidence
        
        # Indicator-based scoring
        indicator_weights = {
            "urgency": 15,
            "fear": 20,
            "authority_impersonation": 15,
            "reward_lure": 10,
            "payment_request": 15,
            "kyc_verification": 10,
            "link_sharing": 10,
            "otp_request": 20,
        }
        
        for indicator in indicators:
            score += indicator_weights.get(indicator, 5)
        
        return min(100.0, score)
    
    def _calculate_confidence_score(self, entities: list[ExtractedEntity]) -> float:
        """Calculate overall confidence in extraction"""
        if not entities:
            return 0.0
        
        total_confidence = sum(e.confidence for e in entities)
        return total_confidence / len(entities)


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================

def extract_intelligence(text: str, use_spacy: bool = False) -> dict:
    """
    Convenience function to extract intelligence from text.
    
    Args:
        text: Input text to analyze
        use_spacy: Whether to use spaCy NER
        
    Returns:
        Dictionary with extraction results
    """
    extractor = IntelligenceExtractor(use_spacy=use_spacy)
    result = extractor.extract(text)
    return result.to_dict()


def extract_from_conversation(messages: list[dict], use_spacy: bool = False) -> dict:
    """
    Extract intelligence from a full conversation.
    
    Args:
        messages: List of message dicts with 'role' and 'content'
        use_spacy: Whether to use spaCy NER
        
    Returns:
        Dictionary with extraction results
    """
    # Combine all messages into one text
    full_text = "\n".join(
        f"{msg.get('role', 'unknown')}: {msg.get('content', '')}"
        for msg in messages
    )
    
    return extract_intelligence(full_text, use_spacy)


# ============================================================================
# EXAMPLE USAGE AND TESTS
# ============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("INTELLIGENCE EXTRACTOR - Test Cases")
    print("=" * 60)
    
    # Test cases
    test_texts = [
        # Test case 1: UPI and phone
        """
        Hello sir, your account has been blocked. Please pay Rs 500 to this UPI ID 
        fraudster@paytm immediately. Call me at +91 9876543210 for help.
        """,
        
        # Test case 2: URL and urgency
        """
        URGENT: Your SBI account KYC is expiring! Click this link immediately:
        http://sbi-kyc-update.fake.com/verify or your account will be blocked within 2 hours.
        """,
        
        # Test case 3: Bank details
        """
        Sir, I am calling from RBI. For refund, please share your account number 12345678901234
        and IFSC code SBIN0001234. Also need your OTP for verification.
        """,
        
        # Test case 4: Lottery scam
        """
        Congratulations! You have won Rs 50,00,000 in the International Lottery!
        To claim your prize, pay processing fee of Rs 5000 to gpay@lottery
        Contact: 8765432109
        """,
        
        # Test case 5: Mixed entities
        """
        Dear customer, suspicious activity detected on your HDFC account ending 4567.
        Your card 4532-XXXX-XXXX-1234 may be compromised. Share CVV and OTP 847291
        to verify. Visit www.hdfc-security.fake.in or call 7654321098
        """,
    ]
    
    extractor = IntelligenceExtractor(use_spacy=False)
    
    for i, text in enumerate(test_texts, 1):
        print(f"\n{'='*60}")
        print(f"TEST CASE {i}")
        print(f"{'='*60}")
        print(f"INPUT:\n{text.strip()}")
        print(f"\nRESULT:")
        
        result = extractor.extract(text)
        output = result.to_dict()
        
        print(f"  Risk Score: {output['risk_score']:.1f}/100")
        print(f"  Scam Type: {output['scam_type']}")
        print(f"  Scam Indicators: {', '.join(output['scam_indicators'])}")
        print(f"  Confidence: {output['confidence_score']:.2f}")
        print(f"\n  Entities Found ({len(output['entities'])}):")
        
        for entity in output['entities']:
            print(f"    - [{entity['type']}] {entity['value']} (conf: {entity['confidence']:.2f})")
    
    print(f"\n{'='*60}")
    print("All tests completed!")
