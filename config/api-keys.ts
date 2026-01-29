/**
 * API KEYS CONFIGURATION
 * ======================
 * 
 * This file documents all API keys needed for the AI Honeypot System.
 * 
 * IMPORTANT: The Next.js frontend uses Vercel AI Gateway which works
 * automatically WITHOUT any API keys. You only need keys for:
 * 1. Google OAuth (configured in Supabase dashboard)
 * 2. Python backend (if you run it locally)
 */

// ============================================================
// NEXT.JS FRONTEND - NO API KEYS NEEDED
// ============================================================
// The AI chat uses Vercel AI Gateway which is pre-configured.
// Model: openai/gpt-4o-mini (works automatically)

// ============================================================
// GOOGLE OAUTH SETUP (For "Sign in with Google")
// ============================================================
/**
 * STEP 1: Create Google OAuth Credentials
 * ----------------------------------------
 * 1. Go to: https://console.cloud.google.com/apis/credentials
 * 2. Create a new project (or select existing)
 * 3. Click "Create Credentials" > "OAuth client ID"
 * 4. Choose "Web application"
 * 5. Add authorized redirect URI:
 *    https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
 * 6. Copy the Client ID and Client Secret
 * 
 * STEP 2: Configure in Supabase
 * -----------------------------
 * 1. Go to your Supabase project dashboard
 * 2. Navigate to: Authentication > Providers > Google
 * 3. Enable Google provider
 * 4. Paste your Google Client ID
 * 5. Paste your Google Client Secret
 * 6. Save
 * 
 * That's it! Google sign-in will now work.
 */

// ============================================================
// PYTHON BACKEND API KEYS (Only if running locally)
// ============================================================
/**
 * If you want to run the Python backend separately, create a .env file
 * in the /python-backend folder with:
 * 
 * OPENAI_API_KEY=sk-your-key-here
 * 
 * Get your OpenAI API key from: https://platform.openai.com/api-keys
 */

export const API_CONFIG = {
  // Next.js uses Vercel AI Gateway - no key needed
  ai: {
    provider: 'vercel-ai-gateway',
    model: 'openai/gpt-4o-mini',
    requiresKey: false,
  },
  
  // Google OAuth - configured in Supabase dashboard
  googleOAuth: {
    provider: 'supabase',
    configLocation: 'Supabase Dashboard > Authentication > Providers > Google',
    requiresKey: true,
    instructions: 'See GOOGLE_OAUTH_SETUP.md for detailed steps',
  },
  
  // Python backend (optional, for local development)
  pythonBackend: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    requiresKey: true,
    envFile: '/python-backend/.env',
  },
}
