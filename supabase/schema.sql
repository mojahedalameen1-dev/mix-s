-- Enable Row Level Security
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.team_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meeting_preps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.files ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    job_title TEXT,
    monthly_target NUMERIC DEFAULT 0,
    role TEXT CHECK (role IN ('engineer', 'admin')) DEFAULT 'engineer',
    status TEXT CHECK (status IN ('pending', 'active', 'deactivated')) DEFAULT 'pending',
    transferred_to UUID REFERENCES public.profiles(id),
    theme_preference TEXT CHECK (theme_preference IN ('light', 'dark')) DEFAULT 'light',
    has_seen_welcome BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. INVITE LINKS Table
CREATE TABLE IF NOT EXISTS public.invite_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. CLIENTS Table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    company TEXT,
    notes TEXT,
    engineer_id UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. DEALS Table
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    value NUMERIC DEFAULT 0,
    status TEXT CHECK (status IN ('new', 'in_progress', 'won', 'lost')) DEFAULT 'new',
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    engineer_id UUID REFERENCES public.profiles(id) NOT NULL,
    expected_close_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. NOTIFICATIONS Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. BADGES Table (Gamification)
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_key TEXT NOT NULL,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. TEAM TARGETS Table
CREATE TABLE IF NOT EXISTS public.team_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    total_target NUMERIC NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (month, year)
);

-- 8. MEETING PREPS Table
CREATE TABLE IF NOT EXISTS public.meeting_preps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    client_name TEXT, -- Fallback for legacy
    sector TEXT,
    meeting_date DATE,
    status TEXT DEFAULT 'مسودة',
    idea_raw TEXT,
    analysis_result JSONB,
    tags TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. SCORES Table (BANT Qualification)
CREATE TABLE IF NOT EXISTS public.scores (
    id SERIAL PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    budget_score INTEGER DEFAULT 0,
    authority_score INTEGER DEFAULT 0,
    need_score INTEGER DEFAULT 0,
    timeline_score INTEGER DEFAULT 0,
    fit_score INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (client_id)
);

-- 10. FILES Table
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type_label TEXT DEFAULT 'أخرى',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS POLICIES --

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile." ON public.profiles FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Invite Links
CREATE POLICY "Admins can manage invite links." ON public.invite_links FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Anyone can read active invite links." ON public.invite_links FOR SELECT USING (is_active = true);

-- Clients
CREATE POLICY "Engineers can manage their own clients." ON public.clients FOR ALL USING (engineer_id = auth.uid());
CREATE POLICY "Admins can see all clients." ON public.clients FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Deals
CREATE POLICY "Engineers can manage their own deals." ON public.deals FOR ALL USING (engineer_id = auth.uid());
CREATE POLICY "Admins can see all deals." ON public.deals FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Notifications
CREATE POLICY "Users can see their own notifications." ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications." ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Badges
CREATE POLICY "Badges are viewable by everyone." ON public.badges FOR SELECT USING (true);
CREATE POLICY "Only system can award badges." ON public.badges FOR INSERT WITH CHECK (false); -- Insert via Edge Function/Service Role

-- Team Targets
CREATE POLICY "Team targets viewable by all active users." ON public.team_targets FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active'));
CREATE POLICY "Admins can manage team targets." ON public.team_targets FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Meeting Preps
CREATE POLICY "Engineers can manage their own meeting preps." ON public.meeting_preps FOR ALL 
USING (EXISTS (SELECT 1 FROM public.clients WHERE id = meeting_preps.client_id AND engineer_id = auth.uid()));

-- Scores
CREATE POLICY "Engineers can manage scores for their clients." ON public.scores FOR ALL 
USING (EXISTS (SELECT 1 FROM public.clients WHERE id = scores.client_id AND engineer_id = auth.uid()));

-- Files
CREATE POLICY "Engineers can manage files for their clients." ON public.files FOR ALL 
USING (EXISTS (SELECT 1 FROM public.clients WHERE id = files.client_id AND engineer_id = auth.uid()));

-- Functions & Triggers --

-- Auto-create profile on signup
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
