-- Fix RLS policies to allow INSERT operations for story_segments and questions
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can insert segments for their own stories" ON story_segments;
DROP POLICY IF EXISTS "Users can insert questions for their own stories" ON questions;
DROP POLICY IF EXISTS "Users can update segments for their own stories" ON story_segments;
DROP POLICY IF EXISTS "Users can update questions for their own stories" ON questions;

-- Add INSERT policy for story_segments
-- Users can insert segments for stories they created
CREATE POLICY "Users can insert segments for their own stories" ON story_segments FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM stories WHERE stories.id = story_segments.story_id AND stories.created_by = auth.uid()));

-- Add INSERT policy for questions  
-- Users can insert questions for stories they created
CREATE POLICY "Users can insert questions for their own stories" ON questions FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM stories WHERE stories.id = questions.story_id AND stories.created_by = auth.uid()));

-- Add UPDATE policies in case they're needed later
CREATE POLICY "Users can update segments for their own stories" ON story_segments FOR UPDATE 
USING (EXISTS (SELECT 1 FROM stories WHERE stories.id = story_segments.story_id AND stories.created_by = auth.uid()));

CREATE POLICY "Users can update questions for their own stories" ON questions FOR UPDATE 
USING (EXISTS (SELECT 1 FROM stories WHERE stories.id = questions.story_id AND stories.created_by = auth.uid()));

-- Check if the policies were created successfully
SELECT schemaname, tablename, policyname, permissive, cmd, qual
FROM pg_policies 
WHERE tablename IN ('story_segments', 'questions')
ORDER BY tablename, policyname;