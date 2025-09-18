"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
	Trophy,
	Star,
	Flame,
	BookOpen,
	Target,
	TrendingUp,
	Crown,
	BarChart3,
	Clock,
} from "lucide-react";

// Mock user progress data
const mockUserProgress = {
	level: 3,
	experiencePoints: 1250,
	nextLevelXP: 1500,
	readingStreak: 7,
	longestStreak: 14,
	totalStoriesRead: 23,
	totalTimeReading: 180, // minutes
	questionsAnswered: 156,
	correctAnswers: 142,
	averageScore: 91,
	favoriteGenres: ["Mystery", "Adventure", "Science Fiction"],
	readingGoal: {
		storiesPerWeek: 5,
		currentWeekProgress: 3,
	},
};

export default function ProgressPage() {
	const [selectedTab, setSelectedTab] = useState<
		"overview" | "badges" | "stats" | "goals"
	>("overview");

	const xpProgress =
		(mockUserProgress.experiencePoints / mockUserProgress.nextLevelXP) *
		100;

	return (
		<ProtectedRoute>
			<div className='min-h-screen bg-background'>
				<main className='container mx-auto px-4 py-8'>
					<div className='mb-8'>
						<h1 className='text-3xl font-bold mb-2'>
							Your Reading Progress
						</h1>
						<p className='text-muted'>
							Track your reading journey and achievements
						</p>
					</div>

					{/* Level Progress */}
					<Card className='mb-8 bg-gradient-to-r from-[#EF7722]/10 to-[#FAA533]/10 border-[#EF7722]/30'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between mb-4'>
								<div className='flex items-center space-x-4'>
									<div className='p-3 bg-[#EF7722]/20 rounded-full'>
										<Crown className='h-8 w-8 text-[#EF7722]' />
									</div>
									<div>
										<h2 className='text-2xl font-bold'>
											Level{" "}
											{mockUserProgress.level}{" "}
											Reader
										</h2>
										<p className='text-muted'>
											You&apos;re doing
											amazing! Keep up the
											great work!
										</p>
									</div>
								</div>
								<div className='text-right'>
									<div className='text-sm text-muted mb-1'>
										Experience Points
									</div>
									<div className='text-xl font-bold'>
										{
											mockUserProgress.experiencePoints
										}{" "}
										/{" "}
										{mockUserProgress.nextLevelXP}
									</div>
								</div>
							</div>

							<div className='w-full bg-muted/30 rounded-full h-3 mb-2'>
								<div
									className='bg-gradient-to-r from-[#EF7722] to-[#FAA533] h-3 rounded-full transition-all duration-500'
									style={{ width: `${xpProgress}%` }}
								/>
							</div>
							<div className='text-sm text-muted text-center'>
								{mockUserProgress.nextLevelXP -
									mockUserProgress.experiencePoints}{" "}
								XP until next level
							</div>
						</CardContent>
					</Card>

					{/* Tab Navigation */}
					<Card className='mb-8'>
						<CardHeader>
							<div className='flex space-x-1 bg-muted/20 p-1 rounded-lg w-fit'>
								{[
									{
										key: "overview",
										label: "Overview",
										icon: BarChart3,
									},
									{
										key: "badges",
										label: "Badges",
										icon: Trophy,
									},
									{
										key: "stats",
										label: "Statistics",
										icon: TrendingUp,
									},
									{
										key: "goals",
										label: "Goals",
										icon: Target,
									},
								].map((tab) => (
									<button
										key={tab.key}
										onClick={() =>
											setSelectedTab(
												tab.key as
													| "overview"
													| "badges"
													| "stats"
													| "goals"
											)
										}
										className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
											selectedTab === tab.key
												? "bg-[#EF7722] text-white shadow-sm"
												: "text-muted hover:text-foreground"
										}`}
									>
										<tab.icon className='h-4 w-4' />
										<span>{tab.label}</span>
									</button>
								))}
							</div>
						</CardHeader>
					</Card>

					{/* Overview Tab */}
					{selectedTab === "overview" && (
						<div className='space-y-8'>
							{/* Key Stats */}
							<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
								<Card className='bg-gradient-to-br from-[#EF7722]/10 to-[#EF7722]/5 border-[#EF7722]/30'>
									<CardContent className='p-6'>
										<div className='flex items-center justify-between'>
											<div>
												<p className='text-sm font-medium text-[#EF7722]'>
													Stories Read
												</p>
												<p className='text-3xl font-bold'>
													{
														mockUserProgress.totalStoriesRead
													}
												</p>
											</div>
											<BookOpen className='h-12 w-12 text-[#EF7722]/60' />
										</div>
									</CardContent>
								</Card>

								<Card className='bg-gradient-to-br from-[#FAA533]/10 to-[#FAA533]/5 border-[#FAA533]/30'>
									<CardContent className='p-6'>
										<div className='flex items-center justify-between'>
											<div>
												<p className='text-sm font-medium text-[#FAA533]'>
													Reading Streak
												</p>
												<p className='text-3xl font-bold'>
													{
														mockUserProgress.readingStreak
													}
												</p>
												<p className='text-xs text-muted'>
													days
												</p>
											</div>
											<Flame className='h-12 w-12 text-[#FAA533]/60' />
										</div>
									</CardContent>
								</Card>

								<Card className='bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30'>
									<CardContent className='p-6'>
										<div className='flex items-center justify-between'>
											<div>
												<p className='text-sm font-medium text-green-600'>
													Average Score
												</p>
												<p className='text-3xl font-bold'>
													{
														mockUserProgress.averageScore
													}
													%
												</p>
											</div>
											<Star className='h-12 w-12 text-green-500/60' />
										</div>
									</CardContent>
								</Card>

								<Card className='bg-gradient-to-br from-[#0BA6DF]/10 to-[#0BA6DF]/5 border-[#0BA6DF]/30'>
									<CardContent className='p-6'>
										<div className='flex items-center justify-between'>
											<div>
												<p className='text-sm font-medium text-[#0BA6DF]'>
													Time Reading
												</p>
												<p className='text-3xl font-bold'>
													{
														mockUserProgress.totalTimeReading
													}
												</p>
												<p className='text-xs text-muted'>
													minutes
												</p>
											</div>
											<Clock className='h-12 w-12 text-[#0BA6DF]/60' />
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					)}

					{/* Motivational Card */}
					<Card className='mt-8 bg-gradient-to-r from-green-500/10 to-[#EF7722]/10 border-green-500/30'>
						<CardContent className='p-6 text-center'>
							<Star className='h-12 w-12 text-[#FAA533] mx-auto mb-4' />
							<h3 className='text-xl font-semibold mb-2'>
								You&apos;re An Amazing Reader! 🌟
							</h3>
							<p className='text-muted mb-4'>
								You&apos;ve read{" "}
								{mockUserProgress.totalStoriesRead}{" "}
								stories and maintained a{" "}
								{mockUserProgress.readingStreak}-day
								streak. That&apos;s incredible
								dedication to learning!
							</p>
							<Button asChild>
								<a href='/stories'>
									<BookOpen className='h-4 w-4 mr-2' />
									Read More Stories
								</a>
							</Button>
						</CardContent>
					</Card>
				</main>
			</div>
		</ProtectedRoute>
	);
}
