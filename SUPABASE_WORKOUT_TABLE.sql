-- =====================================================
-- Workout Days Table for Rubén Fitness
-- =====================================================
-- This table stores workout completion days
-- Execute this in your Supabase SQL Editor

-- Create workout_days table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.workout_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_workout_days_user_id ON public.workout_days(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_days_date ON public.workout_days(date);

-- Enable RLS
ALTER TABLE public.workout_days ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own workout days" ON public.workout_days;
CREATE POLICY "Users can view own workout days" ON public.workout_days
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own workout days" ON public.workout_days;
CREATE POLICY "Users can insert own workout days" ON public.workout_days
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own workout days" ON public.workout_days;
CREATE POLICY "Users can update own workout days" ON public.workout_days
  FOR UPDATE USING (auth.uid() = user_id);

