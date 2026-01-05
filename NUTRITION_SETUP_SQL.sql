-- =====================================================
-- Rubén Fitness - Nutrition Module Database Schema
-- =====================================================
-- Execute this in your Supabase SQL Editor

-- =====================================================
-- 1. NUTRITION PLANS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.nutrition_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES auth.users(id),
    name VARCHAR(255) NOT NULL DEFAULT 'Plan Nutricional',
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

-- =====================================================
-- 2. NUTRITION MEALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.nutrition_meals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES public.nutrition_plans(id) ON DELETE CASCADE,
    meal_type VARCHAR(50) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'
    meal_order INTEGER DEFAULT 0,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    calories INTEGER,
    protein_grams DECIMAL(10,2),
    carbs_grams DECIMAL(10,2),
    fat_grams DECIMAL(10,2),
    time_suggestion VARCHAR(50), -- '08:00', '13:00', etc.
    foods JSONB, -- Array of food items with portions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. COACH CHAT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.coach_chat (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES auth.users(id),
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    sender_role VARCHAR(20) NOT NULL, -- 'user' or 'coach'
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'plan_update', 'system'
    metadata JSONB, -- For plan change notifications, etc.
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_user ON public.nutrition_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_coach ON public.nutrition_plans(coach_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_meals_plan ON public.nutrition_meals(plan_id);
CREATE INDEX IF NOT EXISTS idx_coach_chat_user ON public.coach_chat(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_chat_coach ON public.coach_chat(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_chat_created ON public.coach_chat(created_at DESC);

-- =====================================================
-- 5. ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_chat ENABLE ROW LEVEL SECURITY;

-- Users can view their own plans
CREATE POLICY "Users can view own nutrition plans" ON public.nutrition_plans
    FOR SELECT USING (auth.uid() = user_id);

-- Coaches can view/edit plans they created
CREATE POLICY "Coaches can manage assigned plans" ON public.nutrition_plans
    FOR ALL USING (auth.uid() = coach_id OR auth.uid() = user_id);

-- Users can view meals from their plans
CREATE POLICY "Users can view own meals" ON public.nutrition_meals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.nutrition_plans 
            WHERE id = nutrition_meals.plan_id 
            AND (user_id = auth.uid() OR coach_id = auth.uid())
        )
    );

-- Coaches can manage meals
CREATE POLICY "Coaches can manage meals" ON public.nutrition_meals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.nutrition_plans 
            WHERE id = nutrition_meals.plan_id 
            AND coach_id = auth.uid()
        )
    );

-- Chat access for participants
CREATE POLICY "Chat participants can view messages" ON public.coach_chat
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = coach_id);

CREATE POLICY "Chat participants can send messages" ON public.coach_chat
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- =====================================================
-- 6. UPDATE TIMESTAMP TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_nutrition_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_nutrition_plans_timestamp
    BEFORE UPDATE ON public.nutrition_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_nutrition_timestamp();

CREATE TRIGGER update_nutrition_meals_timestamp
    BEFORE UPDATE ON public.nutrition_meals
    FOR EACH ROW
    EXECUTE FUNCTION update_nutrition_timestamp();

-- =====================================================
-- 7. SERVICE ROLE POLICIES (for backend)
-- =====================================================
-- Allow service role full access
CREATE POLICY "Service role full access nutrition_plans" ON public.nutrition_plans
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access nutrition_meals" ON public.nutrition_meals
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access coach_chat" ON public.coach_chat
    FOR ALL USING (true) WITH CHECK (true);

