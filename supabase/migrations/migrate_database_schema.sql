-- Migration script to fix schema mismatch
-- Run this in your Supabase SQL Editor

-- First, let's see what we're working with
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'stories' AND table_schema = 'public';

-- The database-schema.sql uses author_id, but the API expects created_by
-- Let's rename the column if it exists as author_id

DO $$ 
BEGIN
  -- Check if stories table has author_id column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' 
    AND column_name = 'author_id'
    AND table_schema = 'public'
  ) THEN
    -- Rename author_id to created_by
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

-- Add missing columns that the API expects but database-schema.sql doesn't have
DO $$
BEGIN
  -- Add description column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'description' AND table_schema = 'public') THEN
    ALTER TABLE stories ADD COLUMN description TEXT;
    RAISE NOTICE 'Added description column';
  END IF;
  
  -- Modify content column to be JSONB (API expects JSONB, but schema has TEXT)
  -- First check if it's currently TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' 
    AND column_name = 'content'
    AND data_type = 'text'
    AND table_schema = 'public'
  ) THEN
    -- Convert existing TEXT content to JSONB format
    UPDATE stories SET content = ('{"raw": "' || replace(content, '"', '\"') || '"}')::jsonb WHERE content IS NOT NULL;
    -- Change column type
    ALTER TABLE stories ALTER COLUMN content TYPE jsonb USING content::jsonb;
    RAISE NOTICE 'Converted content column from TEXT to JSONB';
  END IF;
  
  -- Add theme column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'theme' AND table_schema = 'public') THEN
    ALTER TABLE stories ADD COLUMN theme VARCHAR(100);
    RAISE NOTICE 'Added theme column';
  END IF;
  
  -- Add story_type column with enum (create enum first if it doesn't exist)
  DO $enum$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'story_type') THEN
      CREATE TYPE story_type AS ENUM ('fiction', 'non_fiction');
    END IF;
  END $enum$;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'story_type' AND table_schema = 'public') THEN
    ALTER TABLE stories ADD COLUMN story_type story_type NOT NULL DEFAULT 'fiction';
    RAISE NOTICE 'Added story_type column';
  END IF;
  
  -- Add grade_level column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'grade_level' AND table_schema = 'public') THEN
    ALTER TABLE stories ADD COLUMN grade_level INTEGER CHECK (grade_level BETWEEN 1 AND 6);
    RAISE NOTICE 'Added grade_level column';
  END IF;
  
  -- Add difficulty_rating column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'difficulty_rating' AND table_schema = 'public') THEN
    ALTER TABLE stories ADD COLUMN difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5);
    RAISE NOTICE 'Added difficulty_rating column';
  END IF;
  
  -- Add cover_image_url column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'cover_image_url' AND table_schema = 'public') THEN
    ALTER TABLE stories ADD COLUMN cover_image_url TEXT;
    RAISE NOTICE 'Added cover_image_url column';
  END IF;
  
  -- Add is_featured column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'is_featured' AND table_schema = 'public') THEN
    ALTER TABLE stories ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_featured column';
  END IF;
  
  -- Add is_published column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'is_published' AND table_schema = 'public') THEN
    ALTER TABLE stories ADD COLUMN is_published BOOLEAN DEFAULT TRUE;
    RAISE NOTICE 'Added is_published column';
  END IF;

  -- Update reading_level column to use enum if it's currently TEXT
  DO $reading_level$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reading_level') THEN
      CREATE TYPE reading_level AS ENUM ('beginner', 'intermediate', 'advanced');
    END IF;
  END $reading_level$;

  -- Check if reading_level is currently text and convert to enum
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' 
    AND column_name = 'reading_level'
    AND data_type = 'text'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE stories ALTER COLUMN reading_level TYPE reading_level USING reading_level::reading_level;
    RAISE NOTICE 'Converted reading_level to enum type';
  END IF;

END $$;

-- Also create the story_segments and questions tables if they don't exist
-- (needed for the API's additional functionality)

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

-- Update questions table if it exists but is missing columns
DO $$
BEGIN
  -- Add segment_id column to questions if missing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'segment_id' AND table_schema = 'public') THEN
      ALTER TABLE questions ADD COLUMN segment_id UUID REFERENCES story_segments(id) ON DELETE CASCADE;
      RAISE NOTICE 'Added segment_id to questions table';
    END IF;
    
    -- Add points column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'points' AND table_schema = 'public') THEN
      ALTER TABLE questions ADD COLUMN points INTEGER DEFAULT 10;
      RAISE NOTICE 'Added points to questions table';
    END IF;
    
    -- Rename difficulty_level to difficulty if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'difficulty_level' AND table_schema = 'public') THEN
      ALTER TABLE questions RENAME COLUMN difficulty_level TO difficulty;
      RAISE NOTICE 'Renamed difficulty_level to difficulty in questions table';
    END IF;
  END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Show final table structure
SELECT 'stories table columns:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'stories' AND table_schema = 'public'
ORDER BY column_name;