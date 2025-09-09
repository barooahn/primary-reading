// @ts-nocheck
/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@/utils/images/storage";

// GET /api/stories/[id]
export async function GET(
	_request: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { createClient } = await import("@/utils/supabase/server");
		const supabase = await createClient();

		const params = await context.params;
		const storyId = params?.id;
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

		if (error || !story) {
			console.error("Story fetch error:", error);
			return NextResponse.json(
				{ success: false, error: "Story not found" },
				{ status: 404 }
			);
		}

		// Process segments from structured data or raw content
		let segments = [];

		// If we have structured segments, use them
		if (story.story_segments && story.story_segments.length > 0) {
			segments = story.story_segments
				.slice()
				.sort(
					(
						a: { segment_order: number },
						b: { segment_order: number }
					) => (a?.segment_order ?? 0) - (b?.segment_order ?? 0)
				);
		}
		// Check for JSON content with segments (new format) or structured format
		else if (story.content?.raw || story.content?.structured?.segments) {
			console.log("Attempting to parse segments from stored content...");
			
			// Try to parse JSON content first (new format)
			if (story.content?.raw && typeof story.content.raw === 'string') {
				try {
					console.log("Attempting to parse segments from JSON content.raw...");
					const parsedContent = JSON.parse(story.content.raw);
					
					if (parsedContent.segments && Array.isArray(parsedContent.segments)) {
						console.log("Found segments in JSON content:", parsedContent.segments.length);
						segments = parsedContent.segments.map((seg: any, idx: number) => ({
							id: idx + 1,
							segment_order: idx + 1,
							title: seg.title || `Segment ${idx + 1}`,
							content: seg.content || "",
							image_url: null,
							image_prompt: seg.imagePrompt || null
						}));
					}
				} catch (error) {
					console.log("Content is not JSON, will try text parsing...");
				}
			}
			
			// If we didn't get segments from JSON, try structured format
			if (segments.length === 0 && story.content?.structured?.segments && story.content.structured.segments.length > 0) {
				console.log("Found structured segments in content:", story.content.structured.segments.length);
				segments = story.content.structured.segments.map((seg: any, idx: number) => ({
					id: idx + 1,
					segment_order: idx + 1,
					title: seg.title || `Segment ${idx + 1}`,
					content: seg.content || "",
					image_url: null,
					image_prompt: seg.imagePrompt || null
				}));
			}
			
			// If still no segments, try parsing raw content as text  
			if (segments.length === 0 && story.content?.raw) {
				console.log("No JSON/structured segments found, parsing raw text content...");
				const rawContent = story.content.raw;

			// Function to clean markdown formatting
			const cleanMarkdown = (text: string) => {
				return (
					text
						// Remove image prompts and suggestions
						.replace(/#### Suggested Image Prompt:.*$/gm, "")
						.replace(/\*\*\[Image Prompt:.*?\]\*\*/g, "")
						.replace(/\[Image Prompt:.*?\]/g, "")
						.replace(/\*Image Prompt:.*$/gm, "")
						// Remove suggestion lines
						.replace(/.*Suggested.*:/gi, "")
						// Remove horizontal rules that act as separators
						.replace(/^---+$/gm, "")
						// Remove question sections that might leak in
						.replace(
							/### Suggested Comprehension Questions:[\s\S]*$/i,
							""
						)
						.replace(
							/\*\*Suggested Comprehension Questions:\*\*[\s\S]*$/i,
							""
						)
						.replace(/\d+\.\s+\*\*.*?\*\*.*$/gm, "")
						// Clean up extra whitespace and newlines
						.replace(/\n{3,}/g, "\n\n")
						.replace(/^\s+|\s+$/gm, "")
						.trim()
				);
			};

			// Try to split by different segment patterns
			let segmentParts = rawContent.split(/#### Segment \d+:/);

			// If that doesn't work, try other patterns
			if (segmentParts.length === 1) {
				segmentParts = rawContent.split(/### \*\*Segment \d+:/);
			}

			// Try **Segment X:** pattern
			if (segmentParts.length === 1) {
				segmentParts = rawContent.split(/\*\*Segment \d+:\*\*/);
			}

			// If we have segment parts, process them
			if (segmentParts.length > 1) {
				segments = segmentParts
					.slice(1)
					.map((part: string, idx: number) => {
						const lines = part.trim().split("\n");
						const title = cleanMarkdown(
							lines[0]?.replace(/\*\*$/, "") || ""
						);
						// Get content, excluding image prompts and other metadata
						const contentLines = lines
							.slice(1)
							.filter((line) => {
								const trimmed = line.trim();
								return (
									trimmed &&
									!trimmed.startsWith("####") &&
									!trimmed.startsWith("###") &&
									!trimmed.startsWith("**[Image") &&
									!trimmed.startsWith("[Image") &&
									!trimmed.startsWith(
										"*Image Prompt:"
									) &&
									!trimmed.includes(
										"Suggested Image Prompt"
									) &&
									!trimmed.includes(
										"Suggested Comprehension"
									) &&
									!trimmed.includes(
										"Multiple Choice:"
									) &&
									!trimmed.includes("True/False:") &&
									!trimmed.includes(
										"Short Answer:"
									) &&
									!trimmed.includes(
										"Sequence Type:"
									) &&
									!trimmed.startsWith("---") &&
									!trimmed.match(/^\d+\.\s+\*\*/) &&
									!trimmed.match(/^[a-d]\)/i) &&
									!trimmed.match(
										/\(Correct answer:/
									) &&
									!trimmed.match(/^- [A-D]\)/)
								);
							});
						const content = cleanMarkdown(
							contentLines.join("\n")
						);
						return {
							id: idx + 1,
							segment_order: idx + 1,
							title: title,
							content: content,
							image_url: null,
						};
					});
			}
			// If not, try to parse "**Segment X: Title**" blocks explicitly
			else {
				const segRegex =
					/\*\*Segment\s+(\d+):\s*([^*\n]+)\*\*\s*([\s\S]*?)(?=\n\*\*Segment\s+\d+:|\n### Suggested Comprehension|\n\*\*Suggested Comprehension|$)/g;
				const matches = Array.from(rawContent.matchAll(segRegex));
				if (matches.length > 0) {
					segments = matches.map((m, idx) => {
						const title = cleanMarkdown(m[2] || "");
						// Clean content area and strip prompts/questions
						const block = m[3] || "";
						const contentLines = block
							.split("\n")
							.filter((line) => {
								const trimmed = line.trim();
								return (
									trimmed &&
									!trimmed.startsWith("####") &&
									!trimmed.startsWith("###") &&
									!trimmed.startsWith("**[Image") &&
									!trimmed.startsWith("[Image") &&
									!trimmed.startsWith(
										"*Image Prompt:"
									) &&
									!trimmed.includes(
										"Suggested Image Prompt"
									) &&
									!trimmed.includes(
										"Suggested Comprehension"
									) &&
									!trimmed.includes(
										"Multiple Choice:"
									) &&
									!trimmed.includes("True/False:") &&
									!trimmed.includes(
										"Short Answer:"
									) &&
									!trimmed.includes(
										"Sequence Type:"
									) &&
									!trimmed.startsWith("---") &&
									!trimmed.match(/^\d+\.\s+\*\*/) &&
									!trimmed.match(/^[a-d]\)/i) &&
									!trimmed.match(
										/\(Correct answer:/
									) &&
									!trimmed.match(/^- [A-D]\)/)
								);
							});
						const content = cleanMarkdown(
							contentLines.join("\n")
						);
						return {
							id: idx + 1,
							segment_order: idx + 1,
							title,
							content,
							image_url: null,
						};
					});
				}

				// Fallbacks when explicit "Segment X" patterns are not found
				else {
					// 1) Try splitting by general markdown headings (##, ###, ####) as sections
					const headingMatches = Array.from(
						rawContent.matchAll(/^#{2,4}\s+(.+)$/gm)
					).filter(
						(m) =>
							!/Suggested Comprehension/i.test(m[1] || "")
					);
					if (headingMatches.length > 0) {
						segments = headingMatches.map((m, idx) => {
							const title = cleanMarkdown(m[1] || "");
							const start =
								(m.index ?? 0) + (m[0]?.length ?? 0);
							const end =
								headingMatches[idx + 1]?.index ??
								rawContent.length;
							const block = rawContent.slice(start, end);
							const contentLines = block
								.split("\n")
								.filter((line) => {
									const trimmed = line.trim();
									return (
										trimmed &&
										!trimmed.startsWith(
											"#### Suggested"
										) &&
										!trimmed.includes(
											"Suggested Comprehension"
										) &&
										!trimmed.includes(
											"Multiple Choice"
										) &&
										!trimmed.includes(
											"True/False"
										) &&
										!trimmed.includes(
											"Short Answer"
										) &&
										!trimmed.startsWith(
											"**[Image"
										) &&
										!trimmed.startsWith(
											"[Image"
										) &&
										!trimmed.startsWith(
											"*Image Prompt:"
										) &&
										!trimmed.startsWith("---") &&
										!trimmed.match(
											/^\d+\.\s+\*\*/
										)
									);
								});
							const content = cleanMarkdown(
								contentLines.join("\n")
							);
							return {
								id: idx + 1,
								segment_order: idx + 1,
								title,
								content,
								image_url: null,
							};
						});
					} else {
						// 2) Last resort: single segment from main content between metadata and questions
						let mainContent = rawContent;
						const questionsIndex = mainContent.indexOf(
							"### Suggested Comprehension Questions"
						);
						if (questionsIndex !== -1) {
							mainContent = mainContent.substring(
								0,
								questionsIndex
							);
						}
						const storyStartIndex =
							mainContent.indexOf("---");
						if (storyStartIndex !== -1) {
							const afterDash = mainContent.substring(
								storyStartIndex + 3
							);
							const nextSectionStart =
								afterDash.indexOf("---");
							mainContent =
								nextSectionStart !== -1
									? afterDash.substring(
											nextSectionStart + 3
									  )
									: afterDash;
						}
						const contentLines = mainContent
							.split("\n")
							.filter((line) => {
								const trimmed = line.trim();
								return (
									trimmed &&
									!trimmed.startsWith("####") &&
									!trimmed.startsWith("###") &&
									!trimmed.startsWith("**[") &&
									!trimmed.startsWith("[Image") &&
									!trimmed.includes("Suggested") &&
									!trimmed.includes(
										"Multiple Choice"
									) &&
									!trimmed.includes("True/False") &&
									!trimmed.includes(
										"Short Answer"
									) &&
									!trimmed.startsWith("---") &&
									!trimmed.match(/^\d+\.\s+\*\*/)
								);
							});
						const cleanedContent = cleanMarkdown(
							contentLines.join("\n")
						);
						segments = [
							{
								id: 1,
								segment_order: 1,
								title:
									story.title?.replace(
										/\*\*/g,
										""
									) || "Story",
								content: cleanedContent,
								image_url: null,
							},
						];
					}
				}
			}
		}

		// Parse questions from structured content or raw content if no structured questions exist
			let questions = story.questions || [];

			console.log("=== QUESTIONS DEBUG IN API ===");
			console.log("Initial questions from DB:", questions);
			console.log("Questions count from DB:", questions.length);
			
			// First check if we have structured content with questions (new JSON format)
			if (questions.length === 0) {
				console.log("Attempting to parse from stored content...");
				
				// Try to parse JSON content first (new format)
				if (story.content?.raw && typeof story.content.raw === 'string') {
					try {
						console.log("Attempting to parse JSON from content.raw...");
						const parsedContent = JSON.parse(story.content.raw);
						
						if (parsedContent.questions && Array.isArray(parsedContent.questions)) {
							console.log("Found questions in JSON content:", parsedContent.questions.length);
							questions = parsedContent.questions.map((q: any, idx: number) => ({
								id: idx + 1,
								question_text: q.question_text || q.question || "",
								question_type: q.question_type || q.type || "multiple_choice", 
								options: q.options || [],
								correct_answer: q.correct_answer || q.answer || "",
								explanation: q.explanation || "Great job!"
							}));
						}
					} catch (error) {
						console.log("Content is not JSON, checking structured format...");
						
						// Fallback to old structured format
						if (story.content?.structured?.questions) {
							console.log("Found structured questions in content:", story.content.structured.questions.length);
							questions = story.content.structured.questions.map((q: any, idx: number) => ({
								id: idx + 1,
								question_text: q.question_text || q.question || "",
								question_type: q.question_type || q.type || "multiple_choice", 
								options: q.options || [],
								correct_answer: q.correct_answer || q.answer || "",
								explanation: q.explanation || "Great job!"
							}));
						}
					}
				} else if (story.content?.structured?.questions) {
					console.log("Found structured questions in content:", story.content.structured.questions.length);
					questions = story.content.structured.questions.map((q: any, idx: number) => ({
						id: idx + 1,
						question_text: q.question_text || q.question || "",
						question_type: q.question_type || q.type || "multiple_choice", 
						options: q.options || [],
						correct_answer: q.correct_answer || q.answer || "",
						explanation: q.explanation || "Great job!"
					}));
				}
			}

			if (questions.length === 0 && story.content?.raw) {
				console.log("No structured questions found, attempting to parse from raw content...");
				const rawContent = story.content.raw;
				// Try both question section formats
				let questionsSection = rawContent.match(
					/### Suggested Comprehension Questions:([\s\S]*?)(?:\n\n#{1,3}|$)/
				);

				if (!questionsSection) {
					questionsSection = rawContent.match(
						/\*\*Suggested Comprehension Questions:\*\*([\s\S]*?)$/
					);
				}

				if (questionsSection) {
					const questionsText = questionsSection[1];

					// Parse individual questions from this specific format
					// Match pattern: 1. **Type:** Question text followed by options and answer
					const questionBlocks =
						questionsText.split(/(?=\d+\.\s+\*\*)/);

					questions = questionBlocks
						.filter((block) => block.trim())
						.map((block, idx) => {
							const lines = block.trim().split("\n");

							// Extract question header: "1. **Multiple Choice:** Question text"
							const headerMatch = lines[0]?.match(
								/\d+\.\s+\*\*(.*?)\*\*\s*(.*)/
							);
							if (!headerMatch) return null;

							const questionType = headerMatch[1].trim();
							const questionText = headerMatch[2].trim();

							let type = "multiple_choice";
							let options: string[] = [];
							let correctAnswer = "";

							if (
								questionType.includes("Multiple Choice")
							) {
								type = "multiple_choice";

								// Extract options: "a) Blue", "b) Red", etc.
								const optionLines = lines.filter(
									(line) =>
										line.trim().match(/^[a-d]\)/i)
								);
								options = optionLines.map((line) =>
									line
										.trim()
										.replace(/^[a-d]\)\s*/i, "")
								);

								// Extract correct answer: "(Correct answer: b)"
								const answerMatch = block.match(
									/\(Correct answer:\s*([^)]+)\)/i
								);
								if (answerMatch) {
									const answerKey = answerMatch[1]
										.trim()
										.toLowerCase();
									const answerIndex =
										answerKey.charCodeAt(0) - 97; // Convert 'a' to 0, 'b' to 1, etc.
									if (
										answerIndex >= 0 &&
										answerIndex < options.length
									) {
										correctAnswer =
											options[answerIndex];
									}
								}
							} else if (
								questionType.includes("True/False")
							) {
								type = "multiple_choice";
								options = ["True", "False"];

								// Extract correct answer: "(Correct answer: True)"
								const answerMatch = block.match(
									/\(Correct answer:\s*(True|False)\)/i
								);
								correctAnswer = answerMatch
									? answerMatch[1]
									: "True";
							}

							return {
								id: idx + 1,
								question_text: questionText,
								question_type: type,
								options: options,
								correct_answer: correctAnswer,
								explanation: `Great job! ${
									type === "multiple_choice" &&
									questionType.includes("True/False")
										? "You got the right answer."
										: "You selected the correct option."
								}`,
							};
						})
						.filter(Boolean);
				}
			}

			// Ensure image URLs are signed when referencing private storage paths
			const finalizeSignedUrls = async () => {
				const signIfPrivate = async (
					maybePath: string | null | undefined
				) => {
					if (!maybePath) return null;
					if (
						maybePath.startsWith("http://") ||
						maybePath.startsWith("https://")
					)
						return maybePath;
					const signed = await getSignedUrl(maybePath);
					return signed || null;
				};

				segments = await Promise.all(
					segments.map(async (seg: any) => {
						const base = seg?.image_path || seg?.image_url;
						const thumbBase =
							seg?.thumbnail_path || seg?.thumbnail_url;
						return {
							...seg,
							image_url: await signIfPrivate(base),
							thumbnail_url: await signIfPrivate(
								thumbBase
							),
						};
					})
				);

				const coverBase =
					(story as any)?.cover_image_path ||
					(story as any)?.cover_image_url;
				const signedCover = await signIfPrivate(coverBase);
				if (signedCover) {
					(story as any).cover_image_url = signedCover;
				}

				const coverThumbBase =
					(story as any)?.cover_thumbnail_path ||
					(story as any)?.cover_thumbnail_url;
				const signedCoverThumb = await signIfPrivate(
					coverThumbBase
				);
				if (signedCoverThumb) {
					(story as any).cover_thumbnail_url = signedCoverThumb;
				}
			};

			await finalizeSignedUrls();

			// Process and normalize the story data for the frontend
			const processedStory = {
				...story,
				average_rating: 0,
				total_reads: 0,
				author_name: "Anonymous",
				is_user_created: !!story.created_by,
				segments: segments,
				questions: questions,
				reviews: [],
			} as const;

			console.log("=== FINAL API RESPONSE ===");
			console.log("Final questions being sent to frontend:", processedStory.questions);
			console.log("Questions count in response:", processedStory.questions?.length || 0);

			return NextResponse.json({
				success: true,
				story: processedStory,
			});
		}
	} catch (e) {
		console.error("Get story by id error:", e);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
