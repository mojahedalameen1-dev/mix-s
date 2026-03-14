-- ==========================================
-- MIX-AA: Golden Sync Schema
-- This script synchronizes your Supabase DB with all required features.
-- ==========================================

-- 1. Ensure PROFILES is complete
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('engineer', 'admin')) DEFAULT 'engineer',
    status TEXT CHECK (status IN ('pending', 'active', 'deactivated')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Ensure Sync Triggers for Profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role, status)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url', 'engineer', 'pending')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Harmonize CLIENTS with your specific fields + Security
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS engineer_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 4. Harmonize DEALS with your specific fields + Security
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS ticket_link TEXT DEFAULT '';
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS slack_code TEXT DEFAULT '';
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS engineer_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- 5. Establish Additional Missing Tables (Notifications, Badges, etc)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_key TEXT NOT NULL,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- 6. Ultimate RLS Policies (Fix for all tables)

-- Clients & Deals (Ownership based)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Manage own clients" ON public.clients;
    CREATE POLICY "Manage own clients" ON public.clients FOR ALL USING (engineer_id = auth.uid());
    
    DROP POLICY IF EXISTS "Manage own deals" ON public.deals;
    CREATE POLICY "Manage own deals" ON public.deals FOR ALL USING (engineer_id = auth.uid());
    
    DROP POLICY IF EXISTS "Manage own preps" ON public.meeting_preps;
    CREATE POLICY "Manage own preps" ON public.meeting_preps FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.clients WHERE id = meeting_preps.client_id AND engineer_id = auth.uid()));

    DROP POLICY IF EXISTS "Manage own scores" ON public.scores;
    CREATE POLICY "Manage own scores" ON public.scores FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.clients WHERE id = scores.client_id AND engineer_id = auth.uid()));

    DROP POLICY IF EXISTS "Manage own files" ON public.files;
    CREATE POLICY "Manage own files" ON public.files FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.clients WHERE id = files.client_id AND engineer_id = auth.uid()));
    
    DROP POLICY IF EXISTS "See own notifications" ON public.notifications;
    CREATE POLICY "See own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
END $$;

-- 7. Realtime Enablement (Run via SQL Editor)
-- Note: Realtime must be enabled via the UI or a specific ALTER PUBLICATION command
-- ALTER PUBLICATION supabase_realtime ADD TABLE deals, notifications, clients, scores;
