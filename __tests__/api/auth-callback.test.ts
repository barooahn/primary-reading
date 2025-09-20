import { GET } from '@/app/auth/callback/route';
import { createMockSupabaseClient } from '../helpers/test-utils';
import '../helpers/mock-modules';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

// Mock NextResponse.redirect
jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    redirect: jest.fn(),
  },
}));

const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

describe('/auth/callback', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createMockSupabaseClient();
    mockCreateClient.mockResolvedValue(mockSupabase);
    
    // Mock NextResponse.redirect to return a mock response
    mockNextResponse.redirect.mockReturnValue({
      status: 302,
      headers: new Headers({ location: 'http://localhost:3000/' }),
    } as any);
  });

  describe('GET /auth/callback', () => {
    it('should handle successful authentication with code', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null,
      });

      const url = 'http://localhost:3000/auth/callback?code=auth-code-123';
      const request = new Request(url, { method: 'GET' }) as any;

      const response = await GET(request);

      expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('auth-code-123');
      expect(mockNextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/');
    });

    it('should handle authentication errors', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid authorization code' },
      });

      const url = 'http://localhost:3000/auth/callback?code=invalid-code';
      const request = new Request(url, { method: 'GET' }) as any;

      const response = await GET(request);

      expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('invalid-code');
      expect(mockNextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/auth/auth-error');
    });

    it('should handle missing authorization code', async () => {
      const url = 'http://localhost:3000/auth/callback';
      const request = new Request(url, { method: 'GET' }) as any;

      const response = await GET(request);

      expect(mockSupabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
      expect(mockNextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/auth/auth-error');
    });

    it('should handle empty authorization code', async () => {
      const url = 'http://localhost:3000/auth/callback?code=';
      const request = new Request(url, { method: 'GET' }) as any;

      const response = await GET(request);

      expect(mockSupabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
      expect(mockNextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/auth/auth-error');
    });

    it('should handle Supabase client creation errors', async () => {
      mockCreateClient.mockRejectedValue(new Error('Supabase connection error'));

      const url = 'http://localhost:3000/auth/callback?code=auth-code-123';
      const request = new Request(url, { method: 'GET' }) as any;

      const response = await GET(request);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/auth/auth-error');
    });

    it('should redirect to origin URL if provided', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null,
      });

      const url = 'http://localhost:3000/auth/callback?code=auth-code-123&origin=/dashboard';
      const request = new Request(url, { method: 'GET' }) as any;

      const response = await GET(request);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/dashboard');
    });

    it('should handle malformed origin URL', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null,
      });

      const url = 'http://localhost:3000/auth/callback?code=auth-code-123&origin=javascript:alert(1)';
      const request = new Request(url, { method: 'GET' }) as any;

      const response = await GET(request);

      // Should fallback to home page for security
      expect(mockNextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/');
    });

    it('should handle session exchange timeout', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockImplementation(
        () => new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100);
        })
      );

      const url = 'http://localhost:3000/auth/callback?code=auth-code-123';
      const request = new Request(url, { method: 'GET' }) as any;

      const response = await GET(request);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/auth/auth-error');
    });

    it('should handle successful session but no user data', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { user: null } },
        error: null,
      });

      const url = 'http://localhost:3000/auth/callback?code=auth-code-123';
      const request = new Request(url, { method: 'GET' }) as any;

      const response = await GET(request);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/');
    });

    it('should handle URL construction errors', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null,
      });

      // Simulate URL constructor throwing an error
      const originalURL = global.URL;
      global.URL = jest.fn().mockImplementation(() => {
        throw new Error('Invalid URL');
      });

      const request = { url: 'invalid-url' } as any;

      const response = await GET(request);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/auth/auth-error');

      // Restore original URL constructor
      global.URL = originalURL;
    });

    it('should preserve query parameters in redirect', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null,
      });

      const url = 'http://localhost:3000/auth/callback?code=auth-code-123&origin=/stories%3Fpage%3D2';
      const request = new Request(url, { method: 'GET' }) as any;

      const response = await GET(request);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/stories?page=2');
    });
  });
});