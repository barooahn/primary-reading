import { NextRequest, NextResponse } from "next/server";

interface SaveStoryRequest {
	title: string;
	description: string;
	content: string;
	genre: string;
	theme: string;
	reading_level: "beginner" | "intermediate" | "advanced";
	story_type: "fiction" | "non_fiction";
	grade_level: number;
	word_count: number;
	estimated_reading_time: number;
	difficulty_rating: number;
	cover_image_url?: string;
	cover_thumbnail_url?: string;
	segments?: Array<{
		segment_order: number;
		title?: string;
		content: string;
		image_url?: string;
		thumbnail_url?: string;
		image_prompt?: string;
	}>;
	questions?: Array<{
		question_text: string;
		question_type:
			| "multiple_choice"
			| "true_false"
			| "short_answer"
			| "drag_drop"
			| "sequence";
		options?: string[] | { [key: string]: string } | null;
		correct_answer: string | number | boolean;
		explanation?: string;
		points: number;
		difficulty: number;
	}>;
}

export async function POST(request: NextRequest) {
	try {
		const { createClient } = await import("@/utils/supabase/server");
		const supabase = await createClient();
		let body: SaveStoryRequest;
		try {
			body = (await request.json()) as SaveStoryRequest;
		} catch {
			return NextResponse.json(
				{ success: false, error: "Invalid JSON payload" },
				{ status: 400 }
			);
		}

		// Basic validation
		const requiredFields: Array<keyof SaveStoryRequest> = [
			"title",
			"content",
			"genre",
			"reading_level",
			"story_type",
			"grade_level",
		];
		for (const field of requiredFields) {
			if (
				(body as any)[field] === undefined ||
				(typeof (body as any)[field] === "string" &&
					!(body as any)[field].trim())
			) {
				return NextResponse.json(
					{
						success: false,
						error: `Missing or invalid field: ${String(
							field
						)}`,
					},
					{ status: 400 }
				);
			}
		}
		if (
			!["beginner", "intermediate", "advanced"].includes(
				String(body.reading_level)
			)
		) {
			return NextResponse.json(
				{ success: false, error: "Invalid reading level" },
				{ status: 400 }
			);
		}
		if (
			body.story_type !== "fiction" &&
			body.story_type !== "non_fiction"
		) {
			return NextResponse.json(
				{ success: false, error: "Invalid story type" },
				{ status: 400 }
			);
		}
		if (
			typeof body.grade_level !== "number" ||
			body.grade_level < 1 ||
			body.grade_level > 6
		) {
			return NextResponse.json(
				{ success: false, error: "Invalid grade level" },
				{ status: 400 }
			);
		}

		// Get current user
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json(
				{ success: false, error: "Authentication required" },
				{ status: 401 }
			);
		}

		// Save the main story record (insert first, then use returned id)
		const insertResult = await supabase.from("stories").insert({
			title: body.title,
			description: body.description,
			content: { raw: body.content }, // Store full content as JSONB
			genre: body.genre,
			theme: body.theme,
			reading_level: body.reading_level,
			story_type: body.story_type,
			grade_level: body.grade_level,
			word_count: body.word_count,
			estimated_reading_time: body.estimated_reading_time,
			difficulty_rating: body.difficulty_rating,
			cover_image_url: body.cover_image_url,
			cover_image_path:
				body.cover_image_url &&
				!body.cover_image_url.startsWith("http")
					? body.cover_image_url
					: null,
			cover_thumbnail_path:
				body.cover_thumbnail_url &&
				!body.cover_thumbnail_url.startsWith("http")
					? body.cover_thumbnail_url
					: null,
			is_featured: false,
			is_published: true,
			created_by: user.id,
		}).select();

		if (insertResult.error) {
			console.error("Story save error:", insertResult.error);
			return NextResponse.json(
				{
					success: false,
					error: insertResult.error.message || "Database error",
				},
				{ status: 500 }
			);
		}

		console.log("=== INSERT RESULT DEBUG ===");
		console.log("Insert result:", insertResult);
		console.log("Insert result data:", insertResult.data);
		console.log("Insert result data[0]:", insertResult.data?.[0]);
		
		const storyId = insertResult.data?.[0]?.id;
		console.log("Extracted story ID:", storyId);

		// Save story segments if provided
		if (body.segments && body.segments.length > 0) {
			const segmentsToInsert = body.segments.map((segment) => ({
				story_id: storyId,
				segment_order: segment.segment_order,
				title: segment.title,
				content: segment.content,
				image_url: segment.image_url,
				image_path:
					segment.image_url &&
					!segment.image_url.startsWith("http")
						? segment.image_url
						: null,
				thumbnail_path:
					segment.thumbnail_url &&
					!segment.thumbnail_url.startsWith("http")
						? segment.thumbnail_url
						: null,
				image_prompt: segment.image_prompt,
			}));

			const { error: segmentsError } = await supabase
				.from("story_segments")
				.insert(segmentsToInsert);

			if (segmentsError) {
				console.error("Segments save error:", segmentsError);
				// Don't fail the whole operation, just log the error
			}
		}

		// Save questions if provided
		if (body.questions && body.questions.length > 0) {
			console.log("Saving questions:", body.questions);
			const questionsToInsert = body.questions.map((question) => ({
				story_id: storyId,
				question_text: question.question_text,
				question_type: question.question_type,
				options: question.options,
				correct_answer: question.correct_answer,
				explanation: question.explanation,
				points: question.points,
				difficulty: question.difficulty,
			}));

			console.log("Questions to insert:", questionsToInsert);

			const { error: questionsError } = await supabase
				.from("questions")
				.insert(questionsToInsert);

			if (questionsError) {
				console.error("Questions save error:", questionsError);
				// Don't fail the whole operation, just log the error
			} else {
				console.log("Questions saved successfully!");
			}
		} else {
			console.log("No questions to save - questions array is empty or undefined");
		}

		// Update user's story count (for achievements/progress)
		try {
			const { error: profileError } = await supabase.rpc(
				"increment_user_stories",
				{
					p_user_id: user.id,
				}
			);

			if (profileError) {
				console.error("Profile update error:", profileError);
			}
		} catch {
			// If the function doesn't exist, it's okay - we'll handle this in the future
			console.log("Profile update function not available yet");
		}

		return NextResponse.json({
			success: true,
			story: {
				id: storyId,
			},
			message: "Story saved successfully!",
		});
	} catch (error) {
		console.error("Save story error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
