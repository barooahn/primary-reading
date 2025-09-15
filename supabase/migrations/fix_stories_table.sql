-- Fix stories table - add missing created_by column
-- Run this in your Supabase SQL Editor

-- First, let's check if the stories table exists and what columns it has
-- (You can run this separately to see the current structure)
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'stories' AND table_schema = 'public';

-- Add the missing created_by column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' 
    AND column_name = 'created_by'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE stories ADD COLUMN created_by UUID REFERENCES auth.users(id);
    RAISE NOTICE 'Added created_by column to stories table';
  ELSE
    RAISE NOTICE 'created_by column already exists';
  END IF;
END $$;

-- Ensure all required columns exist in stories table
DO $$
BEGIN
  -- Add theme column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'theme' AND table_schema = 'public') THEN
    ALTER TABLE stories ADD COLUMN theme VARCHAR(100);
  END IF;
  
  -- Add story_type column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'story_type' AND table_schema = 'public') THEN
    ALTER TABLE stories ADD COLUMN story_type story_type NOT NULL DEFAULT 'fiction';
  END IF;
  
  -- Add difficulty_rating column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'difficulty_rating' AND table_schema = 'public') THEN
    ALTER TABLE stories ADD COLUMN difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5);
  END IF;
  
  -- Add cover_image_url column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'cover_image_url' AND table_schema = 'public') THEN
    ALTER TABLE stories ADD COLUMN cover_image_url TEXT;
  END IF;
  
  -- Add is_featured column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'is_featured' AND table_schema = 'public') THEN
    ALTER TABLE stories ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add is_published column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'is_published' AND table_schema = 'public') THEN
    ALTER TABLE stories ADD COLUMN is_published BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';