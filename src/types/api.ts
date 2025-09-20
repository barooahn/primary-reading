// API Response Types

export interface StoryData {
  title: string;
  description?: string;
  content?: string;
  genre?: string;
  readingLevel?: string;
  estimatedTime?: number;
  difficulty?: number;
}

export interface StoryGenerationResponse {
  success: boolean;
  story?: StoryData;
  title?: string;
  content?: string;
  error?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  originalPrompt?: string;
  error?: string;
}

export interface StoryWithMetadata {
  id: string;
  title: string;
  description?: string;
  genre?: string;
  readingLevel?: string;
  difficulty?: number;
  estimatedTime?: number;
  isPopular?: boolean;
  isNew?: boolean;
  rating?: number;
  totalReads?: number;
  image?: string;
  tags?: string[];
  createdBy?: string;
  hasImages?: boolean;
  created_by?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StoriesApiResponse extends ApiResponse<StoryWithMetadata[]> {
  stories?: StoryWithMetadata[];
}