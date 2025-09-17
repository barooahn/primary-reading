# Database Setup for Child Profiles

This document explains how to set up the database tables for the child profiles feature.

## Prerequisites

- Supabase project set up and connected
- Access to the Supabase SQL editor or psql command line

## Migration Script

Run the following SQL script in your Supabase SQL editor to create the child_profiles table:

```sql
-- Copy and paste the contents of migrations/001_create_child_profiles.sql
```

## What the Migration Creates

### Tables
- `child_profiles`: Stores child profile data including name, age, reading level, and topic preferences

### Fields
- `id` (UUID): Primary key
- `parent_user_id` (UUID): Reference to the parent/teacher who created the profile
- `name` (VARCHAR): Child's name
- `year_level` (INTEGER): School year level (1-6)
- `age` (INTEGER): Child's age (5-12)
- `gender` (VARCHAR): Child's gender (boy/girl/other)
- `preferences` (JSONB): Reading preferences including allowed topics
- `created_at` (TIMESTAMP): When the profile was created
- `updated_at` (TIMESTAMP): When the profile was last updated

### Security
- Row Level Security (RLS) enabled
- Parents can only access their own children's profiles
- Automatic user ID validation

### Indexes
- Optimized for common queries by parent_user_id, year_level, age, and creation date

## API Endpoints

The following API endpoints are available:

### GET /api/child-profiles
Fetch all child profiles for the authenticated user.

### POST /api/child-profiles
Create a new child profile.

**Body:**
```json
{
  "name": "Child Name",
  "year_level": 3,
  "age": 7,
  "gender": "other",
  "preferences": {
    "favoriteGenres": [],
    "contentFilters": ["age-appropriate"],
    "allowedTopics": ["🐱 Cats & Kittens", "🏫 School Adventures"],
    "blockedTopics": []
  }
}
```

### GET /api/child-profiles/[id]
Fetch a specific child profile by ID.

### PATCH /api/child-profiles/[id]
Update a child profile.

### DELETE /api/child-profiles/[id]
Delete a child profile.

## Frontend Integration

The frontend components have been updated to use the database:

1. **Parent Setup Page** (`/parent-setup`) - Now saves child profiles to database
2. **Topic Editing Page** (`/parent-setup/edit-topics/[childId]`) - Loads and saves topic preferences
3. **useChildProfiles Hook** - Provides database operations for child profiles

## Data Flow

1. Parent creates child profile with basic info (name, year, gender)
2. Parent selects topics for the child
3. Profile is saved to database with all preferences
4. Parent can edit topics later via dedicated editing page
5. All changes are persisted to Supabase database

## Testing

To test the implementation:

1. Run the migration script in Supabase
2. Visit `/parent-setup` as an authenticated user
3. Create a child profile
4. Verify the profile appears in the Supabase dashboard
5. Edit topics and confirm changes are saved

## Error Handling

The implementation includes comprehensive error handling:
- Database connection errors
- Validation errors (age, year level, etc.)
- Authentication errors
- Not found errors
- Server errors

All errors are logged to the console and appropriate error messages are returned to the client.