-- ==========================================
-- MIX-AA: Full Database Initialization & Repair
-- ==========================================

-- 1. PROFILES Table (Core User System)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    job_title TEXT,
    monthly_target NUMERIC DEFAULT 0,
    role TEXT CHECK (role IN ('engineer', 'admin')) DEFAULT 'engineer',
    status TEXT CHECK (status IN ('pending', 'active', 'deactivated')) DEFAULT 'pending',
    theme_preference TEXT CHECK (theme_preference IN ('light', 'dark')) DEFAULT 'light',
    has_seen_welcome BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Auth Trigger (Auto-create profile when user signs up)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role, status)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    'engineer',
    'pending'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. CLIENTS Table Repair (Adding engineer_id and linking to profiles)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='engineer_id') THEN
        ALTER TABLE public.clients ADD COLUMN engineer_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 4. Other Core Tables
CREATE TABLE IF NOT EXISTS public.meeting_preps (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES public.clients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    client_name TEXT,
    sector TEXT,
    meeting_date DATE,
    status TEXT DEFAULT 'مسودة',
    idea_raw TEXT,
    analysis_result JSONB,
    tags TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.meeting_preps ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.files (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES public.clients(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type_label TEXT DEFAULT 'أخرى',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- 5. Universal RLS Policies (Security)

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Clients
DROP POLICY IF EXISTS "Engineers can manage their own clients" ON public.clients;
CREATE POLICY "Engineers can manage their own clients" ON public.clients FOR ALL USING (engineer_id = auth.uid());
DROP POLICY IF EXISTS "Admins can see all clients" ON public.clients;
CREATE POLICY "Admins can see all clients" ON public.clients FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Meeting Preps
DROP POLICY IF EXISTS "Engineers can manage their meeting preps" ON public.meeting_preps;
CREATE POLICY "Engineers can manage their meeting preps" ON public.meeting_preps FOR ALL 
USING (EXISTS (SELECT 1 FROM public.clients WHERE id = meeting_preps.client_id AND engineer_id = auth.uid()));

-- Files
DROP POLICY IF EXISTS "Engineers can manage their files" ON public.files;
CREATE POLICY "Engineers can manage their files" ON public.files FOR ALL 
USING (EXISTS (SELECT 1 FROM public.clients WHERE id = files.client_id AND engineer_id = auth.uid()));
