import { POST, GET } from '@/app/api/bookmarks/route';
import { createMockRequest, parseResponse, createMockSupabaseClient, mockAuthenticatedUser, mockUnauthenticatedUser } from '../helpers/test-utils';
import '../helpers/mock-modules';
import { createClient } from '@/utils/supabase/server';

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('/api/bookmarks', () => {
  let mockSupabase: any;
  const mockBookmarkData = {
    story_id: 'story-123',
    stories: {
      id: 'story-123',
      title: 'Test Story',
      description: 'A test story',
      genre: 'adventure',
      reading_level: 'intermediate',
      grade_level: 3,
      estimated_reading_time: 5,
      difficulty_rating: 3,
      cover_image_url: 'https://example.com/cover.jpg',
      created_at: '2024-01-01T00:00:00Z',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createMockSupabaseClient();
    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  describe('POST /api/bookmarks', () => {
    it('should add bookmark successfully with authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      });

      const requestData = { storyId: 'story-123', action: 'add' };
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.bookmarked).toBe(true);
      expect(data.message).toBe('Story bookmarked!');
      expect(mockSupabase.from).toHaveBeenCalledWith('user_progress');
    });

    it('should remove bookmark successfully with authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }),
      });

      const requestData = { storyId: 'story-123', action: 'remove' };
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.bookmarked).toBe(false);
      expect(data.message).toBe('Bookmark removed!');
    });

    it('should reject unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockUnauthenticatedUser());

      const requestData = { storyId: 'story-123', action: 'add' };
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });

    it('should validate required fields', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());

      const requestData = { action: 'add' }; // Missing storyId
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should validate action field', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());

      const requestData = { storyId: 'story-123', action: 'invalid' };
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle database errors when adding bookmark', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn().mockResolvedValue({
          error: { message: 'Database error' },
        }),
      });

      const requestData = { storyId: 'story-123', action: 'add' };
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to add bookmark');
    });

    it('should handle database errors when removing bookmark', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      const requestData = { storyId: 'story-123', action: 'remove' };
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to remove bookmark');
    });

    it('should handle malformed JSON', async () => {
      const request = new Request('http://localhost:3000/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json',
      }) as any;

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should handle missing storyId', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());

      const requestData = { storyId: '', action: 'add' };
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/bookmarks', () => {
    it('should get bookmarks successfully with authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [mockBookmarkData],
              error: null,
            }),
          }),
        }),
      });

      const url = 'http://localhost:3000/api/bookmarks';
      const request = new Request(url, { method: 'GET' }) as any;

      const response = await GET();
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.bookmarks).toHaveLength(1);
      expect(data.bookmarks[0]).toEqual(mockBookmarkData.stories);
    });

    it('should reject unauthenticated requests for GET', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockUnauthenticatedUser());

      const response = await GET();
      const data = await parseResponse(response);

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });

    it('should return empty array when no bookmarks found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const response = await GET();
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.bookmarks).toHaveLength(0);
    });

    it('should handle database errors when getting bookmarks', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      const response = await GET();
      const data = await parseResponse(response);

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to get bookmarks');
    });

    it('should handle null bookmarks data gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      const response = await GET();
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.bookmarks).toHaveLength(0);
    });

    it('should filter bookmarks by user and bookmarked status', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(mockAuthenticatedUser());
      const selectMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockReturnThis();
      const finalEqMock = jest.fn().mockResolvedValue({
        data: [mockBookmarkData],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: selectMock,
        eq: eqMock.mockReturnValue({
          eq: finalEqMock,
        }),
      });

      await GET();

      expect(eqMock).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(finalEqMock).toHaveBeenCalledWith('is_bookmarked', true);
    });

    it('should handle authentication errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Token expired' },
      });

      const response = await GET();
      const data = await parseResponse(response);

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });
  });
});