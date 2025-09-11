export interface GradeLevelConfig {
  year: number;
  age: number;
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  
  // Story Configuration
  wordCount: {
    min: number;
    max: number;
    recommended: number;
  };
  
  // Sentence Structure
  sentenceLength: {
    average: number;
    maxWords: number;
  };
  
  // Vocabulary Level
  vocabularyLevel: {
    description: string;
    syllableComplexity: number; // 1-3
    commonWords: boolean;
    allowComplexWords: boolean;
  };
  
  // Comprehension Questions
  questionTypes: string[];
  questionsPerStory: number;
  questionComplexity: 1 | 2 | 3;
  
  // Story Elements
  storyElements: {
    plotComplexity: 'simple' | 'moderate' | 'complex';
    characterCount: number;
    subplots: boolean;
    themes: string[];
  };
  
  // UI/UX Considerations
  uiElements: {
    fontSize: 'large' | 'medium' | 'standard';
    imageFrequency: 'high' | 'medium' | 'low';
    audioSupport: boolean;
    highlightSupport: boolean;
  };
}

export const GRADE_LEVEL_CONFIGS: Record<number, GradeLevelConfig> = {
  1: {
    year: 1,
    age: 5,
    readingLevel: 'beginner',
    wordCount: {
      min: 50,
      max: 150,
      recommended: 100,
    },
    sentenceLength: {
      average: 5,
      maxWords: 8,
    },
    vocabularyLevel: {
      description: 'Simple, high-frequency words',
      syllableComplexity: 1,
      commonWords: true,
      allowComplexWords: false,
    },
    questionTypes: ['multiple_choice'],
    questionsPerStory: 3,
    questionComplexity: 1,
    storyElements: {
      plotComplexity: 'simple',
      characterCount: 2,
      subplots: false,
      themes: ['Family', 'Animals', 'Friendship', 'Daily Life', 'Colors', 'Numbers'],
    },
    uiElements: {
      fontSize: 'large',
      imageFrequency: 'high',
      audioSupport: true,
      highlightSupport: true,
    },
  },
  
  2: {
    year: 2,
    age: 6,
    readingLevel: 'beginner',
    wordCount: {
      min: 100,
      max: 250,
      recommended: 175,
    },
    sentenceLength: {
      average: 6,
      maxWords: 10,
    },
    vocabularyLevel: {
      description: 'Common words with some simple adjectives',
      syllableComplexity: 1,
      commonWords: true,
      allowComplexWords: false,
    },
    questionTypes: ['multiple_choice'],
    questionsPerStory: 4,
    questionComplexity: 1,
    storyElements: {
      plotComplexity: 'simple',
      characterCount: 3,
      subplots: false,
      themes: ['School', 'Pets', 'Seasons', 'Community Helpers', 'Simple Adventures', 'Nature'],
    },
    uiElements: {
      fontSize: 'large',
      imageFrequency: 'high',
      audioSupport: true,
      highlightSupport: true,
    },
  },
  
  3: {
    year: 3,
    age: 7,
    readingLevel: 'intermediate',
    wordCount: {
      min: 200,
      max: 400,
      recommended: 300,
    },
    sentenceLength: {
      average: 8,
      maxWords: 12,
    },
    vocabularyLevel: {
      description: 'Expanded vocabulary with descriptive words',
      syllableComplexity: 2,
      commonWords: true,
      allowComplexWords: true,
    },
    questionTypes: ['multiple_choice'],
    questionsPerStory: 5,
    questionComplexity: 2,
    storyElements: {
      plotComplexity: 'moderate',
      characterCount: 4,
      subplots: false,
      themes: ['Mystery', 'Fantasy', 'Sports', 'Travel', 'Problem Solving', 'Teamwork'],
    },
    uiElements: {
      fontSize: 'medium',
      imageFrequency: 'medium',
      audioSupport: true,
      highlightSupport: true,
    },
  },
  
  4: {
    year: 4,
    age: 8,
    readingLevel: 'intermediate',
    wordCount: {
      min: 350,
      max: 600,
      recommended: 475,
    },
    sentenceLength: {
      average: 10,
      maxWords: 15,
    },
    vocabularyLevel: {
      description: 'Rich vocabulary with some challenging words',
      syllableComplexity: 2,
      commonWords: false,
      allowComplexWords: true,
    },
    questionTypes: ['multiple_choice'],
    questionsPerStory: 6,
    questionComplexity: 2,
    storyElements: {
      plotComplexity: 'moderate',
      characterCount: 5,
      subplots: true,
      themes: ['Adventure', 'Science Fiction', 'Historical Fiction', 'Friendship Challenges', 'Environmental Issues', 'Different Cultures'],
    },
    uiElements: {
      fontSize: 'medium',
      imageFrequency: 'medium',
      audioSupport: false,
      highlightSupport: true,
    },
  },
  
  5: {
    year: 5,
    age: 9,
    readingLevel: 'advanced',
    wordCount: {
      min: 500,
      max: 800,
      recommended: 650,
    },
    sentenceLength: {
      average: 12,
      maxWords: 18,
    },
    vocabularyLevel: {
      description: 'Advanced vocabulary with academic words',
      syllableComplexity: 3,
      commonWords: false,
      allowComplexWords: true,
    },
    questionTypes: ['multiple_choice'],
    questionsPerStory: 7,
    questionComplexity: 3,
    storyElements: {
      plotComplexity: 'complex',
      characterCount: 6,
      subplots: true,
      themes: ['Complex Adventures', 'Moral Dilemmas', 'Science Concepts', 'Historical Events', 'Character Development', 'Social Issues'],
    },
    uiElements: {
      fontSize: 'standard',
      imageFrequency: 'low',
      audioSupport: false,
      highlightSupport: false,
    },
  },
  
  6: {
    year: 6,
    age: 10,
    readingLevel: 'advanced',
    wordCount: {
      min: 650,
      max: 1000,
      recommended: 825,
    },
    sentenceLength: {
      average: 14,
      maxWords: 20,
    },
    vocabularyLevel: {
      description: 'Sophisticated vocabulary with abstract concepts',
      syllableComplexity: 3,
      commonWords: false,
      allowComplexWords: true,
    },
    questionTypes: ['multiple_choice'],
    questionsPerStory: 8,
    questionComplexity: 3,
    storyElements: {
      plotComplexity: 'complex',
      characterCount: 7,
      subplots: true,
      themes: ['Leadership', 'Coming of Age', 'Complex Problem Solving', 'Global Issues', 'Technology Ethics', 'Future Concepts'],
    },
    uiElements: {
      fontSize: 'standard',
      imageFrequency: 'low',
      audioSupport: false,
      highlightSupport: false,
    },
  },
};

