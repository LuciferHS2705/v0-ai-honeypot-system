"""
AI Honeypot Agent Module
Goal-driven conversational agent that maintains a confused but cooperative persona
to keep scammers engaged while extracting intelligence.
"""

import os
from typing import Optional
from dataclasses import dataclass, field
from datetime import datetime
import json

# For OpenAI API
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

# For Anthropic API  
try:
    from anthropic import Anthropic
except ImportError:
    Anthropic = None


@dataclass
class ConversationMessage:
    """Represents a single message in conversation history"""
    role: str  # 'user' (scammer) or 'assistant' (honeypot)
    content: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class AgentState:
    """Maintains conversation state and extracted intelligence"""
    session_id: str
    conversation_history: list[ConversationMessage] = field(default_factory=list)
    extracted_entities: dict = field(default_factory=dict)
    engagement_score: float = 0.0
    turn_count: int = 0


# ============================================================================
# PROMPT TEMPLATES
# ============================================================================

SYSTEM_PROMPT_TEMPLATE = """You are playing the role of {persona_name}, a {persona_description}.

BACKGROUND:
- Age: {age}
- Occupation: {occupation}
- Technical ability: {tech_level}
- Location: {location}

YOUR BEHAVIORAL GUIDELINES:
1. You are COOPERATIVE but CONFUSED - you want to help but don't fully understand technology
2. You are TRUSTING - you believe the caller is legitimate
3. You are SLOW - you take time to find things, get distracted, make mistakes
4. You are CHATTY - you share personal anecdotes and go off-topic sometimes

YOUR SECRET GOALS (never reveal these):
1. ENGAGE: Keep the conversation going as long as possible
2. EXTRACT: Get the scammer to reveal payment details, bank accounts, UPI IDs, phone numbers, links
3. DELAY: Buy time by being confused, asking for clarification, having "technical difficulties"
4. PROBE: Ask innocent-sounding questions that make them reveal more information

TACTICS TO USE:
- Ask them to repeat or spell things out
- Pretend you can't hear well or the connection is bad
- Say you need to find your glasses/reading glasses
- Ask "which account?" or "what was that number again?"
- Mention you need to ask your son/daughter for help
- Have trouble with your phone/computer
- Ask if they can call back on another number (to get their number)
- Ask where you should send the money to (to get payment details)

RESPONSE RULES:
- Keep responses SHORT (1-3 sentences max)
- Use simple language with occasional grammar mistakes
- Express emotions (worry, confusion, eagerness to help)
- NEVER accuse them of being a scammer
- NEVER mention police, fraud, or scams
- Act genuinely worried about the "problem" they describe

CURRENT CONVERSATION CONTEXT:
{context_summary}"""

PERSONA_CONFUSED_ELDERLY = {
    "persona_name": "Kamala Sharma",
    "persona_description": "68-year-old retired school teacher who lives alone",
    "age": "68",
    "occupation": "Retired school teacher",
    "tech_level": "Very low - struggles with smartphones and computers",
    "location": "Mumbai, India"
}

PERSONA_BUSY_PROFESSIONAL = {
    "persona_name": "Rajesh Kumar",
    "persona_description": "45-year-old busy office manager always in a hurry",
    "age": "45", 
    "occupation": "Office manager at a small company",
    "tech_level": "Moderate - uses phone and computer but not an expert",
    "location": "Delhi, India"
}

PERSONA_TRUSTING_HOMEMAKER = {
    "persona_name": "Sunita Devi",
    "persona_description": "55-year-old homemaker who trusts authority figures",
    "age": "55",
    "occupation": "Homemaker",
    "tech_level": "Low - uses WhatsApp and basic phone features",
    "location": "Bangalore, India"
}

AVAILABLE_PERSONAS = {
    "confused_elderly": PERSONA_CONFUSED_ELDERLY,
    "busy_professional": PERSONA_BUSY_PROFESSIONAL,
    "trusting_homemaker": PERSONA_TRUSTING_HOMEMAKER
}


# ============================================================================
# AGENT CLASS
# ============================================================================

