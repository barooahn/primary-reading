export const READING_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate', 
  ADVANCED: 'advanced'
} as const;

export const STORY_GENRES = {
  ADVENTURE: 'adventure',
  MYSTERY: 'mystery',
  FANTASY: 'fantasy',
  HUMOR: 'humor',
  ACTION: 'action',
  ANIMALS: 'animals',
  SCIENCE: 'science',
  FRIENDSHIP: 'friendship',
  SCHOOL_LIFE: 'school_life',
  SPORTS: 'sports'
} as const;

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  SHORT_ANSWER: 'short_answer',
  TRUE_FALSE: 'true_false',
  SEQUENCE_ORDERING: 'sequence_ordering',
  DRAWING: 'drawing',
  CREATIVE: 'creative'
} as const;

export const GRADE_LEVELS = [1, 2, 3, 4, 5, 6] as const;

export const WORD_COUNT_RANGES = {
  [READING_LEVELS.BEGINNER]: { min: 50, max: 200 },
  [READING_LEVELS.INTERMEDIATE]: { min: 200, max: 500 },
  [READING_LEVELS.ADVANCED]: { min: 500, max: 1000 }
} as const;

// Gamification constants
export const BADGE_CATEGORIES = {
  READING: 'reading',
  COMPREHENSION: 'comprehension',
  STREAK: 'streak',
  EXPLORATION: 'exploration',
  ACHIEVEMENT: 'achievement'
} as const;

export const ACHIEVEMENT_THRESHOLDS = {
  STORIES_READ: [1, 5, 10, 25, 50, 100],
  READING_STREAK: [3, 7, 14, 30, 60, 100],
  QUESTIONS_CORRECT: [10, 50, 100, 250, 500, 1000],
  GENRES_EXPLORED: [3, 5, 7, 10]
} as const;

// High-interest themes from research
export const HIGH_INTEREST_THEMES = [
  'Detective stories and mystery solving',
  'Treasure hunts and secret codes', 
  'Dinosaurs and prehistoric adventures',
  'Dragons and magical worlds',
  'Superpowers and time travel',
  'Funny characters and silly situations',
  'Racing and extreme sports competitions',
  'Space exploration and robots',
  'Friendship drama and playground conflicts',
  'Video game adventures',
  'Animal rescue missions',
  'Ninja training and martial arts',
  'Science experiments gone wrong',
  'Coding and computer mysteries'
] as const;