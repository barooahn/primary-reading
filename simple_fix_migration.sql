-- Simple migration to fix the PGRST204 error
-- Run this in your Supabase SQL Editor

-- Step 1: Handle the created_by column issue
DO $$ 
BEGIN
  -- Check if stories table has author_id column and rename it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' 
    AND column_name = 'author_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE stories RENAME COLUMN author_id TO created_by;
    RAISE NOTICE 'Renamed author_id to created_by';
  END IF;

  -- Add created_by if it doesn't exist at all
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' 
    AND column_name = 'created_by'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE stories ADD COLUMN created_by UUID REFERENCES auth.users(id);
    RAISE NOTICE 'Added created_by column';
  END IF;
END $$;

-- Step 2: Add missing columns one by one
ALTER TABLE stories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS theme VARCHAR(100);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS grade_level INTEGER CHECK (grade_level BETWEEN 1 AND 6);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

-- Step 3: Create story_type enum and add column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'story_type') THEN
    CREATE TYPE story_type AS ENUM ('fiction', 'non_fiction');
  END IF;
END $$;

ALTER TABLE stories ADD COLUMN IF NOT EXISTS story_type story_type DEFAULT 'fiction';

-- Step 4: Handle content column conversion to JSONB
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' 
    AND column_name = 'content'
    AND data_type = 'text'
    AND table_schema = 'public'
  ) THEN
    -- Convert existing TEXT content to JSONB format, handling quotes properly
    UPDATE stories 
    SET content = ('{"raw": "' || replace(replace(content, '\', '\\'), '"', '\"') || '"}')::jsonb 
    WHERE content IS NOT NULL;
    
    -- Change column type
    ALTER TABLE stories ALTER COLUMN content TYPE jsonb USING content::jsonb;
    RAISE NOTICE 'Converted content column from TEXT to JSONB';
  END IF;
END $$;

-- Step 5: Create story_segments table
CREATE TABLE IF NOT EXISTS story_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  segment_order INTEGER NOT NULL,
  title VARCHAR(200),
  content TEXT NOT NULL,
  image_url TEXT,
  image_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Update questions table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions' AND table_schema = 'public') THEN
    -- Add missing columns
    ALTER TABLE questions ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 10;
    
    -- Rename difficulty_level to difficulty if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'difficulty_level' AND table_schema = 'public') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'difficulty' AND table_schema = 'public') THEN
      ALTER TABLE questions RENAME COLUMN difficulty_level TO difficulty;
    END IF;
  END IF;
END $$;

-- Step 7: Create the increment_user_stories function
CREATE OR REPLACE FUNCTION increment_user_stories(user_id UUID)
RETURNS void AS $$
BEGIN
  -- Insert or update user progress
  INSERT INTO user_progress (user_id, total_stories_read, updated_at)
  VALUES (user_id, 1, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    total_stories_read = user_progress.total_stories_read + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_user_stories(UUID) TO authenticated;

-- Step 8: Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Step 9: Show what we have now
SELECT 'Current stories table structure:' as message;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'stories' AND table_schema = 'public'
ORDER BY column_name;