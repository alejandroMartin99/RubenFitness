-- =====================================================
-- Sleep Data Table for Rubén Fitness
-- =====================================================
-- This table stores daily health data including sleep hours
-- Execute this in your Supabase SQL Editor

-- Create daily_health_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.daily_health_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_hours DECIMAL(4, 2) DEFAULT 0,
  water_ml INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_health_data_user_id ON public.daily_health_data(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_health_data_date ON public.daily_health_data(date);

-- Enable RLS
ALTER TABLE public.daily_health_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own health data" ON public.daily_health_data;
CREATE POLICY "Users can view own health data" ON public.daily_health_data
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own health data" ON public.daily_health_data;
CREATE POLICY "Users can insert own health data" ON public.daily_health_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own health data" ON public.daily_health_data;
CREATE POLICY "Users can update own health data" ON public.daily_health_data
  FOR UPDATE USING (auth.uid() = user_id);

