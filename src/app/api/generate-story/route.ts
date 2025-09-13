import { NextRequest, NextResponse } from "next/server";

interface GenerateStoryRequest {
	theme: string;
	customTopic?: string;
	gradeLevel: number; // Year 1-6
	storyType: "fiction" | "non_fiction";
	generateImages?: boolean;
	imageStyle?: "cartoon" | "realistic" | "illustration";
}

export async function POST(request: NextRequest) {
	try {
		// Feature flag: allow disabling story generation without code changes
		if (process.env.GENERATION_ENABLED === "false") {
			return NextResponse.json(
				{
					success: false,
					error: "Story generation is temporarily disabled.",
				},
				{ status: 503 }
			);
		}

		let body: GenerateStoryRequest;
		try {
			body = (await request.json()) as GenerateStoryRequest;
		} catch {
			return NextResponse.json(
				{ success: false, error: "Invalid JSON payload" },
				{ status: 400 }
			);
		}
		const { 
			theme, 
			customTopic, 
			gradeLevel, 
			storyType, 
			generateImages = false,
			imageStyle = "illustration" 
		} = body;
		// Validate required fields
		if (
			typeof gradeLevel !== "number" ||
			gradeLevel < 1 ||
			gradeLevel > 6
		) {
			return NextResponse.json(
				{ success: false, error: "Invalid or missing gradeLevel" },
				{ status: 400 }
			);
		}
		if (storyType !== "fiction" && storyType !== "non_fiction") {
			return NextResponse.json(
				{ success: false, error: "Invalid or missing storyType" },
				{ status: 400 }
			);
		}

		// Get grade-specific configuration (dynamic import so tests can mock)
		const { getGradeLevelConfig, getVocabularyForYear } = await import(
			"@/config/grade-levels"
		);
		const gradeConfig = getGradeLevelConfig(gradeLevel);
		const vocabulary = getVocabularyForYear(gradeLevel);

		// Safe defaults for possibly missing fields in tests/mocks
		const topicsList = Array.isArray((vocabulary as any)?.topics)
			? (vocabulary as any).topics
			: [];
		const commonWordsList = Array.isArray(
			(vocabulary as any)?.commonWords
		)
			? (vocabulary as any).commonWords
			: [];
		const questionsPerStory =
			typeof (gradeConfig as any)?.questionsPerStory === "number"
				? (gradeConfig as any).questionsPerStory
				: 5;
		const questionTypes = Array.isArray(
			(gradeConfig as any)?.questionTypes
		)
			? (gradeConfig as any).questionTypes
			: ["multiple_choice"];
		const sentenceAvg =
			(gradeConfig as any)?.sentenceLength?.average ?? 8;
		const sentenceMax =
			(gradeConfig as any)?.sentenceLength?.maxWords ?? 12;
		const vocabDesc =
			(gradeConfig as any)?.vocabularyLevel?.description ??
			"Age-appropriate vocabulary";
		const syllableMax =
			(gradeConfig as any)?.vocabularyLevel?.syllableComplexity ?? 2;
		const focusHighFreq =
			(gradeConfig as any)?.vocabularyLevel?.commonWords ?? true;

		// Research the topic for factual accuracy
		const topic = customTopic || theme;
		let research: any = "";
		try {
			const { researchTopicForStory } = await import(
				"@/utils/search/client"
			);
			research = await researchTopicForStory(topic);
		} catch {
			// If research fails, continue without it
			research = "";
		}

		// Create grade-specific story generation prompt
		const prompt = `Create an engaging ${storyType} story for children in Year ${gradeLevel} (age ${
			gradeConfig.age
		}, ${gradeConfig.readingLevel} reading level).

Topic: ${topic}
Target word count: ${gradeConfig.wordCount.recommended} words (${
			gradeConfig.wordCount.min
		}-${gradeConfig.wordCount.max} range)
Target audience: Year ${gradeLevel} children (age ${gradeConfig.age})

YEAR ${gradeLevel} REQUIREMENTS:
- Reading Level: ${gradeConfig.readingLevel}
- Average sentence length: ${sentenceAvg} words (max ${sentenceMax} words)
- Vocabulary: ${vocabDesc}
- Plot complexity: ${gradeConfig.storyElements.plotComplexity}
- Maximum characters: ${gradeConfig.storyElements.characterCount}
- Subplots allowed: ${gradeConfig.storyElements.subplots ? "Yes" : "No"}
- Appropriate themes: ${gradeConfig.storyElements.themes.join(", ")}

VOCABULARY GUIDELINES:
- Use these topic-appropriate words: ${topicsList.join(", ")}
- Include these common words where appropriate: ${commonWordsList.join(", ")}
- Syllable complexity: Maximum ${syllableMax} syllables for new words
- ${
			focusHighFreq
				? "Focus on high-frequency words"
				: "Can use more varied vocabulary"
		}

STORY STRUCTURE:
- Break into 4-6 segments for interactive reading
- Each segment should end with a natural pause or mini-cliffhanger
- Make it fun and exciting, not boring or overly educational
- Include dialogue and action appropriate for Year ${gradeLevel}
- Plan for ${questionsPerStory} comprehension questions

Please provide:
1. Story title
2. Brief description
3. Story segments (each segment should be clearly marked)
4. Suggested image prompts for each segment
5. Suggested comprehension questions (${questionTypes.join(", ")} types)

⚠️ CRITICAL: You MUST include comprehension questions! The response will be incomplete without them.

REQUIRED FORMAT - Return ONLY valid JSON in this exact structure:

{
  "title": "[Your story title]",
  "description": "[Brief description]",
  "segments": [
    {
      "title": "[Segment title]",
      "content": "[Story content for this segment]",
      "imagePrompt": "[Description for AI image generation]"
    }
  ],
  "questions": [
    {
      "question_text": "[Question text]",
      "question_type": "multiple_choice",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct_answer": "Option 2",
      "explanation": "[Why this is the correct answer]"
    },
    {
      "question_text": "[True/False question text]",
      "question_type": "multiple_choice",
      "options": ["True", "False"],
      "correct_answer": "True",
      "explanation": "[Explanation]"
    }
  ]
}

⚠️ CRITICAL: Return ONLY valid JSON. Do not include any markdown, explanatory text, or formatting outside the JSON structure.

RESEARCH CONTEXT (use this for factual accuracy):
${research}`;

		// Generate story using GPT-4.1 nano (gpt-4o-mini is the model name for GPT-4.1 nano)
		const { openai } = await import("@/lib/openai");
		const completion = await (openai as any).chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "user",
					content: prompt,
				},
				{
					role: "system",
					content: `You are a creative children's story writer who specializes in making reading fun and engaging for primary school students. Write a ${storyType} story for Year ${gradeLevel} children. Avoid boring, overly educational content. IMPORTANT: You MUST return ONLY valid JSON in the exact format specified. Do not include any markdown, explanatory text, or additional formatting.`,
				},
			],
			temperature: 0.8,
			max_tokens: 8000,
		});

		const storyContent = completion.choices[0]?.message?.content;

		if (!storyContent) {
			throw new Error("Failed to generate story content");
		}

		// Parse the generated JSON content
		let parsedStory;
		try {
			// Clean the response in case there's any extra content
			const cleanContent = storyContent.trim();
			const jsonStart = cleanContent.indexOf('{');
			const jsonEnd = cleanContent.lastIndexOf('}') + 1;
			
			if (jsonStart === -1 || jsonEnd <= jsonStart) {
				throw new Error('No valid JSON structure found');
			}
			
			const jsonContent = cleanContent.slice(jsonStart, jsonEnd);
			parsedStory = JSON.parse(jsonContent);
		} catch (error) {
			console.error('Failed to parse JSON response:', error);
			// Fallback to old parsing method if JSON fails
			const lines = storyContent.split("\n").filter((line: string) => line.trim());
			const titleLine = lines.find((line: string) =>
				line.toLowerCase().includes("title:") ||
				line.toLowerCase().includes("story title:")
			);
			const title = titleLine
				? titleLine.split(":")[1]?.trim().replace(/"/g, "") || "Untitled Story"
				: "Untitled Story";

			const descriptionLine = lines.find((line) =>
				line.toLowerCase().includes("description:") ||
				line.toLowerCase().includes("brief description:")
			);
			const description = descriptionLine
				? descriptionLine.split(":")[1]?.trim() || "An exciting adventure story!"
				: "An exciting adventure story!";
				
			parsedStory = {
				title,
				description,
				segments: [],
				questions: []
			};
		}

		const title = parsedStory.title || "Untitled Story";
		const description = parsedStory.description || "An exciting adventure story!";

		// Generate images if requested
		let generatedImages: any[] = [];
		console.log("=== IMAGE GENERATION DEBUG ===");
		console.log("generateImages flag:", generateImages);
		console.log("imageStyle:", imageStyle);
		
		if (generateImages) {
			try {
				console.log("Starting image generation...");
				const { generateStoryImages } = await import("@/utils/images/story-images");
				generatedImages = await generateStoryImages(storyContent, title, {
					generateAll: true,
					maxImages: 4, // Limit to avoid long generation times
					style: imageStyle
				});
				console.log("Image generation completed. Generated", generatedImages.length, "images");
				console.log("Generated images:", generatedImages.map(img => ({
					segmentId: img.segmentId,
					hasImageUrl: !!img.imageUrl,
					imageUrl: img.imageUrl?.substring(0, 100) + "..."
				})));
			} catch (imageError) {
				console.error("Image generation failed:", imageError);
				// Continue without images if generation fails
			}
		} else {
			console.log("Image generation skipped - generateImages is false");
		}

		// Create structured story data with parsed JSON
		// Link generated images to their corresponding segments
		const segmentsWithImages = (parsedStory.segments || []).map((segment: any, index: number) => {
			const segmentId = `segment_${index + 1}`;
			const matchingImage = generatedImages.find(img => img.segmentId === segmentId);
			
			return {
				...segment,
				image: matchingImage?.imageUrl || null,
				imagePath: matchingImage?.storagePath || null,
				thumbnailUrl: matchingImage?.thumbnailUrl || null,
				thumbnailPath: matchingImage?.thumbnailStoragePath || null,
				imagePrompt: segment.imagePrompt || matchingImage?.prompt || null,
			};
		});

		const storyData = {
			title,
			description,
			content: {
				raw: storyContent, // Keep raw content for backward compatibility
				structured: {
					...parsedStory,
					segments: segmentsWithImages // Use segments with linked images
				}
			},
			segments: segmentsWithImages,
			questions: parsedStory.questions || [],
			genre: theme,
			theme: topic,
			reading_level: gradeConfig.readingLevel,
			story_type: storyType,
			grade_level: gradeLevel,
			word_count: gradeConfig.wordCount.recommended,
			estimated_reading_time: Math.ceil(
				gradeConfig.wordCount.recommended / (gradeLevel * 20 + 40)
			), // Age-adjusted reading speed
			difficulty_rating: gradeConfig.questionComplexity,
			images: generatedImages,
			grade_config: {
				sentenceLength: gradeConfig.sentenceLength,
				vocabularyLevel: gradeConfig.vocabularyLevel,
				questionTypes: gradeConfig.questionTypes,
				questionsPerStory: gradeConfig.questionsPerStory,
				uiElements: gradeConfig.uiElements,
			},
		};

		return NextResponse.json({
			success: true,
			story: storyContent,
			storyData,
			research,
			images: generatedImages,
			imagesGenerated: generatedImages.length > 0,
		});
	} catch (error) {
		console.error("Story generation error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to generate story. Please try again.",
			},
			{ status: 500 }
		);
	}
}
