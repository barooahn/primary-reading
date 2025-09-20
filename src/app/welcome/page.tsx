"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Star, ShieldCheck, Heart, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChildProfiles } from "@/hooks/use-child-profiles";
import { useAuth } from "@/contexts/auth-context";

export default function WelcomePage() {
	const [selectedRole, setSelectedRole] = useState<"parent" | "child" | null>(null);
	const [isCheckingProfiles, setIsCheckingProfiles] = useState(false);
	const router = useRouter();
	const { user } = useAuth();
	const { fetchChildProfiles } = useChildProfiles();

	const handleStartReading = async () => {
		if (!user) {
			// If not authenticated, redirect to login
			router.push("/login?role=student");
			return;
		}

		setIsCheckingProfiles(true);
		try {
			const profiles = await fetchChildProfiles();

			if (profiles.length === 0) {
				// No child profiles exist, redirect to parent setup flow with a helpful message
				router.push("/parent-setup?message=Please create a child profile before students can start reading&required=true");
			} else {
				// Child profiles exist, proceed to student login
				router.push("/login?role=student");
			}
		} catch (error) {
			console.error("Error checking child profiles:", error);
			// On error, redirect to parent setup to be safe
			router.push("/parent-setup?message=Please ensure you have set up a child profile&required=true");
		} finally {
			setIsCheckingProfiles(false);
		}
	};

	return (
		<div className="min-h-[calc(100vh-5rem)] min-h-[calc(100dvh-5rem)] bg-gradient-to-br from-light-gray/30 via-student/5 to-student-secondary/10 flex items-center justify-center overflow-hidden p-3 md:p-6">
			{/* Background decoration */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-student-secondary/20 to-student/20 rounded-full blur-3xl" />
				<div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-parent/20 to-parent/10 rounded-full blur-3xl" />
				<div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-parent/20 to-parent/10 rounded-full blur-2xl" />
			</div>

			<div className="container mx-auto max-w-6xl relative z-10 w-full py-4 md:py-8">
				{!selectedRole ? (
					/* Role Selection Screen */
					<div className="text-center space-y-4 md:space-y-6">
						{/* Header */}
						<div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
							<div className="flex items-center justify-center space-x-2 mb-3 md:mb-4">
								<BookOpen className="h-6 w-6 md:h-8 md:w-8 text-student" />
								<h1 className="text-2xl md:text-3xl lg:text-4xl font-black font-heading bg-gradient-to-r from-student to-student-secondary bg-clip-text text-transparent">
									PrimaryReading
								</h1>
							</div>
							<h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 leading-tight px-2">
								Welcome to Your Reading Adventure! 🌟
							</h2>
							<p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto px-2">
								Choose your role to get started with the perfect reading experience
							</p>
						</div>

						{/* Role Selection Cards */}
						<div className="grid md:grid-cols-2 gap-3 md:gap-6 max-w-4xl mx-auto px-1 sm:px-0">
							{/* Parent/Teacher Card */}
							<Card
								className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 hover:border-parent bg-white/95 backdrop-blur-sm"
								onClick={() => setSelectedRole("parent")}
							>
								<CardHeader className="text-center p-4 md:p-6">
									<div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-parent-light rounded-full flex items-center justify-center mb-2 md:mb-3 group-hover:bg-parent/20 transition-colors">
										<Users className="h-7 w-7 md:h-10 md:w-10 text-parent" />
									</div>
									<CardTitle className="text-lg md:text-2xl text-parent mb-1 md:mb-2">I&apos;m a Parent/Teacher</CardTitle>
									<CardDescription className="text-sm md:text-base text-text-secondary">
										Set up reading levels and manage children&apos;s accounts
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-2 md:space-y-3 px-4 md:px-6 pb-4 md:pb-6">
									<div className="space-y-2 text-sm text-gray-700">
										<div className="flex items-center space-x-2">
											<ShieldCheck className="h-4 w-4 text-parent" />
											<span>Control age-appropriate content</span>
										</div>
										<div className="flex items-center space-x-2">
											<Star className="h-4 w-4 text-parent" />
											<span>Track reading progress</span>
										</div>
										<div className="flex items-center space-x-2">
											<Heart className="h-4 w-4 text-parent" />
											<span>Create safe reading environment</span>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Child Card */}
							<Card
								className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 hover:border-student bg-white/95 backdrop-blur-sm"
								onClick={() => setSelectedRole("child")}
							>
								<CardHeader className="text-center p-4 md:p-6">
									<div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-student-light rounded-full flex items-center justify-center mb-2 md:mb-3 group-hover:bg-student/20 transition-colors">
										<Sparkles className="h-7 w-7 md:h-10 md:w-10 text-student" />
									</div>
									<CardTitle className="text-lg md:text-2xl text-student mb-1 md:mb-2">I&apos;m a Student</CardTitle>
									<CardDescription className="text-sm md:text-base text-text-secondary">
										Start reading amazing stories made just for you!
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-2 md:space-y-3 px-4 md:px-6 pb-4 md:pb-6">
									<div className="space-y-2 text-sm text-gray-700">
										<div className="flex items-center space-x-2">
											<BookOpen className="h-4 w-4 text-student" />
											<span>Fun interactive stories</span>
										</div>
										<div className="flex items-center space-x-2">
											<Star className="h-4 w-4 text-student-secondary" />
											<span>Reading games & rewards</span>
										</div>
										<div className="flex items-center space-x-2">
											<Sparkles className="h-4 w-4 text-student" />
											<span>AI-generated adventures</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Features Preview */}
						<div className="mt-6 md:mt-8 max-w-4xl mx-auto px-2">
							<h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
								Why Kids Love PrimaryReading ✨
							</h3>
							<div className="grid md:grid-cols-3 gap-3 md:gap-4 text-center">
								<div className="space-y-1">
									<div className="text-3xl">🎨</div>
									<h4 className="font-medium">Beautiful Stories</h4>
									<p className="text-sm text-text-secondary">AI-generated illustrations that bring stories to life</p>
								</div>
								<div className="space-y-1">
									<div className="text-3xl">🎯</div>
									<h4 className="font-medium">Perfect Level</h4>
									<p className="text-sm text-text-secondary">Content matched to your exact reading ability</p>
								</div>
								<div className="space-y-1">
									<div className="text-3xl">🏆</div>
									<h4 className="font-medium">Fun Learning</h4>
									<p className="text-sm text-text-secondary">Comprehension questions that feel like games</p>
								</div>
							</div>
						</div>
					</div>
				) : selectedRole === "parent" ? (
					/* Parent/Teacher Setup Screen */
					<div className="max-w-2xl mx-auto text-center space-y-4 md:space-y-6 px-3 sm:px-4">
						<div className="space-y-2 md:space-y-3">
							<div className="mx-auto w-12 h-12 md:w-14 md:h-14 bg-parent-light rounded-full flex items-center justify-center mb-2 md:mb-3">
								<Users className="h-6 w-6 md:h-8 md:w-8 text-parent" />
							</div>
							<h2 className="text-xl md:text-2xl font-bold text-gray-900">Parent/Teacher Setup</h2>
							<p className="text-sm md:text-base text-text-secondary px-2">
								Create a safe and controlled reading environment for your children or students
							</p>
						</div>

						<Card className="text-left">
							<CardHeader className="p-4 md:p-6">
								<CardTitle className="text-lg md:text-xl">Getting Started</CardTitle>
								<CardDescription className="text-sm md:text-base">
									You&apos;ll be able to set up reading levels and manage children&apos;s accounts
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
								<div className="space-y-2 md:space-y-3">
									<h3 className="font-semibold text-sm md:text-base">What you can do:</h3>
									<div className="space-y-2 text-xs md:text-sm">
										<div className="flex items-start space-x-3">
											<ShieldCheck className="h-5 w-5 text-parent mt-0.5" />
											<div>
												<p className="font-medium">Set Reading Levels</p>
												<p className="text-text-secondary">Control what content is appropriate for each child&apos;s age and ability</p>
											</div>
										</div>
										<div className="flex items-start space-x-3">
											<Star className="h-5 w-5 text-parent mt-0.5" />
											<div>
												<p className="font-medium">Track Progress</p>
												<p className="text-text-secondary">Monitor reading achievements and comprehension scores</p>
											</div>
										</div>
										<div className="flex items-start space-x-3">
											<Heart className="h-5 w-5 text-parent mt-0.5" />
											<div>
												<p className="font-medium">Manage Multiple Children</p>
												<p className="text-text-secondary">Create profiles for multiple students or children</p>
											</div>
										</div>
									</div>
								</div>

								<div className="bg-parent-light p-3 md:p-4 rounded-lg border border-parent-border">
									<h3 className="font-semibold text-parent mb-2 text-sm md:text-base">Professional Features:</h3>
									<div className="space-y-2 text-xs md:text-sm text-gray-700">
										<div className="flex items-center space-x-2">
											<span className="text-lg">📊</span>
											<span>Detailed progress analytics and reports</span>
										</div>
										<div className="flex items-center space-x-2">
											<span className="text-lg">🔒</span>
											<span>Safe, controlled reading environment</span>
										</div>
										<div className="flex items-center space-x-2">
											<span className="text-lg">👥</span>
											<span>Multi-child/student management dashboard</span>
										</div>
									</div>
								</div>

								<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
									<Button
										variant="outline"
										onClick={() => setSelectedRole(null)}
										className="flex-1 border-parent text-parent hover:bg-parent hover:text-white h-11 md:h-10 text-sm md:text-base"
									>
										← Back
									</Button>
									<Button
										asChild
										className="flex-1 bg-parent hover:bg-parent-hover active:bg-parent-active focus:bg-parent focus:ring-parent/50 text-white border-parent h-11 md:h-10 text-sm md:text-base"
									>
										<Link href="/parent-setup">Continue Setup</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				) : (
					/* Child Login Screen */
					<div className="max-w-2xl mx-auto text-center space-y-4 md:space-y-6 px-3 sm:px-4">
						<div className="space-y-2 md:space-y-3">
							<div className="mx-auto w-12 h-12 md:w-14 md:h-14 bg-student-light rounded-full flex items-center justify-center mb-2 md:mb-3">
								<Sparkles className="h-6 w-6 md:h-8 md:w-8 text-student" />
							</div>
							<h2 className="text-xl md:text-2xl font-bold text-gray-900">Ready to Read! 📚</h2>
							<p className="text-sm md:text-base text-text-secondary px-2">
								Let&apos;s start your reading adventure with stories made just for you
							</p>
						</div>

						<Card className="text-left">
							<CardHeader className="p-4 md:p-6">
								<CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
									<BookOpen className="h-4 w-4 md:h-5 md:w-5 text-primary" />
									<span>Student Access</span>
								</CardTitle>
								<CardDescription className="text-sm md:text-base">
									Log in to start reading amazing stories
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
								<div className="bg-student-light p-3 md:p-4 rounded-lg border border-student-border">
									<h3 className="font-semibold text-student mb-2 text-sm md:text-base">What&apos;s waiting for you:</h3>
									<div className="space-y-2 text-xs md:text-sm text-gray-700">
										<div className="flex items-center space-x-2">
											<span className="text-lg">🎨</span>
											<span>Beautiful illustrated stories</span>
										</div>
										<div className="flex items-center space-x-2">
											<span className="text-lg">🎯</span>
											<span>Stories perfect for your reading level</span>
										</div>
										<div className="flex items-center space-x-2">
											<span className="text-lg">🏆</span>
											<span>Fun questions and reading rewards</span>
										</div>
									</div>
								</div>

								<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
									<Button
										variant="outline"
										onClick={() => setSelectedRole(null)}
										className="flex-1 h-11 md:h-10 text-sm md:text-base"
										disabled={isCheckingProfiles}
									>
										← Back
									</Button>
									<Button
										onClick={handleStartReading}
										disabled={isCheckingProfiles}
										className="flex-1 bg-student hover:bg-student-hover active:bg-student-active focus:bg-student focus:ring-student/50 text-white border-student h-11 md:h-10 text-sm md:text-base"
									>
										{isCheckingProfiles ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin mr-2" />
												Checking...
											</>
										) : (
											"Start Reading!"
										)}
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}