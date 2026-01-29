# AI Honeypot System - Python Backend

Agentic AI system that engages scammers with realistic human personas and extracts intelligence for law enforcement.

## Quick Start

### 1. Install Dependencies

```bash
cd python-backend
pip install -r requirements.txt

# Optional: For enhanced NLP extraction
pip install spacy
python -m spacy download en_core_web_sm
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### 3. Run the API Server

```bash
python main.py
# Server starts at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 4. Test the API

```bash
# Health check
curl http://localhost:8000/health

# Send a scam message
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, your bank account has been blocked. Pay Rs 500 to unlock."}'
```

## Module Overview

### `agent.py` - AI Conversational Agent
- Goal-driven LLM agent with configurable personas
- Maintains conversation history
- Designed to keep scammers engaged while extracting information

```python
from agent import HoneypotAgent

agent = HoneypotAgent(persona="confused_elderly")
response = agent.reply("Your account is blocked!")
print(response)
```

### `extractor.py` - NLP Intelligence Extraction
- Regex patterns for UPI IDs, phone numbers, URLs, bank accounts
- Optional spaCy NER for organization detection
- Risk scoring algorithm

```python
from extractor import extract_intelligence

result = extract_intelligence("Pay to scammer@upi or call 9876543210")
print(result)  # Returns entities, risk score, scam type
```

### `orchestrator.py` - Conversation Manager
- Multi-turn conversation handling
- Session management
- Logging and export

```python
from orchestrator import ConversationOrchestrator

orch = ConversationOrchestrator(persona="confused_elderly")
result = orch.process_message("Your KYC is pending!")
print(result["agent_response"])
print(result["extraction"])
```

### `main.py` - FastAPI Backend
- REST API for all functionality
- Session management
- Report generation

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/personas` | GET | List available personas |
| `/chat` | POST | Send message, get AI response |
| `/extract` | POST | Extract intelligence from text |
| `/session/{id}` | GET | Get session details |
| `/sessions` | GET | List all sessions |
| `/report` | POST | Generate intelligence report |

## Available Personas

1. **confused_elderly** - Kamala Sharma, 68-year-old retired teacher
2. **busy_professional** - Rajesh Kumar, 45-year-old office manager
3. **trusting_homemaker** - Sunita Devi, 55-year-old homemaker

## Entities Extracted

- UPI IDs (e.g., `scammer@paytm`, `fraud@ybl`)
- Phone numbers (Indian format)
- URLs and phishing links
- Bank account numbers
- IFSC codes
- Email addresses
- OTP mentions
- Card number patterns

## Risk Scoring

Risk score (0-100) is calculated based on:
- Number and type of entities extracted
- Scam indicators (urgency, fear, authority)
- Scam type classification

## Demo

```bash
# Run interactive demo
python orchestrator.py --interactive

# Run sample conversation demo
python demo/sample_conversations.py
```

## Project Structure

```
python-backend/
├── agent.py              # AI conversational agent
├── extractor.py          # NLP extraction engine
├── orchestrator.py       # Conversation orchestrator
├── main.py               # FastAPI backend
├── requirements.txt      # Python dependencies
├── .env.example          # Environment template
└── demo/
    ├── DEMO_SCRIPT.md    # 2-minute demo script
    └── sample_conversations.py  # Sample scam scenarios
```

## API Keys Required

### OpenAI (Required)
Get from: https://platform.openai.com/api-keys
- Used for AI conversation generation
- Recommended model: `gpt-4o-mini`

### Anthropic (Optional)
Get from: https://console.anthropic.com/
- Alternative to OpenAI
- Model: `claude-3-haiku-20240307`

## Integration with Next.js Frontend

The Python backend can work alongside the Next.js frontend:

1. Run Python backend on port 8000
2. Update Next.js API routes to proxy to Python backend
3. Or use Next.js frontend directly with built-in Vercel AI

## License

MIT License - For educational and law enforcement purposes only.
