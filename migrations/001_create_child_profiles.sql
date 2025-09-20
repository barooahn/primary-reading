-- Migration: Create child_profiles table
-- Description: Table to store child profiles created by parents/teachers

-- Create child_profiles table
CREATE TABLE IF NOT EXISTS child_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Parent/teacher who created this profile (foreign key to auth.users)
    parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Basic child information
    name VARCHAR(255) NOT NULL,
    year_level INTEGER NOT NULL CHECK (year_level >= 1 AND year_level <= 6),
    age INTEGER NOT NULL CHECK (age >= 5 AND age <= 12),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('boy', 'girl', 'other')),

    -- Reading preferences as JSONB for flexibility
    preferences JSONB NOT NULL DEFAULT '{
        "favoriteGenres": [],
        "contentFilters": ["age-appropriate"],
        "allowedTopics": [],
        "blockedTopics": []
    }'::jsonb,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_child_profiles_parent_user_id ON child_profiles(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_child_profiles_year_level ON child_profiles(year_level);
CREATE INDEX IF NOT EXISTS idx_child_profiles_age ON child_profiles(age);
CREATE INDEX IF NOT EXISTS idx_child_profiles_created_at ON child_profiles(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_child_profiles_updated_at
    BEFORE UPDATE ON child_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Parents can only see their own children's profiles
CREATE POLICY "Users can view their own child profiles" ON child_profiles
    FOR SELECT USING (auth.uid() = parent_user_id);

-- Policy: Parents can insert child profiles for themselves
CREATE POLICY "Users can insert their own child profiles" ON child_profiles
    FOR INSERT WITH CHECK (auth.uid() = parent_user_id);

-- Policy: Parents can update their own children's profiles
CREATE POLICY "Users can update their own child profiles" ON child_profiles
    FOR UPDATE USING (auth.uid() = parent_user_id);

-- Policy: Parents can delete their own children's profiles
CREATE POLICY "Users can delete their own child profiles" ON child_profiles
    FOR DELETE USING (auth.uid() = parent_user_id);

-- Grant necessary permissions
GRANT ALL ON child_profiles TO authenticated;