// Vocabulary lists for each year level
export const VOCABULARY_LISTS = {
  1: {
    commonWords: ['the', 'and', 'cat', 'dog', 'run', 'jump', 'play', 'happy', 'big', 'little', 'red', 'blue'],
    topics: ['home', 'family', 'pets', 'toys', 'food', 'colors'],
  },
  2: {
    commonWords: ['because', 'when', 'where', 'what', 'how', 'friend', 'school', 'teacher', 'book', 'story'],
    topics: ['school', 'community', 'seasons', 'weather', 'transportation', 'feelings'],
  },
  3: {
    commonWords: ['adventure', 'mystery', 'discover', 'important', 'different', 'interesting', 'character', 'problem'],
    topics: ['mystery', 'adventure', 'fantasy', 'problem-solving', 'teamwork', 'nature'],
  },
  4: {
    commonWords: ['challenge', 'experience', 'responsibility', 'community', 'environment', 'culture', 'tradition'],
    topics: ['cultures', 'environment', 'history', 'science', 'adventure', 'friendship'],
  },
  5: {
    commonWords: ['consequence', 'perspective', 'analyze', 'evaluate', 'distinguish', 'interpret', 'collaborate'],
    topics: ['ethics', 'science', 'history', 'global issues', 'character development', 'leadership'],
  },
  6: {
    commonWords: ['sophisticated', 'philosophical', 'technological', 'sustainability', 'innovation', 'complexity'],
    topics: ['philosophy', 'technology ethics', 'global citizenship', 'future concepts', 'abstract thinking'],
  },
};

// Function to get configuration for a specific year
export function getGradeLevelConfig(year: number): GradeLevelConfig {
  if (year < 1 || year > 6) {
    throw new Error('Year must be between 1 and 6');
  }
  return GRADE_LEVEL_CONFIGS[year];
}

// Function to get appropriate reading level for year
export function getReadingLevelForYear(year: number): 'beginner' | 'intermediate' | 'advanced' {
  return getGradeLevelConfig(year).readingLevel;
}

// Function to get vocabulary for year
export function getVocabularyForYear(year: number) {
  if (year < 1 || year > 6) {
    throw new Error('Year must be between 1 and 6');
  }
  return VOCABULARY_LISTS[year as keyof typeof VOCABULARY_LISTS];
}