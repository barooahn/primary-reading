"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/auth-context";
import {
	BookOpen,
	Trophy,
	Flame,
	Star,
	Target,
	Crown,
	Sparkles,
	Award,
	Clock,
	AlertCircle,
	CheckCircle,
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

interface MetricCardProps {
	number: string | number;
	label: string;
	sublabel?: string;
	type: "excellent" | "good" | "needs-attention";
	avatar?: string;
}

function MetricCard({
	number,
	label,
	sublabel,
	type,
	avatar,
}: MetricCardProps) {
	const getBackgroundColor = () => {
		switch (type) {
			case "excellent":
				return "bg-student/50 border-2 border-student"; // Student orange - muted
			case "good":
				return "bg-student-secondary/50 border-2 border-student-secondary"; // Student secondary orange - muted
			case "needs-attention":
				return "bg-parent/50 border-2 border-parent"; // Parent blue - muted
			default:
				return "bg-light-gray border-2 border-gray-300"; // Light Gray
		}
	};

	const getIcon = () => {
		switch (type) {
			case "excellent":
				return <CheckCircle className='h-6 w-6 text-student' />;
			case "good":
				return <Star className='h-6 w-6 text-student-secondary' />;
			case "needs-attention":
				return <AlertCircle className='h-6 w-6 text-parent' />;
			default:
				return <Star className='h-6 w-6 text-gray-300' />;
		}
	};

	return (
		<div
			className={`${getBackgroundColor()} rounded-lg p-3 sm:p-4 text-center relative min-h-[90px] sm:min-h-[100px] flex flex-col justify-center shadow-sm`}
		>
			{avatar && (
				<div className='absolute top-3 right-3'>
					<div className='w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40'>
						{getIcon()}
					</div>
				</div>
			)}

			<div className='text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-1 drop-shadow-lg'>
				{number}
			</div>

			<div className='text-gray-900 font-semibold text-xs sm:text-sm drop-shadow-md'>
				{label}
			</div>

			{sublabel && (
				<div className='text-gray-900/90 text-xs drop-shadow-sm mt-1'>
					{sublabel}
				</div>
			)}
		</div>
	);
}

export default function DashboardPage() {
	const { user } = useAuth();
	const [userProgress, setUserProgress] = useState<UserProgress | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);

	const displayName =
		(user?.user_metadata?.display_name as string) ||
		(user?.user_metadata?.name as string) ||
		(user?.user_metadata?.full_name as string) ||
		"Reader";

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setIsLoading(true);

				// Mock data for the educational dashboard
				const mockProgress: UserProgress = {
					level: 3,
					experiencePoints: 1250,
					readingStreak: 7,
					storiesRead: 15,
					questionsAnswered: 89,
					correctAnswers: 73,
					badges: [
						{
							id: "1",
							name: "First Story",
							icon: "📖",
							color: "blue",
							earned: true,
						},
						{
							id: "2",
							name: "Week Streak",
							icon: "🔥",
							color: "orange",
							earned: true,
						},
						{
							id: "3",
							name: "Quiz Master",
							icon: "🏆",
							color: "gold",
							earned: false,
						},
					],
				};

				setUserProgress(mockProgress);
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		if (user) {
			fetchDashboardData();
		}
	}, [user]);

	if (isLoading) {
		return (
			<ProtectedRoute>
				<div className='min-h-screen bg-light-gray/50 flex items-center justify-center'>
					<div className='bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-lg'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-student mx-auto mb-4'></div>
						<p className='text-gray-700'>
							Loading your reading adventure...
						</p>
					</div>
				</div>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<div
				className='bg-light-gray/50 overflow-y-auto relative'
				style={{ height: 'calc(100vh - 80px)' }}
			>
				{/* Background Decoration */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute top-10 left-10 w-32 h-32 bg-student/20 rounded-full blur-3xl animate-pulse" />
					<div className="absolute bottom-10 right-10 w-40 h-40 bg-student-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
					<div className="absolute top-1/2 left-1/4 w-24 h-24 bg-parent/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />
					<div className="absolute top-20 right-1/4 w-28 h-28 bg-student-secondary/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "0.5s" }} />
				</div>

				<div className='max-w-6xl mx-auto px-4 py-3 space-y-3 relative z-10'>
					{/* Header */}
					<div className='bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-sm'>
						<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
							<div>
								<h1 className='text-2xl font-bold text-gray-900'>
									My Reading Dashboard
								</h1>
								<p className='text-gray-600 text-sm'>
									Welcome back, {displayName}! 🌟 Keep up the great reading!
								</p>
							</div>

							<div className='flex items-center gap-4'>
								<div className='flex items-center gap-2 text-sm text-gray-700 bg-student-light px-3 py-1 rounded-full'>
									<Flame className='h-4 w-4 text-student' />
									<span className='font-semibold'>
										{userProgress?.readingStreak || 7} Day Streak
									</span>
								</div>

								<div className='flex items-center gap-2 text-sm text-gray-700 bg-student-secondary/10 px-3 py-1 rounded-full'>
									<Crown className='h-4 w-4 text-student-secondary' />
									<span className='font-semibold'>
										Level {userProgress?.level || 3}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Stats Overview */}
					<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
						<MetricCard
							number={userProgress?.storiesRead || 15}
							label='Stories Read'
							sublabel='This month'
							type='excellent'
							avatar='true'
						/>

						<MetricCard
							number={Math.round(
								((userProgress?.correctAnswers || 73) /
									(userProgress?.questionsAnswered ||
										89)) *
									100
							)}
							label='Accuracy Rate'
							sublabel={`${
								userProgress?.correctAnswers || 73
							}/${
								userProgress?.questionsAnswered || 89
							} correct`}
							type='good'
							avatar='true'
						/>

						<MetricCard
							number={userProgress?.readingStreak || 7}
							label='Reading Streak'
							sublabel='Days in a row'
							type='excellent'
							avatar='true'
						/>

						<MetricCard
							number={
								userProgress?.experiencePoints || 1250
							}
							label='XP Points'
							sublabel='Experience earned'
							type='good'
							avatar='true'
						/>

						<MetricCard
							number={userProgress?.level || 3}
							label='Reading Level'
							sublabel='Keep growing!'
							type='excellent'
							avatar='true'
						/>
					</div>

					{/* Recent Activity & Achievements */}
					<div className='bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-sm'>
						<div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2'>
							<h2 className='text-lg sm:text-xl font-bold text-gray-700'>
								Recent Activity
							</h2>
							<div className='flex items-center gap-2 text-sm text-gray-700'>
								<Clock className='h-4 w-4' />
								Last 7 days
							</div>
						</div>

						<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
							{/* Achievements & Badges */}
							<div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4'>
								<h3 className='text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2'>
									<Award className='h-5 w-5 text-student' />
									Recent Achievements
								</h3>
								<div className='space-y-3'>
									{userProgress?.badges?.map(
										(badge) => (
											<div
												key={badge.id}
												className={`flex items-center gap-3 p-3 rounded-xl ${
													badge.earned
														? "bg-white/90 backdrop-blur-sm"
														: "bg-gray-100/70 backdrop-blur-sm"
												}`}
											>
												<div
													className={`text-2xl ${
														badge.earned
															? ""
															: "grayscale opacity-50"
													}`}
												>
													{badge.icon}
												</div>
												<div>
													<div
														className={`font-medium ${
															badge.earned
																? "text-gray-700"
																: "text-gray-700"
														}`}
													>
														{
															badge.name
														}
													</div>
													<div className='text-sm text-gray-700'>
														{badge.earned
															? "Completed!"
															: "In progress..."}
													</div>
												</div>
												{badge.earned && (
													<div className='ml-auto'>
														<CheckCircle className='h-5 w-5 text-parent' />
													</div>
												)}
											</div>
										)
									)}
								</div>
							</div>

							{/* Reading Goals & Progress */}
							<div className='bg-parent-light rounded-xl p-4'>
								<h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
									<Target className='h-5 w-5 text-parent' />
									Reading Goals
								</h3>
								<div className='space-y-4'>
									{/* Daily Goal */}
									<div className='bg-white/90 backdrop-blur-sm rounded-xl p-3'>
										<div className='flex items-center justify-between mb-2'>
											<span className='font-medium text-gray-700'>
												Daily Reading
											</span>
											<span className='text-sm text-gray-700'>
												12/15 min
											</span>
										</div>
										<div className='w-full bg-gray-200 rounded-full h-2'>
											<div
												className='bg-parent h-2 rounded-full'
												style={{
													width: "80%",
												}}
											></div>
										</div>
									</div>

									{/* Weekly Goal */}
									<div className='bg-white/90 backdrop-blur-sm rounded-xl p-3'>
										<div className='flex items-center justify-between mb-2'>
											<span className='font-medium text-gray-700'>
												Weekly Stories
											</span>
											<span className='text-sm text-gray-700'>
												3/5 stories
											</span>
										</div>
										<div className='w-full bg-gray-200 rounded-full h-2'>
											<div
												className='bg-student h-2 rounded-full'
												style={{
													width: "60%",
												}}
											></div>
										</div>
									</div>

									{/* Monthly Goal */}
									<div className='bg-white/90 backdrop-blur-sm rounded-xl p-3'>
										<div className='flex items-center justify-between mb-2'>
											<span className='font-medium text-gray-700'>
												Monthly XP
											</span>
											<span className='text-sm text-gray-700'>
												1250/2000 XP
											</span>
										</div>
										<div className='w-full bg-gray-200 rounded-full h-2'>
											<div
												className='bg-student-secondary h-2 rounded-full'
												style={{
													width: "62.5%",
												}}
											></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Quick Actions */}
					<div className='bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-sm'>
						<h2 className='text-xl font-bold text-gray-900 mb-4'>
							Quick Actions
						</h2>
						<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
							<Link href='/stories'>
								<div className='bg-parent hover:bg-parent-hover rounded-xl p-4 text-white transition-all duration-200 hover:scale-105 cursor-pointer'>
									<div className='flex items-center gap-3 mb-2'>
										<BookOpen className='h-6 w-6' />
										<span className='font-semibold'>
											Read New Story
										</span>
									</div>
									<p className='text-white/90 text-sm'>
										Discover amazing adventures
									</p>
								</div>
							</Link>

							<Link href='/create'>
								<div className='bg-student hover:bg-student-hover rounded-xl p-4 text-white transition-all duration-200 hover:scale-105 cursor-pointer'>
									<div className='flex items-center gap-3 mb-2'>
										<Sparkles className='h-6 w-6' />
										<span className='font-semibold'>
											Create Story
										</span>
									</div>
									<p className='text-white/90 text-sm'>
										Write your own adventure
									</p>
								</div>
							</Link>

							<Link href='/progress'>
								<div className='bg-student-secondary hover:bg-student-secondary/90 rounded-xl p-4 text-white transition-all duration-200 hover:scale-105 cursor-pointer'>
									<div className='flex items-center gap-3 mb-2'>
										<Trophy className='h-6 w-6' />
										<span className='font-semibold'>
											View Progress
										</span>
									</div>
									<p className='text-white/90 text-sm'>
										See your achievements
									</p>
								</div>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}
