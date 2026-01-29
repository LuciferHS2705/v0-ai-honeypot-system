-- Honeypot Sessions Table
CREATE TABLE IF NOT EXISTS public.honeypot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_name TEXT,
  persona_type TEXT DEFAULT 'elderly_victim',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'exported')),
  risk_score INTEGER DEFAULT 0,
  scam_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.honeypot_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'scammer')),
  content TEXT NOT NULL,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extracted Intelligence Table
CREATE TABLE IF NOT EXISTS public.extracted_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.honeypot_sessions(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('upi_id', 'phone_number', 'url', 'bank_account', 'organization', 'email', 'crypto_wallet')),
  entity_value TEXT NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.00,
  source_message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports Table
CREATE TABLE IF NOT EXISTS public.intelligence_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.honeypot_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT DEFAULT 'law_enforcement',
  report_data JSONB NOT NULL,
  exported_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  organization TEXT,
  role TEXT DEFAULT 'analyst',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.honeypot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for honeypot_sessions
CREATE POLICY "Users can view their own sessions" ON public.honeypot_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON public.honeypot_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.honeypot_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON public.honeypot_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for chat_messages (via session ownership)
CREATE POLICY "Users can view messages from their sessions" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.honeypot_sessions WHERE id = session_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can create messages in their sessions" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.honeypot_sessions WHERE id = session_id AND user_id = auth.uid())
  );

-- RLS Policies for extracted_intelligence (via session ownership)
CREATE POLICY "Users can view intelligence from their sessions" ON public.extracted_intelligence
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.honeypot_sessions WHERE id = session_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can create intelligence in their sessions" ON public.extracted_intelligence
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.honeypot_sessions WHERE id = session_id AND user_id = auth.uid())
  );

-- RLS Policies for intelligence_reports
CREATE POLICY "Users can view their own reports" ON public.intelligence_reports
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own reports" ON public.intelligence_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create trigger function for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating profiles on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.honeypot_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_session_id ON public.extracted_intelligence(session_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_entity_type ON public.extracted_intelligence(entity_type);
