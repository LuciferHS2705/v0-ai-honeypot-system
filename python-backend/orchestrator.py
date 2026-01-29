"""
Conversation Orchestrator Module
Maintains conversation state, logs messages, and manages multi-turn conversations.
"""

import json
import logging
from datetime import datetime
from dataclasses import dataclass, field
from typing import Optional, Callable
from pathlib import Path

from agent import HoneypotAgent, AgentState, AVAILABLE_PERSONAS
from extractor import IntelligenceExtractor, ExtractionResult


# ============================================================================
# LOGGING SETUP
# ============================================================================

def setup_logger(name: str, log_file: Optional[str] = None) -> logging.Logger:
    """Setup logger with file and console handlers"""
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger


# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class ConversationTurn:
    """Represents a single turn in the conversation"""
    turn_number: int
    scammer_message: str
    agent_response: str
    extraction_result: dict
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class ConversationSession:
    """Complete conversation session"""
    session_id: str
    persona: str
    turns: list[ConversationTurn] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    status: str = "active"  # active, completed, exported
    
    def to_dict(self) -> dict:
        return {
            "session_id": self.session_id,
            "persona": self.persona,
            "total_turns": len(self.turns),
            "created_at": self.created_at,
            "status": self.status,
            "turns": [
                {
                    "turn": t.turn_number,
                    "scammer": t.scammer_message,
                    "agent": t.agent_response,
                    "extraction": t.extraction_result,
                    "timestamp": t.timestamp
                }
                for t in self.turns
            ]
        }


# ============================================================================
# ORCHESTRATOR CLASS
# ============================================================================

class ConversationOrchestrator:
    """
    Orchestrates multi-turn conversations between scammer input and AI agent.
    Handles state management, logging, and intelligence extraction.
    """
    
    def __init__(
        self,
        persona: str = "confused_elderly",
        log_file: Optional[str] = None,
        auto_extract: bool = True,
        on_message: Optional[Callable] = None,
        on_extraction: Optional[Callable] = None
    ):
        """
        Initialize the orchestrator.
        
        Args:
            persona: Agent persona to use
            log_file: Path to log file
            auto_extract: Whether to automatically extract intelligence
            on_message: Callback when message is processed
            on_extraction: Callback when extraction is complete
        """
        self.logger = setup_logger("orchestrator", log_file)
        self.auto_extract = auto_extract
        self.on_message = on_message
        self.on_extraction = on_extraction
        
        # Initialize components
        self.agent = HoneypotAgent(persona=persona)
        self.extractor = IntelligenceExtractor(use_spacy=False)
        
        # Initialize session
        self.session = ConversationSession(
            session_id=self.agent.state.session_id,
            persona=persona
        )
        
        self.logger.info(f"Orchestrator initialized with persona: {persona}")
        self.logger.info(f"Session ID: {self.session.session_id}")
    
    def process_message(self, scammer_message: str) -> dict:
        """
        Process a scammer message and return the response.
        
        Args:
            scammer_message: The scammer's message
            
        Returns:
            Dict with agent response and extraction results
        """
        self.logger.info(f"Processing message: {scammer_message[:50]}...")
        
        # Get agent response
        agent_response = self.agent.reply(scammer_message)
        self.logger.debug(f"Agent response: {agent_response}")
        
        # Extract intelligence
        extraction_result = {}
        if self.auto_extract:
            full_conversation = self.agent.get_conversation_history()
            full_text = "\n".join(
                f"{m['role']}: {m['content']}" for m in full_conversation
            )
            result = self.extractor.extract(full_text)
            extraction_result = result.to_dict()
            
            self.logger.info(f"Risk score: {extraction_result['risk_score']:.1f}")
            self.logger.info(f"Entities found: {len(extraction_result['entities'])}")
            
            if self.on_extraction:
                self.on_extraction(extraction_result)
        
        # Create turn record
        turn = ConversationTurn(
            turn_number=len(self.session.turns) + 1,
            scammer_message=scammer_message,
            agent_response=agent_response,
            extraction_result=extraction_result
        )
        self.session.turns.append(turn)
        
        # Callback
        if self.on_message:
            self.on_message({
                "scammer": scammer_message,
                "agent": agent_response,
                "extraction": extraction_result
            })
        
        return {
            "agent_response": agent_response,
            "extraction": extraction_result,
            "turn_number": turn.turn_number,
            "session_id": self.session.session_id
        }
    
    def get_conversation_history(self) -> list[dict]:
        """Get full conversation history"""
        return self.agent.get_conversation_history()
    
    def get_latest_extraction(self) -> Optional[dict]:
        """Get the latest extraction result"""
        if self.session.turns:
            return self.session.turns[-1].extraction_result
        return None
    
    def get_session_summary(self) -> dict:
        """Get session summary"""
        latest = self.get_latest_extraction() or {}
        return {
            "session_id": self.session.session_id,
            "persona": self.session.persona,
            "total_turns": len(self.session.turns),
            "status": self.session.status,
            "risk_score": latest.get("risk_score", 0),
            "scam_type": latest.get("scam_type"),
            "entities_count": len(latest.get("entities", []))
        }
    
    def export_session(self, filepath: Optional[str] = None) -> str:
        """Export session to JSON file"""
        self.session.status = "exported"
        data = self.session.to_dict()
        
        if filepath is None:
            filepath = f"session_{self.session.session_id}.json"
        
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2, default=str)
        
        self.logger.info(f"Session exported to: {filepath}")
        return filepath
    
    def reset(self, persona: Optional[str] = None):
        """Reset the orchestrator for a new session"""
        if persona:
            self.agent = HoneypotAgent(persona=persona)
        else:
            self.agent.reset()
        
        self.session = ConversationSession(
            session_id=self.agent.state.session_id,
            persona=persona or self.session.persona
        )
        
        self.logger.info(f"Session reset. New ID: {self.session.session_id}")
    
    def run_interactive(self):
        """Run interactive conversation loop in terminal"""
        print("\n" + "=" * 60)
        print("AI HONEYPOT - Interactive Mode")
        print("=" * 60)
        print(f"Persona: {AVAILABLE_PERSONAS[self.session.persona]['persona_name']}")
        print("Type 'quit' to exit, 'export' to save session")
        print("=" * 60 + "\n")
        
        while True:
            try:
                scammer_input = input("\nSCAMMER: ").strip()
                
                if scammer_input.lower() == 'quit':
                    break
                elif scammer_input.lower() == 'export':
                    filepath = self.export_session()
                    print(f"Session exported to: {filepath}")
                    continue
                elif not scammer_input:
                    continue
                
                result = self.process_message(scammer_input)
                
                print(f"\nHONEYPOT: {result['agent_response']}")
                
                if result['extraction']:
                    ext = result['extraction']
                    print(f"\n  [Risk: {ext['risk_score']:.0f}/100 | "
                          f"Type: {ext['scam_type'] or 'Unknown'} | "
                          f"Entities: {len(ext['entities'])}]")
            
            except KeyboardInterrupt:
                break
        
        print("\n\nSession ended.")
        summary = self.get_session_summary()
        print(f"Total turns: {summary['total_turns']}")
        print(f"Final risk score: {summary['risk_score']:.1f}")


