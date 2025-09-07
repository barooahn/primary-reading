import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface BookmarkRequest {
  storyId: string;
  action: 'add' | 'remove';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: BookmarkRequest = await request.json();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (body.action === 'add') {
      // Add bookmark - we'll use user_badges table for now, or create a separate bookmarks table
      // For this demo, let's create a simple bookmark system using the user_progress table
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          story_id: body.storyId,
          is_bookmarked: true,
          total_segments: 1, // Default value
        }, {
          onConflict: 'user_id,story_id',
        });

      if (error) {
        console.error('Bookmark add error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to add bookmark' },
          { status: 500 }
        );
      }
    } else {
      // Remove bookmark
      const { error } = await supabase
        .from('user_progress')
        .update({ is_bookmarked: false })
        .eq('user_id', user.id)
        .eq('story_id', body.storyId);

      if (error) {
        console.error('Bookmark remove error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to remove bookmark' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      bookmarked: body.action === 'add',
      message: body.action === 'add' ? 'Story bookmarked!' : 'Bookmark removed!'
    });

  } catch (error) {
    console.error('Bookmark error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's bookmarks  
export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get bookmarked stories
    const { data: bookmarks, error } = await supabase
      .from('user_progress')
      .select(`
        story_id,
        stories (
          id,
          title,
          description,
          genre,
          reading_level,
          grade_level,
          estimated_reading_time,
          difficulty_rating,
          cover_image_url,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .eq('is_bookmarked', true);

    if (error) {
      console.error('Get bookmarks error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to get bookmarks' },
        { status: 500 }
      );
    }

    const bookmarkedStories = bookmarks?.map(bookmark => bookmark.stories) || [];

    return NextResponse.json({
      success: true,
      bookmarks: bookmarkedStories
    });

  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}