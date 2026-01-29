"""
AI Honeypot System - FastAPI Backend
RESTful API for the AI-powered scam honeypot system.
"""

import os
import uuid
from datetime import datetime
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Import our modules
from agent import HoneypotAgent, AVAILABLE_PERSONAS
from extractor import IntelligenceExtractor, extract_from_conversation


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str = Field(..., min_length=1, description="Scammer's message")
    session_id: Optional[str] = Field(None, description="Session ID for continuing conversation")
    persona: Optional[str] = Field("confused_elderly", description="Agent persona to use")


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    session_id: str
    agent_reply: str
    extracted_entities: list[dict]
    risk_score: float
    scam_type: Optional[str]
    scam_indicators: list[str]
    confidence_score: float
    turn_count: int


class SessionState(BaseModel):
    """Session state model"""
    session_id: str
    persona: str
    turn_count: int
    conversation_history: list[dict]
    extracted_intelligence: dict
    created_at: str
    last_activity: str


class ExtractionRequest(BaseModel):
    """Request model for extraction-only endpoint"""
    text: str = Field(..., min_length=1, description="Text to analyze")
    use_spacy: bool = Field(False, description="Whether to use spaCy NER")


class ReportRequest(BaseModel):
    """Request model for generating reports"""
    session_id: str
    include_conversation: bool = True
    format: str = "json"  # "json" or "text"


# ============================================================================
# IN-MEMORY SESSION STORAGE
# ============================================================================

sessions: dict[str, dict] = {}
agents: dict[str, HoneypotAgent] = {}


def get_or_create_session(session_id: Optional[str], persona: str) -> tuple[str, HoneypotAgent]:
    """Get existing session or create new one"""
    if session_id and session_id in sessions:
        return session_id, agents[session_id]
    
    # Create new session
    new_session_id = f"session_{uuid.uuid4().hex[:12]}"
    agent = HoneypotAgent(
        api_provider="openai",
        model="gpt-4o-mini",
        persona=persona
    )
    agent.state.session_id = new_session_id
    
    sessions[new_session_id] = {
        "session_id": new_session_id,
        "persona": persona,
        "created_at": datetime.now().isoformat(),
        "last_activity": datetime.now().isoformat(),
        "extraction_history": []
    }
    agents[new_session_id] = agent
    
    return new_session_id, agent


# ============================================================================
# FASTAPI APP
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    print("AI Honeypot API Starting...")
    print(f"Available personas: {list(AVAILABLE_PERSONAS.keys())}")
    yield
    print("AI Honeypot API Shutting down...")


