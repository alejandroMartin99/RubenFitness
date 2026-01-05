-- =====================================================
-- NUTRITION MODULE - SUPABASE TABLES
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- 1. NUTRITION PLANS TABLE
CREATE TABLE IF NOT EXISTS public.nutrition_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) DEFAULT 'Plan Nutricional',
    description TEXT,
    daily_calories INTEGER,
    protein_grams INTEGER,
    carbs_grams INTEGER,
    fat_grams INTEGER,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. NUTRITION MEALS TABLE
CREATE TABLE IF NOT EXISTS public.nutrition_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.nutrition_plans(id) ON DELETE CASCADE,
    meal_type VARCHAR(50) NOT NULL, -- breakfast, lunch, dinner, snack, pre_workout, post_workout
    meal_order INTEGER DEFAULT 0,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    day_of_week VARCHAR(20), -- monday, tuesday, etc.
    calories INTEGER,
    protein_grams NUMERIC(10,2),
    carbs_grams NUMERIC(10,2),
    fat_grams NUMERIC(10,2),
    time_suggestion VARCHAR(10), -- e.g., "08:00"
    foods JSONB DEFAULT '[]'::jsonb, -- Array of {name, portion, calories?, protein?, carbs?, fat?}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. COACH CHAT TABLE (for nutrition discussions)
CREATE TABLE IF NOT EXISTS public.coach_chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_id UUID NOT NULL,
    sender_role VARCHAR(20) NOT NULL, -- 'user' or 'coach'
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_nutrition_plans_user_id ON public.nutrition_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_active ON public.nutrition_plans(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_nutrition_meals_plan_id ON public.nutrition_meals(plan_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_meals_day ON public.nutrition_meals(plan_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_coach_chat_user_id ON public.coach_chat(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_chat_unread ON public.coach_chat(user_id, sender_role, is_read);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_chat ENABLE ROW LEVEL SECURITY;

-- Policies for nutrition_plans
CREATE POLICY "Users can view their own plans" ON public.nutrition_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view all plans" ON public.nutrition_plans
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Coaches can create plans" ON public.nutrition_plans
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Coaches can update plans" ON public.nutrition_plans
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Coaches can delete plans" ON public.nutrition_plans
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Policies for nutrition_meals
CREATE POLICY "Users can view meals of their plans" ON public.nutrition_meals
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.nutrition_plans WHERE id = plan_id AND user_id = auth.uid())
    );

CREATE POLICY "Coaches can view all meals" ON public.nutrition_meals
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Coaches can manage meals" ON public.nutrition_meals
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Policies for coach_chat
CREATE POLICY "Users can view their chat" ON public.coach_chat
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = coach_id);

CREATE POLICY "Users can send messages" ON public.coach_chat
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read" ON public.coach_chat
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = coach_id);

-- =====================================================
-- SERVICE ROLE BYPASS (for backend API)
-- =====================================================
-- Note: If using service_role key in backend, RLS is bypassed automatically

-- Grant permissions to service role
GRANT ALL ON public.nutrition_plans TO service_role;
GRANT ALL ON public.nutrition_meals TO service_role;
GRANT ALL ON public.coach_chat TO service_role;

-- =====================================================
-- DONE! Now run this in Supabase SQL Editor
-- =====================================================

