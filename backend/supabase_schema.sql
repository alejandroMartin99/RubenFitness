-- =====================================================
-- Rubén Fitness - Supabase Database Schema
-- =====================================================
-- This file contains the complete database schema for the Rubén Fitness application
-- Execute this in your Supabase SQL Editor

-- =====================================================
-- 1. EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. CUSTOM TYPES
-- =====================================================
CREATE TYPE fitness_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE user_role AS ENUM ('admin', 'user', 'coach');
CREATE TYPE workout_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

-- =====================================================
-- 3. USERS TABLE (extends auth.users)
-- =====================================================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  age INTEGER,
  fitness_level fitness_level DEFAULT 'beginner',
  role user_role DEFAULT 'user',
  goals TEXT[],
  availability JSONB, -- { days: [1,2,3], time_preference: 'morning' }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. WORKOUTS TABLE
-- =====================================================
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  difficulty workout_difficulty DEFAULT 'medium',
  equipment_needed TEXT[],
  target_muscles TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. EXERCISES TABLE
-- =====================================================
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sets INTEGER,
  repetitions INTEGER,
  rest_seconds INTEGER,
  weight_kg DECIMAL,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. PROGRESS TABLE
-- =====================================================
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT true,
  duration_minutes INTEGER,
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. CHAT MESSAGES TABLE
-- =====================================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  session_id UUID,
  metadata JSONB, -- For storing additional context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. HABITS TABLE
-- =====================================================
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_frequency INTEGER, -- e.g., 5 times per week
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. HABIT TRACKING TABLE
-- =====================================================
CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, log_date)
);

-- =====================================================
-- 10. CLIENT-COACH RELATIONSHIPS
-- =====================================================
CREATE TABLE public.coach_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active', -- active, paused, ended
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coach_id, client_id)
);

-- =====================================================
-- 11. INDEXES for Performance
-- =====================================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

CREATE INDEX idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX idx_workouts_created_at ON public.workouts(created_at DESC);

CREATE INDEX idx_exercises_workout_id ON public.exercises(workout_id);

CREATE INDEX idx_progress_user_id ON public.progress(user_id);
CREATE INDEX idx_progress_workout_date ON public.progress(workout_date DESC);
CREATE INDEX idx_progress_user_date ON public.progress(user_id, workout_date DESC);

CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

CREATE INDEX idx_habits_user_id ON public.habits(user_id);

CREATE INDEX idx_habit_logs_user_id ON public.habit_logs(user_id);
CREATE INDEX idx_habit_logs_log_date ON public.habit_logs(log_date DESC);

CREATE INDEX idx_coach_clients_coach_id ON public.coach_clients(coach_id);
CREATE INDEX idx_coach_clients_client_id ON public.coach_clients(client_id);

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_clients ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 13. RLS POLICIES - USERS
-- =====================================================
-- Users can view and update their own data
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 14. RLS POLICIES - WORKOUTS
-- =====================================================
-- Users can manage their own workouts
CREATE POLICY "Users can manage own workouts"
  ON public.workouts FOR ALL
  USING (auth.uid() = user_id);

-- Coaches can manage their clients' workouts
CREATE POLICY "Coaches can manage client workouts"
  ON public.workouts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_id = auth.uid() 
      AND client_id = public.workouts.user_id
      AND status = 'active'
    )
  );

-- =====================================================
-- 15. RLS POLICIES - EXERCISES
-- =====================================================
-- Users can view exercises for their workouts
CREATE POLICY "Users can view own exercises"
  ON public.exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE id = public.exercises.workout_id 
      AND user_id = auth.uid()
    )
  );

-- =====================================================
-- 16. RLS POLICIES - PROGRESS
-- =====================================================
-- Users can manage their own progress
CREATE POLICY "Users can manage own progress"
  ON public.progress FOR ALL
  USING (auth.uid() = user_id);

-- Coaches can view their clients' progress
CREATE POLICY "Coaches can view client progress"
  ON public.progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_id = auth.uid() 
      AND client_id = public.progress.user_id
      AND status = 'active'
    )
  );

-- =====================================================
-- 17. RLS POLICIES - CHAT MESSAGES
-- =====================================================
-- Users can manage their own chat messages
CREATE POLICY "Users can manage own messages"
  ON public.chat_messages FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- 18. RLS POLICIES - HABITS
-- =====================================================
CREATE POLICY "Users can manage own habits"
  ON public.habits FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own habit logs"
  ON public.habit_logs FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- 19. RLS POLICIES - COACH CLIENTS
-- =====================================================
CREATE POLICY "Coaches can view their clients"
  ON public.coach_clients FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can manage their clients"
  ON public.coach_clients FOR ALL
  USING (auth.uid() = coach_id);

-- =====================================================
-- 20. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for workouts table
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for habits table
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 21. VIEWS for Convenience
-- =====================================================

-- View for user progress summary
CREATE VIEW user_progress_summary AS
SELECT 
  u.id as user_id,
  u.full_name,
  COUNT(DISTINCT p.id) as total_workouts,
  MAX(p.workout_date) as last_workout_date,
  AVG(p.satisfaction_rating) as avg_rating
FROM public.users u
LEFT JOIN public.progress p ON u.id = p.user_id
GROUP BY u.id, u.full_name;

-- View for coach's active clients
CREATE VIEW coach_active_clients AS
SELECT 
  cc.coach_id,
  cc.client_id,
  u.full_name as client_name,
  u.email as client_email,
  cc.status,
  cc.assigned_at,
  (SELECT COUNT(*) FROM public.progress WHERE user_id = cc.client_id) as total_workouts,
  (SELECT MAX(workout_date) FROM public.progress WHERE user_id = cc.client_id) as last_workout
FROM public.coach_clients cc
JOIN public.users u ON cc.client_id = u.id
WHERE cc.status = 'active';

-- =====================================================
-- 22. INITIAL DATA (Optional - for testing)
-- =====================================================

-- You can insert test data here if needed
-- Example admin user (after Supabase Auth creates the auth.users record)
-- INSERT INTO public.users (id, email, full_name, role)
-- VALUES ('admin-uuid-here', 'admin@ruben.fitness', 'Admin User', 'admin');

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- To verify the schema was created correctly:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

