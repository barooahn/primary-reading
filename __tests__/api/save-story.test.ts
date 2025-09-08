import { POST } from '@/app/api/save-story/route';
import { createMockRequest, parseResponse, createMockSupabaseClient, mockAuthenticatedUser, mockUnauthenticatedUser } from '../helpers/test-utils';
import '../helpers/mock-modules';
import { createClient } from '@/utils/supabase/server';

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('/api/save-story', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createMockSupabaseClient();
    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  const generateSaveStoryRequest = (overrides?: any) => ({
    title: 'Test Story',
    description: 'A test story description',
    content: 'This is the story content.',
    genre: 'Adventure',
    theme: 'friendship',
    reading_level: 'intermediate' as const,
    story_type: 'fiction' as const,
    grade_level: 3,
    word_count: 250,
    estimated_reading_time: 5,
    difficulty_rating: 3,
    cover_image_url: 'https://example.com/image.jpg',
    segments: [
      {
        segment_order: 1,
        title: 'Chapter 1',
        content: 'First segment content',
        image_url: 'https://example.com/segment1.jpg',
        image_prompt: 'A scene from chapter 1',
      },
    ],
    questions: [
      {
        question_text: 'What is the main character\'s name?',
        question_type: 'multiple_choice' as const,
        options: ['Alice', 'Bob', 'Charlie'],
        correct_answer: 'Alice',
        explanation: 'The main character is introduced as Alice',
        points: 5,
        difficulty: 2,
      },
    ],
    ...overrides,
  });

  describe('POST /api/save-story', () => {
    it('should save story successfully with authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: [{ id: 'story-id', ...generateSaveStoryRequest() }],
          error: null,
        }),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'story-id' },
          error: null,
        }),
      });
      mockSupabase.rpc.mockResolvedValue({ error: null });

      const requestData = generateSaveStoryRequest();
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.story).toHaveProperty('id');
      expect(mockSupabase.from).toHaveBeenCalledWith('stories');
    });

    it('should reject unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockUnauthenticatedUser());

      const requestData = generateSaveStoryRequest();
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });

    it('should validate required fields', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());

      const requestData = { title: 'Test' }; // Missing required fields
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle database insertion errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
        select: jest.fn().mockReturnThis(),
        single: jest.fn(),
      });

      const requestData = generateSaveStoryRequest();
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Database error');
    });

    it('should save segments when provided', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());
      
      const segmentInsertMock = jest.fn().mockResolvedValue({
        data: [{ id: 'segment-id' }],
        error: null,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'stories') {
          return {
            insert: jest.fn().mockResolvedValue({
              data: [{ id: 'story-id' }],
              error: null,
            }),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'story-id' },
              error: null,
            }),
          };
        }
        if (table === 'story_segments') {
          return {
            insert: segmentInsertMock,
          };
        }
        return {
          insert: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      });

      mockSupabase.rpc.mockResolvedValue({ error: null });

      const requestData = generateSaveStoryRequest({
        segments: [
          {
            segment_order: 1,
            title: 'Chapter 1',
            content: 'First chapter content',
          },
          {
            segment_order: 2,
            title: 'Chapter 2',
            content: 'Second chapter content',
          },
        ],
      });
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(segmentInsertMock).toHaveBeenCalled();
    });

    it('should save questions when provided', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());
      
      const questionInsertMock = jest.fn().mockResolvedValue({
        data: [{ id: 'question-id' }],
        error: null,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'stories') {
          return {
            insert: jest.fn().mockResolvedValue({
              data: [{ id: 'story-id' }],
              error: null,
            }),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'story-id' },
              error: null,
            }),
          };
        }
        if (table === 'comprehension_questions') {
          return {
            insert: questionInsertMock,
          };
        }
        return {
          insert: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      });

      mockSupabase.rpc.mockResolvedValue({ error: null });

      const requestData = generateSaveStoryRequest({
        questions: [
          {
            question_text: 'Who is the main character?',
            question_type: 'multiple_choice',
            options: ['Alice', 'Bob'],
            correct_answer: 'Alice',
            points: 5,
            difficulty: 2,
          },
        ],
      });
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(questionInsertMock).toHaveBeenCalled();
    });

    it('should increment user story count', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: [{ id: 'story-id' }],
          error: null,
        }),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'story-id' },
          error: null,
        }),
      });
      mockSupabase.rpc.mockResolvedValue({ error: null });

      const requestData = generateSaveStoryRequest();
      const request = createMockRequest('POST', requestData);

      await POST(request);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_user_stories', {
        p_user_id: 'test-user-id',
      });
    });

    it('should handle increment user stories function error gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: [{ id: 'story-id' }],
          error: null,
        }),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'story-id' },
          error: null,
        }),
      });
      mockSupabase.rpc.mockResolvedValue({
        error: { message: 'Function not found' },
      });

      const requestData = generateSaveStoryRequest();
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      // Should still succeed even if incrementing user stories fails
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle malformed JSON', async () => {
      const request = new Request('http://localhost:3000/api/save-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json',
      }) as any;

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should validate reading level values', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());

      const requestData = generateSaveStoryRequest({
        reading_level: 'invalid_level',
      });
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should validate story type values', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());

      const requestData = generateSaveStoryRequest({
        story_type: 'invalid_type',
      });
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});