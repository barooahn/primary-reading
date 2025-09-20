import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSignedUrl } from "@/utils/images/storage";

interface StoriesQuery {
	genre?: string;
	reading_level?: string;
	grade_level?: number;
	limit?: number;
	offset?: number;
	featured_only?: boolean;
	user_created_only?: boolean;
}

export async function GET(request: NextRequest) {
	try {
		const { createClient } = await import("@/utils/supabase/server");
		const supabase = await createClient();
		const { searchParams } = new URL(request.url);

		// Parse query parameters safely with defaults
		const rawGrade = searchParams.get("grade_level");
		const parsedGrade =
			rawGrade !== null ? parseInt(rawGrade, 10) : undefined;
		const rawLimit = searchParams.get("limit");
		const rawOffset = searchParams.get("offset");
		const parsedLimit = rawLimit !== null ? parseInt(rawLimit, 10) : NaN;
		const parsedOffset =
			rawOffset !== null ? parseInt(rawOffset, 10) : NaN;

		const query: StoriesQuery = {
			genre: searchParams.get("genre") || undefined,
			reading_level: searchParams.get("reading_level") || undefined,
			grade_level: Number.isFinite(parsedGrade as number)
				? (parsedGrade as number)
				: undefined,
			limit:
				Number.isFinite(parsedLimit) && (parsedLimit as number) > 0
					? (parsedLimit as number)
					: 50,
			offset:
				Number.isFinite(parsedOffset) &&
				(parsedOffset as number) >= 0
					? (parsedOffset as number)
					: 0,
			featured_only: searchParams.get("featured_only") === "true",
			user_created_only:
				searchParams.get("user_created_only") === "true",
		};

		// Build the query
		let storiesQuery = supabase
			.from("stories")
			.select(
				`
        *,
        story_segments(*),
        questions(*)
      `
			)
			.eq("is_published", true);

		// Apply filters
		if (query.genre) {
			storiesQuery = storiesQuery.eq("genre", query.genre);
		}

		if (query.reading_level) {
			storiesQuery = storiesQuery.eq(
				"reading_level",
				query.reading_level
			);
		}

		if (query.grade_level) {
			storiesQuery = storiesQuery.eq("grade_level", query.grade_level);
		}

		if (query.featured_only) {
			storiesQuery = storiesQuery.eq("is_featured", true);
		}

		if (query.user_created_only) {
			// Require authentication for user-created filter
			const {
				data: { user },
				error: authError,
			} = await supabase.auth.getUser();
			if (authError || !user) {
				return NextResponse.json(
					{
						success: false,
						error: "Authentication required for user-created stories",
					},
					{ status: 401 }
				);
			}
			storiesQuery = storiesQuery.eq("created_by", user.id);
		}

		// Apply sorting and pagination (order before range to match test mocks)
		storiesQuery = storiesQuery
			.order("created_at", { ascending: false })
			.range(query.offset!, query.offset! + query.limit! - 1);

		const { data: stories, error } = await storiesQuery;

		if (error) {
			console.error("Stories fetch error:", error);
			return NextResponse.json(
				{ success: false, error: "Database error" },
				{ status: 500 }
			);
		}

		// Sign cover image and thumbnail if stored as private paths
		const signIfPrivate = async (
			maybePath: string | null | undefined
		): Promise<string | null> => {
			if (!maybePath) return null;
			if (
				maybePath.startsWith("http://") ||
				maybePath.startsWith("https://")
			)
				return maybePath;
			const signed = await getSignedUrl(maybePath);
			return signed || null;
		};

		const signedStories = await Promise.all(
			(stories || []).map(async (s: any) => {
				const coverBase = s?.cover_image_path || s?.cover_image_url;
				const coverThumbBase =
					s?.cover_thumbnail_path || s?.cover_thumbnail_url;
				const signedCover = await signIfPrivate(coverBase);
				const signedCoverThumb = await signIfPrivate(
					coverThumbBase
				);
				return {
					...s,
					cover_image_url:
						signedCover ?? s?.cover_image_url ?? null,
					cover_thumbnail_url:
						signedCoverThumb ??
						s?.cover_thumbnail_url ??
						null,
				};
			})
		);

		// Process stories to add computed fields
		const processedStories =
			signedStories?.map((story) => {
				return {
					...story,
					average_rating: 0, // Ratings not implemented yet
					total_reads: 0, // Progress tracking not implemented yet
					author_name: "Anonymous", // User profiles don't contain display names
					is_user_created: !!story.created_by,
					segments_count: story.story_segments?.length || 0,
					questions_count: story.questions?.length || 0,
				};
			}) || [];

		return NextResponse.json({
			success: true,
			stories: processedStories,
			total: processedStories.length,
			query: query,
		});
	} catch (error) {
		console.error("Get stories error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// Get a specific story by ID
export async function POST(request: NextRequest) {
	try {
		const { createClient } = await import("@/utils/supabase/server");
		const supabase = await createClient();
		const { storyId } = await request.json();

		if (!storyId) {
			return NextResponse.json(
				{ success: false, error: "Story ID is required" },
				{ status: 400 }
			);
		}

		const { data: story, error } = await supabase
			.from("stories")
			.select(
				`
        *,
        story_segments(*),
        questions(*)
      `
			)
			.eq("id", storyId)
			.eq("is_published", true)
			.single();

		if (error) {
			console.error("Story fetch error:", error);
			return NextResponse.json(
				{ success: false, error: "Story not found" },
				{ status: 404 }
			);
		}

		// Process the story data
		const processedStory = {
			...story,
			average_rating: 0, // Ratings not implemented yet
			total_reads: 0, // Progress tracking not implemented yet
			author_name: "Anonymous", // User profiles don't contain display names
			is_user_created: !!story.created_by,
			segments:
				story.story_segments?.sort(
					(
						a: { segment_order: number },
						b: { segment_order: number }
					) => a.segment_order - b.segment_order
				) || [],
			questions: story.questions || [],
			reviews: [], // Reviews not implemented yet
		};

		return NextResponse.json({
			success: true,
			story: processedStory,
		});
	} catch (error) {
		console.error("Get story error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
