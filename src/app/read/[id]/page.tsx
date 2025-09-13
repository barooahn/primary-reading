"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PrintButton } from "@/components/ui/print-button";
import {
	BookOpen,
	CheckCircle,
	Star,
	Trophy,
	ArrowLeft,
	ArrowRight,
	Heart,
	Lightbulb,
	Target,
	Clock,
	Award,
	Maximize,
	Minimize,
	Info,
	X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DeleteStoryButton } from "@/components/stories/delete-story-button";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Mock story data - in real app this would come from Supabase
const defaultMockStory = {
	id: "1",
	title: "The Mystery of the Coding Cat",
	genre: "Mystery",
	readingLevel: "intermediate",
	estimatedTime: 8,
	content: [
		{
			id: 1,
			text: `Once upon a time, in a small town called Bitburg, there lived a very unusual cat named Pixel. Unlike other cats who spent their days napping and chasing mice, Pixel had a secret passion – computer programming!`,
			image: null,
			isTitle: true,
		},
		{
			id: 2,
			text: `Every night, when the Thompson family was asleep, Pixel would sneak downstairs to their home office. With her tiny paws, she would tap away at the keyboard, writing code that could solve problems no human programmer had ever tackled.`,
			image: null,
		},
		{
			id: 3,
			text: `One morning, young Emma Thompson woke up to find something incredible on the computer screen. Her math homework had been completed overnight – and not just completed, but transformed into a fun, interactive game!`,
			image: null,
		},
		{
			id: 4,
			text: `"Mom, Dad!" Emma called excitedly. "Someone turned my boring math problems into an amazing puzzle adventure!" But who could have done such a thing? Emma was determined to solve this mystery.`,
			image: null,
		},
		{
			id: 5,
			text: `That night, Emma hid behind the couch in the living room. As the clock struck midnight, she heard the soft tap-tap-tapping of keys. Peeking around the corner, she gasped at what she saw.`,
			image: null,
		},
		{
			id: 6,
			text: `There was Pixel, sitting upright at the computer, her green eyes focused intently on the glowing screen. Lines of colorful code scrolled by as the clever cat programmed with incredible speed and precision.`,
			image: null,
		},
		{
			id: 7,
			text: `"Pixel!" Emma whispered in amazement. "You're a programmer!" The cat turned around, expecting to be in trouble. But instead, Emma's face lit up with the biggest smile.`,
			image: null,
		},
		{
			id: 8,
			text: `"This is the coolest thing ever! Can you teach me how to code too?" And that's how Emma and Pixel became the best programming team in Bitburg, creating games and apps that helped kids all over town learn and have fun at the same time.`,
			image: null,
			isEnding: true,
		},
	],
	questions: [
		{
			id: 1,
			question: "What was Pixel's secret talent?",
			type: "multiple_choice",
			options: [
				"Singing",
				"Computer Programming",
				"Painting",
				"Dancing",
			],
			correctAnswer: "Computer Programming",
			explanation:
				"Great job! Pixel was indeed a computer programmer who coded at night while the family slept.",
		},
		{
			id: 2,
			question: "How did Emma discover Pixel's secret?",
			type: "multiple_choice",
			options: [
				"She followed the cat",
				"She hid and watched",
				"She found the computer on",
				"She heard typing sounds",
			],
			correctAnswer: "She hid and watched",
			explanation:
				"Excellent! Emma hid behind the couch and watched Pixel programming at midnight.",
		},
		{
			id: 3,
			question: "What did Emma and Pixel decide to do together?",
			type: "short_answer",
			correctAnswer: "Create games and apps to help kids learn",
			explanation:
				"Perfect! Emma and Pixel became a programming team, making educational games and apps for other children.",
		},
		{
			id: 4,
			question: "Draw or describe your favorite part of the story:",
			type: "creative",
			correctAnswer: "",
			explanation:
				"Amazing creativity! Every reader might have a different favorite part, and that's what makes reading special.",
		},
	],
};

interface ReadingProgress {
	currentSegment: number;
	totalSegments: number;
	timeSpent: number;
	questionsAnswered: number;
	correctAnswers: number;
}

