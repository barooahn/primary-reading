import { NextRequest, NextResponse } from "next/server";

interface RegenerateImageRequest {
	segmentId: string;
	prompt: string;
	storyTitle: string;
	style?: "cartoon" | "realistic" | "illustration";
	regenerationCount: number;
}

export async function POST(request: NextRequest) {
	try {
		let body: RegenerateImageRequest;
		try {
			body = (await request.json()) as RegenerateImageRequest;
		} catch {
			return NextResponse.json(
				{ success: false, error: "Invalid JSON payload" },
				{ status: 400 }
			);
		}

		const { segmentId, prompt, storyTitle, style = "illustration", regenerationCount } = body;

		// Check regeneration limit (only 1 regeneration per image allowed)
		if (regenerationCount >= 1) {
			return NextResponse.json(
				{ 
					success: false, 
					error: "Maximum regeneration limit reached (1 per image)" 
				},
				{ status: 429 }
			);
		}

		if (!segmentId || !prompt || !storyTitle) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing required fields: segmentId, prompt, or storyTitle",
				},
				{ status: 400 }
			);
		}

		// Use the same image generation API but with a modified prompt for variety
		const modifiedPrompt = `${prompt}. Different perspective, varied composition from previous generation.`;

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/generate-image`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt: modifiedPrompt,
					storyTitle: storyTitle,
					segmentId: `${segmentId}_regen_${regenerationCount + 1}`,
					style: style,
					saveToStorage: true,
				}),
			}
		);

		const imageResult = await response.json();

		if (imageResult.success) {
			return NextResponse.json({
				success: true,
				imageUrl: imageResult.imageUrl,
				thumbnailUrl: imageResult.thumbnailUrl,
				storagePath: imageResult.storagePath,
				thumbnailStoragePath: imageResult.thumbnailStoragePath,
				revisedPrompt: imageResult.revisedPrompt,
				regenerationCount: regenerationCount + 1,
				canRegenerate: false, // No more regenerations allowed
				message: "Image regenerated successfully",
			});
		} else {
			return NextResponse.json({
				success: false,
				error: imageResult.error || "Failed to regenerate image",
			}, { status: 500 });
		}

	} catch (error: any) {
		console.error("Image regeneration error:", error);
		
		const status = typeof error?.status === "number" ? error.status : 500;
		
		if (status === 429) {
			return NextResponse.json(
				{
					success: false,
					error: "Rate limit exceeded. Please try again later.",
				},
				{ status: 429 }
			);
		}

		if (status === 400 && error.message?.includes("content_policy")) {
			return NextResponse.json(
				{
					success: false,
					error: "Image prompt doesn't meet content policy. Please try a different description.",
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{
				success: false,
				error: "Failed to regenerate image. Please try again.",
			},
			{ status: 500 }
		);
	}
}