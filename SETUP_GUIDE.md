# AI Honeypot System - Complete Setup Guide

## Quick Summary

| Component | API Key Needed? | Where to Get It |
|-----------|-----------------|-----------------|
| Next.js Frontend (AI Chat) | NO | Uses Vercel AI Gateway automatically |
| Google Sign-In | YES | Google Cloud Console + Supabase Dashboard |
| Python Backend | YES | OpenAI Platform |

---

## Part 1: Next.js Frontend (Works Immediately)

The AI chat functionality uses **Vercel AI Gateway** which is pre-configured. 
No API key is required - it works out of the box!

**You can test the app right now without any setup.**

---

## Part 2: Google OAuth Setup (For "Sign in with Google")

### What You Need
- Google Cloud account (free)
- 10 minutes

### Step-by-Step

#### A. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing
3. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
4. If prompted, configure OAuth consent screen first:
   - Choose "External"
   - Fill in app name and email
   - Save and continue through all steps
5. Back to Credentials, create OAuth client ID:
   - Application type: **Web application**
   - Name: `AI Honeypot`
   - Authorized redirect URIs: Add your Supabase callback URL
   
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
   
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

#### B. Configure Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** > **Providers**
4. Find **Google** and enable it
5. Paste your:
   - Client ID
   - Client Secret
6. Click **Save**

Done! Google sign-in now works.

---

## Part 3: Python Backend Setup (Optional)

The Python backend is for running the system locally/independently.

### What You Need
- OpenAI API key (~$5 credit to start)
- Python 3.9+

### Step-by-Step

#### A. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click **"Create new secret key"**
4. Name it: `AI Honeypot`
5. Copy the key (starts with `sk-...`)

#### B. Configure Python Backend

```bash
cd python-backend

# Copy the template
cp local_config.template.py local_config.py

# Edit the file and add your key
# Open local_config.py and replace 'sk-PASTE-YOUR-KEY-HERE' with your actual key
```

#### C. Run the Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Download spaCy model for NLP
python -m spacy download en_core_web_sm

# Run the server
python main.py
```

API will be available at: http://localhost:8000
Documentation at: http://localhost:8000/docs

---

## File Locations

```
/config/
  api-keys.ts              # API configuration documentation
  GOOGLE_OAUTH_SETUP.md    # Detailed Google OAuth guide

/python-backend/
  config.py                # Python config loader
  local_config.template.py # Template - copy and edit this
  local_config.py          # Your actual keys (create this, don't commit!)
```

---

## Testing Checklist

- [ ] Frontend loads without errors
- [ ] Can create account with email/password
- [ ] Can sign in with Google (after OAuth setup)
- [ ] AI chat responds to messages
- [ ] Intelligence extraction shows entities
- [ ] Can export reports

---

## Troubleshooting

### "Google sign-in not working"
- Verify redirect URI matches exactly
- Check Supabase Google provider is enabled
- Ensure OAuth consent screen is configured

### "AI not responding"
- Check browser console for errors
- Verify you're connected to internet
- Try refreshing the page

### "Python backend errors"
- Run `python python-backend/config.py` to check configuration
- Verify API key is correct
- Check OpenAI account has credits

---

## Cost Estimates

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel AI Gateway | Included | - |
| Google OAuth | Free | Free |
| OpenAI API | $5 free credit | ~$0.15/1M tokens |
| Supabase | 500MB DB, 50K auth | $25/mo |

For a hackathon demo, everything should be free or nearly free.
