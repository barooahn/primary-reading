"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/auth-context";
import {
	BookOpen,
	Trophy,
	Flame,
	Star,
	Zap,
	Target,
	Crown,
	Sparkles,
	ChevronRight,
	Play,
} from "lucide-react";
import Link from "next/link";

interface UserProgress {
	level: number;
	experiencePoints: number;
	readingStreak: number;
	storiesRead: number;
	questionsAnswered: number;
	correctAnswers: number;
	badges: Array<{
		id: string;
		name: string;
		icon: string;
		color: string;
		earned: boolean;
	}>;
}

interface Story {
	id: string;
	title: string;
	genre?: string;
	reading_level?: string;
	progress?: number;
	completed?: boolean;
	score?: number | null;
	estimated_reading_time?: number;
	difficulty_rating?: number;
	created_at?: string;
	is_featured?: boolean;
}

export default function Dashboard() {
	const { user } = useAuth();
	const [selectedTab, setSelectedTab] = useState<"continue" | "suggested" | "create">("continue");
	const [loading, setLoading] = useState(true);
	const [userProgress, setUserProgress] = useState<UserProgress>({
		level: 1,
		experiencePoints: 0,
		readingStreak: 0,
		storiesRead: 0,
		questionsAnswered: 0,
		correctAnswers: 0,
		badges: []
	});
	const [recentStories, setRecentStories] = useState<Story[]>([]);
	const [suggestedStories, setSuggestedStories] = useState<Story[]>([]);

	// Load dashboard data
	useEffect(() => {
		if (user) {
			loadDashboardData();
		}
	}, [user, loadDashboardData]);

	const loadDashboardData = useCallback(async () => {
		try {
			setLoading(true);
			
			// Load user's stories (recent/continue reading)
			const storiesResponse = await fetch('/api/stories?limit=5&user_created_only=true', {
				credentials: 'include'
			});
			
			if (storiesResponse.ok) {
				const storiesData = await storiesResponse.json();
				if (storiesData.success) {
					setRecentStories(storiesData.stories || []);
				}
			}

			// Load suggested stories (all stories, not user-created)
			const suggestedResponse = await fetch('/api/stories?limit=10&user_created_only=false', {
				credentials: 'include'
			});
			
			if (suggestedResponse.ok) {
				const suggestedData = await suggestedResponse.json();
				if (suggestedData.success) {
					// Filter out user's own stories from suggestions
					const filtered = (suggestedData.stories || []).filter((story: Story) => 
						!recentStories.some(recent => recent.id === story.id)
					);
					setSuggestedStories(filtered.slice(0, 6));
				}
			}

			// For now, use basic calculated progress based on stories
			const storiesCount = recentStories.length;
			setUserProgress({
				level: Math.floor(storiesCount / 5) + 1,
				experiencePoints: storiesCount * 50,
				readingStreak: Math.min(storiesCount, 7), // Simple streak calculation
				storiesRead: storiesCount,
				questionsAnswered: 0, // TODO: Implement question tracking
				correctAnswers: 0, // TODO: Implement question tracking
				badges: [
					{
						id: "1",
						name: "First Story",
						icon: "📚",
						color: "#4A90E2",
						earned: storiesCount >= 1,
					},
					{
						id: "2",
						name: "Story Creator",
						icon: "✍️",
						color: "#FF6B6B", 
						earned: storiesCount >= 3,
					},
					{
						id: "3",
						name: "Prolific Writer",
						icon: "🏆",
						color: "#F5D547",
						earned: storiesCount >= 10,
					},
					{
						id: "4",
						name: "Master Storyteller",
						icon: "👑",
						color: "#87CEEB",
						earned: storiesCount >= 20,
					},
				]
			});

		} catch (error) {
			console.error('Failed to load dashboard data:', error);
		} finally {
			setLoading(false);
		}
	}, [recentStories]);

	return (
		<ProtectedRoute>
			<div className='container mx-auto px-4 py-8 max-w-7xl'>
				{/* Welcome Section */}
				<div className='mb-8'>
					<div className='flex items-center justify-between mb-4'>
						<div>
							<h1 className='text-3xl font-bold text-foreground'>
								Welcome back{user?.name ? `, ${user.name}` : ', Reader'}! 🌟
							</h1>
							<p className='text-muted mt-2'>
								Ready for your next reading adventure?
							</p>
						</div>
						<div className='hidden sm:flex items-center space-x-4'>
							<div className='flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full'>
								<Crown className='h-5 w-5 text-primary' />
								<span className='font-semibold'>
									Level {userProgress.level}
								</span>
							</div>
							<div className='flex items-center space-x-2 px-4 py-2 bg-secondary/10 rounded-full'>
								<Flame className='h-5 w-5 text-orange-500' />
								<span className='font-semibold'>
									{userProgress.readingStreak} day streak!
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className='grid lg:grid-cols-3 gap-8'>
					{/* Main Content */}
					<div className='lg:col-span-2 space-y-6'>
						{/* Progress Stats Cards */}
						<div className='grid sm:grid-cols-3 gap-4'>
							<Card className='bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-primary'>
												Stories Read
											</p>
											<p className='text-2xl font-bold'>
												{userProgress.storiesRead}
											</p>
										</div>
										<BookOpen className='h-8 w-8 text-primary' />
									</div>
								</CardContent>
							</Card>

							<Card className='bg-gradient-to-br from-success/10 to-success/5 border-success/20'>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-success'>
												Questions Correct
											</p>
											<p className='text-2xl font-bold'>
												{userProgress.correctAnswers}
											</p>
										</div>
										<Target className='h-8 w-8 text-success' />
									</div>
								</CardContent>
							</Card>

							<Card className='bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20'>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-orange-600'>
												Experience Points
											</p>
											<p className='text-2xl font-bold'>
												{userProgress.experiencePoints}
											</p>
										</div>
										<Zap className='h-8 w-8 text-orange-600' />
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Story Tabs */}
						<Card>
							<CardHeader>
								<div className='flex space-x-1 bg-muted/20 p-1 rounded-lg w-fit'>
									<button
										onClick={() =>
											setSelectedTab(
												"continue"
											)
										}
										className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
											selectedTab ===
											"continue"
												? "bg-primary text-white shadow-sm"
												: "text-muted hover:text-foreground"
										}`}
									>
										Continue Reading
									</button>
									<button
										onClick={() =>
											setSelectedTab(
												"suggested"
											)
										}
										className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
											selectedTab ===
											"suggested"
												? "bg-primary text-white shadow-sm"
												: "text-muted hover:text-foreground"
										}`}
									>
										Suggested for You
									</button>
									<button
										onClick={() =>
											setSelectedTab("create")
										}
										className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
											selectedTab === "create"
												? "bg-primary text-white shadow-sm"
												: "text-muted hover:text-foreground"
										}`}
									>
										Create New
									</button>
								</div>
							</CardHeader>
							<CardContent>
								{selectedTab === "continue" && (
									<div className='space-y-4'>
										{loading ? (
											<div className='space-y-4'>
												{Array.from({ length: 3 }).map((_, i) => (
													<div key={i} className='flex items-center space-x-4 p-4 rounded-lg border'>
														<div className='flex-1 space-y-2'>
															<div className='h-5 bg-gray-200 rounded animate-pulse' />
															<div className='h-4 bg-gray-200 rounded w-2/3 animate-pulse' />
														</div>
														<div className='w-24 h-10 bg-gray-200 rounded animate-pulse' />
													</div>
												))}
											</div>
										) : recentStories.length > 0 ? (
											recentStories.map((story) => (
												<div
													key={story.id}
													className='flex items-center space-x-4 p-4 rounded-lg border hover:shadow-md transition-all'
												>
													<div className='flex-1'>
														<h3 className='font-semibold text-lg'>
															{story.title?.replace(/\*\*/g, '') || 'Untitled Story'}
														</h3>
														<div className='flex items-center space-x-4 mt-2 text-sm text-muted'>
															{story.genre && <span>{story.genre}</span>}
															{story.reading_level && (
																<span className='capitalize'>{story.reading_level}</span>
															)}
															{story.estimated_reading_time && (
																<span>{story.estimated_reading_time} min read</span>
															)}
														</div>
														{/* For now, all stories are considered "completed" since we don't have progress tracking yet */}
													</div>
													<Button asChild>
														<Link href={`/read/${story.id}`}>
															<Play className='h-4 w-4 mr-2' />
															Read Story
														</Link>
													</Button>
												</div>
											))
										) : (
											<div className='text-center py-12'>
												<BookOpen className='h-16 w-16 text-muted mx-auto mb-4' />
												<h3 className='text-xl font-semibold mb-2'>No stories yet</h3>
												<p className='text-muted mb-6'>
													Create your first story to get started!
												</p>
												<Button asChild>
													<Link href='/create'>
														<Sparkles className='h-5 w-5 mr-2' />
														Create Story
													</Link>
												</Button>
											</div>
										)}
									</div>
								)}

								{selectedTab === "suggested" && (
									<div className='space-y-4'>
										{loading ? (
											<div className='space-y-4'>
												{Array.from({ length: 3 }).map((_, i) => (
													<div key={i} className='flex items-center space-x-4 p-4 rounded-lg border'>
														<div className='flex-1 space-y-2'>
															<div className='h-5 bg-gray-200 rounded animate-pulse' />
															<div className='h-4 bg-gray-200 rounded w-3/4 animate-pulse' />
														</div>
														<div className='w-24 h-10 bg-gray-200 rounded animate-pulse' />
													</div>
												))}
											</div>
										) : suggestedStories.length > 0 ? (
											suggestedStories.map((story) => (
												<div
													key={story.id}
													className='flex items-center space-x-4 p-4 rounded-lg border hover:shadow-md transition-all'
												>
													<div className='flex-1'>
														<div className='flex items-center space-x-2'>
															<h3 className='font-semibold text-lg'>
																{story.title?.replace(/\*\*/g, '') || 'Untitled Story'}
															</h3>
															{story.is_featured && (
																<span className='px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full font-medium'>
																	FEATURED
																</span>
															)}
														</div>
														<div className='flex items-center space-x-4 mt-2 text-sm text-muted'>
															{story.genre && <span>{story.genre}</span>}
															{story.reading_level && (
																<span className='capitalize'>{story.reading_level}</span>
															)}
															{story.estimated_reading_time && (
																<span>{story.estimated_reading_time} min read</span>
															)}
															{story.difficulty_rating && (
																<div className='flex items-center'>
																	{Array.from({ length: 5 }).map((_, i) => (
																		<Star
																			key={i}
																			className={`h-3 w-3 ${
																				i < story.difficulty_rating!
																					? "text-secondary fill-secondary"
																					: "text-muted/30"
																			}`}
																		/>
																	))}
																</div>
															)}
														</div>
													</div>
													<Button asChild>
														<Link href={`/read/${story.id}`}>
															<Play className='h-4 w-4 mr-2' />
															Start Reading
														</Link>
													</Button>
												</div>
											))
										) : (
											<div className='text-center py-12'>
												<BookOpen className='h-16 w-16 text-muted mx-auto mb-4' />
												<h3 className='text-xl font-semibold mb-2'>No suggestions yet</h3>
												<p className='text-muted mb-6'>
													Suggestions will appear as more stories are added to the library.
												</p>
												<Button asChild variant='outline'>
													<Link href='/stories'>
														<BookOpen className='h-5 w-5 mr-2' />
														Browse Library
													</Link>
												</Button>
											</div>
										)}
									</div>
								)}

								{selectedTab === "create" && (
									<div className='text-center py-8'>
										<Sparkles className='h-16 w-16 text-primary mx-auto mb-4' />
										<h3 className='text-xl font-semibold mb-2'>
											Create Your Own
											Adventure!
										</h3>
										<p className='text-muted mb-6 max-w-md mx-auto'>
											Use AI to create a
											personalized story about
											anything you want!
											Dragons, space travel,
											funny pets, or mystery
											adventures.
										</p>
										<Button size='lg' asChild>
											<Link href='/create'>
												<Sparkles className='h-5 w-5 mr-2' />
												Create New Story
											</Link>
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className='space-y-6'>
						{/* Badges */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center space-x-2'>
									<Trophy className='h-5 w-5 text-primary' />
									<span>My Badges</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-2 gap-3'>
									{userProgress.badges.map(
										(badge) => (
											<div
												key={badge.id}
												className={`p-3 rounded-lg border-2 text-center transition-all ${
													badge.earned
														? "border-primary/20 bg-primary/5 hover:scale-105"
														: "border-muted/20 bg-muted/5 opacity-50"
												}`}
											>
												<div className='text-2xl mb-1'>
													{badge.icon}
												</div>
												<p className='text-xs font-medium'>
													{badge.name}
												</p>
											</div>
										)
									)}
								</div>
								<Button
									variant='outline'
									className='w-full mt-4'
									asChild
								>
									<Link href='/progress'>
										View All Badges
										<ChevronRight className='h-4 w-4 ml-1' />
									</Link>
								</Button>
							</CardContent>
						</Card>

						{/* Daily Challenge */}
						<Card className='bg-gradient-to-br from-success/10 to-success/5 border-success/20'>
							<CardHeader>
								<CardTitle className='flex items-center space-x-2 text-success'>
									<Target className='h-5 w-5' />
									<span>Daily Challenge</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-center'>
									<div className='text-3xl mb-2'>
										🎯
									</div>
									<p className='font-semibold mb-1'>
										Read for 15 minutes
									</p>
									<p className='text-sm text-muted mb-4'>
										Keep your streak going!
									</p>
									<div className='w-full bg-muted/20 rounded-full h-3 mb-3'>
										<div
											className='bg-success h-3 rounded-full'
											style={{ width: "70%" }}
										/>
									</div>
									<p className='text-xs text-muted'>
										10.5 / 15 minutes
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Quick Actions */}
						<Card>
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
							</CardHeader>
							<CardContent className='space-y-3'>
								<Button
									variant='outline'
									className='w-full justify-start'
									asChild
								>
									<Link href='/stories'>
										<BookOpen className='h-4 w-4 mr-2' />
										Browse Story Library
									</Link>
								</Button>
								<Button
									variant='outline'
									className='w-full justify-start'
									asChild
								>
									<Link href='/create'>
										<Sparkles className='h-4 w-4 mr-2' />
										Create New Story
									</Link>
								</Button>
								<Button
									variant='outline'
									className='w-full justify-start'
									asChild
								>
									<Link href='/progress'>
										<Trophy className='h-4 w-4 mr-2' />
										View Progress
									</Link>
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}
