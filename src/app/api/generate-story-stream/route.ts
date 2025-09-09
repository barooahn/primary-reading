import { NextRequest } from "next/server";

interface GenerateStoryRequest {
	theme: string;
	customTopic?: string;
	gradeLevel: number;
	storyType: "fiction" | "non_fiction";
	generateImages?: boolean;
	imageStyle?: "cartoon" | "realistic" | "illustration";
}

interface ProgressUpdate {
	step: string;
	progress: number;
	message: string;
	data?: any;
}

interface ParsedQuestion {
	question_text: string;
	question_type: string;
	options: string[];
	correct_answer: string;
	explanation: string;
}

interface ParsedSegment {
	title: string;
	content: string;
	imagePrompt: string;
}

export async function POST(request: NextRequest) {
	try {
		if (process.env.GENERATION_ENABLED === "false") {
			return new Response(
				JSON.stringify({
					error: "Story generation is temporarily disabled.",
				}),
				{
					status: 503,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		let body: GenerateStoryRequest;
		try {
			body = (await request.json()) as GenerateStoryRequest;
		} catch {
			return new Response(
				JSON.stringify({ error: "Invalid JSON payload" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
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
			return new Response(
				JSON.stringify({ error: "Invalid or missing gradeLevel" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Create a ReadableStream for Server-Sent Events
		const encoder = new TextEncoder();
		let controller!: ReadableStreamDefaultController<Uint8Array>;

		const stream = new ReadableStream({
			start(ctrl) {
				controller = ctrl;
			},
		});

		// Function to send progress updates
		const sendUpdate = (update: ProgressUpdate) => {
			const data = `data: ${JSON.stringify(update)}\n\n`;
			controller.enqueue(encoder.encode(data));
		};

		// Start the generation process asynchronously
		(async () => {
			try {
				// Step 1: Generate story content
				sendUpdate({
					step: "story",
					progress: 10,
					message: "Generating your story...",
				});

				const { getGradeLevelConfig } = await import("@/config/grade-levels");
				const gradeConfig = getGradeLevelConfig(gradeLevel);

				const questionTypes = gradeConfig.questionTypes.slice(0, 3);
				const topic = customTopic || theme;

				// Enhanced research for better story quality
				let research = "";
				try {
					if (theme.toLowerCase().includes("science") || 
						theme.toLowerCase().includes("nature") || 
						theme.toLowerCase().includes("animal")) {
						research = "Use age-appropriate scientific facts and encourage curiosity about the natural world.";
					} else if (theme.toLowerCase().includes("history") || 
							   theme.toLowerCase().includes("culture")) {
						research = "Include historically accurate but simplified information suitable for children.";
					}
				} catch {
					// Continue without research if fetching fails
				}

				const questionsPerStory = gradeConfig.questionsPerStory || 5;

				const prompt = `Create an engaging ${storyType} story for Year ${gradeLevel} children (ages ${gradeLevel + 4}-${gradeLevel + 5}).

STORY REQUIREMENTS:
- Theme: ${topic}
- Reading level: ${gradeConfig.readingLevel}
- Length: ${gradeConfig.wordCount.recommended} words (${gradeConfig.wordCount.min}-${gradeConfig.wordCount.max} range)
- Sentence length: ${gradeConfig.sentenceLength.maxWords} words maximum
- Vocabulary: ${gradeConfig.vocabularyLevel}

RETURN YOUR RESPONSE AS A VALID JSON OBJECT WITH THIS EXACT STRUCTURE:

{
  "title": "Story title without asterisks",
  "description": "1-2 sentence summary of the story",
  "segments": [
    {
      "title": "Beginning",
      "content": "First part of story - about 25% of total length",
      "imagePrompt": "Detailed visual description for this segment"
    },
    {
      "title": "Rising Action", 
      "content": "Second part of story - about 25% of total length",
      "imagePrompt": "Detailed visual description for this segment"
    },
    {
      "title": "Climax",
      "content": "Third part of story - about 25% of total length",
      "imagePrompt": "Detailed visual description for this segment"
    },
    {
      "title": "Resolution",
      "content": "Final part of story - about 25% of total length",
      "imagePrompt": "Detailed visual description for this segment"
    }
  ],
  "questions": [
    {
      "question_text": "What did the main character discover at the beginning?",
      "question_type": "multiple_choice",
      "options": ["A treasure map", "A golden key", "A magic wand", "A secret door"],
      "correct_answer": "A treasure map",
      "explanation": "The main character found a treasure map in the library"
    },
    {
      "question_text": "True or False: The story takes place during the day.",
      "question_type": "multiple_choice", 
      "options": ["True", "False"],
      "correct_answer": "True",
      "explanation": "The adventure happens during daylight hours"
    },
    {
      "question_text": "What lesson do the characters learn?",
      "question_type": "short_answer",
      "options": [],
      "correct_answer": "The importance of friendship and teamwork",
      "explanation": "They learn that working together makes them stronger"
    }
  ]
}

CRITICAL REQUIREMENTS:
1. MUST return ONLY valid JSON - no explanatory text, no markdown, no code blocks
2. Start your response with { and end with } - nothing else
3. Include EXACTLY ${questionsPerStory} questions in the "questions" array
4. Use question types: ${questionTypes.join(", ")} (convert all to "multiple_choice" or "short_answer")
5. Each question must have: question_text, question_type, options array, correct_answer, explanation
6. For multiple_choice: options should be array of strings, correct_answer should match one option exactly
7. For short_answer: options should be empty array [], correct_answer should be the expected answer
8. Questions must test understanding of YOUR story content - replace examples with actual story questions
9. Story segments must tell a complete, engaging story appropriate for the age group

IMPORTANT: Your entire response must be parseable JSON. Do not include any text outside the JSON object.

RESEARCH CONTEXT (use this for factual accuracy):
${research}`;

				// Generate story using GPT-4o-mini
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
							content: `You are a creative children's story writer who specializes in making reading fun and engaging for primary school students. Write a ${storyType} story for Year ${gradeLevel} children. Avoid boring, overly educational content. CRITICAL: You must return ONLY valid JSON with no additional text, explanations, or formatting. Your entire response must be parseable JSON starting with { and ending with }.`,
						},
					],
					temperature: 0.8,
					max_tokens: 2000,
				});

				const storyContent = completion.choices[0]?.message?.content;

				if (!storyContent) {
					throw new Error("Failed to generate story content");
				}

				// Parse the JSON response
				let parsedStory;
				try {
					// First try direct parsing
					parsedStory = JSON.parse(storyContent);
				} catch {
					console.log("Direct JSON parse failed, attempting to extract JSON...");
					
					// Try to extract JSON from the response
					// Look for content between first { and last }
					const firstBrace = storyContent.indexOf('{');
					const lastBrace = storyContent.lastIndexOf('}');
					
					if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
						const extractedJson = storyContent.slice(firstBrace, lastBrace + 1);
						console.log("Extracted JSON:", extractedJson.substring(0, 500));
						
						try {
							parsedStory = JSON.parse(extractedJson);
							console.log("Successfully parsed extracted JSON");
						} catch (extractError) {
							console.error("Failed to parse extracted JSON:", extractError);
							console.error("Raw response:", storyContent.substring(0, 500));
							throw new Error("Generated content is not valid JSON");
						}
					} else {
						console.error("No JSON structure found in response");
						console.error("Raw response:", storyContent.substring(0, 500));
						throw new Error("No JSON structure found in response");
					}
				}

				// Extract data from JSON
				const title = parsedStory.title || "Untitled Story";
				const description = parsedStory.description || "An exciting adventure story!";

				// Extract questions directly from JSON
				const parsedQuestions: ParsedQuestion[] = (parsedStory.questions || []).map((q: any) => ({
					question_text: q.question_text || '',
					question_type: q.question_type || 'multiple_choice',
					options: Array.isArray(q.options) ? q.options : [],
					correct_answer: q.correct_answer || '',
					explanation: q.explanation || ''
				}));
				console.log("=== QUESTIONS DEBUG IN STREAMING API ===");
				console.log("Parsed questions:", parsedQuestions);
				console.log("Questions count:", parsedQuestions.length);

				// Extract segments directly from JSON
				const parsedSegments: ParsedSegment[] = (parsedStory.segments || []).map((s: any) => ({
					title: s.title || '',
					content: s.content || '',
					imagePrompt: s.imagePrompt || ''
				}));

				console.log(`Parsed ${parsedSegments.length} segments from JSON`);
				console.log("Parsed segments:", parsedSegments);

				const storyData = {
					title: title.replace(/\*\*/g, ""),
					description,
					content: {
						raw: storyContent,
						structured: {
							title: title.replace(/\*\*/g, ""),
							description,
							segments: parsedSegments,
							questions: parsedQuestions
						}
					},
					segments: parsedSegments,
					questions: parsedQuestions,
					genre: theme,
					theme: topic,
					reading_level: gradeConfig.readingLevel,
					story_type: storyType,
					grade_level: gradeLevel,
					word_count: gradeConfig.wordCount.recommended,
					estimated_reading_time: Math.ceil(
						gradeConfig.wordCount.recommended / (gradeLevel * 20 + 40)
					),
					difficulty_rating: gradeConfig.questionComplexity,
					grade_config: {
						sentenceLength: gradeConfig.sentenceLength,
						vocabularyLevel: gradeConfig.vocabularyLevel,
						questionTypes: gradeConfig.questionTypes,
						questionsPerStory: gradeConfig.questionsPerStory,
						uiElements: gradeConfig.uiElements,
					},
				};

				console.log("=== FINAL STREAMING API RESPONSE ===");
				console.log("Final questions being sent to frontend:", storyData.questions);
				console.log("Questions count in response:", storyData.questions?.length || 0);

				sendUpdate({
					step: "story",
					progress: 30,
					message: "Story generated successfully!",
					data: { story: storyData },
				});

				// Step 2: Generate images if requested
				if (generateImages) {
					const { extractImagePrompts } = await import("@/utils/images/story-images");
					const imagePrompts = extractImagePrompts(storyContent, title);
					
					// Limit to 5 images maximum (including cover)
					const promptsToGenerate = imagePrompts.slice(0, 5);

					sendUpdate({
						step: "images",
						progress: 35,
						message: `Generating ${promptsToGenerate.length} images...`,
					});

					const generatedImages = [];

					for (let i = 0; i < promptsToGenerate.length; i++) {
						const prompt = promptsToGenerate[i];
						const imageProgress = 35 + ((i + 1) / promptsToGenerate.length) * 60;

						sendUpdate({
							step: "images",
							progress: Math.round(imageProgress),
							message: `Generating image ${i + 1} of ${promptsToGenerate.length}...`,
						});

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
									storyTitle: title,
									segmentId: prompt.segmentId,
									style: imageStyle,
									saveToStorage: true,
								}),
							});

							const result = await response.json();

							if (result.success) {
								const imageData = {
									segmentId: prompt.segmentId,
									imageUrl: result.imageUrl,
									thumbnailUrl: result.thumbnailUrl,
									storagePath: result.storagePath,
									thumbnailStoragePath: result.thumbnailStoragePath,
									prompt: prompt.prompt,
									revisedPrompt: result.revisedPrompt,
									type: prompt.type,
									title: prompt.title,
									canRegenerate: true,
									regenerationCount: 0,
								};

								generatedImages.push(imageData);

								sendUpdate({
									step: "images",
									progress: Math.round(imageProgress),
									message: `Generated image ${i + 1} of ${promptsToGenerate.length}`,
									data: { 
										newImage: imageData,
										totalImages: generatedImages.length 
									},
								});
							} else {
								console.error(`Failed to generate image for ${prompt.segmentId}:`, result.error);
								sendUpdate({
									step: "images",
									progress: Math.round(imageProgress),
									message: `Failed to generate image ${i + 1}`,
								});
							}

							// Add delay between requests to respect rate limits
							if (i < promptsToGenerate.length - 1) {
								await new Promise((resolve) => setTimeout(resolve, 1000));
							}
						} catch (error) {
							console.error(`Error generating image for ${prompt.segmentId}:`, error);
							sendUpdate({
								step: "images",
								progress: Math.round(imageProgress),
								message: `Error generating image ${i + 1}`,
							});
						}
					}

					sendUpdate({
						step: "images",
						progress: 95,
						message: `Generated ${generatedImages.length} images successfully!`,
						data: { images: generatedImages },
					});
				}

				// Final completion
				sendUpdate({
					step: "complete",
					progress: 100,
					message: "Story generation complete!",
					data: {
						story: storyData,
						...(generateImages && { images: [] }), // Images already sent individually
					},
				});

			} catch (error) {
				console.error("Stream generation error:", error);
				sendUpdate({
					step: "error",
					progress: 0,
					message: `Generation failed: ${error}`,
				});
			} finally {
				controller.close();
			}
		})();

		return new Response(stream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "no-cache",
				"Connection": "keep-alive",
			},
		});

	} catch (error) {
		console.error("Error in story generation stream:", error);
		return new Response(
			JSON.stringify({ error: "Internal server error" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}