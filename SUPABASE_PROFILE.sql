CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT,
  gender TEXT,
  birth_date DATE,
  height_cm INT,
  weight_kg INT,
  goal TEXT,
  activity_level TEXT,
  habits TEXT,
  photo_url TEXT,
  -- granular habits fields
  diet TEXT,
  sleep_hours_target INT,
  water_goal_ml INT,
  injuries TEXT,
  allergies TEXT,
  medication TEXT,
  training_experience TEXT,
  equipment TEXT,
  availability_days TEXT,
  availability_hours TEXT,
  stress_level TEXT,
  nutrition_preference TEXT,
  smoking BOOLEAN,
  alcohol BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);


-- Idempotent alter statements for deployments where table already exists
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS diet TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS sleep_hours_target INT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS water_goal_ml INT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS injuries TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS medication TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS training_experience TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS equipment TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS availability_days TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS availability_hours TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS stress_level TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS nutrition_preference TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS smoking BOOLEAN;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS alcohol BOOLEAN;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS notes TEXT;


