/**
 * Story Image Generation Service
 * Extracts image prompts from generated stories and creates illustrations
 */

interface ImagePrompt {
	segmentId: string;
	title: string;
	prompt: string;
	type: "cover" | "segment";
}

interface GeneratedImage {
	segmentId: string;
	imageUrl: string; // signed URL for immediate display
	thumbnailUrl?: string; // signed URL for preview
	storagePath?: string; // private storage path to save in DB
	thumbnailStoragePath?: string;
	prompt: string;
	revisedPrompt?: string;
	type?: "cover" | "segment";
}

/**
 * Extract image prompts from story content
 */
export function extractImagePrompts(
	storyContent: string,
	storyTitle: string
): ImagePrompt[] {
	const prompts: ImagePrompt[] = [];

	// Look for image prompts in various formats
	const imagePromptPatterns = [
		/\*\*\[Image Prompt: (.*?)\]\*\*/gi,
		/\[Image Prompt: (.*?)\]/gi,
		/Image Prompt: (.*?)(?:\n|$)/gi,
		/Suggested Image: (.*?)(?:\n|$)/gi,
		/\*\*Image Suggestion:\*\* (.*?)(?:\n|$)/gi,
	];

	// Split content into segments
	const segments = storyContent.split(
		/(?:#{1,4}|###)\s*(?:\*\*)?Segment\s*\d+/i
	);

	segments.forEach((segment, index) => {
		if (!segment.trim()) return;

		// Extract segment title
		const titleMatch = segment.match(
			/(?:#{1,4}|###)?\s*(?:\*\*)?([^:\n]+?)(?:\*\*)?(?::|$)/
		);
		const segmentTitle =
			titleMatch?.[1]?.trim() || `Segment ${index + 1}`;
		const segmentId = `segment_${index + 1}`;

		// Look for image prompts in this segment (take first match only)
		let foundPrompt = false;
		for (const pattern of imagePromptPatterns) {
			const match = segment.match(pattern);
			if (match?.[1]?.trim()) {
				prompts.push({
					segmentId,
					title: segmentTitle,
					prompt: match[1].trim(),
					type: index === 0 ? "cover" : "segment",
				});
				foundPrompt = true;
				break;
			}
		}

		// If no explicit image prompt found, create one from content
		if (!foundPrompt && segment.length > 50) {
			// Extract key elements from the story segment for auto-generated prompt
			const cleanContent = segment
				.replace(/#{1,6}\s*/g, "")
				.replace(/\*\*(.*?)\*\*/g, "$1")
				.replace(/\[Image.*?\]/gi, "")
				.replace(/Image Prompt:.*$/gm, "")
				.trim();

			const firstSentence = cleanContent.split(/[.!?]/)[0]?.trim();
			if (firstSentence && firstSentence.length > 10) {
				const autoPrompt = generateAutoPrompt(
					firstSentence,
					segmentTitle,
					storyTitle
				);
				prompts.push({
					segmentId,
					title: segmentTitle,
					prompt: autoPrompt,
					type: index === 0 ? "cover" : "segment",
				});
			}
		}
	});

	// If no prompts found at all, create a cover image from story title
	if (prompts.length === 0) {
		prompts.push({
			segmentId: "cover",
			title: "Story Cover",
			prompt: `Book cover illustration for a children's story titled "${storyTitle}". Show the main characters and setting in a welcoming, colorful style.`,
			type: "cover",
		});
	}

	return prompts;
}

/**
 * Generate an automatic image prompt from story content
 */
function generateAutoPrompt(
	content: string,
	segmentTitle: string,
	storyTitle: string
): string {
	// Extract key nouns and actions
	const characters = extractCharacters(content);
	const setting = extractSetting(content);
	const action = extractAction(content);

	let prompt = `Children's book illustration showing `;

	if (characters.length > 0) {
		prompt += characters.join(" and ") + " ";
	}

	if (action) {
		prompt += action + " ";
	}

	if (setting) {
		prompt += `in ${setting} `;
	}

	prompt += `for the story "${storyTitle}". Bright, colorful, child-friendly art style.`;

	return prompt;
}

/**
 * Extract character mentions from text
 */
function extractCharacters(text: string): string[] {
	const characters: string[] = [];

	// Common character patterns
	const characterPatterns = [
		/\b([A-Z][a-z]+)\s+(?:said|asked|replied|shouted|whispered|thought)/gi,
		/"([^"]*?),?" said ([A-Z][a-z]+)/gi,
		/\b([A-Z][a-z]+)\s+(?:was|were|had|could|would)/gi,
	];

	characterPatterns.forEach((pattern) => {
		const matches = [...text.matchAll(pattern)];
		matches.forEach((match) => {
			const name = match[1] || match[2];
			if (name && name.length < 15 && !characters.includes(name)) {
				characters.push(name);
			}
		});
	});

	return characters.slice(0, 3); // Limit to 3 main characters
}

/**
 * Extract setting mentions from text
 */
function extractSetting(text: string): string | null {
	const settingPatterns = [
		/\bin (?:the )?([a-z ]+(?:forest|house|school|park|garden|cave|castle|village|town|city))/gi,
		/\bat (?:the )?([a-z ]+(?:beach|playground|library|store|market))/gi,
		/\bon (?:the )?([a-z ]+(?:island|mountain|hill|farm))/gi,
	];

	for (const pattern of settingPatterns) {
		const match = text.match(pattern);
		if (match?.[1]) {
			return match[1].trim();
		}
	}

	return null;
}

/**
 * Extract main action from text
 */
function extractAction(text: string): string | null {
	const actionPatterns = [
		/(?:was|were) ([a-z]+ing)/i,
		/(?:began to|started to) ([a-z ]+)/i,
		/decided to ([a-z ]+)/i,
	];

	for (const pattern of actionPatterns) {
		const match = text.match(pattern);
		if (match?.[1]) {
			return match[1].trim();
		}
	}

	return null;
}

/**
 * Generate images for all segments in a story
 */
export async function generateStoryImages(
	storyContent: string,
	storyTitle: string,
	options: {
		generateAll?: boolean;
		maxImages?: number;
		style?: "cartoon" | "realistic" | "illustration";
	} = {}
): Promise<GeneratedImage[]> {
	const {
		generateAll = true,
		maxImages = 6,
		style = "illustration",
	} = options;

	const imagePrompts = extractImagePrompts(storyContent, storyTitle);
	const promptsToGenerate = generateAll
		? imagePrompts.slice(0, maxImages)
		: imagePrompts.filter((p) => p.type === "cover").slice(0, 1);

	const generatedImages: GeneratedImage[] = [];

	// Generate images sequentially to avoid rate limits
	for (const prompt of promptsToGenerate) {
		try {
			const baseUrl =
				(process.env.NEXT_PUBLIC_APP_URL &&
					process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")) ||
				(process.env.VERCEL_URL
					? `https://${process.env.VERCEL_URL}`
					: "http://localhost:3000");
			const response = await fetch(`${baseUrl}/api/generate-image`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					prompt: prompt.prompt,
					storyTitle: storyTitle,
					segmentId: prompt.segmentId,
					style: style,
					saveToStorage: true,
				}),
			});

			const result = await response.json();

			if (result.success) {
				generatedImages.push({
					segmentId: prompt.segmentId,
					imageUrl: result.imageUrl,
					thumbnailUrl: result.thumbnailUrl,
					storagePath: result.storagePath,
					thumbnailStoragePath: result.thumbnailStoragePath,
					prompt: prompt.prompt,
					revisedPrompt: result.revisedPrompt,
					type: prompt.type,
				});
			} else {
				console.error(
					`Failed to generate image for ${prompt.segmentId}:`,
					result.error
				);
			}

			// Add delay between requests to respect rate limits
			await new Promise((resolve) => setTimeout(resolve, 2000));
		} catch (error) {
			console.error(
				`Error generating image for ${prompt.segmentId}:`,
				error
			);
		}
	}

	return generatedImages;
}

/**
 * Process and optimize story images for different display contexts
 */
export function optimizeImagesForDisplay(images: GeneratedImage[]) {
	return images.map((image) => ({
		...image,
		// Use thumbnail for list views, full image for detail views
		displayUrl: image.thumbnailUrl || image.imageUrl,
		fullUrl: image.imageUrl,
	}));
}
