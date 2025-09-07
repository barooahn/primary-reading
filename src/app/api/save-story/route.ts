import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface SaveStoryRequest {
  title: string;
  description: string;
  content: string;
  genre: string;
  theme: string;
  reading_level: 'beginner' | 'intermediate' | 'advanced';
  story_type: 'fiction' | 'non_fiction';
  grade_level: number;
  word_count: number;
  estimated_reading_time: number;
  difficulty_rating: number;
  cover_image_url?: string;
  segments?: Array<{
    segment_order: number;
    title?: string;
    content: string;
    image_url?: string;
    image_prompt?: string;
  }>;
  questions?: Array<{
    question_text: string;
    question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'drag_drop' | 'sequence';
    options?: string[] | { [key: string]: string } | null;
    correct_answer: string | number | boolean;
    explanation?: string;
    points: number;
    difficulty: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: SaveStoryRequest = await request.json();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Save the main story record
    const { data: storyData, error: storyError } = await supabase
      .from('stories')
      .insert({
        title: body.title,
        description: body.description,
        content: { raw: body.content }, // Store full content as JSONB
        genre: body.genre,
        theme: body.theme,
        reading_level: body.reading_level,
        story_type: body.story_type,
        grade_level: body.grade_level,
        word_count: body.word_count,
        estimated_reading_time: body.estimated_reading_time,
        difficulty_rating: body.difficulty_rating,
        cover_image_url: body.cover_image_url,
        is_featured: false,
        is_published: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (storyError) {
      console.error('Story save error:', storyError);
      return NextResponse.json(
        { success: false, error: 'Failed to save story' },
        { status: 500 }
      );
    }

    const storyId = storyData.id;

    // Save story segments if provided
    if (body.segments && body.segments.length > 0) {
      const segmentsToInsert = body.segments.map(segment => ({
        story_id: storyId,
        segment_order: segment.segment_order,
        title: segment.title,
        content: segment.content,
        image_url: segment.image_url,
        image_prompt: segment.image_prompt,
      }));

      const { error: segmentsError } = await supabase
        .from('story_segments')
        .insert(segmentsToInsert);

      if (segmentsError) {
        console.error('Segments save error:', segmentsError);
        // Don't fail the whole operation, just log the error
      }
    }

    // Save questions if provided
    if (body.questions && body.questions.length > 0) {
      const questionsToInsert = body.questions.map(question => ({
        story_id: storyId,
        question_text: question.question_text,
        question_type: question.question_type,
        options: question.options,
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        points: question.points,
        difficulty: question.difficulty,
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) {
        console.error('Questions save error:', questionsError);
        // Don't fail the whole operation, just log the error
      }
    }

    // Update user's story count (for achievements/progress)
    try {
      const { error: profileError } = await supabase.rpc('increment_user_stories', {
        user_id: user.id
      });
      
      if (profileError) {
        console.error('Profile update error:', profileError);
      }
    } catch {
      // If the function doesn't exist, it's okay - we'll handle this in the future
      console.log('Profile update function not available yet');
    }

    return NextResponse.json({
      success: true,
      story: {
        id: storyId,
        ...storyData,
      },
      message: 'Story saved successfully!'
    });

  } catch (error) {
    console.error('Save story error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}