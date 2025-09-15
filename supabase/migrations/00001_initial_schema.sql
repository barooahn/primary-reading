-- PrimaryReading Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE reading_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer', 'drag_drop', 'sequence');
CREATE TYPE story_type AS ENUM ('fiction', 'non_fiction');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  grade_level INTEGER CHECK (grade_level BETWEEN 1 AND 6),
  reading_level reading_level DEFAULT 'beginner',
  experience_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  reading_streak INTEGER DEFAULT 0,
  last_read_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories table
CREATE TABLE stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content JSONB NOT NULL, -- Story segments
  genre VARCHAR(50),
  theme VARCHAR(100),
  reading_level reading_level NOT NULL,
  story_type story_type NOT NULL,
  grade_level INTEGER CHECK (grade_level BETWEEN 1 AND 6),
  word_count INTEGER,
  estimated_reading_time INTEGER, -- in minutes
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  cover_image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story segments table (for the reading interface)
CREATE TABLE story_segments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  segment_order INTEGER NOT NULL,
  title VARCHAR(200),
  content TEXT NOT NULL,
  image_url TEXT,
  image_prompt TEXT, -- For AI image generation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES story_segments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL,
  options JSONB, -- For multiple choice, drag & drop, etc.
  correct_answer JSONB NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 10,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 3) DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  current_segment INTEGER DEFAULT 1,
  segments_completed INTEGER DEFAULT 0,
  total_segments INTEGER NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  is_bookmarked BOOLEAN DEFAULT FALSE,
  reading_time_minutes INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- User answers table
CREATE TABLE user_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_answer JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_earned INTEGER DEFAULT 0,
  time_taken_seconds INTEGER,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(10), -- Emoji
  color VARCHAR(7), -- Hex color
  criteria JSONB NOT NULL, -- Conditions to earn the badge
  points_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges table
CREATE TABLE user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Goals table
CREATE TABLE goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  metric VARCHAR(50) NOT NULL, -- 'stories', 'minutes', 'questions'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story ratings table
CREATE TABLE story_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Create indexes for better performance
CREATE INDEX idx_stories_reading_level ON stories(reading_level);
CREATE INDEX idx_stories_genre ON stories(genre);
CREATE INDEX idx_stories_featured ON stories(is_featured);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX idx_story_segments_story_id ON story_segments(story_id);
CREATE INDEX idx_questions_story_id ON questions(story_id);

-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_ratings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Stories policies (public read, authenticated write)
CREATE POLICY "Anyone can view published stories" ON stories FOR SELECT USING (is_published = true);
CREATE POLICY "Users can create stories" ON stories FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own stories" ON stories FOR UPDATE USING (auth.uid() = created_by);

-- Story segments policies
CREATE POLICY "Anyone can view segments of published stories" ON story_segments FOR SELECT 
USING (EXISTS (SELECT 1 FROM stories WHERE stories.id = story_segments.story_id AND stories.is_published = true));

-- Questions policies
CREATE POLICY "Anyone can view questions for published stories" ON questions FOR SELECT 
USING (EXISTS (SELECT 1 FROM stories WHERE stories.id = questions.story_id AND stories.is_published = true));

-- User progress policies
CREATE POLICY "Users can view their own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- User answers policies
CREATE POLICY "Users can view their own answers" ON user_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own answers" ON user_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User badges policies
CREATE POLICY "Users can view their own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert user badges" ON user_badges FOR INSERT WITH CHECK (true);

-- Goals policies
CREATE POLICY "Users can view their own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own goals" ON goals FOR ALL USING (auth.uid() = user_id);

-- Story ratings policies
CREATE POLICY "Users can view all story ratings" ON story_ratings FOR SELECT USING (true);
CREATE POLICY "Users can manage their own ratings" ON story_ratings FOR ALL USING (auth.uid() = user_id);

-- Badges are public read
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (is_active = true);

-- Insert some initial badges
INSERT INTO badges (name, description, icon, color, criteria, points_reward) VALUES
('First Story', 'Complete your first story!', '📚', '#4A90E2', '{"stories_completed": 1}', 50),
('Streak Starter', 'Read for 3 days in a row', '🔥', '#FF6B6B', '{"reading_streak": 3}', 75),
('Question Master', 'Answer 50 questions correctly', '🧠', '#F5D547', '{"correct_answers": 50}', 100),
('Explorer', 'Try 5 different story genres', '🗺️', '#87CEEB', '{"genres_explored": 5}', 125),
('Speed Reader', 'Complete a story in under 5 minutes', '⚡', '#9B59B6', '{"fastest_completion": 5}', 100),
('Perfect Score', 'Get 100% on a story quiz', '⭐', '#2ECC71', '{"perfect_scores": 1}', 150),
('Bookworm', 'Read 25 stories', '🐛', '#E67E22', '{"stories_completed": 25}', 250),
('Scholar', 'Reach Level 10', '🎓', '#34495E', '{"level_reached": 10}', 300);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();