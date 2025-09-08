import { NextRequest, NextResponse } from "next/server";
import {
	uploadImageFromUrl,
	ensureStorageBucket,
} from "@/utils/images/storage";

interface GenerateImageRequest {
	prompt: string;
	storyTitle?: string;
	segmentId?: string;
	style?: "cartoon" | "realistic" | "illustration";
	saveToStorage?: boolean;
}

export async function POST(request: NextRequest) {
	try {
		let body: GenerateImageRequest;
		try {
			body = (await request.json()) as GenerateImageRequest;
		} catch {
			return NextResponse.json(
				{ success: false, error: "Invalid JSON payload" },
				{ status: 400 }
			);
		}
		const {
			prompt,
			style = "illustration",
			storyTitle = "story",
			segmentId,
			saveToStorage = true,
		} = body;

		if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
			return NextResponse.json(
				{
					success: false,
					error: 'The "prompt" field is required.',
				},
				{ status: 400 }
			);
		}

		// Enhanced prompt for child-friendly, educational content
		const enhancedPrompt = `Child-friendly digital ${style} artwork: ${prompt}. 

Create a vibrant, engaging illustration perfect for primary school children aged 5-12. 
Style guidelines:
- Use bright, cheerful colors with good contrast
- Make it welcoming and educational, never scary or inappropriate
- Include clear, simple compositions that support reading comprehension
- Use a modern, clean digital art style similar to children's book illustrations
- Ensure diverse representation when depicting people
- Focus on details that enhance story understanding

Technical requirements: High quality, detailed, suitable for web display, optimized for children's educational content.`;

		// Ensure storage bucket exists if we're saving
		if (saveToStorage) {
			const bucketReady = await ensureStorageBucket();
			if (!bucketReady) {
				console.warn(
					"Storage bucket not ready, will return temporary URL only"
				);
			}
		}

		// Generate image using DALL-E 3
		const { default: openai } = await import("@/utils/openai/client");
		const response = await openai.images.generate({
			model: "dall-e-3",
			prompt: enhancedPrompt,
			n: 1,
			size: "1024x1024",
			quality: "hd", // Use HD quality for better results
			style: "vivid", // Vivid style for more engaging images
		});

		const temporaryImageUrl = response.data?.[0]?.url;
		const revisedPrompt = response.data?.[0]?.revised_prompt;

		if (!temporaryImageUrl) {
			throw new Error("Failed to generate image");
		}

		let permanentImageUrl = temporaryImageUrl;
		let thumbnailUrl = null as string | null;
		let storagePath: string | null = null;
		let thumbStoragePath: string | null = null;

		// Save to Supabase Storage for permanent hosting
		if (saveToStorage) {
			try {
				const fileName = segmentId
					? `${storyTitle.replace(
							/[^a-zA-Z0-9]/g,
							"_"
					  )}_${segmentId}`
					: `${storyTitle.replace(
							/[^a-zA-Z0-9]/g,
							"_"
					  )}_${Date.now()}`;

				// Create optimized versions
				const uploadResult = await uploadImageFromUrl(
					temporaryImageUrl,
					fileName,
					{
						width: 1024,
						height: 1024,
						quality: 85,
						format: "webp",
					}
				);

				if (uploadResult) {
					permanentImageUrl =
						uploadResult.signedUrl || temporaryImageUrl;
					storagePath = uploadResult.path;
					// Also create a thumbnail
					const thumbnailResult = await uploadImageFromUrl(
						temporaryImageUrl,
						`${fileName}_thumb`,
						{
							width: 400,
							height: 300,
							quality: 80,
							format: "webp",
						}
					);
					if (thumbnailResult) {
						thumbnailUrl = thumbnailResult.signedUrl;
						thumbStoragePath = thumbnailResult.path;
					}
				}
			} catch (storageError) {
				console.error("Storage upload failed:", storageError);
				// Continue with temporary URL if storage fails
			}
		}

		return NextResponse.json({
			success: true,
			imageUrl: permanentImageUrl,
			thumbnailUrl,
			temporaryUrl: temporaryImageUrl,
			revisedPrompt,
			savedToStorage: permanentImageUrl !== temporaryImageUrl,
			storagePath,
			thumbnailStoragePath: thumbStoragePath,
		});
	} catch (error: any) {
		console.error("Image generation error:", error);
		const status =
			typeof error?.status === "number" ? error.status : undefined;

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
				error: "Failed to generate image. Please try again.",
			},
			{ status: 500 }
		);
	}
}
