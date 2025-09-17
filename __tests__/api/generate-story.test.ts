import { POST } from '@/app/api/generate-story/route';
import { createMockRequest, parseResponse, mockOpenAIResponse, generateTestStoryRequest } from '../helpers/test-utils';
import '../helpers/mock-modules';
import openai from '@/utils/openai/client';
import { researchTopicForStory } from '@/utils/search/client';

const mockOpenai = openai as jest.Mocked<typeof openai>;
const mockResearchTopicForStory = researchTopicForStory as jest.MockedFunction<typeof researchTopicForStory>;

describe('/api/generate-story', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockOpenai.chat.completions.create.mockResolvedValue(
      mockOpenAIResponse('This is a generated story for children.')
    );
    
    mockResearchTopicForStory.mockResolvedValue({
      summary: 'Research summary about the topic',
      keyFacts: ['Fact 1', 'Fact 2'],
      sources: ['Source 1', 'Source 2'],
    });
  });

  describe('POST /api/generate-story', () => {
    it('should generate a story successfully with valid request', async () => {
      const requestData = generateTestStoryRequest();
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('story');
      expect(data).toHaveProperty('research');
      expect(data.story).toContain('This is a generated story for children.');
      expect(mockOpenai.chat.completions.create).toHaveBeenCalledTimes(1);
      expect(mockResearchTopicForStory).toHaveBeenCalledWith('adventure');
    });

    it('should handle custom topic correctly', async () => {
      const requestData = generateTestStoryRequest({
        customTopic: 'space exploration',
      });
      const request = createMockRequest('POST', requestData);

      await POST(request);

      expect(mockResearchTopicForStory).toHaveBeenCalledWith('space exploration');
    });

    it('should validate required fields', async () => {
      const requestData = { theme: 'adventure' }; // Missing gradeLevel and storyType
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should handle invalid grade level', async () => {
      const requestData = generateTestStoryRequest({
        gradeLevel: 10, // Invalid grade level
      });
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should handle invalid story type', async () => {
      const requestData = generateTestStoryRequest({
        storyType: 'invalid-type',
      });
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should handle OpenAI API errors', async () => {
      mockOpenai.chat.completions.create.mockRejectedValue(
        new Error('OpenAI API Error')
      );

      const requestData = generateTestStoryRequest();
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });

    it('should handle research errors gracefully', async () => {
      mockResearchTopicForStory.mockRejectedValue(
        new Error('Research API Error')
      );

      const requestData = generateTestStoryRequest();
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      // Should still generate story even if research fails
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('story');
    });

    it('should generate fiction stories correctly', async () => {
      const requestData = generateTestStoryRequest({
        storyType: 'fiction',
        theme: 'fantasy',
      });
      const request = createMockRequest('POST', requestData);

      await POST(request);

      const callArgs = mockOpenai.chat.completions.create.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('fiction story');
      expect(callArgs.messages[0].content).toContain('fantasy');
    });

    it('should generate non-fiction stories correctly', async () => {
      const requestData = generateTestStoryRequest({
        storyType: 'non_fiction',
        theme: 'science',
      });
      const request = createMockRequest('POST', requestData);

      await POST(request);

      const callArgs = mockOpenai.chat.completions.create.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('non_fiction story');
      expect(callArgs.messages[0].content).toContain('science');
    });

    it('should include grade-specific requirements in prompt', async () => {
      const requestData = generateTestStoryRequest({
        gradeLevel: 3,
      });
      const request = createMockRequest('POST', requestData);

      await POST(request);

      const callArgs = mockOpenai.chat.completions.create.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('Year 3');
      expect(callArgs.messages[0].content).toContain('Early Reader');
    });

    it('should handle empty theme', async () => {
      const requestData = generateTestStoryRequest({
        theme: '',
        customTopic: 'space',
      });
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockResearchTopicForStory).toHaveBeenCalledWith('space');
    });

    it('should handle malformed JSON', async () => {
      const request = new Request('http://localhost:3000/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json',
      }) as any;

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });
  });
});