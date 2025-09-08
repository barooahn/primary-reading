"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { Header } from "@/components/navigation/header";
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
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DeleteStoryButton } from "@/components/stories/delete-story-button";

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
	const [story, setStory] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);

	function mapApiStory(api: any) {
		// Server already processes segments, so just map them to the expected format
		const segs = Array.isArray(api?.segments) ? api.segments : [];
		const segments = segs.map((seg: any, idx: number, arr: any[]) => ({
			id: seg?.segment_order ?? seg?.id ?? idx + 1,
			text: seg?.content ?? seg?.text ?? "",
			image: seg?.image_url ?? seg?.image ?? null,
			imagePrompt: seg?.image_prompt ?? undefined,
			isTitle: idx === 0,
			isEnding: idx === arr.length - 1,
		}));

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
					const mappedStory = mapApiStory(data.story);
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
	// eslint-disable-next-line react-hooks/exhaustive-deps
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
	}, [isPlaying, currentSegment]);

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
			if (qLen === 0) {
				calculateResults();
				setShowResults(true);
			} else {
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
				return userAnswers[index] === question.correctAnswer
					? count + 1
					: count;
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

							{question?.type === "short_answer" && (
								<div className='space-y-4'>
									<textarea
										className='w-full p-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
										rows={4}
										placeholder='Type your answer here...'
										disabled={isAnswered}
										onChange={(e) =>
											!isAnswered &&
											setUserAnswers({
												...userAnswers,
												[currentQuestion]:
													e.target
														?.value ??
													"",
											})
										}
									/>
									{!isAnswered && (
										<Button
											onClick={() =>
												handleAnswerQuestion(
													userAnswers[
														currentQuestion
													] || ""
												)
											}
										>
											Submit Answer
										</Button>
									)}
								</div>
							)}

							{question?.type === "creative" && (
								<div className='space-y-4'>
									<textarea
										className='w-full p-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
										rows={6}
										placeholder='Draw with words or describe your ideas here...'
										disabled={isAnswered}
										onChange={(e) =>
											!isAnswered &&
											setUserAnswers({
												...userAnswers,
												[currentQuestion]:
													e.target
														?.value ??
													"",
											})
										}
									/>
									{!isAnswered && (
										<Button
											onClick={() =>
												handleAnswerQuestion(
													userAnswers[
														currentQuestion
													] ||
														"Creative response given"
												)
											}
										>
											Share My Ideas
										</Button>
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
	const totalSegments = mockStory?.content?.length ?? 0;
	const progress =
		totalSegments > 0
			? (Math.min(currentSegment + 1, totalSegments) / totalSegments) *
			  100
			: 0;

	const isEmpty = totalSegments === 0;
	const displayPage = totalSegments > 0 ? currentSegment + 1 : 0;

	return (
		<>
			<div className='container mx-auto px-4 py-8 max-w-4xl'>
				{/* Story Header */}
				<div className='mb-6'>
					<div className='flex items-center justify-between mb-4'>
						<div>
							<h1 className='text-2xl font-bold'>
								{mockStory.title}
							</h1>
							<div className='flex items-center space-x-4 text-sm text-muted'>
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
							/>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => setIsMuted(!isMuted)}
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
								/>
							)}
						</div>
					</div>

					{/* Progress Bar */}
					<div className='space-y-2'>
						<div className='flex justify-between text-sm text-muted'>
							<span>Reading Progress</span>
							<span>{Math.round(progress)}%</span>
						</div>
						<div className='w-full bg-muted/20 rounded-full h-3'>
							<div
								className='bg-primary h-3 rounded-full transition-all duration-500 relative'
								style={{ width: `${progress}%` }}
							>
								<div className='absolute right-0 top-0 w-6 h-3 bg-primary rounded-full shadow-lg'></div>
							</div>
						</div>
					</div>
				</div>

				{/* Reading Content */}
				<Card className='mb-6'>
					<CardContent className='p-8'>
						<div className='min-h-[300px] flex flex-col justify-center'>
							{currentContent?.image && (
								<div className='mb-6 text-center'>
									<div className='w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden shadow-lg'>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={
												currentContent.image
											}
											alt={
												currentContent.imagePrompt ||
												`Illustration for ${currentContent.text?.substring(
													0,
													100
												)}...`
											}
											className='w-full h-full object-cover'
											onError={(e) => {
												// Fallback to placeholder if image fails to load
												const target =
													e.target as HTMLImageElement;
												target.style.display =
													"none";
												const fallback =
													target.nextElementSibling as HTMLElement;
												if (fallback)
													fallback.style.display =
														"flex";
											}}
										/>
										<div
											className='w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center'
											style={{
												display: "none",
											}}
										>
											<BookOpen className='h-12 w-12 text-primary/60' />
										</div>
									</div>
								</div>
							)}

							<div
								className={`reading-text ${
									currentContent?.isTitle
										? "text-center"
										: ""
								}`}
							>
								{currentContent?.text ? (
									<div
										className={`leading-relaxed whitespace-pre-line ${
											currentContent?.isTitle
												? "text-xl font-semibold text-primary"
												: currentContent?.isEnding
												? "text-lg font-medium"
												: "text-base"
										}`}
									>
										{currentContent.text}
									</div>
								) : (
									<span className='block text-center text-muted'>
										This story has no content to
										display.
									</span>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Navigation Controls */}
				<div className='flex items-center justify-between'>
					<Button
						variant='outline'
						onClick={handlePrevious}
						disabled={currentSegment === 0}
					>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Previous
					</Button>

					<div className='flex items-center space-x-4'>
						<span className='text-sm text-muted'>
							{displayPage} of {totalSegments}
						</span>

						{isPlaying && (
							<div className='flex items-center space-x-2 text-sm text-muted'>
								<div className='w-2 h-2 bg-primary rounded-full animate-pulse'></div>
								<span>Auto-reading...</span>
							</div>
						)}
					</div>

					<Button onClick={handleNext}>
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

				{/* Reading Tips */}
				{currentSegment === 0 && (
					<Card className='mt-6 bg-secondary/5 border-secondary/20'>
						<CardContent className='p-4'>
							<div className='flex items-center space-x-3'>
								<Lightbulb className='h-5 w-5 text-secondary flex-shrink-0' />
								<div className='text-sm'>
									<p className='font-medium text-secondary mb-1'>
										Reading Tip:
									</p>
									<p className='text-muted'>
										Click the play button to
										auto-read, or use the arrow
										buttons to go at your own
										pace. Try to picture the story
										in your mind as you read!
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</>
	);
}
