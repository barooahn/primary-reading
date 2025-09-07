export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ReadingLevel = 'beginner' | 'intermediate' | 'advanced'
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'drag_drop' | 'sequence'
export type StoryType = 'fiction' | 'non_fiction'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          grade_level: number | null
          reading_level: ReadingLevel
          experience_points: number
          level: number
          reading_streak: number
          last_read_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          grade_level?: number | null
          reading_level?: ReadingLevel
          experience_points?: number
          level?: number
          reading_streak?: number
          last_read_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          grade_level?: number | null
          reading_level?: ReadingLevel
          experience_points?: number
          level?: number
          reading_streak?: number
          last_read_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          title: string
          description: string | null
          content: Json
          genre: string | null
          theme: string | null
          reading_level: ReadingLevel
          story_type: StoryType
          grade_level: number | null
          word_count: number | null
          estimated_reading_time: number | null
          difficulty_rating: number | null
          cover_image_url: string | null
          is_featured: boolean
          is_published: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content: Json
          genre?: string | null
          theme?: string | null
          reading_level: ReadingLevel
          story_type: StoryType
          grade_level?: number | null
          word_count?: number | null
          estimated_reading_time?: number | null
          difficulty_rating?: number | null
          cover_image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: Json
          genre?: string | null
          theme?: string | null
          reading_level?: ReadingLevel
          story_type?: StoryType
          grade_level?: number | null
          word_count?: number | null
          estimated_reading_time?: number | null
          difficulty_rating?: number | null
          cover_image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      story_segments: {
        Row: {
          id: string
          story_id: string
          segment_order: number
          title: string | null
          content: string
          image_url: string | null
          image_prompt: string | null
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          segment_order: number
          title?: string | null
          content: string
          image_url?: string | null
          image_prompt?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          segment_order?: number
          title?: string | null
          content?: string
          image_url?: string | null
          image_prompt?: string | null
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          story_id: string
          segment_id: string | null
          question_text: string
          question_type: QuestionType
          options: Json | null
          correct_answer: Json
          explanation: string | null
          points: number
          difficulty: number
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          segment_id?: string | null
          question_text: string
          question_type: QuestionType
          options?: Json | null
          correct_answer: Json
          explanation?: string | null
          points?: number
          difficulty?: number
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          segment_id?: string | null
          question_text?: string
          question_type?: QuestionType
          options?: Json | null
          correct_answer?: Json
          explanation?: string | null
          points?: number
          difficulty?: number
          created_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          story_id: string
          current_segment: number
          segments_completed: number
          total_segments: number
          progress_percentage: number
          is_completed: boolean
          reading_time_minutes: number
          started_at: string
          completed_at: string | null
          last_read_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id: string
          current_segment?: number
          segments_completed?: number
          total_segments: number
          progress_percentage?: number
          is_completed?: boolean
          reading_time_minutes?: number
          started_at?: string
          completed_at?: string | null
          last_read_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          current_segment?: number
          segments_completed?: number
          total_segments?: number
          progress_percentage?: number
          is_completed?: boolean
          reading_time_minutes?: number
          started_at?: string
          completed_at?: string | null
          last_read_at?: string
        }
      }
      user_answers: {
        Row: {
          id: string
          user_id: string
          question_id: string
          story_id: string
          user_answer: Json
          is_correct: boolean
          points_earned: number
          time_taken_seconds: number | null
          answered_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          story_id: string
          user_answer: Json
          is_correct: boolean
          points_earned?: number
          time_taken_seconds?: number | null
          answered_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          story_id?: string
          user_answer?: Json
          is_correct?: boolean
          points_earned?: number
          time_taken_seconds?: number | null
          answered_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          criteria: Json
          points_reward: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          criteria: Json
          points_reward?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          criteria?: Json
          points_reward?: number
          is_active?: boolean
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          goal_type: string
          target_value: number
          current_value: number
          metric: string
          start_date: string
          end_date: string
          is_completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_type: string
          target_value: number
          current_value?: number
          metric: string
          start_date: string
          end_date: string
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_type?: string
          target_value?: number
          current_value?: number
          metric?: string
          start_date?: string
          end_date?: string
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
      story_ratings: {
        Row: {
          id: string
          user_id: string
          story_id: string
          rating: number
          review: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id: string
          rating: number
          review?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          rating?: number
          review?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      reading_level: ReadingLevel
      question_type: QuestionType
      story_type: StoryType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}