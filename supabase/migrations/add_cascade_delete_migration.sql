-- Migration: Add CASCADE DELETE for complete user data cleanup
-- Run this in your Supabase SQL Editor to ensure all user data is deleted when a user is removed

-- First, drop existing foreign key constraints that don't have CASCADE DELETE
-- and recreate them with proper CASCADE DELETE

BEGIN;

-- Drop and recreate foreign key constraints with CASCADE DELETE

-- 1. profiles table - already references auth.users(id) as PRIMARY KEY, so it will cascade automatically

-- 2. stories table - update created_by constraint
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_created_by_fkey;
ALTER TABLE stories ADD CONSTRAINT stories_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. user_progress table - already has ON DELETE CASCADE

-- 4. user_answers table - already has ON DELETE CASCADE  

-- 5. user_badges table - already has ON DELETE CASCADE

-- 6. goals table - already has ON DELETE CASCADE

-- 7. story_ratings table - already has ON DELETE CASCADE

-- Add a function to handle complete user deletion
CREATE OR REPLACE FUNCTION delete_user_completely(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
    -- Delete user data in proper order to avoid constraint violations
    
    -- Delete dependent records first (those that reference the user)
    DELETE FROM story_ratings WHERE user_id = user_id_param;
    DELETE FROM goals WHERE user_id = user_id_param;
    DELETE FROM user_badges WHERE user_id = user_id_param;
    DELETE FROM user_answers WHERE user_id = user_id_param;
    DELETE FROM user_progress WHERE user_id = user_id_param;
    
    -- Delete stories created by the user (this will CASCADE to story_segments and questions)
    DELETE FROM stories WHERE created_by = user_id_param;
    
    -- Delete the user profile
    DELETE FROM profiles WHERE id = user_id_param;
    
    -- Finally delete from auth.users
    DELETE FROM auth.users WHERE id = user_id_param;
    
    -- Log the deletion (optional)
    RAISE NOTICE 'User % and all related data has been deleted', user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (for self-deletion)
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO authenticated;

-- Create a safer function for admin use that shows what will be deleted first
CREATE OR REPLACE FUNCTION preview_user_deletion(user_id_param UUID)
RETURNS TABLE(
    table_name TEXT,
    record_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'profiles'::TEXT, COUNT(*) FROM profiles WHERE id = user_id_param
    UNION ALL
    SELECT 'stories'::TEXT, COUNT(*) FROM stories WHERE created_by = user_id_param
    UNION ALL
    SELECT 'user_progress'::TEXT, COUNT(*) FROM user_progress WHERE user_id = user_id_param
    UNION ALL
    SELECT 'user_answers'::TEXT, COUNT(*) FROM user_answers WHERE user_id = user_id_param
    UNION ALL
    SELECT 'user_badges'::TEXT, COUNT(*) FROM user_badges WHERE user_id = user_id_param
    UNION ALL
    SELECT 'goals'::TEXT, COUNT(*) FROM goals WHERE user_id = user_id_param
    UNION ALL
    SELECT 'story_ratings'::TEXT, COUNT(*) FROM story_ratings WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION preview_user_deletion(UUID) TO authenticated;

COMMIT;