import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface StoriesQuery {
  genre?: string;
  reading_level?: string;
  grade_level?: number;
  limit?: number;
  offset?: number;
  featured_only?: boolean;
  user_created_only?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const query: StoriesQuery = {
      genre: searchParams.get('genre') || undefined,
      reading_level: searchParams.get('reading_level') || undefined,
      grade_level: searchParams.get('grade_level') ? parseInt(searchParams.get('grade_level')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      featured_only: searchParams.get('featured_only') === 'true',
      user_created_only: searchParams.get('user_created_only') === 'true',
    };

    // Build the query
    let storiesQuery = supabase
      .from('stories')
      .select(`
        *,
        profiles:created_by(display_name, username),
        story_ratings(rating),
        user_progress(user_id)
      `)
      .eq('is_published', true);

    // Apply filters
    if (query.genre) {
      storiesQuery = storiesQuery.eq('genre', query.genre);
    }
    
    if (query.reading_level) {
      storiesQuery = storiesQuery.eq('reading_level', query.reading_level);
    }
    
    if (query.grade_level) {
      storiesQuery = storiesQuery.eq('grade_level', query.grade_level);
    }
    
    if (query.featured_only) {
      storiesQuery = storiesQuery.eq('is_featured', true);
    }
    
    if (query.user_created_only) {
      storiesQuery = storiesQuery.not('created_by', 'is', null);
    }

    // Apply pagination
    storiesQuery = storiesQuery
      .range(query.offset!, query.offset! + query.limit! - 1)
      .order('created_at', { ascending: false });

    const { data: stories, error } = await storiesQuery;

    if (error) {
      console.error('Stories fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch stories' },
        { status: 500 }
      );
    }

    // Process stories to add computed fields
    const processedStories = stories?.map(story => {
      // Calculate average rating
      const ratings = story.story_ratings || [];
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratings.length 
        : 0;
      
      // Count total reads (unique users who have progress)
      const totalReads = story.user_progress ? story.user_progress.length : 0;
      
      return {
        ...story,
        average_rating: Math.round(averageRating * 10) / 10,
        total_reads: totalReads,
        author_name: story.profiles?.display_name || story.profiles?.username || 'Anonymous',
        is_user_created: !!story.created_by,
      };
    }) || [];

    return NextResponse.json({
      success: true,
      stories: processedStories,
      total: processedStories.length,
      query: query,
    });

  } catch (error) {
    console.error('Get stories error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get a specific story by ID
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { storyId } = await request.json();

    if (!storyId) {
      return NextResponse.json(
        { success: false, error: 'Story ID is required' },
        { status: 400 }
      );
    }

    const { data: story, error } = await supabase
      .from('stories')
      .select(`
        *,
        profiles:created_by(display_name, username),
        story_segments(*),
        questions(*),
        story_ratings(rating, review),
        user_progress(user_id, progress_percentage, is_completed)
      `)
      .eq('id', storyId)
      .eq('is_published', true)
      .single();

    if (error) {
      console.error('Story fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Process the story data
    const ratings = story.story_ratings || [];
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratings.length 
      : 0;
    
    const totalReads = story.user_progress ? story.user_progress.length : 0;

    const processedStory = {
      ...story,
      average_rating: Math.round(averageRating * 10) / 10,
      total_reads: totalReads,
      author_name: story.profiles?.display_name || story.profiles?.username || 'Anonymous',
      is_user_created: !!story.created_by,
      segments: story.story_segments?.sort((a: { segment_order: number }, b: { segment_order: number }) => a.segment_order - b.segment_order) || [],
      questions: story.questions || [],
      reviews: ratings.filter((r: { review?: string }) => r.review && r.review.trim().length > 0),
    };

    return NextResponse.json({
      success: true,
      story: processedStory,
    });

  } catch (error) {
    console.error('Get story error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}