app = FastAPI(
    title="AI Honeypot System API",
    description="Agentic AI system that engages scammers with realistic human personas and extracts intelligence for law enforcement.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize extractor
extractor = IntelligenceExtractor(use_spacy=False)


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "name": "AI Honeypot System API",
        "version": "1.0.0",
        "endpoints": {
            "POST /chat": "Send message and get AI response",
            "POST /extract": "Extract intelligence from text",
            "GET /session/{session_id}": "Get session state",
            "GET /sessions": "List all sessions",
            "POST /report": "Generate intelligence report",
            "DELETE /session/{session_id}": "Delete session",
            "GET /personas": "List available personas"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/personas")
async def list_personas():
    """List all available agent personas"""
    return {
        "personas": [
            {
                "key": key,
                "name": persona["persona_name"],
                "description": persona["persona_description"],
                "age": persona["age"],
                "occupation": persona["occupation"]
            }
            for key, persona in AVAILABLE_PERSONAS.items()
        ]
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, background_tasks: BackgroundTasks):
    """
    Main chat endpoint.
    Sends scammer message to AI agent and returns response with extracted intelligence.
    """
    try:
        # Get or create session
        session_id, agent = get_or_create_session(request.session_id, request.persona)
        
        # Get AI response
        agent_reply = agent.reply(request.message)
        
        # Update session activity
        sessions[session_id]["last_activity"] = datetime.now().isoformat()
        
        # Extract intelligence from full conversation
        conversation = agent.get_conversation_history()
        extraction_result = extract_from_conversation(conversation, use_spacy=False)
        
        # Store extraction in session
        sessions[session_id]["extraction_history"].append({
            "turn": agent.state.turn_count,
            "timestamp": datetime.now().isoformat(),
            "result": extraction_result
        })
        
        return ChatResponse(
            session_id=session_id,
            agent_reply=agent_reply,
            extracted_entities=extraction_result["entities"],
            risk_score=extraction_result["risk_score"],
            scam_type=extraction_result["scam_type"],
            scam_indicators=extraction_result["scam_indicators"],
            confidence_score=extraction_result["confidence_score"],
            turn_count=agent.state.turn_count
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/extract")
async def extract_only(request: ExtractionRequest):
    """
    Extract intelligence from text without AI conversation.
    Useful for analyzing existing messages.
    """
    try:
        result = extractor.extract(request.text)
        return result.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/session/{session_id}", response_model=SessionState)
async def get_session(session_id: str):
    """Get session state and conversation history"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    agent = agents[session_id]
    session = sessions[session_id]
    
    # Get latest extraction
    latest_extraction = {}
    if session["extraction_history"]:
        latest_extraction = session["extraction_history"][-1]["result"]
    
    return SessionState(
        session_id=session_id,
        persona=session["persona"],
        turn_count=agent.state.turn_count,
        conversation_history=agent.get_conversation_history(),
        extracted_intelligence=latest_extraction,
        created_at=session["created_at"],
        last_activity=session["last_activity"]
    )


@app.get("/sessions")
async def list_sessions():
    """List all active sessions"""
    return {
        "sessions": [
            {
                "session_id": sid,
                "persona": data["persona"],
                "turn_count": agents[sid].state.turn_count if sid in agents else 0,
                "created_at": data["created_at"],
                "last_activity": data["last_activity"]
            }
            for sid, data in sessions.items()
        ],
        "total": len(sessions)
    }


@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a session and its data"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    del sessions[session_id]
    if session_id in agents:
        del agents[session_id]
    
    return {"message": f"Session {session_id} deleted", "success": True}


@app.post("/report")
async def generate_report(request: ReportRequest):
    """Generate intelligence report for law enforcement"""
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[request.session_id]
    agent = agents[request.session_id]
    
    # Get latest extraction
    latest_extraction = {}
    if session["extraction_history"]:
        latest_extraction = session["extraction_history"][-1]["result"]
    
    report = {
        "report_id": f"RPT-{uuid.uuid4().hex[:8].upper()}",
        "generated_at": datetime.now().isoformat(),
        "session_info": {
            "session_id": request.session_id,
            "persona_used": session["persona"],
            "total_turns": agent.state.turn_count,
            "session_start": session["created_at"],
            "session_end": session["last_activity"]
        },
        "intelligence_summary": {
            "risk_score": latest_extraction.get("risk_score", 0),
            "scam_type": latest_extraction.get("scam_type"),
            "scam_indicators": latest_extraction.get("scam_indicators", []),
            "confidence": latest_extraction.get("confidence_score", 0)
        },
        "extracted_entities": latest_extraction.get("entities", []),
        "entity_summary": latest_extraction.get("summary", {})
    }
    
    if request.include_conversation:
        report["conversation_transcript"] = agent.get_conversation_history()
    
    if request.format == "text":
        # Generate text format
        text_report = _generate_text_report(report)
        return {"report": report, "text_format": text_report}
    
    return {"report": report}


def _generate_text_report(report: dict) -> str:
    """Generate human-readable text report"""
    lines = [
        "=" * 60,
        "AI HONEYPOT INTELLIGENCE REPORT",
        "=" * 60,
        f"Report ID: {report['report_id']}",
        f"Generated: {report['generated_at']}",
        "",
        "SESSION INFORMATION",
        "-" * 40,
        f"Session ID: {report['session_info']['session_id']}",
        f"Persona: {report['session_info']['persona_used']}",
        f"Total Turns: {report['session_info']['total_turns']}",
        f"Duration: {report['session_info']['session_start']} to {report['session_info']['session_end']}",
        "",
        "THREAT ASSESSMENT",
        "-" * 40,
        f"Risk Score: {report['intelligence_summary']['risk_score']:.1f}/100",
        f"Scam Type: {report['intelligence_summary']['scam_type'] or 'Unknown'}",
        f"Indicators: {', '.join(report['intelligence_summary']['scam_indicators']) or 'None'}",
        f"Confidence: {report['intelligence_summary']['confidence']:.2%}",
        "",
        "EXTRACTED ENTITIES",
        "-" * 40,
    ]
    
    for entity in report.get("extracted_entities", []):
        lines.append(f"  [{entity['type'].upper()}] {entity['value']} (conf: {entity['confidence']:.2f})")
    
    if "conversation_transcript" in report:
        lines.extend([
            "",
            "CONVERSATION TRANSCRIPT",
            "-" * 40,
        ])
        for msg in report["conversation_transcript"]:
            role = "SCAMMER" if msg["role"] == "user" else "HONEYPOT"
            lines.append(f"[{msg['timestamp']}] {role}: {msg['content']}")
    
    lines.extend(["", "=" * 60, "END OF REPORT", "=" * 60])
    
    return "\n".join(lines)


# ============================================================================
# STREAMLIT ALTERNATIVE (Run separately)
# ============================================================================

def run_streamlit_dashboard():
    """
    Alternative: Run Streamlit dashboard
    Save this code to streamlit_app.py and run: streamlit run streamlit_app.py
    """
    streamlit_code = '''
import streamlit as st
import requests
import json

API_URL = "http://localhost:8000"

st.set_page_config(
    page_title="AI Honeypot Dashboard",
    page_icon="🎣",
    layout="wide"
)

st.title("AI Honeypot System")
st.markdown("*Agentic AI for engaging scammers and extracting intelligence*")

# Session state
if "session_id" not in st.session_state:
    st.session_state.session_id = None
if "messages" not in st.session_state:
    st.session_state.messages = []

# Sidebar
with st.sidebar:
    st.header("Configuration")
    persona = st.selectbox(
        "Select Persona",
        ["confused_elderly", "busy_professional", "trusting_homemaker"]
    )
    
    if st.button("New Session"):
        st.session_state.session_id = None
        st.session_state.messages = []
        st.rerun()

# Main layout
col1, col2 = st.columns([2, 1])

with col1:
    st.header("Conversation")
    
    # Display messages
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.write(msg["content"])
    
    # Input
    if prompt := st.chat_input("Enter scammer message..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        # Call API
        response = requests.post(f"{API_URL}/chat", json={
            "message": prompt,
            "session_id": st.session_state.session_id,
            "persona": persona
        })
        
        if response.ok:
            data = response.json()
            st.session_state.session_id = data["session_id"]
            st.session_state.messages.append({
                "role": "assistant",
                "content": data["agent_reply"]
            })
            st.session_state.extraction = data
        
        st.rerun()

with col2:
    st.header("Intelligence")
    
    if "extraction" in st.session_state:
        data = st.session_state.extraction
        
        # Risk score
        risk = data["risk_score"]
        color = "green" if risk < 30 else "orange" if risk < 70 else "red"
        st.metric("Risk Score", f"{risk:.1f}/100")
        
        # Scam type
        st.write(f"**Scam Type:** {data['scam_type'] or 'Unknown'}")
        
        # Indicators
        st.write("**Scam Indicators:**")
        for ind in data["scam_indicators"]:
            st.write(f"- {ind}")
        
        # Entities
        st.write("**Extracted Entities:**")
        for entity in data["extracted_entities"]:
            st.write(f"- [{entity['type']}] {entity['value']}")
        
        # JSON view
        with st.expander("Raw JSON"):
            st.json(data)
'''
    return streamlit_code


# ============================================================================
# MAIN ENTRY
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    print("Starting AI Honeypot API Server...")
    print("Documentation: http://localhost:8000/docs")
    print("Alternative docs: http://localhost:8000/redoc")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
