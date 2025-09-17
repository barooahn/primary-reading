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

function MetricCard({ number, label, sublabel, type, avatar }: MetricCardProps) {
	const getBackgroundColor = () => {
		switch (type) {
			case "excellent": return "bg-green-400";
			case "good": return "bg-orange-400";
			case "needs-attention": return "bg-red-400";
			default: return "bg-gray-400";
		}
	};

	const getIcon = () => {
		switch (type) {
			case "excellent": return <CheckCircle className="h-6 w-6 text-white" />;
			case "good": return <Star className="h-6 w-6 text-white" />;
			case "needs-attention": return <AlertCircle className="h-6 w-6 text-white" />;
			default: return <Star className="h-6 w-6 text-white" />;
		}
	};

	return (
		<div className={`${getBackgroundColor()} rounded-2xl p-3 sm:p-4 text-center relative min-h-[100px] sm:min-h-[120px] flex flex-col justify-center transition-all duration-200 hover:scale-105`}>
			{avatar && (
				<div className="absolute top-3 right-3">
					<div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40">
						{getIcon()}
					</div>
				</div>
			)}

			<div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1 drop-shadow-lg">
				{number}
			</div>

			<div className="text-white font-semibold text-xs sm:text-sm drop-shadow-md">
				{label}
			</div>

			{sublabel && (
				<div className="text-white/90 text-xs drop-shadow-sm mt-1">
					{sublabel}
				</div>
			)}
		</div>
	);
}


