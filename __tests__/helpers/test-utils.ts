import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Mock Supabase client for testing
export const createMockSupabaseClient = () => {
	return {
		auth: {
			getUser: jest.fn(),
			signInWithPassword: jest.fn(),
			signOut: jest.fn(),
			exchangeCodeForSession: jest.fn(),
		},
		from: jest.fn(() => ({
			select: jest.fn().mockReturnThis(),
			insert: jest.fn().mockReturnThis(),
			update: jest.fn().mockReturnThis(),
			delete: jest.fn().mockReturnThis(),
			eq: jest.fn().mockReturnThis(),
			single: jest.fn(),
		})),
		rpc: jest.fn(),
	};
};

// Mock user data
export const mockUser = {
	id: "test-user-id",
	email: "test@example.com",
	user_metadata: {
		full_name: "Test User",
	},
};

// Mock story data
export const mockStory = {
	id: "test-story-id",
	title: "Test Story",
	content: "This is a test story content.",
	theme: "adventure",
	grade_level: 3,
	story_type: "fiction",
	user_id: "test-user-id",
	created_at: "2024-01-01T00:00:00Z",
};

// Helper to create mock NextRequest
export const createMockRequest = (
	method: string = "POST",
	body?: any,
	headers?: Record<string, string>
) => {
	const url = "http://localhost:3000/api/test";
	const init: RequestInit = {
		method,
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
	};

	if (body) {
		init.body = JSON.stringify(body);
	}

	return new NextRequest(url, init);
};

// Helper to parse NextResponse
export const parseResponse = async (response: NextResponse) => {
	const text = await response.text();
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
};

// Mock OpenAI client
export const mockOpenAIResponse = (content: string) => ({
	choices: [
		{
			message: {
				content,
			},
		},
	],
});

// Test data generators
export const generateTestStoryRequest = (overrides?: any) => ({
	theme: "adventure",
	gradeLevel: 3,
	storyType: "fiction" as const,
	...overrides,
});

export const generateTestUser = (overrides?: any) => ({
	...mockUser,
	...overrides,
});

// Database helper functions for testing
export const resetTestDatabase = async () => {
	// This would reset test database state
	// Implementation depends on your test database setup
};

// Auth helper functions
export const mockAuthenticatedUser = (user = mockUser) => {
	return {
		data: { user },
		error: null,
	};
};

export const mockUnauthenticatedUser = () => {
	return {
		data: { user: null },
		error: { message: "User not authenticated" },
	};
};
