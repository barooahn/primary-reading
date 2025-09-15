-- PrimaryReading Database Schema for Supabase
-- Run these commands in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  grade_level INTEGER CHECK (grade_level >= 1 AND grade_level <= 6),
  reading_level TEXT CHECK (reading_level IN ('beginner', 'intermediate', 'advanced')),
  preferred_genres TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  reading_level TEXT NOT NULL CHECK (reading_level IN ('beginner', 'intermediate', 'advanced')),
  genre TEXT,
  word_count INTEGER,
  estimated_reading_time INTEGER, -- in minutes
  is_ai_generated BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story images table
CREATE TABLE IF NOT EXISTS story_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  position_in_story INTEGER,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'short_answer', 'true_false', 'sequence_ordering', 'drawing', 'creative')),
  correct_answer TEXT,
  options JSONB, -- For multiple choice options
  explanation TEXT,
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading sessions table
CREATE TABLE IF NOT EXISTS reading_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  story_id UUID REFERENCES stories(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  reading_progress DECIMAL(3,2) CHECK (reading_progress >= 0.00 AND reading_progress <= 1.00), -- 0.00 to 1.00
  comprehension_score DECIMAL(3,2) CHECK (comprehension_score >= 0.00 AND comprehension_score <= 1.00),
  time_spent_seconds INTEGER
);

-- Question responses table
CREATE TABLE IF NOT EXISTS question_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES reading_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  user_answer TEXT,
  is_correct BOOLEAN,
  response_time_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress and gamification table
CREATE TABLE IF NOT EXISTS user_progress (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  reading_streak INTEGER DEFAULT 0,
  total_stories_read INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  last_read_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Icon name or emoji
  color TEXT NOT NULL, -- Hex color code
  category TEXT NOT NULL CHECK (category IN ('reading', 'comprehension', 'streak', 'exploration', 'achievement')),
  threshold_value INTEGER, -- What value triggers this badge
  threshold_type TEXT, -- What metric this applies to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges junction table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS stories_reading_level_idx ON stories(reading_level);
CREATE INDEX IF NOT EXISTS stories_genre_idx ON stories(genre);
CREATE INDEX IF NOT EXISTS stories_created_at_idx ON stories(created_at);
CREATE INDEX IF NOT EXISTS reading_sessions_user_id_idx ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS reading_sessions_story_id_idx ON reading_sessions(story_id);
CREATE INDEX IF NOT EXISTS question_responses_session_id_idx ON question_responses(session_id);
CREATE INDEX IF NOT EXISTS user_progress_reading_streak_idx ON user_progress(reading_streak);

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Stories: All users can read published stories
CREATE POLICY "Anyone can view published stories" ON stories
  FOR SELECT USING (true);

-- Authors can manage their own stories
CREATE POLICY "Authors can manage own stories" ON stories
  FOR ALL USING (auth.uid() = author_id);

-- Story images: Follow story permissions
CREATE POLICY "Anyone can view story images" ON story_images
  FOR SELECT USING (true);

-- Questions: Follow story permissions  
CREATE POLICY "Anyone can view questions" ON questions
  FOR SELECT USING (true);

-- Reading sessions: Users can only access their own sessions
CREATE POLICY "Users can view own reading sessions" ON reading_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading sessions" ON reading_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading sessions" ON reading_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Question responses: Users can only access their own responses
CREATE POLICY "Users can manage own question responses" ON question_responses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM reading_sessions 
      WHERE reading_sessions.id = question_responses.session_id 
      AND reading_sessions.user_id = auth.uid()
    )
  );

-- User progress: Users can only access their own progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges: Everyone can view badges
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

-- User badges: Users can only access their own badges
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default badges
INSERT INTO badges (name, description, icon, color, category, threshold_value, threshold_type) VALUES
('First Story', 'Read your first story!', '📚', '#4A90E2', 'reading', 1, 'stories_read'),
('Bookworm', 'Read 10 stories', '🐛', '#7ED321', 'reading', 10, 'stories_read'),
('Reading Machine', 'Read 50 stories', '🤖', '#BD10E0', 'reading', 50, 'stories_read'),
('Question Master', 'Answer 100 questions correctly', '🧠', '#F5D547', 'comprehension', 100, 'correct_answers'),
('Streak Starter', 'Read for 3 days in a row', '🔥', '#FF6B6B', 'streak', 3, 'reading_streak'),
('Streak Champion', 'Read for 30 days in a row', '🏆', '#FF9500', 'streak', 30, 'reading_streak'),
('Explorer', 'Try 5 different story genres', '🗺️', '#87CEEB', 'exploration', 5, 'genres_explored'),
('Super Reader', 'Reach level 10', '⭐', '#4A90E2', 'achievement', 10, 'level')
ON CONFLICT DO NOTHING;