export default function ReadStoryPage() {
	// Load actual story by ID and shadow mock data
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [story, setStory] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);

	function mapApiStory(api: any) {
		// Server already processes segments, so just map them to the expected format
		console.log("=== MAPPING API STORY ===");
		console.log("API segments raw:", api?.segments);
		const segs = Array.isArray(api?.segments) ? api.segments : [];
		const segments = segs.map((seg: any, idx: number, arr: any[]) => {
			const mappedSeg = {
				id: seg?.segment_order ?? seg?.id ?? idx + 1,
				text: seg?.content ?? seg?.text ?? "",
				image: seg?.image_url ?? seg?.image ?? null,
				imagePath: seg?.image_path ?? null,
				thumbnailPath: seg?.thumbnail_path ?? null,
				imagePrompt:
					seg?.image_prompt ?? seg?.imagePrompt ?? undefined,
				thumbnailUrl:
					seg?.thumbnail_url ?? seg?.thumbnailUrl ?? null,
				isTitle: idx === 0,
				isEnding: idx === arr.length - 1,
			};
			console.log(`=== MAPPING SEGMENT ${idx} ===`);
			console.log("Raw segment data:", seg);
			console.log("Mapped segment data:", mappedSeg);
			console.log(
				`Image sources - image_url: ${seg?.image_url}, image: ${seg?.image}`
			);
			console.log(`Final image URL: ${mappedSeg.image}`);
			return mappedSeg;
		});

		// Handle questions
		const qs = Array.isArray(api?.questions) ? api.questions : [];
		const questions = (qs || []).map((q: any, idx: number) => ({
			id: idx + 1,
			question: q?.question_text ?? q?.question ?? "",
			type: q?.question_type ?? q?.type ?? "multiple_choice",
			options: Array.isArray(q?.options)
				? q.options
				: q?.options
				? Object.values(q.options as Record<string, string>)
				: undefined,
			correctAnswer:
				typeof q?.correct_answer === "boolean"
					? q.correct_answer
						? "True"
						: "False"
					: q?.correct_answer ?? q?.answer,
			explanation: q?.explanation ?? "",
		}));

		return {
			id: String(api?.id ?? ""),
			title: (api?.title ?? "Untitled").replace(/\*\*/g, ""),
			genre: api?.genre ?? "",
			readingLevel: api?.reading_level ?? "beginner",
			estimatedTime: api?.estimated_reading_time ?? 10,
			content: segments,
			questions,
		};
	}

	useEffect(() => {
		let active = true;
		async function load() {
			try {
				if (!params?.id) {
					setLoading(false);
					return;
				}
				setLoading(true);
				const res = await fetch(`/api/stories/${params.id}`, {
					method: "GET",
					credentials: "include",
				});
				const data = await res.json();
				if (!active) return;
				if (data?.success && data?.story) {
					console.log("=== READ PAGE API RESPONSE ===");
					console.log(
						"Raw questions from API:",
						data.story.questions
					);
					console.log(
						"Questions count:",
						data.story.questions?.length || 0
					);
					const mappedStory = mapApiStory(data.story);
					console.log(
						"Mapped questions in read page:",
						mappedStory.questions
					);
					console.log(
						"Mapped questions count:",
						mappedStory.questions?.length || 0
					);
					setStory(mappedStory);
				}
			} catch (e) {
				console.error("Failed to load story:", e);
			} finally {
				if (active) setLoading(false);
			}
		}
		load();
		return () => {
			active = false;
		};
	}, [params?.id]);

	// Use fetched story when available, else fallback
	const mockStory = story ?? defaultMockStory;

	const [currentSegment, setCurrentSegment] = useState(0);
	const [, setIsReading] = useState(true);
	const [showQuestions, setShowQuestions] = useState(false);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>(
		{}
	);
	const [showResults, setShowResults] = useState(false);
	// Get fullscreen state from URL parameters
	const [isFullscreenMode, setIsFullscreenMode] = useState(() => {
		return searchParams.get("fullscreen") === "true";
	});
	
	// Mobile info toggle state
	const [showMobileInfo, setShowMobileInfo] = useState(false);
	
	// Reading tip modal state
	const [showReadingTip, setShowReadingTip] = useState(false);

	// Removed on-demand image generation state - images are now pre-generated during story creation

	const [isPlaying] = useState(false);
	const [readingStartTime] = useState(Date.now());
	const [readingProgress, setReadingProgress] = useState<ReadingProgress>({
		currentSegment: 0,
		totalSegments: mockStory?.content?.length ?? 0,
		timeSpent: 0,
		questionsAnswered: 0,
		correctAnswers: 0,
	});

	// Check localStorage for reading tip preference
	useEffect(() => {
		const dontShowTip = localStorage.getItem('hideReadingTip') === 'true';
		if (!dontShowTip && currentSegment === 0) {
			// Show tip after a brief delay when story loads
			const timer = setTimeout(() => {
				setShowReadingTip(true);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [currentSegment]);

	// Auto-advance reading with reading speed calculation

	useEffect(() => {
		if (
			isPlaying &&
			(mockStory?.content?.length ?? 0) > 0 &&
			currentSegment < (mockStory?.content?.length ?? 0) - 1
		) {
			const wordsInSegment = (
				mockStory?.content?.[currentSegment]?.text ?? ""
			).split(" ").length;
			const readingSpeed = 150; // words per minute for intermediate level
			const timeToRead = (wordsInSegment / readingSpeed) * 60000; // convert to milliseconds

			const timer = setTimeout(() => {
				setCurrentSegment((prev) => prev + 1);
			}, Math.max(3000, timeToRead)); // minimum 3 seconds per segment

			return () => clearTimeout(timer);
		}
	}, [isPlaying, currentSegment, mockStory?.content]);

	const handlePrevious = () => {
		if (currentSegment > 0) {
			setCurrentSegment(currentSegment - 1);
		}
	};

	const handleNext = () => {
		const contentLen = mockStory?.content?.length ?? 0;
		if (currentSegment < contentLen - 1) {
			setCurrentSegment(currentSegment + 1);
		} else if (!showQuestions) {
			setIsReading(false);
			const qLen = mockStory?.questions?.length ?? 0;
			console.log("=== QUESTIONS BUTTON DEBUG ===");
			console.log("Questions array:", mockStory?.questions);
			console.log("Questions length:", qLen);
			console.log("Full story object:", mockStory);
			if (qLen === 0) {
				console.log("No questions found - showing results page");
				calculateResults();
				setShowResults(true);
			} else {
				console.log("Questions found - showing questions page");
				setShowQuestions(true);
			}
		}
	};

	const handleCloseTip = () => {
		setShowReadingTip(false);
	};

	const handleDontShowAgain = () => {
		localStorage.setItem('hideReadingTip', 'true');
		setShowReadingTip(false);
	};

	const handleAnswerQuestion = (answer: string) => {
		setUserAnswers({ ...userAnswers, [currentQuestion]: answer });

		setTimeout(() => {
			if (currentQuestion < (mockStory?.questions?.length ?? 0) - 1) {
				setCurrentQuestion(currentQuestion + 1);
			} else {
				calculateResults();
			}
		}, 1500);
	};

	const calculateResults = () => {
		const correctCount = (mockStory?.questions ?? []).reduce(
			(count, question, index) => {
				const userAnswer = userAnswers[index];
				const isCorrect = userAnswer === question.correctAnswer;
				return isCorrect ? count + 1 : count;
			},
			0
		);

		setReadingProgress((prev) => ({
			...prev,
			questionsAnswered: mockStory?.questions?.length ?? 0,
			correctAnswers: correctCount,
			timeSpent: Math.floor(
				(Date.now() - readingStartTime) / 1000 / 60
			), // minutes
		}));

		setShowResults(true);
	};

	const getScoreMessage = () => {
		const totalQ = mockStory?.questions?.length ?? 0;
		const denominator = totalQ > 0 ? totalQ : 1;
		const percentage =
			(readingProgress.correctAnswers / denominator) * 100;
		if (percentage >= 90)
			return {
				message: "Outstanding Reader! 🌟",
				color: "text-success",
				icon: Trophy,
			};
		if (percentage >= 75)
			return {
				message: "Great Job! 🎉",
				color: "text-primary",
				icon: Award,
			};
		if (percentage >= 50)
			return {
				message: "Good Work! 👍",
				color: "text-secondary",
				icon: Star,
			};
		return {
			message: "Keep Learning! 📚",
			color: "text-muted",
			icon: Heart,
		};
	};

	// Show loading state while fetching story
	if (loading) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-4xl'>
				<Card>
					<CardContent className='p-8'>
						<div className='min-h-[300px] flex items-center justify-center'>
							<div className='text-center'>
								<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
								<p className='text-muted'>
									Loading story...
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (showResults) {
		const scoreInfo = getScoreMessage();
		return (
			<>
				<div className='container mx-auto px-4 py-8 max-w-4xl'>
					<Card className='text-center'>
						<CardHeader>
							<div className='mx-auto w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-4'>
								<scoreInfo.icon
									className={`h-10 w-10 ${scoreInfo.color}`}
								/>
							</div>
							<CardTitle className='text-2xl'>
								{scoreInfo.message}
							</CardTitle>
							<CardDescription>
								You completed &quot;{mockStory.title}
								&quot;
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='grid md:grid-cols-3 gap-6'>
								<div className='bg-primary/10 p-4 rounded-lg'>
									<div className='text-2xl font-bold text-primary'>
										{
											readingProgress.correctAnswers
										}
										/
										{mockStory?.questions
											?.length ?? 0}
									</div>
									<p className='text-sm text-muted'>
										Questions Correct
									</p>
								</div>
								<div className='bg-secondary/10 p-4 rounded-lg'>
									<div className='text-2xl font-bold text-orange-600'>
										{readingProgress.timeSpent ||
											mockStory.estimatedTime}
									</div>
									<p className='text-sm text-muted'>
										Minutes Reading
									</p>
								</div>
								<div className='bg-success/10 p-4 rounded-lg'>
									<div className='text-2xl font-bold text-success'>
										+50
									</div>
									<p className='text-sm text-muted'>
										Experience Points
									</p>
								</div>
							</div>

							<div className='space-y-3'>
								<h3 className='font-semibold'>
									New Achievements Unlocked!
								</h3>
								<div className='flex justify-center space-x-4'>
									<div className='bg-primary/10 p-3 rounded-lg text-center'>
										<div className='text-2xl mb-1'>
											📖
										</div>
										<p className='text-xs font-medium'>
											Story Reader
										</p>
									</div>
									<div className='bg-success/10 p-3 rounded-lg text-center'>
										<div className='text-2xl mb-1'>
											🧠
										</div>
										<p className='text-xs font-medium'>
											Question Master
										</p>
									</div>
									<div className='bg-secondary/10 p-3 rounded-lg text-center'>
										<div className='text-2xl mb-1'>
											⭐
										</div>
										<p className='text-xs font-medium'>
											Mystery Solver
										</p>
									</div>
								</div>
							</div>

							<div className='flex space-x-4'>
								<PrintButton
									story={{
										id: mockStory.id,
										title: mockStory.title,
										content: mockStory.content
											.map(
												(segment) =>
													segment.text
											)
											.join("\n\n"),
										grade_level: 3,
										estimated_reading_time:
											mockStory.estimatedTime,
									}}
									variant='outline'
									size='md'
									className='flex-1'
								/>
								<Button
									variant='outline'
									className='flex-1'
									asChild
								>
									<Link href='/dashboard'>
										<ArrowLeft className='h-4 w-4 mr-2' />
										Back to Dashboard
									</Link>
								</Button>
								<Button className='flex-1' asChild>
									<Link href='/stories'>
										<BookOpen className='h-4 w-4 mr-2' />
										Read Another Story
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</>
		);
	}

	if (showQuestions) {
		const question = mockStory?.questions?.[currentQuestion];
		const userAnswer = userAnswers[currentQuestion];
		const isAnswered = userAnswer !== undefined;

		const qTotal = mockStory?.questions?.length ?? 0;
		const qProgress =
			qTotal > 0
				? (Math.min(currentQuestion + 1, qTotal) / qTotal) * 100
				: 0;

		return (
			<>
				<div className='container mx-auto px-4 py-8 max-w-4xl'>
					<div className='mb-6'>
						<div className='flex items-center justify-between mb-4'>
							<h1 className='text-2xl font-bold'>
								Comprehension Questions
							</h1>
							<div className='text-sm text-muted'>
								Question {currentQuestion + 1} of{" "}
								{mockStory?.questions?.length ?? 0}
							</div>
						</div>
						<div className='w-full bg-muted/20 rounded-full h-2'>
							<div
								className='bg-primary h-2 rounded-full transition-all duration-500'
								style={{
									width: `${qProgress.toFixed(0)}%`,
								}}
							/>
						</div>
					</div>

					<Card>
						<CardHeader>
							<CardTitle className='flex items-center space-x-2'>
								<Lightbulb className='h-5 w-5 text-secondary' />
								<span>
									Question {currentQuestion + 1}
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-6'>
							<h2 className='text-lg font-medium leading-relaxed'>
								{question?.question ?? ""}
							</h2>

							{question?.type === "multiple_choice" && (
								<div className='space-y-3'>
									{question.options?.map(
										(option, index) => (
											<button
												key={index}
												onClick={() =>
													handleAnswerQuestion(
														option
													)
												}
												disabled={
													isAnswered
												}
												className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
													isAnswered
														? option ===
														  question?.correctAnswer
															? "border-success bg-success/10 text-success"
															: userAnswer ===
															  option
															? "border-error bg-error/10 text-error"
															: "border-muted bg-muted/5 text-muted"
														: "border-border hover:border-primary hover:bg-primary/5"
												}`}
											>
												<div className='flex items-center space-x-3'>
													<div
														className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
															isAnswered &&
															option ===
																question.correctAnswer
																? "border-success bg-success text-white"
																: isAnswered &&
																  userAnswer ===
																		option
																? "border-error bg-error text-white"
																: "border-muted"
														}`}
													>
														{String.fromCharCode(
															65 +
																index
														)}
													</div>
													<span>
														{option}
													</span>
													{isAnswered &&
														option ===
															question?.correctAnswer && (
															<CheckCircle className='h-5 w-5 text-success ml-auto' />
														)}
												</div>
											</button>
										)
									)}
								</div>
							)}

							{isAnswered && (
								<div className='mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20'>
									<div className='flex items-start space-x-2'>
										<Lightbulb className='h-5 w-5 text-primary mt-0.5 flex-shrink-0' />
										<div>
											<h4 className='font-medium text-primary mb-1'>
												Explanation:
											</h4>
											<p className='text-sm leading-relaxed'>
												{question?.explanation ??
													""}
											</p>
										</div>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</>
		);
	}

	// Main reading interface
	const currentContent = mockStory?.content?.[currentSegment];

	// Debug logging for current content and images
	console.log("=== READING PAGE DEBUG ===");
	console.log("Current segment:", currentSegment);
	console.log("Current content:", currentContent);
	console.log("All story content:", mockStory?.content);
	console.log("Story has segments:", mockStory?.content?.length || 0);
	const totalSegments = mockStory?.content?.length ?? 0;
	const progress =
		totalSegments > 0
			? (Math.min(currentSegment + 1, totalSegments) / totalSegments) *
			  100
			: 0;

	const displayPage = totalSegments > 0 ? currentSegment + 1 : 0;

	// Image generation is now handled during story creation for seamless reading experience

	// Use pre-generated story images with smart fallbacks for seamless reading experience
	const getBackgroundImage = (segment: any, index: number) => {
		// First priority: use the segment's own pre-generated image URL
		if (
			segment?.image &&
			segment.image !== null &&
			segment.image !== ""
		) {
			return segment.image;
		}

		// Second priority: if we have storage paths but no URLs, convert them
		if (
			segment?.imagePath ||
			segment?.thumbnailPath ||
			segment?.image_path ||
			segment?.thumbnail_path
		) {
			const storagePath =
				segment.thumbnailPath ||
				segment.imagePath ||
				segment.thumbnail_path ||
				segment.image_path;
			return `/api/images/${encodeURIComponent(storagePath)}`;
		}

		// Third priority: look for images from other segments in the story (pre-generated)
		const allSegments = mockStory?.content || [];
		const preGeneratedImages = allSegments
			.filter(
				(seg: any) =>
					seg?.image && seg.image !== null && seg.image !== ""
			)
			.map((seg: any) => seg.image);

		if (preGeneratedImages.length > 0) {
			const selectedImage =
				preGeneratedImages[index % preGeneratedImages.length];
			return selectedImage;
		}

		// Fourth priority: choose themed images based on image prompt content
		const imagePrompt = segment?.imagePrompt?.toLowerCase() || "";
		const imagePromptAlt = segment?.image_prompt?.toLowerCase() || "";
		const finalPrompt = imagePrompt || imagePromptAlt;

		// Match prompt keywords to appropriate themed background images
		if (
			finalPrompt.includes("kitchen") ||
			finalPrompt.includes("house") ||
			finalPrompt.includes("home")
		) {
			return "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"; // Cozy kitchen
		}
		if (
			finalPrompt.includes("backyard") ||
			finalPrompt.includes("garden") ||
			finalPrompt.includes("outdoor")
		) {
			return "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"; // Beautiful backyard
		}
		if (
			finalPrompt.includes("tree") ||
			finalPrompt.includes("nest") ||
			finalPrompt.includes("squirrel")
		) {
			return "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"; // Forest with trees
		}
		if (
			finalPrompt.includes("party") ||
			finalPrompt.includes("celebration") ||
			finalPrompt.includes("friends")
		) {
			return "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"; // Party/celebration
		}
		if (
			finalPrompt.includes("morning") ||
			finalPrompt.includes("sunny") ||
			finalPrompt.includes("bright")
		) {
			return "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2040&q=80"; // Sunny morning
		}
		if (
			finalPrompt.includes("mystery") ||
			finalPrompt.includes("detective") ||
			finalPrompt.includes("clue") ||
			finalPrompt.includes("cat") ||
			finalPrompt.includes("coding")
		) {
			return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"; // Mysterious path
		}
		if (
			finalPrompt.includes("birthday") ||
			finalPrompt.includes("cake")
		) {
			return "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"; // Birthday/celebration
		}

		// Final fallback: cycle through general story-appropriate images
		const fallbackImages = [
			"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80", // Library/books
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80", // Forest path
			"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80", // Mountain landscape
			"https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80", // Meadow
		];

		const selectedFallback =
			fallbackImages[index % fallbackImages.length];
		return selectedFallback;
	};

	return (
		<>
			{/* Reading interface with conditional fullscreen coverage */}
			<div
				className={`netflix-reading-container ${
					isFullscreenMode ? "fullscreen-mode" : ""
				} ${
					isFullscreenMode
						? "fixed top-0 left-0 right-0 bottom-0 z-[99999] min-h-screen"
						: "relative h-[calc(100vh-70px)] max-h-[calc(100vh-70px)]"
				} flex flex-col overflow-hidden`}
				style={{
					backgroundColor: "black",
					backgroundImage: `url(${getBackgroundImage(
						currentContent,
						currentSegment
					)})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
				}}
			>
				{/* Background overlay for text readability */}
				<div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 pointer-events-none' />

				{/* Story Header - Relative positioning */}
<div className={`relative z-50 bg-gradient-to-b from-black/95 via-black/70 to-transparent ${
					isFullscreenMode ? 'p-3 md:p-4' : 'px-3 md:px-8 py-3 md:py-4'
				}`}>
					{/* Mobile Layout */}
					<div className='md:hidden'>
						{/* Title - Full Width */}
						<div className='mb-3'>
							<h1 className='text-xl font-bold text-white'>
								{mockStory.title}
							</h1>
						</div>
						
						{/* Action Buttons Row */}
						<div className='flex items-center justify-between mb-2'>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => setShowMobileInfo(!showMobileInfo)}
								className='text-white hover:bg-white/30 h-10 w-10'
								title='Story Information'
							>
								<Info className='h-5 w-5' />
							</Button>
							
							<div className='flex items-center space-x-3'>
								{/* Fullscreen Mode Toggle */}
								<Button
									variant='ghost'
									size='icon'
									onClick={() => {
										const newFullscreenState = !isFullscreenMode;
										setIsFullscreenMode(newFullscreenState);
										
										// Update URL parameters
										const currentParams = new URLSearchParams(searchParams.toString());
										if (newFullscreenState) {
											currentParams.set("fullscreen", "true");
										} else {
											currentParams.delete("fullscreen");
										}
										
										const newUrl = currentParams.toString() 
											? `${window.location.pathname}?${currentParams.toString()}`
											: window.location.pathname;
										
										router.replace(newUrl);
									}}
									className='text-white hover:bg-white/30 h-10 w-10'
									title={isFullscreenMode ? 'Exit Fullscreen' : 'Enter Fullscreen'}
								>
									{isFullscreenMode ? (
										<Minimize className='h-5 w-5' />
									) : (
										<Maximize className='h-5 w-5' />
									)}
								</Button>
								<PrintButton
									story={{
										id: mockStory.id,
										title: mockStory.title,
										content: mockStory.content.map((segment: any) => segment.text).join('\n\n'),
										questions: mockStory.questions || []
									}}
									variant='ghost'
									className='text-white hover:bg-white/30 border-white/30 h-10 w-10'
								/>
								{mockStory?.id && (
									<DeleteStoryButton
										storyId={mockStory.id}
										storyTitle={mockStory.title}
										hasImages={mockStory.content?.some((segment: any) => segment.image)}
										variant='ghost'
										size='sm'
										showText={false}
										redirectAfterDelete='/dashboard'
										className='text-white hover:bg-white/30 h-10 w-10'
									/>
								)}
							</div>
						</div>
						
						{/* Mobile Info Panel - Toggleable */}
						{showMobileInfo && (
							<div className='bg-black/60 backdrop-blur-sm rounded-lg p-3 mb-2 border border-white/20'>
								<div className='flex flex-wrap gap-2'>
									<span className='px-2 py-1 bg-white/20 rounded-full text-xs text-white/80'>
										{mockStory.genre}
									</span>
									<span className='capitalize px-2 py-1 bg-white/20 rounded-full text-xs text-white/80'>
										{mockStory.readingLevel}
									</span>
									<div className='flex items-center space-x-1 px-2 py-1 bg-white/20 rounded-full'>
										<Clock className='h-3 w-3' />
										<span className='text-xs text-white/80'>
											{mockStory.estimatedTime} min
										</span>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Desktop Layout - Keep Original */}
					<div className='hidden md:flex items-center justify-between'>
						<div className='text-white'>
							<h1 className='text-2xl font-bold mb-1'>
								{mockStory.title}
							</h1>
							<div className='flex items-center space-x-4 text-sm text-white/80'>
								<span>{mockStory.genre}</span>
								<span className='capitalize'>
									{mockStory.readingLevel}
								</span>
								<div className='flex items-center space-x-1'>
									<Clock className='h-3 w-3' />
									<span>
										{mockStory.estimatedTime} min
									</span>
								</div>
							</div>
						</div>

						<div className='flex items-center space-x-2'>
							{/* Fullscreen Mode Toggle - Larger for mobile */}
							<Button
								variant='ghost'
								size='icon'
								onClick={() => {
									const newFullscreenState =
										!isFullscreenMode;
									setIsFullscreenMode(
										newFullscreenState
									);

									// Update URL parameters
									const currentParams =
										new URLSearchParams(
											searchParams.toString()
										);
									if (newFullscreenState) {
										currentParams.set(
											"fullscreen",
											"true"
										);
									} else {
										currentParams.delete(
											"fullscreen"
										);
									}

									const newUrl =
										currentParams.toString()
											? `${
													window.location
														.pathname
											  }?${currentParams.toString()}`
											: window.location
													.pathname;

									router.replace(newUrl);
								}}
								className='text-white hover:bg-white/30 h-14 w-14 md:h-12 md:w-12'
								title={
									isFullscreenMode
										? "Exit Fullscreen"
										: "Enter Fullscreen"
								}
							>
								{isFullscreenMode ? (
									<Minimize className='h-8 w-8 md:h-6 md:w-6' />
								) : (
									<Maximize className='h-8 w-8 md:h-6 md:w-6' />
								)}
							</Button>
							<PrintButton
								story={{
									id: mockStory.id,
									title: mockStory.title,
									content: mockStory.content
										.map(
											(segment: any) => segment.text
										)
										.join("\n\n"),
									grade_level: 3,
									estimated_reading_time:
										mockStory.estimatedTime,
								}}
								variant='ghost'
								size='sm'
								showText={false}
								className='text-white hover:bg-white/30 border-white/30 h-14 w-14 md:h-12 md:w-12'
							/>
							{/* Audio controls removed - no audio functionality currently */}
							{mockStory?.id && (
								<DeleteStoryButton
									storyId={mockStory.id}
									storyTitle={mockStory.title}
									hasImages={mockStory.content?.some(
										(segment: any) =>
											segment.image
									)}
									variant='ghost'
									size='sm'
									showText={false}
									redirectAfterDelete='/dashboard'
									className='text-white hover:bg-white/30 h-14 w-14 md:h-12 md:w-12'
								/>
							)}
						</div>
					</div>
				</div>

				{/* Progress Bar - Relative positioning */}
				<div className={`relative z-40 ${
					isFullscreenMode ? 'px-3 md:px-4' : 'px-3 md:px-8'
				}`}>
					<div className='space-y-2'>
						<div className='flex justify-between text-sm text-white/80'>
							<span>Reading Progress</span>
							<span>{Math.round(progress)}%</span>
						</div>
						<div
							className={`w-full rounded-full h-2 ${
								isFullscreenMode
									? "bg-white/20"
									: "bg-slate-300 dark:bg-slate-600"
							}`}
						>
							<div
								className={`h-2 rounded-full transition-all duration-500 relative shadow-lg ${
									isFullscreenMode
										? "bg-white"
										: "bg-blue-500 dark:bg-blue-400"
								}`}
								style={{ width: `${progress}%` }}
							>
								<div
									className={`absolute right-0 top-0 w-4 h-2 rounded-full shadow-xl ${
										isFullscreenMode
											? "bg-white"
											: "bg-blue-500 dark:bg-blue-400"
									}`}
								></div>
							</div>
						</div>
					</div>
				</div>

				{/* Reading Content - Positioned after progress bar */}
				<div className={`relative z-30 pt-4 pb-24 md:pb-28 flex-1 overflow-y-auto ${
					isFullscreenMode ? 'px-3 md:px-4' : 'px-3 md:px-8'
				}`}>
					<div className='w-full'>
						<div className='netflix-text-container bg-black/75 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/10 shadow-2xl'>
							<div
								className={`reading-text ${
									isFullscreenMode
										? "text-white"
										: "text-slate-900 dark:text-slate-100"
								} ${
									currentContent?.isTitle
										? "text-center"
										: ""
								}`}
							>
								{currentContent?.text ? (
									<div
										className={`${
											currentContent?.isTitle
												? "text-3xl md:text-4xl font-bold text-white mb-6"
												: currentContent?.isEnding
												? "text-xl md:text-2xl font-semibold text-white"
												: "text-lg md:text-xl text-white/95"
										}`}
									>
										<ReactMarkdown
											remarkPlugins={[
												remarkGfm,
											]}
											components={{
												h1: (props) => (
													<h1
														className='text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 text-white leading-tight'
														{...props}
													/>
												),
												h2: (props) => (
													<h2
														className='text-3xl md:text-4xl font-semibold mb-4 text-white'
														{...props}
													/>
												),
												h3: (props) => (
													<h3
														className='text-2xl md:text-3xl font-semibold mb-3 text-white'
														{...props}
													/>
												),
												p: (props) => (
													<p
														className='text-base md:text-lg lg:text-xl leading-relaxed mb-4 md:mb-6 text-white/95'
														{...props}
													/>
												),
												ul: (props) => (
													<ul
														className='list-disc pl-6 my-6 space-y-2 text-white/95'
														{...props}
													/>
												),
												ol: (props) => (
													<ol
														className='list-decimal pl-6 my-6 space-y-2 text-white/95'
														{...props}
													/>
												),
												li: (props) => (
													<li
														className='text-white/95'
														{...props}
													/>
												),
												strong: (props) => (
													<strong
														className='font-semibold text-white'
														{...props}
													/>
												),
												em: (props) => (
													<em
														className='italic text-white/90'
														{...props}
													/>
												),
												a: (props) => (
													<a
														className='underline text-blue-300 hover:text-blue-200'
														target='_blank'
														rel='noopener noreferrer'
														{...props}
													/>
												),
											}}
										>
											{currentContent.text}
										</ReactMarkdown>
									</div>
								) : (
									<span className='block text-center text-white/80 text-xl'>
										This story has no content to
										display.
									</span>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Navigation Controls - Always fixed at bottom */}
				<div className={`fixed left-0 right-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pb-safe ${
					showReadingTip ? 'z-[110]' : 'z-50'
				}`}>
					<div className={`pt-8 pb-4 md:pb-6 ${
						isFullscreenMode ? 'px-3 md:px-4' : 'px-3 md:px-8'
					}`}>
					<div className='flex items-center justify-between'>
						<Button
							variant='outline'
							onClick={handlePrevious}
							disabled={currentSegment === 0}
							className={`bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 h-14 md:h-12 px-4 md:px-4 transition-all duration-300 ${
								showReadingTip ? 'border-purple-400 border-2 shadow-lg shadow-purple-400/50' : 'border-white/30'
							}`}
							id="prev-button"
						>
							<ArrowLeft className='h-6 w-6 mr-2' />
							<span className='hidden sm:inline'>
								Previous
							</span>
							<span className='sm:hidden'>Prev</span>
						</Button>

						<div className='flex items-center space-x-6'>
							{!showReadingTip && (
								<span className='text-sm text-white/80 bg-black/40 px-3 py-2 rounded-full backdrop-blur-sm'>
									{displayPage} of {totalSegments}
								</span>
							)}

							{isPlaying && (
								<div className='flex items-center space-x-2 text-sm text-white/80 bg-black/40 px-3 py-2 rounded-full backdrop-blur-sm'>
									<div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
									<span>Auto-reading...</span>
								</div>
							)}
						</div>

						<Button
							onClick={handleNext}
							className={`bg-white text-black hover:bg-white/90 font-semibold h-14 md:h-12 px-4 md:px-4 transition-all duration-300 ${
								showReadingTip ? 'border-purple-400 border-2 shadow-lg shadow-purple-400/50' : ''
							}`}
							id="next-button"
						>
							{currentSegment === totalSegments - 1 ? (
								<>
									<span className='hidden sm:inline'>
										Questions
									</span>
									<span className='sm:hidden'>
										Quiz
									</span>
									<Target className='h-6 w-6 ml-2' />
								</>
							) : (
								<>
									<span>Next</span>
									<ArrowRight className='h-6 w-6 ml-2' />
								</>
							)}
						</Button>
					</div>
					</div>
				</div>

				{/* Reading Tip Modal */}
				{showReadingTip && (
					<div className='fixed inset-0 z-[100] flex items-center justify-center p-4'>
						{/* Backdrop */}
						<div 
							className='absolute inset-0 bg-black/50 backdrop-blur-sm'
							onClick={handleCloseTip}
						/>
						
						{/* Modal Content */}
						<div className='relative bg-black/90 backdrop-blur-md border border-yellow-400/50 rounded-xl p-6 max-w-md mx-auto shadow-2xl shadow-yellow-400/20'>
							{/* Close Button */}
							<button
								onClick={handleCloseTip}
								className='absolute top-3 right-3 text-white/70 hover:text-white transition-colors'
							>
								<X className='h-5 w-5' />
							</button>
							
							{/* Content */}
							<div className='flex items-start space-x-3 text-white mb-4'>
								<Lightbulb className='h-6 w-6 text-yellow-400 flex-shrink-0 mt-1' />
								<div>
									<h3 className='font-bold text-yellow-400 mb-2 text-lg'>
										Welcome to Your Story!
									</h3>
									<p className='text-white/90 mb-3 leading-relaxed'>
										Use the highlighted <span className='text-purple-400 font-semibold'>Previous</span> and <span className='text-purple-400 font-semibold'>Next</span> buttons to navigate through your story at your own pace.
									</p>
									<p className='text-white/80 text-sm'>
										Each section has its own beautiful background to enhance your reading experience!
									</p>
								</div>
							</div>
							
							{/* Action Buttons */}
							<div className='flex flex-col space-y-2'>
								<Button
									onClick={handleCloseTip}
									className='bg-yellow-400 text-black hover:bg-yellow-300 font-semibold'
								>
									Got it!
								</Button>
								<button
									onClick={handleDontShowAgain}
									className='text-white/60 hover:text-white/80 text-sm transition-colors'
								>
									Don&apos;t show this again
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
