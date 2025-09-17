import { GET } from "@/app/api/stories/route";
import {
	createMockRequest,
	parseResponse,
	createMockSupabaseClient,
	mockAuthenticatedUser,
} from "../helpers/test-utils";
import "../helpers/mock-modules";
import { createClient } from "@/utils/supabase/server";

const mockCreateClient = createClient as jest.MockedFunction<
	typeof createClient
>;

describe("/api/stories", () => {
	let mockSupabase: any;
	const mockStories = [
		{
			id: "story-1",
			title: "Adventure Story",
			genre: "adventure",
			reading_level: "intermediate",
			grade_level: 3,
			is_published: true,
			story_segments: [
				{
					id: "segment-1",
					content: "First segment",
					segment_order: 1,
				},
			],
			questions: [
				{ id: "question-1", question_text: "What happened first?" },
			],
		},
		{
			id: "story-2",
			title: "Science Story",
			genre: "educational",
			reading_level: "beginner",
			grade_level: 2,
			is_published: true,
			story_segments: [],
			questions: [],
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
		mockSupabase = createMockSupabaseClient();
		mockCreateClient.mockResolvedValue(mockSupabase);
	});

	describe("GET /api/stories", () => {
		it("should fetch stories successfully with default parameters", async () => {
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockReturnThis(),
				range: jest.fn().mockResolvedValue({
					data: mockStories,
					error: null,
				}),
			});

			const url = "http://localhost:3000/api/stories";
			const request = new Request(url, { method: "GET" }) as any;

			const response = await GET(request);
			const data = await parseResponse(response);

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.stories).toHaveLength(2);
			expect(data.stories[0]).toHaveProperty("story_segments");
			expect(data.stories[0]).toHaveProperty("questions");
		});

		it("should filter by genre", async () => {
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockReturnThis(),
				range: jest.fn().mockResolvedValue({
					data: [mockStories[0]], // Only adventure story
					error: null,
				}),
			});

			const url = "http://localhost:3000/api/stories?genre=adventure";
			const request = new Request(url, { method: "GET" }) as any;

			const response = await GET(request);
			const data = await parseResponse(response);

			expect(response.status).toBe(200);
			expect(data.stories).toHaveLength(1);
			expect(data.stories[0].genre).toBe("adventure");
			expect(mockSupabase.from().eq).toHaveBeenCalledWith(
				"genre",
				"adventure"
			);
		});

		it("should filter by reading level", async () => {
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockReturnThis(),
				range: jest.fn().mockResolvedValue({
					data: [mockStories[1]], // Only beginner story
					error: null,
				}),
			});

			const url =
				"http://localhost:3000/api/stories?reading_level=beginner";
			const request = new Request(url, { method: "GET" }) as any;

			const response = await GET(request);
			const data = await parseResponse(response);

			expect(response.status).toBe(200);
			expect(data.stories).toHaveLength(1);
			expect(data.stories[0].reading_level).toBe("beginner");
			expect(mockSupabase.from().eq).toHaveBeenCalledWith(
				"reading_level",
				"beginner"
			);
		});

		it("should filter by grade level", async () => {
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockReturnThis(),
				range: jest.fn().mockResolvedValue({
					data: [mockStories[0]], // Only grade 3 story
					error: null,
				}),
			});

			const url = "http://localhost:3000/api/stories?grade_level=3";
			const request = new Request(url, { method: "GET" }) as any;

			const response = await GET(request);
			const data = await parseResponse(response);

			expect(response.status).toBe(200);
			expect(data.stories).toHaveLength(1);
			expect(data.stories[0].grade_level).toBe(3);
			expect(mockSupabase.from().eq).toHaveBeenCalledWith(
				"grade_level",
				3
			);
		});

		it("should handle pagination with limit and offset", async () => {
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockReturnThis(),
				range: jest.fn().mockResolvedValue({
					data: [mockStories[0]], // First story only
					error: null,
				}),
			});

			const url = "http://localhost:3000/api/stories?limit=1&offset=0";
			const request = new Request(url, { method: "GET" }) as any;

			const response = await GET(request);
			const data = await parseResponse(response);

			expect(response.status).toBe(200);
			expect(mockSupabase.from().range).toHaveBeenCalledWith(0, 0); // offset to offset + limit - 1
		});

		it("should filter featured stories only", async () => {
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockReturnThis(),
				range: jest.fn().mockResolvedValue({
					data: [mockStories[0]],
					error: null,
				}),
			});

			const url =
				"http://localhost:3000/api/stories?featured_only=true";
			const request = new Request(url, { method: "GET" }) as any;

			const response = await GET(request);

			expect(mockSupabase.from().eq).toHaveBeenCalledWith(
				"is_featured",
				true
			);
		});

		it("should filter user created stories only", async () => {
			mockSupabase.auth.getUser.mockResolvedValue(
				mockAuthenticatedUser()
			);
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockReturnThis(),
				range: jest.fn().mockResolvedValue({
					data: [mockStories[0]],
					error: null,
				}),
			});

			const url =
				"http://localhost:3000/api/stories?user_created_only=true";
			const request = new Request(url, { method: "GET" }) as any;

			const response = await GET(request);

			expect(mockSupabase.from().eq).toHaveBeenCalledWith(
				"created_by",
				"test-user-id"
			);
		});

		it("should handle database errors", async () => {
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockReturnThis(),
				range: jest.fn().mockResolvedValue({
					data: null,
					error: { message: "Database error" },
				}),
			});

			const url = "http://localhost:3000/api/stories";
			const request = new Request(url, { method: "GET" }) as any;

			const response = await GET(request);
			const data = await parseResponse(response);

			expect(response.status).toBe(500);
			expect(data.success).toBe(false);
			expect(data.error).toContain("Database error");
		});

		it("should handle invalid query parameters gracefully", async () => {
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockReturnThis(),
				range: jest.fn().mockResolvedValue({
					data: mockStories,
					error: null,
				}),
			});

			const url =
				"http://localhost:3000/api/stories?grade_level=invalid&limit=abc";
			const request = new Request(url, { method: "GET" }) as any;

			const response = await GET(request);
			const data = await parseResponse(response);

			// Should handle gracefully with default values
			expect(response.status).toBe(200);
			expect(mockSupabase.from().range).toHaveBeenCalledWith(0, 49); // Default limit 50
		});

		it("should return empty array when no stories found", async () => {
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockReturnThis(),
				range: jest.fn().mockResolvedValue({
					data: [],
					error: null,
				}),
			});

			const url = "http://localhost:3000/api/stories";
			const request = new Request(url, { method: "GET" }) as any;

			const response = await GET(request);
			const data = await parseResponse(response);

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.stories).toHaveLength(0);
		});

		it("should apply multiple filters correctly", async () => {
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockReturnThis(),
				range: jest.fn().mockResolvedValue({
					data: [mockStories[0]],
					error: null,
				}),
			});

			const url =
				"http://localhost:3000/api/stories?genre=adventure&grade_level=3&reading_level=intermediate";
			const request = new Request(url, { method: "GET" }) as any;

			await GET(request);

			expect(mockSupabase.from().eq).toHaveBeenCalledWith(
				"genre",
				"adventure"
			);
			expect(mockSupabase.from().eq).toHaveBeenCalledWith(
				"grade_level",
				3
			);
			expect(mockSupabase.from().eq).toHaveBeenCalledWith(
				"reading_level",
				"intermediate"
			);
		});

		it("should only return published stories", async () => {
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockReturnThis(),
				range: jest.fn().mockResolvedValue({
					data: mockStories,
					error: null,
				}),
			});

			const url = "http://localhost:3000/api/stories";
			const request = new Request(url, { method: "GET" }) as any;

			await GET(request);

			expect(mockSupabase.from().eq).toHaveBeenCalledWith(
				"is_published",
				true
			);
		});

		it("should handle user authentication errors for user_created_only filter", async () => {
			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: null },
				error: { message: "User not authenticated" },
			});
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockReturnThis(),
				range: jest.fn().mockResolvedValue({
					data: [],
					error: null,
				}),
			});

			const url =
				"http://localhost:3000/api/stories?user_created_only=true";
			const request = new Request(url, { method: "GET" }) as any;

			const response = await GET(request);
			const data = await parseResponse(response);

			expect(response.status).toBe(401);
			expect(data.success).toBe(false);
			expect(data.error).toBe(
				"Authentication required for user-created stories"
			);
		});
	});
});
