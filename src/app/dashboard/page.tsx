"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/protected-route";
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
	Lock,
} from "lucide-react";
import Link from "next/link";

// Mock data - in real app this would come from Supabase
const mockUserProgress = {
	level: 3,
	experiencePoints: 1250,
	readingStreak: 7,
	storiesRead: 23,
	questionsAnswered: 156,
	correctAnswers: 142,
	badges: [
		{
			id: "1",
			name: "First Story",
			icon: "📚",
			color: "#4A90E2",
			earned: true,
		},
		{
			id: "2",
			name: "Streak Starter",
			icon: "🔥",
			color: "#FF6B6B",
			earned: true,
		},
		{
			id: "3",
			name: "Question Master",
			icon: "🧠",
			color: "#F5D547",
			earned: true,
		},
		{
			id: "4",
			name: "Explorer",
			icon: "🗺️",
			color: "#87CEEB",
			earned: false,
		},
	],
};

const recentStories = [
	{
		id: "1",
		title: "The Mystery of the Missing Dragon Egg",
		genre: "Mystery",
		readingLevel: "intermediate",
		progress: 100,
		completed: true,
		score: 95,
	},
	{
		id: "2",
		title: "Space Rescue Mission Alpha",
		genre: "Science Fiction",
		readingLevel: "intermediate",
		progress: 60,
		completed: false,
		score: null,
	},
	{
		id: "3",
		title: "The Laughing Dinosaur Park",
		genre: "Comedy",
		readingLevel: "beginner",
		progress: 100,
		completed: true,
		score: 88,
	},
];

const suggestedStories = [
	{
		id: "4",
		title: "Ninja Academy: First Day",
		genre: "Action",
		readingLevel: "intermediate",
		isNew: true,
		difficulty: 3,
		estimatedTime: 8,
	},
	{
		id: "5",
		title: "The Robot Pet Inventor",
		genre: "Science",
		readingLevel: "intermediate",
		isNew: false,
		difficulty: 3,
		estimatedTime: 10,
	},
	{
		id: "6",
		title: "Underwater Treasure Hunt",
		genre: "Adventure",
		readingLevel: "advanced",
		isNew: true,
		difficulty: 4,
		estimatedTime: 12,
		locked: true,
	},
];

export default function Dashboard() {
	const [selectedTab, setSelectedTab] = useState<
		"continue" | "suggested" | "create"
	>("continue");

	return (
		<ProtectedRoute>
			<div className='container mx-auto px-4 py-8 max-w-7xl'>
				{/* Welcome Section */}
				<div className='mb-8'>
					<div className='flex items-center justify-between mb-4'>
						<div>
							<h1 className='text-3xl font-bold text-foreground'>
								Welcome back, Reader! 🌟
							</h1>
							<p className='text-muted mt-2'>
								Ready for your next reading adventure?
							</p>
						</div>
						<div className='hidden sm:flex items-center space-x-4'>
							<div className='flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full'>
								<Crown className='h-5 w-5 text-primary' />
								<span className='font-semibold'>
									Level {mockUserProgress.level}
								</span>
							</div>
							<div className='flex items-center space-x-2 px-4 py-2 bg-secondary/10 rounded-full'>
								<Flame className='h-5 w-5 text-orange-500' />
								<span className='font-semibold'>
									{mockUserProgress.readingStreak}{" "}
									day streak!
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
												{
													mockUserProgress.storiesRead
												}
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
												{
													mockUserProgress.correctAnswers
												}
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
												{
													mockUserProgress.experiencePoints
												}
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
										{recentStories.map(
											(story) => (
												<div
													key={story.id}
													className='flex items-center space-x-4 p-4 rounded-lg border hover:shadow-md transition-all'
												>
													<div className='flex-1'>
														<h3 className='font-semibold text-lg'>
															{
																story.title
															}
														</h3>
														<div className='flex items-center space-x-4 mt-2 text-sm text-muted'>
															<span>
																{
																	story.genre
																}
															</span>
															<span className='capitalize'>
																{
																	story.readingLevel
																}
															</span>
															{story.completed && (
																<span className='text-success font-medium'>
																	Score:{" "}
																	{
																		story.score
																	}

																	%
																</span>
															)}
														</div>
														{!story.completed && (
															<div className='mt-3'>
																<div className='flex items-center justify-between text-xs text-muted mb-1'>
																	<span>
																		Progress
																	</span>
																	<span>
																		{
																			story.progress
																		}

																		%
																	</span>
																</div>
																<div className='w-full bg-muted/20 rounded-full h-2'>
																	<div
																		className='bg-primary h-2 rounded-full transition-all'
																		style={{
																			width: `${story.progress}%`,
																		}}
																	/>
																</div>
															</div>
														)}
													</div>
													<Button
														asChild
													>
														<Link
															href={`/read/${story.id}`}
														>
															<Play className='h-4 w-4 mr-2' />
															{story.completed
																? "Read Again"
																: "Continue"}
														</Link>
													</Button>
												</div>
											)
										)}
									</div>
								)}

								{selectedTab === "suggested" && (
									<div className='space-y-4'>
										{suggestedStories.map(
											(story) => (
												<div
													key={story.id}
													className='flex items-center space-x-4 p-4 rounded-lg border hover:shadow-md transition-all'
												>
													<div className='flex-1'>
														<div className='flex items-center space-x-2'>
															<h3 className='font-semibold text-lg'>
																{
																	story.title
																}
															</h3>
															{story.isNew && (
																<span className='px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full font-medium'>
																	NEW
																</span>
															)}
															{story.locked && (
																<Lock className='h-4 w-4 text-muted' />
															)}
														</div>
														<div className='flex items-center space-x-4 mt-2 text-sm text-muted'>
															<span>
																{
																	story.genre
																}
															</span>
															<span className='capitalize'>
																{
																	story.readingLevel
																}
															</span>
															<span>
																{
																	story.estimatedTime
																}{" "}
																min
																read
															</span>
															<div className='flex items-center'>
																{Array.from(
																	{
																		length: 5,
																	}
																).map(
																	(
																		_,
																		i
																	) => (
																		<Star
																			key={
																				i
																			}
																			className={`h-3 w-3 ${
																				i <
																				story.difficulty
																					? "text-secondary fill-secondary"
																					: "text-muted/30"
																			}`}
																		/>
																	)
																)}
															</div>
														</div>
													</div>
													<Button
														disabled={
															story.locked
														}
														variant={
															story.locked
																? "outline"
																: "default"
														}
														asChild={
															!story.locked
														}
													>
														{story.locked ? (
															<>
																<Lock className='h-4 w-4 mr-2' />
																Locked
															</>
														) : (
															<Link
																href={`/read/${story.id}`}
															>
																<Play className='h-4 w-4 mr-2' />
																Start
																Reading
															</Link>
														)}
													</Button>
												</div>
											)
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
									{mockUserProgress.badges.map(
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
