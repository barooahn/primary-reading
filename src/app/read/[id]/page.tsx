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
	Play,
	Pause,
	Volume2,
	VolumeX,
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
				imagePrompt: seg?.image_prompt ?? seg?.imagePrompt ?? undefined,
				thumbnailUrl: seg?.thumbnail_url ?? seg?.thumbnailUrl ?? null,
				isTitle: idx === 0,
				isEnding: idx === arr.length - 1,
			};
			console.log(`=== MAPPING SEGMENT ${idx} ===`);
			console.log("Raw segment data:", seg);
			console.log("Mapped segment data:", mappedSeg);
			console.log(`Image sources - image_url: ${seg?.image_url}, image: ${seg?.image}`);
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
					console.log("Raw questions from API:", data.story.questions);
					console.log("Questions count:", data.story.questions?.length || 0);
					const mappedStory = mapApiStory(data.story);
					console.log("Mapped questions in read page:", mappedStory.questions);
					console.log("Mapped questions count:", mappedStory.questions?.length || 0);
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
		return searchParams.get('fullscreen') === 'true';
	});
	
	// Removed on-demand image generation state - images are now pre-generated during story creation
	
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [readingStartTime] = useState(Date.now());
	const [readingProgress, setReadingProgress] = useState<ReadingProgress>({
		currentSegment: 0,
		totalSegments: mockStory?.content?.length ?? 0,
		timeSpent: 0,
		questionsAnswered: 0,
		correctAnswers: 0,
	});

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
												{question?.explanation ?? ""}
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
		if (segment?.image && segment.image !== null && segment.image !== "") {
			return segment.image;
		}
		
		// Second priority: if we have storage paths but no URLs, convert them
		if (segment?.imagePath || segment?.thumbnailPath || segment?.image_path || segment?.thumbnail_path) {
			const storagePath = segment.thumbnailPath || segment.imagePath || segment.thumbnail_path || segment.image_path;
			return `/api/images/${encodeURIComponent(storagePath)}`;
		}

		// Third priority: look for images from other segments in the story (pre-generated)
		const allSegments = mockStory?.content || [];
		const preGeneratedImages = allSegments
			.filter((seg: any) => seg?.image && seg.image !== null && seg.image !== "")
			.map((seg: any) => seg.image);
		
		if (preGeneratedImages.length > 0) {
			const selectedImage = preGeneratedImages[index % preGeneratedImages.length];
			return selectedImage;
		}
		
		// Fourth priority: choose themed images based on image prompt content
		const imagePrompt = segment?.imagePrompt?.toLowerCase() || "";
		const imagePromptAlt = segment?.image_prompt?.toLowerCase() || "";
		const finalPrompt = imagePrompt || imagePromptAlt;
		
		// Match prompt keywords to appropriate themed background images
		if (finalPrompt.includes("kitchen") || finalPrompt.includes("house") || finalPrompt.includes("home")) {
			return "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"; // Cozy kitchen
		}
		if (finalPrompt.includes("backyard") || finalPrompt.includes("garden") || finalPrompt.includes("outdoor")) {
			return "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"; // Beautiful backyard
		}
		if (finalPrompt.includes("tree") || finalPrompt.includes("nest") || finalPrompt.includes("squirrel")) {
			return "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"; // Forest with trees
		}
		if (finalPrompt.includes("party") || finalPrompt.includes("celebration") || finalPrompt.includes("friends")) {
			return "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"; // Party/celebration
		}
		if (finalPrompt.includes("morning") || finalPrompt.includes("sunny") || finalPrompt.includes("bright")) {
			return "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2040&q=80"; // Sunny morning
		}
		if (finalPrompt.includes("mystery") || finalPrompt.includes("detective") || finalPrompt.includes("clue") || finalPrompt.includes("cat") || finalPrompt.includes("coding")) {
			return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"; // Mysterious path
		}
		if (finalPrompt.includes("birthday") || finalPrompt.includes("cake")) {
			return "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"; // Birthday/celebration
		}
		
		// Final fallback: cycle through general story-appropriate images
		const fallbackImages = [
			"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80", // Library/books
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80", // Forest path
			"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80", // Mountain landscape
			"https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80", // Meadow
		];
		
		const selectedFallback = fallbackImages[index % fallbackImages.length];
		return selectedFallback;
	};

	return (
		<>
			{/* Reading interface with proper navigation spacing */}
			<div className={`netflix-reading-container bg-black overflow-hidden ${
				isFullscreenMode ? 'fixed inset-0' : 'fixed top-[70px] left-0 right-0 bottom-0'
			}`}>
				{/* Background Image with Overlay */}
				<div className='absolute inset-0'>
					<div 
						className='absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out'
						style={{
							backgroundImage: `url(${getBackgroundImage(currentContent, currentSegment)})`,
						}}
						onError={(e) => {
							console.error("Background image failed to load:", e);
							console.log("Attempted image URL:", getBackgroundImage(currentContent, currentSegment));
						}}
					/>
					{/* Gradient overlay for text readability */}
					<div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20' />
				</div>

				{/* Story Header - Fixed at top */}
				<div className='absolute top-0 left-0 right-0 z-20 p-4'>
					<div className='flex items-center justify-between'>
						<div className='text-white'>
							<h1 className='text-2xl font-bold mb-1'>
								{mockStory.title}
							</h1>
							<div className='flex items-center space-x-4 text-sm text-white/80'>
								<span>{mockStory.genre}</span>
								<span className='capitalize'>
									{mockStory.readingLevel}
								</span>
								<span className='flex items-center space-x-1'>
									<Clock className='h-3 w-3' />
									<span>
										{mockStory.estimatedTime} min
									</span>
								</span>
							</div>
						</div>

						<div className='flex items-center space-x-2'>
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
										currentParams.set('fullscreen', 'true');
									} else {
										currentParams.delete('fullscreen');
									}
									
									const newUrl = currentParams.toString() 
										? `${window.location.pathname}?${currentParams.toString()}`
										: window.location.pathname;
									
									router.replace(newUrl);
								}}
								className='text-white hover:bg-white/20'
								title={isFullscreenMode ? 'Exit Fullscreen' : 'Enter Fullscreen'}
							>
								{isFullscreenMode ? (
									<Minimize className='h-4 w-4' />
								) : (
									<Maximize className='h-4 w-4' />
								)}
							</Button>
							<PrintButton
								story={{
									id: mockStory.id,
									title: mockStory.title,
									content: mockStory.content
										.map(
											(segment) => segment.text
										)
										.join("\n\n"),
									grade_level: 3,
									estimated_reading_time:
										mockStory.estimatedTime,
								}}
								variant='ghost'
								size='sm'
								showText={false}
								className='text-white hover:bg-white/20 border-white/30'
							/>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => setIsMuted(!isMuted)}
								className='text-white hover:bg-white/20'
							>
								{isMuted ? (
									<VolumeX className='h-4 w-4' />
								) : (
									<Volume2 className='h-4 w-4' />
								)}
							</Button>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => setIsPlaying(!isPlaying)}
								className='text-white hover:bg-white/20'
							>
								{isPlaying ? (
									<Pause className='h-4 w-4' />
								) : (
									<Play className='h-4 w-4' />
								)}
							</Button>
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
									className='text-white hover:bg-white/20'
								/>
							)}
						</div>
					</div>
				</div>

				{/* Progress Bar - Fixed below header */}
				<div className={`${
					isFullscreenMode ? 'absolute top-24' : 'absolute top-20'
				} left-0 right-0 z-20 px-4`}>
					<div className='space-y-2'>
						<div className='flex justify-between text-sm text-white/80'>
							<span>Reading Progress</span>
							<span>{Math.round(progress)}%</span>
						</div>
						<div className={`w-full rounded-full h-2 ${
							isFullscreenMode ? 'bg-white/20' : 'bg-slate-300 dark:bg-slate-600'
						}`}>
							<div
								className={`h-2 rounded-full transition-all duration-500 relative shadow-lg ${
									isFullscreenMode ? 'bg-white' : 'bg-blue-500 dark:bg-blue-400'
								}`}
								style={{ width: `${progress}%` }}
							>
								<div className={`absolute right-0 top-0 w-4 h-2 rounded-full shadow-xl ${
									isFullscreenMode ? 'bg-white' : 'bg-blue-500 dark:bg-blue-400'
								}`}></div>
							</div>
						</div>
					</div>
				</div>

				{/* Reading Content - Centered in viewport */}
				<div className={`absolute inset-0 z-10 flex items-center justify-center p-6 ${
					isFullscreenMode ? 'pt-40 pb-32' : 'pt-32 pb-24'
				}`}>
					<div className='w-full max-w-4xl'>
						<div className='netflix-text-container bg-black/85 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20 shadow-2xl'>
							<div
								className={`reading-text ${
									isFullscreenMode ? 'text-white' : 'text-slate-900 dark:text-slate-100'
								} ${
									currentContent?.isTitle ? "text-center" : ""
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
														className='text-4xl md:text-5xl font-bold mb-6 text-white'
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
														className='text-lg md:text-xl leading-relaxed mb-6 text-white/95'
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

				{/* Navigation Controls - Fixed at bottom */}
				<div className='absolute bottom-0 left-0 right-0 z-20 p-4'>
					<div className='flex items-center justify-between'>
						<Button
							variant='outline'
							onClick={handlePrevious}
							disabled={currentSegment === 0}
							className='bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30'
						>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Previous
						</Button>

						<div className='flex items-center space-x-6'>
							<span className='text-sm text-white/80 bg-black/40 px-3 py-2 rounded-full backdrop-blur-sm'>
								{displayPage} of {totalSegments}
							</span>

							{isPlaying && (
								<div className='flex items-center space-x-2 text-sm text-white/80 bg-black/40 px-3 py-2 rounded-full backdrop-blur-sm'>
									<div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
									<span>Auto-reading...</span>
								</div>
							)}
						</div>

						<Button 
							onClick={handleNext}
							className='bg-white text-black hover:bg-white/90 font-semibold'
						>
							{currentSegment === totalSegments - 1 ? (
								<>
									Questions
									<Target className='h-4 w-4 ml-2' />
								</>
							) : (
								<>
									Next
									<ArrowRight className='h-4 w-4 ml-2' />
								</>
							)}
						</Button>
					</div>
				</div>

				{/* Reading Tips - Only show on first segment */}
				{currentSegment === 0 && (
					<div className={`${
						isFullscreenMode ? 'absolute bottom-24' : 'absolute bottom-20'
					} left-6 right-6 z-20`}>
						<div className='bg-black/60 backdrop-blur-sm border border-white/20 rounded-xl p-4 max-w-md mx-auto'>
							<div className='flex items-center space-x-3 text-white'>
								<Lightbulb className='h-5 w-5 text-yellow-400 flex-shrink-0' />
								<div className='text-sm'>
									<p className='font-medium text-yellow-400 mb-1'>
										Reading Tip:
									</p>
									<p className='text-white/80'>
										Use controls to navigate at your own pace. Each section has its own beautiful background!
									</p>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
