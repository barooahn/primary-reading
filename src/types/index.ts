export interface User {
  id: string;
  email: string;
  grade_level?: number;
  reading_level?: ReadingLevel;
  preferred_genres?: string[];
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  reading_level: ReadingLevel;
  genre: string;
  word_count: number;
  estimated_reading_time: number;
  is_ai_generated: boolean;
  author_id?: string;
  created_at: string;
  updated_at: string;
  images?: StoryImage[];
  questions?: Question[];
}

export interface StoryImage {
  id: string;
  story_id: string;
  image_url: string;
  alt_text?: string;
  position_in_story: number;
  is_ai_generated: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  story_id: string;
  question_text: string;
  question_type: QuestionType;
  correct_answer: string;
  options?: string[];
  explanation?: string;
  difficulty_level: number;
  created_at: string;
}

export interface ReadingSession {
  id: string;
  user_id: string;
  story_id: string;
  started_at: string;
  completed_at?: string;
  reading_progress: number; // 0.00 to 1.00
  comprehension_score?: number;
  time_spent_seconds?: number;
}

export interface QuestionResponse {
  id: string;
  session_id: string;
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  response_time_seconds?: number;
  created_at: string;
}

export type ReadingLevel = 'beginner' | 'intermediate' | 'advanced';

export type QuestionType = 'multiple_choice' | 'short_answer' | 'true_false' | 'sequence_ordering' | 'drawing' | 'creative';

export type StoryGenre = 
  | 'adventure'
  | 'mystery' 
  | 'fantasy'
  | 'humor'
  | 'action'
  | 'animals'
  | 'science'
  | 'friendship'
  | 'school_life'
  | 'sports';

export interface AIGenerationRequest {
  topic: string;
  grade_level: number;
  reading_level: ReadingLevel;
  genre: StoryGenre;
  word_count: number;
  learning_objectives?: string[];
}

export interface WebSearchResult {
  research_summary: string;
  key_facts: string[];
  vocabulary_terms: Array<{
    word: string;
    definition: string;
  }>;
  curriculum_connections: string[];
  factual_accuracy_score: number;
  age_appropriateness_score: number;
}

// Gamification types
export interface UserProgress {
  user_id: string;
  reading_streak: number;
  total_stories_read: number;
  total_questions_answered: number;
  badges_earned: Badge[];
  current_level: number;
  experience_points: number;
  last_read_date?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned_at: string;
  category: 'reading' | 'comprehension' | 'streak' | 'exploration' | 'achievement';
}