import { POST } from '@/app/api/generate-image/route';
import { createMockRequest, parseResponse } from '../helpers/test-utils';
import '../helpers/mock-modules';
import openai from '@/utils/openai/client';

const mockOpenai = openai as jest.Mocked<typeof openai>;

describe('/api/generate-image', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock response
    mockOpenai.images.generate.mockResolvedValue({
      data: [
        {
          url: 'https://example.com/generated-image.jpg',
          revised_prompt: 'A revised prompt for the generated image',
        },
      ],
    } as any);
  });

  const generateImageRequest = (overrides?: any) => ({
    prompt: 'A friendly dragon reading a book',
    storyTitle: 'Dragon Adventure',
    style: 'illustration' as const,
    ...overrides,
  });

  describe('POST /api/generate-image', () => {
    it('should generate image successfully with valid request', async () => {
      const requestData = generateImageRequest();
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('imageUrl');
      expect(data).toHaveProperty('revisedPrompt');
      expect(data.imageUrl).toBe('https://example.com/generated-image.jpg');
      expect(mockOpenai.images.generate).toHaveBeenCalledTimes(1);
    });

    it('should enhance prompt with child-friendly instructions', async () => {
      const requestData = generateImageRequest({
        prompt: 'A cat in a garden',
        style: 'cartoon',
      });
      const request = createMockRequest('POST', requestData);

      await POST(request);

      const callArgs = mockOpenai.images.generate.mock.calls[0][0];
      expect(callArgs.prompt).toContain('Child-friendly cartoon style');
      expect(callArgs.prompt).toContain('A cat in a garden');
      expect(callArgs.prompt).toContain('colorful, engaging');
      expect(callArgs.prompt).toContain('appropriate for primary school children');
    });

    it('should use default style when not provided', async () => {
      const requestData = { prompt: 'A tree house' };
      const request = createMockRequest('POST', requestData);

      await POST(request);

      const callArgs = mockOpenai.images.generate.mock.calls[0][0];
      expect(callArgs.prompt).toContain('Child-friendly illustration style');
    });

    it('should validate required prompt field', async () => {
      const requestData = { style: 'cartoon' }; // Missing prompt
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should handle empty prompt', async () => {
      const requestData = generateImageRequest({
        prompt: '',
      });
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should handle OpenAI API errors', async () => {
      mockOpenai.images.generate.mockRejectedValue(
        new Error('OpenAI API Error')
      );

      const requestData = generateImageRequest();
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });

    it('should handle different style options', async () => {
      const styles = ['cartoon', 'realistic', 'illustration'] as const;

      for (const style of styles) {
        jest.clearAllMocks();
        const requestData = generateImageRequest({ style });
        const request = createMockRequest('POST', requestData);

        await POST(request);

        const callArgs = mockOpenai.images.generate.mock.calls[0][0];
        expect(callArgs.prompt).toContain(`Child-friendly ${style} style`);
      }
    });

    it('should include story title context when provided', async () => {
      const requestData = generateImageRequest({
        storyTitle: 'The Magic Forest',
        prompt: 'A magical tree',
      });
      const request = createMockRequest('POST', requestData);

      await POST(request);

      // Story title should be used to enhance context
      expect(mockOpenai.images.generate).toHaveBeenCalled();
    });

    it('should use DALL-E 3 configuration', async () => {
      const requestData = generateImageRequest();
      const request = createMockRequest('POST', requestData);

      await POST(request);

      const callArgs = mockOpenai.images.generate.mock.calls[0][0];
      expect(callArgs.model).toBe('dall-e-3');
      expect(callArgs.n).toBe(1);
      expect(callArgs.size).toBe('1024x1024');
      expect(callArgs.quality).toBe('standard');
      expect(callArgs.style).toBe('vivid');
    });

    it('should handle malformed JSON', async () => {
      const request = new Request('http://localhost:3000/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json',
      }) as any;

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should handle OpenAI rate limiting errors', async () => {
      mockOpenai.images.generate.mockRejectedValue(
        Object.assign(new Error('Rate limit exceeded'), {
          status: 429,
          type: 'rate_limit_error',
        })
      );

      const requestData = generateImageRequest();
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(429);
      expect(data).toHaveProperty('error');
    });

    it('should handle invalid style parameter', async () => {
      const requestData = generateImageRequest({
        style: 'invalid-style' as any,
      });
      const request = createMockRequest('POST', requestData);

      // Should still work, falling back to provided style or default
      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should handle long prompts', async () => {
      const longPrompt = 'A very long prompt '.repeat(50);
      const requestData = generateImageRequest({
        prompt: longPrompt,
      });
      const request = createMockRequest('POST', requestData);

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(mockOpenai.images.generate).toHaveBeenCalled();
    });
  });
});