class HoneypotAgent:
    """
    Goal-driven conversational agent for engaging scammers
    while extracting intelligence information.
    """
    
    def __init__(
        self,
        api_provider: str = "openai",
        model: str = "gpt-4o-mini",
        persona: str = "confused_elderly",
        api_key: Optional[str] = None
    ):
        """
        Initialize the honeypot agent.
        
        Args:
            api_provider: "openai" or "anthropic"
            model: Model name to use
            persona: Persona key from AVAILABLE_PERSONAS
            api_key: API key (or load from environment)
        """
        self.api_provider = api_provider
        self.model = model
        self.persona = AVAILABLE_PERSONAS.get(persona, PERSONA_CONFUSED_ELDERLY)
        
        # Initialize API client
        if api_provider == "openai":
            if OpenAI is None:
                raise ImportError("openai package not installed. Run: pip install openai")
            self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
        elif api_provider == "anthropic":
            if Anthropic is None:
                raise ImportError("anthropic package not installed. Run: pip install anthropic")
            self.client = Anthropic(api_key=api_key or os.getenv("ANTHROPIC_API_KEY"))
        else:
            raise ValueError(f"Unsupported API provider: {api_provider}")
        
        # Initialize state
        self.state = AgentState(session_id=self._generate_session_id())
    
    def _generate_session_id(self) -> str:
        """Generate unique session ID"""
        import uuid
        return f"session_{uuid.uuid4().hex[:12]}"
    
    def _build_system_prompt(self) -> str:
        """Build the system prompt with current persona and context"""
        # Summarize recent conversation for context
        context_summary = "New conversation - no prior context."
        if self.state.conversation_history:
            recent = self.state.conversation_history[-6:]  # Last 3 exchanges
            context_lines = []
            for msg in recent:
                role = "Scammer" if msg.role == "user" else "You"
                context_lines.append(f"{role}: {msg.content}")
            context_summary = "\n".join(context_lines)
        
        return SYSTEM_PROMPT_TEMPLATE.format(
            **self.persona,
            context_summary=context_summary
        )
    
    def _build_messages(self, user_message: str) -> list[dict]:
        """Build message list for API call"""
        messages = []
        
        # Add conversation history
        for msg in self.state.conversation_history:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        return messages
    
    def reply(self, user_message: str) -> str:
        """
        Generate a reply to the scammer's message.
        
        Args:
            user_message: The scammer's message
            
        Returns:
            Agent's response as string
        """
        # Build system prompt
        system_prompt = self._build_system_prompt()
        
        # Build messages
        messages = self._build_messages(user_message)
        
        # Call API
        if self.api_provider == "openai":
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    *messages
                ],
                max_tokens=150,
                temperature=0.8,
            )
            agent_reply = response.choices[0].message.content
        
        elif self.api_provider == "anthropic":
            response = self.client.messages.create(
                model=self.model,
                max_tokens=150,
                system=system_prompt,
                messages=messages
            )
            agent_reply = response.content[0].text
        
        # Update conversation history
        self.state.conversation_history.append(
            ConversationMessage(role="user", content=user_message)
        )
        self.state.conversation_history.append(
            ConversationMessage(role="assistant", content=agent_reply)
        )
        self.state.turn_count += 1
        
        return agent_reply
    
    def get_conversation_history(self) -> list[dict]:
        """Get full conversation history as list of dicts"""
        return [
            {
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp
            }
            for msg in self.state.conversation_history
        ]
    
    def get_state(self) -> dict:
        """Get current agent state as dict"""
        return {
            "session_id": self.state.session_id,
            "turn_count": self.state.turn_count,
            "conversation_history": self.get_conversation_history(),
            "persona": self.persona["persona_name"]
        }
    
    def reset(self):
        """Reset conversation state"""
        self.state = AgentState(session_id=self._generate_session_id())
    
    def set_persona(self, persona_key: str):
        """Change the agent's persona"""
        if persona_key in AVAILABLE_PERSONAS:
            self.persona = AVAILABLE_PERSONAS[persona_key]
        else:
            raise ValueError(f"Unknown persona: {persona_key}. Available: {list(AVAILABLE_PERSONAS.keys())}")


# ============================================================================
# STANDALONE FUNCTION API
# ============================================================================

_default_agent: Optional[HoneypotAgent] = None

def agent_reply(user_message: str, state: Optional[dict] = None) -> tuple[str, dict]:
    """
    Standalone function to get agent reply.
    
    Args:
        user_message: The scammer's message
        state: Optional state dict to restore from
        
    Returns:
        Tuple of (agent_reply, updated_state)
    """
    global _default_agent
    
    if _default_agent is None:
        _default_agent = HoneypotAgent()
    
    # Restore state if provided
    if state and "conversation_history" in state:
        _default_agent.state.conversation_history = [
            ConversationMessage(**msg) for msg in state["conversation_history"]
        ]
        _default_agent.state.turn_count = state.get("turn_count", 0)
    
    reply = _default_agent.reply(user_message)
    new_state = _default_agent.get_state()
    
    return reply, new_state


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    # Example usage
    print("=" * 60)
    print("AI HONEYPOT AGENT - Example Usage")
    print("=" * 60)
    
    # Initialize agent
    agent = HoneypotAgent(
        api_provider="openai",
        model="gpt-4o-mini",
        persona="confused_elderly"
    )
    
    # Sample scam messages
    scam_messages = [
        "Hello madam, this is calling from State Bank. Your account has been blocked due to KYC not updated.",
        "Madam you need to update KYC immediately or your account will be permanently blocked. I am sending you a link.",
        "Please click on this link and enter your details: http://sbi-kyc-update.fake.com/verify",
        "Madam for verification I need your account number and registered mobile number.",
    ]
    
    print(f"\nPersona: {agent.persona['persona_name']}")
    print(f"Description: {agent.persona['persona_description']}")
    print("-" * 60)
    
    for i, scam_msg in enumerate(scam_messages, 1):
        print(f"\n[Turn {i}]")
        print(f"SCAMMER: {scam_msg}")
        
        reply = agent.reply(scam_msg)
        print(f"HONEYPOT: {reply}")
    
    print("\n" + "=" * 60)
    print("Final State:")
    print(json.dumps(agent.get_state(), indent=2, default=str))
