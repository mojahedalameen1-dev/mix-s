-- 1. إضافة عمود engineer_id في حال عدم وجوده
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='engineer_id') THEN
        ALTER TABLE public.clients ADD COLUMN engineer_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

-- 2. تحديث السياسات لتستخدم العمود بشكل صحيح
DROP POLICY IF EXISTS "Engineers can manage their own clients" ON public.clients;
CREATE POLICY "Engineers can manage their own clients" ON public.clients FOR ALL 
USING (engineer_id = auth.uid());

DROP POLICY IF EXISTS "Admins can see all clients" ON public.clients;
CREATE POLICY "Admins can see all clients" ON public.clients FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. تحديث سياسات الجداول الجديدة المرتبطة بـ clients
DROP POLICY IF EXISTS "Engineers can manage their meeting preps" ON public.meeting_preps;
CREATE POLICY "Engineers can manage their meeting preps" ON public.meeting_preps FOR ALL 
USING (EXISTS (SELECT 1 FROM public.clients WHERE id = meeting_preps.client_id AND engineer_id = auth.uid()));

DROP POLICY IF EXISTS "Engineers can manage their files" ON public.files;
CREATE POLICY "Engineers can manage their files" ON public.files FOR ALL 
USING (EXISTS (SELECT 1 FROM public.clients WHERE id = files.client_id AND engineer_id = auth.uid()));

DROP POLICY IF EXISTS "Engineers can manage scores" ON public.scores;
CREATE POLICY "Engineers can manage scores" ON public.scores FOR ALL 
USING (EXISTS (SELECT 1 FROM public.clients WHERE id = scores.client_id AND engineer_id = auth.uid()));