export default function DashboardPage() {
	const { user } = useAuth();
	const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
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
						{ id: "1", name: "First Story", icon: "📖", color: "blue", earned: true },
						{ id: "2", name: "Week Streak", icon: "🔥", color: "orange", earned: true },
						{ id: "3", name: "Quiz Master", icon: "🏆", color: "gold", earned: false },
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
				<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
					<div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
						<p className="text-gray-600">Loading your reading adventure...</p>
					</div>
				</div>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<div className="overflow-y-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" style={{ height: 'calc(100vh - 70px)' }}>
				<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-4 space-y-4 sm:space-y-6">
					{/* Header */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm gap-3 sm:gap-4">
						<div>
							<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">My Reading Dashboard</h1>
							<p className="text-gray-600 text-sm sm:text-base">
								Welcome back, {displayName}! 🌟
								<br className="sm:hidden" />
								<span className="hidden sm:inline"> </span>
								Keep up the great reading!
							</p>
						</div>

						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
							<div className="flex items-center gap-2 text-sm text-gray-600">
								<Flame className="h-4 w-4 text-orange-500" />
								<span className="font-semibold">{userProgress?.readingStreak || 7} Day Streak</span>
							</div>

							<div className="flex items-center gap-2 text-sm text-gray-600">
								<Crown className="h-4 w-4 text-yellow-500" />
								<span className="font-semibold">Level {userProgress?.level || 3}</span>
							</div>
						</div>
					</div>

					{/* Stats Overview */}
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
						<MetricCard
							number={userProgress?.storiesRead || 15}
							label="Stories Read"
							sublabel="This month"
							type="excellent"
							avatar="true"
						/>

						<MetricCard
							number={Math.round(((userProgress?.correctAnswers || 73) / (userProgress?.questionsAnswered || 89)) * 100)}
							label="Accuracy Rate"
							sublabel={`${userProgress?.correctAnswers || 73}/${userProgress?.questionsAnswered || 89} correct`}
							type="good"
							avatar="true"
						/>

						<MetricCard
							number={userProgress?.readingStreak || 7}
							label="Reading Streak"
							sublabel="Days in a row"
							type="excellent"
							avatar="true"
						/>

						<MetricCard
							number={userProgress?.experiencePoints || 1250}
							label="XP Points"
							sublabel="Experience earned"
							type="good"
							avatar="true"
						/>

						<MetricCard
							number={userProgress?.level || 3}
							label="Reading Level"
							sublabel="Keep growing!"
							type="excellent"
							avatar="true"
						/>
					</div>

					{/* Recent Activity & Achievements */}
					<div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
							<h2 className="text-lg sm:text-xl font-bold text-gray-800">Recent Activity</h2>
							<div className="flex items-center gap-2 text-sm text-gray-600">
								<Clock className="h-4 w-4" />
								Last 7 days
							</div>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
							{/* Achievements & Badges */}
							<div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
								<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
									<Award className="h-5 w-5 text-purple-600" />
									Recent Achievements
								</h3>
								<div className="space-y-3">
									{userProgress?.badges?.map((badge) => (
										<div key={badge.id} className={`flex items-center gap-3 p-3 rounded-xl ${badge.earned ? 'bg-white/80' : 'bg-gray-100/50'}`}>
											<div className={`text-2xl ${badge.earned ? '' : 'grayscale opacity-50'}`}>
												{badge.icon}
											</div>
											<div>
												<div className={`font-medium ${badge.earned ? 'text-gray-800' : 'text-gray-500'}`}>
													{badge.name}
												</div>
												<div className="text-sm text-gray-600">
													{badge.earned ? 'Completed!' : 'In progress...'}
												</div>
											</div>
											{badge.earned && (
												<div className="ml-auto">
													<CheckCircle className="h-5 w-5 text-green-500" />
												</div>
											)}
										</div>
									))}
								</div>
							</div>

							{/* Reading Goals & Progress */}
							<div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
								<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
									<Target className="h-5 w-5 text-blue-600" />
									Reading Goals
								</h3>
								<div className="space-y-4">
									{/* Daily Goal */}
									<div className="bg-white/80 rounded-xl p-4">
										<div className="flex items-center justify-between mb-2">
											<span className="font-medium text-gray-800">Daily Reading</span>
											<span className="text-sm text-gray-600">12/15 min</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div className="bg-blue-500 h-2 rounded-full" style={{width: '80%'}}></div>
										</div>
									</div>

									{/* Weekly Goal */}
									<div className="bg-white/80 rounded-xl p-4">
										<div className="flex items-center justify-between mb-2">
											<span className="font-medium text-gray-800">Weekly Stories</span>
											<span className="text-sm text-gray-600">3/5 stories</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div className="bg-green-500 h-2 rounded-full" style={{width: '60%'}}></div>
										</div>
									</div>

									{/* Monthly Goal */}
									<div className="bg-white/80 rounded-xl p-4">
										<div className="flex items-center justify-between mb-2">
											<span className="font-medium text-gray-800">Monthly XP</span>
											<span className="text-sm text-gray-600">1250/2000 XP</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div className="bg-purple-500 h-2 rounded-full" style={{width: '62.5%'}}></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm">
						<h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
						<Link href="/stories">
							<div className="bg-blue-500 hover:bg-blue-600 rounded-xl p-4 sm:p-5 text-white transition-all duration-200 hover:scale-105 cursor-pointer">
								<div className="flex items-center gap-3 mb-2">
									<BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
									<span className="font-semibold text-sm sm:text-base">Read New Story</span>
								</div>
								<p className="text-blue-100 text-xs sm:text-sm">Discover amazing adventures</p>
							</div>
						</Link>

						<Link href="/create">
							<div className="bg-purple-500 hover:bg-purple-600 rounded-xl p-4 sm:p-5 text-white transition-all duration-200 hover:scale-105 cursor-pointer">
								<div className="flex items-center gap-3 mb-2">
									<Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
									<span className="font-semibold text-sm sm:text-base">Create Story</span>
								</div>
								<p className="text-purple-100 text-xs sm:text-sm">Write your own adventure</p>
							</div>
						</Link>

						<Link href="/progress">
							<div className="bg-green-500 hover:bg-green-600 rounded-xl p-4 sm:p-5 text-white transition-all duration-200 hover:scale-105 cursor-pointer">
								<div className="flex items-center gap-3 mb-2">
									<Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
									<span className="font-semibold text-sm sm:text-base">View Progress</span>
								</div>
								<p className="text-green-100 text-xs sm:text-sm">See your achievements</p>
							</div>
						</Link>
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}