# ============================================================================
# MULTI-SESSION MANAGER
# ============================================================================

class SessionManager:
    """Manages multiple concurrent conversation sessions"""
    
    def __init__(self, log_dir: str = "logs"):
        self.sessions: dict[str, ConversationOrchestrator] = {}
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)
    
    def create_session(self, persona: str = "confused_elderly") -> str:
        """Create a new session and return session ID"""
        log_file = str(self.log_dir / f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
        orchestrator = ConversationOrchestrator(persona=persona, log_file=log_file)
        session_id = orchestrator.session.session_id
        self.sessions[session_id] = orchestrator
        return session_id
    
    def get_session(self, session_id: str) -> Optional[ConversationOrchestrator]:
        """Get orchestrator for session ID"""
        return self.sessions.get(session_id)
    
    def process_message(self, session_id: str, message: str) -> dict:
        """Process message for a specific session"""
        orchestrator = self.get_session(session_id)
        if not orchestrator:
            raise ValueError(f"Session not found: {session_id}")
        return orchestrator.process_message(message)
    
    def close_session(self, session_id: str) -> Optional[str]:
        """Close session and export data"""
        orchestrator = self.sessions.pop(session_id, None)
        if orchestrator:
            export_path = str(self.log_dir / f"export_{session_id}.json")
            return orchestrator.export_session(export_path)
        return None
    
    def list_sessions(self) -> list[dict]:
        """List all active sessions"""
        return [
            orch.get_session_summary()
            for orch in self.sessions.values()
        ]


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    import sys
    
    print("=" * 60)
    print("CONVERSATION ORCHESTRATOR - Demo")
    print("=" * 60)
    
    # Check for interactive mode
    if len(sys.argv) > 1 and sys.argv[1] == "--interactive":
        orchestrator = ConversationOrchestrator(
            persona="confused_elderly",
            log_file="honeypot_session.log"
        )
        orchestrator.run_interactive()
    else:
        # Demo with sample messages
        orchestrator = ConversationOrchestrator(persona="confused_elderly")
        
        sample_messages = [
            "Hello madam, I am calling from SBI bank. Your account has been blocked.",
            "For unblocking, please pay Rs 500 fee to our official UPI: sbi.official@ybl",
            "Madam please hurry, your account will be permanently closed in 1 hour.",
            "Please share the OTP that will come on your phone for verification.",
        ]
        
        print(f"\nPersona: {orchestrator.session.persona}")
        print("-" * 60)
        
        for msg in sample_messages:
            print(f"\nSCAMMER: {msg}")
            result = orchestrator.process_message(msg)
            print(f"HONEYPOT: {result['agent_response']}")
            
            if result['extraction']:
                ext = result['extraction']
                print(f"  [Risk: {ext['risk_score']:.0f} | Entities: {len(ext['entities'])}]")
        
        # Export session
        print("\n" + "-" * 60)
        export_path = orchestrator.export_session()
        print(f"Session exported to: {export_path}")
        
        # Summary
        summary = orchestrator.get_session_summary()
        print(f"\nFinal Summary:")
        print(json.dumps(summary, indent=2))
