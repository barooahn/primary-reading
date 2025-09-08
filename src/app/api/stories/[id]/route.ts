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
		// Otherwise, parse the raw content field
		else if (story.content?.raw) {
			const rawContent = story.content.raw;

			// Function to clean markdown formatting
			const cleanMarkdown = (text: string) => {
				return (
					text
						// Remove markdown headers (###, ####)
						.replace(/^#{1,6}\s+/gm, "")
						// Remove bold formatting (**text**)
						.replace(/\*\*(.*?)\*\*/g, "$1")
						// Remove italic formatting (*text*)
						.replace(/\*(.*?)\*/g, "$1")
						// Remove image prompts and suggestions
						.replace(/#### Suggested Image Prompt:.*$/gm, "")
						.replace(/\*\*\[Image Prompt:.*?\]\*\*/g, "")
						.replace(/\[Image Prompt:.*?\]/g, "")
						.replace(/\*Image Prompt:.*$/gm, "")
						// Remove suggestion lines
						.replace(/.*Suggested.*:/gi, "")
						// Remove horizontal rules
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
									!trimmed.startsWith("*Image Prompt:") &&
									!trimmed.includes("Suggested Image Prompt") &&
									!trimmed.includes("Suggested Comprehension") &&
									!trimmed.includes("Multiple Choice:") &&
									!trimmed.includes("True/False:") &&
									!trimmed.includes("Short Answer:") &&
									!trimmed.includes("Sequence Type:") &&
									!trimmed.startsWith("---") &&
									!trimmed.match(/^\d+\.\s+\*\*/) &&
									!trimmed.match(/^[a-d]\)/i) &&
									!trimmed.match(/\(Correct answer:/) &&
									!trimmed.match(/^- [A-D]\)/)
								);
							});
						const content = cleanMarkdown(contentLines.join("\n"));
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
				const segRegex = /\*\*Segment\s+(\d+):\s*([^*\n]+)\*\*\s*([\s\S]*?)(?=\n\*\*Segment\s+\d+:|\n### Suggested Comprehension|\n\*\*Suggested Comprehension|$)/g;
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
									!trimmed.startsWith("*Image Prompt:") &&
									!trimmed.includes("Suggested Image Prompt") &&
									!trimmed.includes("Suggested Comprehension") &&
									!trimmed.includes("Multiple Choice:") &&
									!trimmed.includes("True/False:") &&
									!trimmed.includes("Short Answer:") &&
									!trimmed.includes("Sequence Type:") &&
									!trimmed.startsWith("---") &&
									!trimmed.match(/^\d+\.\s+\*\*/) &&
									!trimmed.match(/^[a-d]\)/i) &&
									!trimmed.match(/\(Correct answer:/) &&
									!trimmed.match(/^- [A-D]\)/)
								);
							});
						const content = cleanMarkdown(contentLines.join("\n"));
						return {
							id: idx + 1,
							segment_order: idx + 1,
							title,
							content,
							image_url: null,
						};
					});
				}
				// Fallback: try to extract content between story description and questions
				else {
				let mainContent = rawContent;

				// Remove everything from questions onward
				const questionsIndex = mainContent.indexOf(
					"### Suggested Comprehension Questions"
				);
				if (questionsIndex !== -1) {
					mainContent = mainContent.substring(0, questionsIndex);
				}

				// Remove title and description section - find first segment content
				const storyStartIndex = mainContent.indexOf("---");
				if (storyStartIndex !== -1) {
					const afterDash = mainContent.substring(
						storyStartIndex + 3
					);
					// Sign private storage paths for images (segments + cover)
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

					// Sign segment images
					segments = await Promise.all(
						segments.map(async (seg: any) => {
							const base =
								seg?.image_path || seg?.image_url;
							const thumbBase =
								seg?.thumbnail_path ||
								seg?.thumbnail_url;
							return {
								...seg,
								image_url: await signIfPrivate(base),
								thumbnail_url: await signIfPrivate(
									thumbBase
								),
							};
						})
					);

					// Sign cover image if needed (prefer path)
					const coverBase =
						(story as any)?.cover_image_path ||
						(story as any)?.cover_image_url;
					const signedCover = await signIfPrivate(coverBase);
					if (signedCover) {
						(story as any).cover_image_url = signedCover;
					}

					// Sign cover thumbnail if present
					const coverThumbBase =
						(story as any)?.cover_thumbnail_path ||
						(story as any)?.cover_thumbnail_url;
					const signedCoverThumb = await signIfPrivate(
						coverThumbBase
					);
					if (signedCoverThumb) {
						(story as any).cover_thumbnail_url =
							signedCoverThumb;
					}

					// Skip the first section which is usually metadata/description
					const nextSectionStart = afterDash.indexOf("---");
					if (nextSectionStart !== -1) {
						mainContent = afterDash.substring(
							nextSectionStart + 3
						);
					} else {
						mainContent = afterDash;
					}
				}

				// Split content into paragraphs and filter out unwanted content
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
							!trimmed.includes("Multiple Choice") &&
							!trimmed.includes("True/False") &&
							!trimmed.includes("Short Answer") &&
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
							story.title?.replace(/\*\*/g, "") || "Story",
						content: cleanedContent,
						image_url: null,
					},
				];
			}
		}
	}

		// Parse questions from raw content if no structured questions exist
		let questions = story.questions || [];

		if (questions.length === 0 && story.content?.raw) {
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

						if (questionType.includes("Multiple Choice")) {
							type = "multiple_choice";

							// Extract options: "a) Blue", "b) Red", etc.
							const optionLines = lines.filter((line) =>
								line.trim().match(/^[a-d]\)/i)
							);
							options = optionLines.map((line) =>
								line.trim().replace(/^[a-d]\)\s*/i, "")
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
						} else if (questionType.includes("True/False")) {
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
						thumbnail_url: await signIfPrivate(thumbBase),
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
			const signedCoverThumb = await signIfPrivate(coverThumbBase);
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

		return NextResponse.json({ success: true, story: processedStory });
	} catch (e) {
		console.error("Get story by id error:", e);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
