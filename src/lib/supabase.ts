import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for Supabase
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          grade_level: number | null;
          reading_level: string | null;
          preferred_genres: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          grade_level?: number | null;
          reading_level?: string | null;
          preferred_genres?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          grade_level?: number | null;
          reading_level?: string | null;
          preferred_genres?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          title: string;
          content: string;
          reading_level: string;
          genre: string | null;
          word_count: number | null;
          estimated_reading_time: number | null;
          is_ai_generated: boolean | null;
          author_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          reading_level: string;
          genre?: string | null;
          word_count?: number | null;
          estimated_reading_time?: number | null;
          is_ai_generated?: boolean | null;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          reading_level?: string;
          genre?: string | null;
          word_count?: number | null;
          estimated_reading_time?: number | null;
          is_ai_generated?: boolean | null;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      story_images: {
        Row: {
          id: string;
          story_id: string;
          image_url: string;
          alt_text: string | null;
          position_in_story: number | null;
          is_ai_generated: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          image_url: string;
          alt_text?: string | null;
          position_in_story?: number | null;
          is_ai_generated?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          image_url?: string;
          alt_text?: string | null;
          position_in_story?: number | null;
          is_ai_generated?: boolean | null;
          created_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          story_id: string;
          question_text: string;
          question_type: string;
          correct_answer: string | null;
          options: string[] | { [key: string]: string } | null;
          explanation: string | null;
          difficulty_level: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          question_text: string;
          question_type: string;
          correct_answer?: string | null;
          options?: string[] | { [key: string]: string } | null;
          explanation?: string | null;
          difficulty_level?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          question_text?: string;
          question_type?: string;
          correct_answer?: string | null;
          options?: string[] | { [key: string]: string } | null;
          explanation?: string | null;
          difficulty_level?: number | null;
          created_at?: string;
        };
      };
      reading_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          story_id: string | null;
          started_at: string;
          completed_at: string | null;
          reading_progress: number | null;
          comprehension_score: number | null;
          time_spent_seconds: number | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          story_id?: string | null;
          started_at?: string;
          completed_at?: string | null;
          reading_progress?: number | null;
          comprehension_score?: number | null;
          time_spent_seconds?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          story_id?: string | null;
          started_at?: string;
          completed_at?: string | null;
          reading_progress?: number | null;
          comprehension_score?: number | null;
          time_spent_seconds?: number | null;
        };
      };
      question_responses: {
        Row: {
          id: string;
          session_id: string | null;
          question_id: string | null;
          user_answer: string | null;
          is_correct: boolean | null;
          response_time_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          question_id?: string | null;
          user_answer?: string | null;
          is_correct?: boolean | null;
          response_time_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          question_id?: string | null;
          user_answer?: string | null;
          is_correct?: boolean | null;
          response_time_seconds?: number | null;
          created_at?: string;
        };
      };
    };
  };
};