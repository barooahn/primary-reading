-- Fix the increment_user_stories function by dropping and recreating
-- Run this in your Supabase SQL Editor

-- Drop the existing function first
DROP FUNCTION IF EXISTS increment_user_stories(uuid);

-- Create the corrected function with proper parameter naming
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_user_stories(UUID) TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';