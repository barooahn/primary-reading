/**
 * Question parsing utility for extracting comprehension questions from story content
 */

interface ParsedQuestion {
	question_text: string;
	question_type: "multiple_choice" | "true_false" | "short_answer" | "drag_drop" | "sequence";
	options?: string[] | null;
	correct_answer: string | boolean;
	explanation?: string;
	points: number;
	difficulty: number;
}

/**
 * Parse questions from story content (raw generated text)
 */
export function parseQuestionsFromStoryContent(rawContent: string): ParsedQuestion[] {
	const questions: ParsedQuestion[] = [];

	console.log("=== PARSING QUESTIONS FROM STORY CONTENT ===");
	console.log("Raw content length:", rawContent.length);
	console.log("Content preview:", rawContent.substring(0, 500));

	// Try both question section formats
	let questionsSection = rawContent.match(
		/### Suggested Comprehension Questions:([\s\S]*?)(?:\n\n#{1,3}|$)/
	);

	console.log("First pattern match result:", questionsSection ? "FOUND" : "NOT FOUND");

	if (!questionsSection) {
		questionsSection = rawContent.match(
			/\*\*Suggested Comprehension Questions:\*\*([\s\S]*?)$/
		);
		console.log("Second pattern match result:", questionsSection ? "FOUND" : "NOT FOUND");
	}

	if (questionsSection) {
		const questionsText = questionsSection[1];

		// Parse individual questions from this specific format
		// Match pattern: 1. **Type:** Question text followed by options and answer
		const questionBlocks = questionsText.split(/(?=\d+\.\s+\*\*)/);

		const parsedQuestions = questionBlocks
			.filter((block) => block.trim())
			.map((block) => {
				const lines = block.trim().split("\n");

				// Extract question header: "1. **Multiple Choice:** Question text"
				const headerMatch = lines[0]?.match(
					/\d+\.\s+\*\*(.*?)\*\*\s*(.*)/
				);
				if (!headerMatch) return null;

				const questionType = headerMatch[1].trim();
				const questionText = headerMatch[2].trim();

				let type: ParsedQuestion["question_type"] = "multiple_choice";
				let options: string[] = [];
				let correctAnswer: string | boolean = "";

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
						const answerKey = answerMatch[1].trim().toLowerCase();
						const answerIndex = answerKey.charCodeAt(0) - 97; // Convert 'a' to 0, 'b' to 1, etc.
						if (answerIndex >= 0 && answerIndex < options.length) {
							correctAnswer = options[answerIndex];
						}
					}
				} else if (questionType.includes("True/False")) {
					type = "multiple_choice";
					options = ["True", "False"];

					// Extract correct answer: "(Correct answer: True)"
					const answerMatch = block.match(
						/\(Correct answer:\s*(True|False)\)/i
					);
					correctAnswer = answerMatch ? answerMatch[1] : "True";
				}

				return {
					question_text: questionText,
					question_type: type,
					options: options.length > 0 ? options : null,
					correct_answer: correctAnswer,
					explanation: `Great job! ${
						type === "multiple_choice" &&
						questionType.includes("True/False")
							? "You got the right answer."
							: "You selected the correct option."
					}`,
					points: 10, // Default points per question
					difficulty: 1, // Default difficulty level
				} as ParsedQuestion;
			})
			.filter(Boolean) as ParsedQuestion[];

		questions.push(...parsedQuestions);
	}

	console.log("=== FINAL PARSING RESULT ===");
	console.log("Total questions parsed:", questions.length);
	console.log("Questions:", questions);

	return questions;
}

/**
 * Validate that a question object has all required fields for saving to database
 */
export function validateQuestion(question: ParsedQuestion): boolean {
	return !!(
		question.question_text &&
		question.question_type &&
		question.correct_answer !== undefined &&
		typeof question.points === "number" &&
		typeof question.difficulty === "number"
	);
}

/**
 * Format questions for the save-story API endpoint
 */
export function formatQuestionsForSave(questions: ParsedQuestion[]): ParsedQuestion[] {
	return questions.filter(validateQuestion).map((q) => ({
		...q,
		points: q.points || 10,
		difficulty: q.difficulty || 1,
	}));
}