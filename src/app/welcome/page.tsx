"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Star, ShieldCheck, Heart, Sparkles } from "lucide-react";
import Link from "next/link";

export default function WelcomePage() {
	const [selectedRole, setSelectedRole] = useState<"parent" | "child" | null>(null);

	return (
		<div className="h-[calc(100vh-5rem)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center overflow-hidden p-4 md:p-6">
			{/* Background decoration */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl" />
				<div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
				<div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-2xl" />
			</div>

			<div className="container mx-auto max-w-6xl relative z-10 h-full flex flex-col justify-center">
				{!selectedRole ? (
					/* Role Selection Screen */
					<div className="text-center space-y-6">
						{/* Header */}
						<div className="space-y-3 mb-8">
							<div className="flex items-center justify-center space-x-2 mb-4">
								<BookOpen className="h-8 w-8 text-primary" />
								<h1 className="text-3xl md:text-4xl font-black font-heading bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
									PrimaryReading
								</h1>
							</div>
							<h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
								Welcome to Your Reading Adventure! 🌟
							</h2>
							<p className="text-lg text-text-secondary max-w-2xl mx-auto">
								Choose your role to get started with the perfect reading experience
							</p>
						</div>

						{/* Role Selection Cards */}
						<div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto px-2 sm:px-0">
							{/* Parent/Teacher Card */}
							<Card
								className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 hover:border-blue-300 bg-white/95 backdrop-blur-sm"
								onClick={() => setSelectedRole("parent")}
							>
								<CardHeader className="text-center p-6">
									<div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
										<Users className="h-10 w-10 text-blue-600" />
									</div>
									<CardTitle className="text-2xl text-blue-900 mb-2">I&apos;m a Parent/Teacher</CardTitle>
									<CardDescription className="text-base text-text-secondary">
										Set up reading levels and manage children&apos;s accounts
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3 px-6 pb-6">
									<div className="space-y-2 text-sm text-gray-700">
										<div className="flex items-center space-x-2">
											<ShieldCheck className="h-4 w-4 text-green-600" />
											<span>Control age-appropriate content</span>
										</div>
										<div className="flex items-center space-x-2">
											<Star className="h-4 w-4 text-yellow-600" />
											<span>Track reading progress</span>
										</div>
										<div className="flex items-center space-x-2">
											<Heart className="h-4 w-4 text-pink-600" />
											<span>Create safe reading environment</span>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Child Card */}
							<Card
								className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 hover:border-purple-300 bg-white/95 backdrop-blur-sm"
								onClick={() => setSelectedRole("child")}
							>
								<CardHeader className="text-center p-6">
									<div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
										<Sparkles className="h-10 w-10 text-purple-600" />
									</div>
									<CardTitle className="text-2xl text-purple-900 mb-2">I&apos;m a Student</CardTitle>
									<CardDescription className="text-base text-text-secondary">
										Start reading amazing stories made just for you!
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3 px-6 pb-6">
									<div className="space-y-2 text-sm text-gray-700">
										<div className="flex items-center space-x-2">
											<BookOpen className="h-4 w-4 text-blue-600" />
											<span>Fun interactive stories</span>
										</div>
										<div className="flex items-center space-x-2">
											<Star className="h-4 w-4 text-yellow-600" />
											<span>Reading games & rewards</span>
										</div>
										<div className="flex items-center space-x-2">
											<Sparkles className="h-4 w-4 text-pink-600" />
											<span>AI-generated adventures</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Features Preview */}
						<div className="mt-8 max-w-4xl mx-auto">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">
								Why Kids Love PrimaryReading ✨
							</h3>
							<div className="grid md:grid-cols-3 gap-4 text-center">
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
					<div className="max-w-2xl mx-auto text-center space-y-6 px-4 sm:px-0">
						<div className="space-y-3">
							<div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3">
								<Users className="h-8 w-8 text-blue-600" />
							</div>
							<h2 className="text-2xl font-bold text-gray-900">Parent/Teacher Setup</h2>
							<p className="text-base text-text-secondary">
								Create a safe and controlled reading environment for your children or students
							</p>
						</div>

						<Card className="text-left">
							<CardHeader>
								<CardTitle>Getting Started</CardTitle>
								<CardDescription>
									You&apos;ll be able to set up reading levels and manage children&apos;s accounts
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3">
									<h3 className="font-semibold">What you can do:</h3>
									<div className="space-y-2 text-sm">
										<div className="flex items-start space-x-3">
											<ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
											<div>
												<p className="font-medium">Set Reading Levels</p>
												<p className="text-text-secondary">Control what content is appropriate for each child&apos;s age and ability</p>
											</div>
										</div>
										<div className="flex items-start space-x-3">
											<Star className="h-5 w-5 text-yellow-600 mt-0.5" />
											<div>
												<p className="font-medium">Track Progress</p>
												<p className="text-text-secondary">Monitor reading achievements and comprehension scores</p>
											</div>
										</div>
										<div className="flex items-start space-x-3">
											<Heart className="h-5 w-5 text-pink-600 mt-0.5" />
											<div>
												<p className="font-medium">Manage Multiple Children</p>
												<p className="text-text-secondary">Create profiles for multiple students or children</p>
											</div>
										</div>
									</div>
								</div>

								<div className="flex space-x-4">
									<Button
										variant="outline"
										onClick={() => setSelectedRole(null)}
										className="flex-1"
									>
										← Back
									</Button>
									<Button
										asChild
										className="flex-1 bg-blue-600 hover:bg-blue-700"
									>
										<Link href="/parent-setup">Continue Setup</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				) : (
					/* Child Login Screen */
					<div className="max-w-2xl mx-auto text-center space-y-6 px-4 sm:px-0">
						<div className="space-y-3">
							<div className="mx-auto w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-3">
								<Sparkles className="h-8 w-8 text-purple-600" />
							</div>
							<h2 className="text-2xl font-bold text-gray-900">Ready to Read! 📚</h2>
							<p className="text-base text-text-secondary">
								Let&apos;s start your reading adventure with stories made just for you
							</p>
						</div>

						<Card className="text-left">
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<BookOpen className="h-5 w-5 text-primary" />
									<span>Student Access</span>
								</CardTitle>
								<CardDescription>
									Log in to start reading amazing stories
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
									<h3 className="font-semibold text-purple-900 mb-2">What&apos;s waiting for you:</h3>
									<div className="space-y-2 text-sm text-purple-800">
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

								<div className="flex space-x-4">
									<Button
										variant="outline"
										onClick={() => setSelectedRole(null)}
										className="flex-1"
									>
										← Back
									</Button>
									<Button
										asChild
										className="flex-1 bg-purple-600 hover:bg-purple-700"
									>
										<Link href="/login?role=student">Start Reading!</Link>
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