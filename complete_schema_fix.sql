-- Complete schema fix for PrimaryReading Supabase database
-- Run this in your Supabase SQL Editor

-- Step 1: Add missing foreign key constraints
DO $$
BEGIN
  -- Add foreign key constraint for stories.created_by -> auth.users.id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'stories' 
    AND constraint_type = 'FOREIGN KEY' 
    AND constraint_name = 'stories_created_by_fkey'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE stories 
    ADD CONSTRAINT stories_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);
    RAISE NOTICE 'Added foreign key constraint: stories.created_by -> auth.users.id';
  END IF;

  -- Add foreign key constraint for user_profiles.id -> auth.users.id  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'user_profiles' 
    AND constraint_type = 'FOREIGN KEY' 
    AND constraint_name = 'user_profiles_id_fkey'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id);
    RAISE NOTICE 'Added foreign key constraint: user_profiles.id -> auth.users.id';
  END IF;

  -- Add foreign key constraint for user_progress.user_id -> auth.users.id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'user_progress' 
    AND constraint_type = 'FOREIGN KEY' 
    AND constraint_name = 'user_progress_user_id_fkey'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE user_progress 
    ADD CONSTRAINT user_progress_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);
    RAISE NOTICE 'Added foreign key constraint: user_progress.user_id -> auth.users.id';
  END IF;

  -- Ensure story_segments.story_id -> stories.id constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'story_segments' 
    AND constraint_type = 'FOREIGN KEY' 
    AND constraint_name = 'story_segments_story_id_fkey'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE story_segments 
    ADD CONSTRAINT story_segments_story_id_fkey 
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint: story_segments.story_id -> stories.id';
  END IF;

  -- Ensure questions.story_id -> stories.id constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'questions' 
    AND constraint_type = 'FOREIGN KEY' 
    AND constraint_name = 'questions_story_id_fkey'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE questions 
    ADD CONSTRAINT questions_story_id_fkey 
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint: questions.story_id -> stories.id';
  END IF;

  -- Ensure story_images.story_id -> stories.id constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'story_images' 
    AND constraint_type = 'FOREIGN KEY' 
    AND constraint_name = 'story_images_story_id_fkey'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE story_images 
    ADD CONSTRAINT story_images_story_id_fkey 
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint: story_images.story_id -> stories.id';
  END IF;

END $$;

-- Step 2: Ensure RLS (Row Level Security) is properly configured
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Step 3: Create/update RLS policies for stories table
-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Stories policies
  DROP POLICY IF EXISTS "Anyone can view published stories" ON stories;
  DROP POLICY IF EXISTS "Authors can manage own stories" ON stories;
  DROP POLICY IF EXISTS "Users can insert stories" ON stories;
  
  -- Allow anyone to read published stories
  CREATE POLICY "Anyone can view published stories" ON stories
    FOR SELECT USING (is_published = true);
  
  -- Allow authenticated users to insert their own stories
  CREATE POLICY "Users can insert stories" ON stories
    FOR INSERT WITH CHECK (auth.uid() = created_by);
  
  -- Allow users to manage their own stories
  CREATE POLICY "Authors can manage own stories" ON stories
    FOR ALL USING (auth.uid() = created_by);

  -- User profiles policies  
  DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
  
  CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);
  
  CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);
  
  CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

  -- User progress policies
  DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
  DROP POLICY IF EXISTS "Users can update own progress" ON user_progress; 
  DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
  
  CREATE POLICY "Users can view own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  RAISE NOTICE 'Updated RLS policies for all tables';
END $$;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS stories_created_by_idx ON stories(created_by);
CREATE INDEX IF NOT EXISTS stories_reading_level_idx ON stories(reading_level);
CREATE INDEX IF NOT EXISTS stories_genre_idx ON stories(genre);
CREATE INDEX IF NOT EXISTS stories_is_published_idx ON stories(is_published);
CREATE INDEX IF NOT EXISTS story_segments_story_id_idx ON story_segments(story_id);
CREATE INDEX IF NOT EXISTS questions_story_id_idx ON questions(story_id);
CREATE INDEX IF NOT EXISTS user_progress_user_id_idx ON user_progress(user_id);

-- Step 5: Fix or create the increment_user_stories function  
DROP FUNCTION IF EXISTS increment_user_stories(uuid);

CREATE OR REPLACE FUNCTION increment_user_stories(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_progress (user_id, total_stories_read, updated_at)
  VALUES (p_user_id, 1, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    total_stories_read = user_progress.total_stories_read + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_user_stories(UUID) TO authenticated;

-- Step 6: Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Step 7: Show completion message and test query
SELECT 'Schema fix completed successfully!' as status;

-- Test the foreign key relationships
SELECT 'Testing foreign key relationships...' as test;
SELECT 
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('stories', 'user_profiles', 'user_progress', 'story_segments', 'questions', 'story_images')
ORDER BY tc.table_name, tc.constraint_name;