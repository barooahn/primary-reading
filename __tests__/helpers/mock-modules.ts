// Mock implementations for external modules used in tests

// Mock Supabase
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}));

// Mock OpenAI
jest.mock('@/utils/openai/client', () => ({
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
  images: {
    generate: jest.fn(),
  },
}));

// Mock search client
jest.mock('@/utils/search/client', () => ({
  researchTopicForStory: jest.fn(),
}));

// Mock grade level config
jest.mock('@/config/grade-levels', () => ({
  getGradeLevelConfig: jest.fn(() => ({
    age: '8-9 years',
    readingLevel: 'Early Reader',
    wordCount: { min: 150, max: 300, recommended: 200 },
    sentenceLength: { average: 8, maxWords: 12 },
    vocabularyLevel: {
      description: 'Simple vocabulary with some challenging words',
      syllableComplexity: 2,
      commonWords: true,
    },
    storyElements: {
      plotComplexity: 'Simple with clear beginning, middle, end',
      characterCount: 3,
      subplots: false,
      themes: ['friendship', 'adventure', 'learning'],
    },
  })),
  getVocabularyForYear: jest.fn(() => ({
    topics: ['school', 'family', 'animals', 'nature'],
    commonWords: ['the', 'and', 'is', 'to', 'in', 'it'],
  })),
}));

export {};