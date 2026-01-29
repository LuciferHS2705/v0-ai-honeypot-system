# Google OAuth Setup Guide

## Overview
This guide explains how to set up "Sign in with Google" for the AI Honeypot System.

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click "New Project"
4. Name it: `AI Honeypot System`
5. Click "Create"

---

## Step 2: Enable OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services > OAuth consent screen**
2. Select **External** (unless you have Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - App name: `AI Honeypot System`
   - User support email: Your email
   - Developer contact email: Your email
5. Click "Save and Continue"
6. Skip Scopes (click "Save and Continue")
7. Add test users if needed (your email)
8. Click "Save and Continue"

---

## Step 3: Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
3. Application type: **Web application**
4. Name: `AI Honeypot Web Client`
5. Add **Authorized redirect URIs**:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   
   > Replace `YOUR_PROJECT_REF` with your Supabase project reference ID.
   > Find it in your Supabase URL: `https://[PROJECT_REF].supabase.co`

6. Click "Create"
7. **COPY** the Client ID and Client Secret (you'll need these)

---

## Step 4: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list
5. Toggle it **ON**
6. Enter your credentials:
   - **Client ID**: Paste from Step 3
   - **Client Secret**: Paste from Step 3
7. Click **Save**

---

## Step 5: Test

1. Go to your app's login page
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should be redirected back and logged in!

---

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the redirect URI in Google Cloud Console exactly matches:
  `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

### "Access blocked" error
- Your OAuth consent screen might be in "Testing" mode
- Add your email to the test users list

### Google button not working
- Check browser console for errors
- Verify Supabase Google provider is enabled

---

## Your Credentials (Fill in after setup)

```
Google Client ID: ________________________________

Google Client Secret: ________________________________

Supabase Project Ref: ________________________________

Redirect URI: https://________________.supabase.co/auth/v1/callback
```

Keep this information secure and never commit secrets to version control.
