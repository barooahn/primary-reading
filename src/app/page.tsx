"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	BookOpen,
	Sparkles,
	Trophy,
	Zap,
	Heart,
	Star,
	ArrowRight,
	Play,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { AuthRedirectHandler } from "@/components/auth/auth-redirect-handler";
import { useAuth } from "@/contexts/auth-context";
import { OptimizedImage, HeroImage, StoryImage } from "@/components/ui/optimized-image";

interface Story {
	id: string;
	title: string;
	description?: string;
	genre?: string;
	reading_level?: string;
	estimated_reading_time?: number;
	cover_thumbnail_url?: string;
	cover_image_url?: string;
	is_featured?: boolean;
	total_reads?: number;
	average_rating?: number;
	created_at?: string;
}

export default function Home() {
	const { user } = useAuth();
	const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
	const [latestStories, setLatestStories] = useState<Story[]>([]);
	const [trendingStories, setTrendingStories] = useState<Story[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentSlide, setCurrentSlide] = useState(0);

	// Redirect non-authenticated users to welcome page
	useEffect(() => {
		if (!user) {
			window.location.href = '/welcome';
		}
	}, [user]);

	useEffect(() => {
		if (!user) return; // Don't load stories if not authenticated

		const loadStories = async () => {
			try {
				setLoading(true);
				const response = await fetch("/api/stories?limit=20", {
					credentials: "include",
				});

				if (response.ok) {
					const data = await response.json();
					if (data.success && data.stories) {
						const stories = data.stories;

						// Filter and categorize stories
						const featured = stories
							.filter((s: Story) => s.is_featured)
							.slice(0, 6);
						const latest = stories.slice(0, 10);
						const trending = stories
							.filter(
								(s: Story) =>
									s.total_reads && s.total_reads > 0
							)
							.slice(0, 8);

						setFeaturedStories(featured);
						setLatestStories(latest);
						setTrendingStories(trending);
					}
				}
			} catch (error) {
				console.error("Failed to load stories:", error);
			} finally {
				setLoading(false);
			}
		};

		loadStories();
	}, [user]);

	// Auto-advance carousel
	useEffect(() => {
		if (featuredStories.length > 1) {
			const timer = setInterval(() => {
				setCurrentSlide(
					(prev) => (prev + 1) % featuredStories.length
				);
			}, 5000);
			return () => clearInterval(timer);
		}
	}, [featuredStories.length]);

	const StoryCard = ({
		story,
		size = "normal",
	}: {
		story: Story;
		size?: "normal" | "large";
	}) => (
		<div
			className={`group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border-2 border-gray-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:border-gray-300/70 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-3 ${
				size === "large" ? "min-h-[320px]" : "min-h-[280px]"
			}`}
		>
			{/* Image Container */}
			<div className='relative overflow-hidden rounded-t-3xl'>
				<StoryImage
					src={
						story.cover_thumbnail_url ||
						story.cover_image_url ||
						"/placeholder.svg"
					}
					alt={story.title}
					width={size === "large" ? 400 : 300}
					height={size === "large" ? 220 : 180}
					className={`w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 ${
						size === "large" ? "h-52" : "h-44"
					}`}
				/>

				{/* Gradient Overlay */}
				<div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300' />

				{/* Ello-Style Featured Badge */}
				{story.is_featured && (
					<div className='absolute top-4 left-4 bg-gradient-to-r from-teal-400 to-teal-500 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm border border-teal-300/30'>
						<Star className='h-3 w-3 fill-current' />
						FEATURED
					</div>
				)}

				{/* Ello-Style Action Button */}
				<div className='absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0'>
					<Link href={`/read/${story.id}`}>
						<div className='w-14 h-14 bg-teal-500/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl hover:bg-teal-500 hover:scale-110 transition-all duration-200 border-2 border-teal-400/50'>
							<Play className='h-6 w-6 text-white ml-0.5' />
						</div>
					</Link>
				</div>
			</div>

			{/* Content */}
			<div className='p-5'>
				<h3 className='font-bold text-lg mb-3 text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors duration-300 leading-tight font-heading'>
					{story.title?.replace(/\*\*/g, "") || "Untitled Story"}
				</h3>

				{/* Meta Info */}
				<div className='flex items-center justify-between mb-4'>
					{story.genre && (
						<span className='bg-gradient-to-r from-teal-100/80 to-cyan-100/80 text-teal-700 px-3 py-1.5 rounded-2xl text-xs font-bold border border-teal-200/60'>
							{story.genre}
						</span>
					)}
					{story.estimated_reading_time && (
						<span className='text-xs text-text-muted font-medium bg-gray-100 px-2 py-1 rounded-lg'>
							{story.estimated_reading_time} min
						</span>
					)}
				</div>

				{/* Rating */}
				{story.average_rating && story.average_rating > 0 && (
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-1'>
							{Array.from({ length: 5 }).map((_, i) => (
								<Star
									key={i}
									className={`h-4 w-4 ${
										i <
										Math.floor(
											story.average_rating!
										)
											? "text-amber-400 fill-current"
											: "text-gray-300"
									}`}
								/>
							))}
						</div>
						<span className='text-xs text-text-muted font-medium'>
							({story.total_reads || 0})
						</span>
					</div>
				)}
			</div>

			{/* Subtle bottom border accent */}
			<div className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left' />
		</div>
	);

	return (
		<>
			<AuthRedirectHandler />
			{/* Full Viewport Hero Section with Arc Layout */}
			<section className='relative hero-arc-layout bg-white overflow-hidden' aria-label="Welcome to PrimaryReading - AI-powered reading adventures for children">
				{/* Hero Background Image - Desktop */}
				<div
					className='absolute inset-0 hidden md:block'
					style={{ zIndex: 5 }}
				>
					<div className='absolute inset-0 flex items-start justify-center pt-8'>
						<HeroImage
							src='/images/hero.webp'
							alt='Hero Gaming Elements'
							width={1200}
							height={600}
							className='opacity-90'
							style={{
								objectFit: "contain",
							}}
							priority={true}
						/>
					</div>
				</div>

				{/* Hero Background Images - Mobile */}
				<div
					className='absolute inset-0 md:hidden'
					style={{ zIndex: 5 }}
				>
					{/* Top floating images - kept minimal and high */}
					<div className='absolute top-10 left-4 w-32 h-32 animate-float'>
						<OptimizedImage
							src='/images/space-rocket-ship.webp'
							alt='Space Adventure'
							width={200}
							height={200}
							className='drop-shadow-lg'
							style={{ objectFit: "contain" }}
							loading="lazy"
						/>
					</div>
					<div className='absolute top-10 right-6 w-32 h-32 animate-float-delayed'>
						<OptimizedImage
							src='/images/magical-unicorn.webp'
							alt='Magical Adventure'
							width={200}
							height={200}
							className='drop-shadow-lg'
							style={{ objectFit: "contain" }}
							loading="lazy"
						/>
					</div>
					<div className='absolute bottom-28 left-8 w-32 h-32 animate-bounce-slow'>
						<OptimizedImage
							src='/images/fairy-character.webp'
							alt='Fairy Tale'
							width={200}
							height={200}
							className='drop-shadow-md'
							style={{ objectFit: "contain" }}
							loading="lazy"
						/>
					</div>
					<div className='absolute bottom-28 right-8 w-32 h-32 animate-bounce-slow'>
						<OptimizedImage
							src='/images/hero-robot-character.webp'
							alt='Robot Adventure'
							width={200}
							height={200}
							className='drop-shadow-md'
							style={{ objectFit: "contain" }}
							loading="lazy"
						/>
					</div>
				</div>

				{/* Text Content - Bottom positioned */}
				<div className='absolute inset-0 flex items-center justify-center pt-16 z-10'>
					<div className='px-4 pb-20'>
						<div
							className='text-center transform transition-all duration-1000 ease-out bg-white/70 backdrop-blur-md border-2 border-gray-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.1)] rounded-3xl px-6 py-8 md:px-8 md:py-10 max-w-2xl mx-auto'
							style={{
								animation:
									"heroContentSlide 1.2s ease-out",
							}}
						>
							{/* Brand-Aligned Badge */}
							<div className='inline-flex items-center space-x-3 px-8 py-4 rounded-3xl bg-white/80 backdrop-blur-xl border-2 border-gray-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.1)] mb-8 hover:scale-105 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]'>
								<div className='w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full animate-pulse' />
								<Sparkles className='h-5 w-5 text-blue-600' />
								<span className='text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent'>
									AI-Powered Reading Adventures
								</span>
							</div>

							{/* Brand-Aligned Typography */}
							<h1 className='text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1] font-heading'>
								<span className='text-gray-900'>
									Reading Made
								</span>
								<br />
								<span className='bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 bg-clip-text text-transparent relative'>
									Fun & Exciting!
									<div className='absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/30 via-purple-500/30 to-pink-500/30 rounded-full' />
								</span>
							</h1>

							<p className='text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed mb-10 font-medium'>
								Discover amazing stories crafted just
								for you
								<span className='inline-block ml-2 text-2xl animate-bounce'>
									✨
								</span>
							</p>

							{/* Brand-Aligned CTA Buttons */}
							<div className='flex flex-col sm:flex-row gap-6 justify-center items-center'>
								<Link
									href={
										user ? "/dashboard" : "/welcome"
									}
									aria-label={user ? "Continue to your reading dashboard" : "Get started with PrimaryReading"}
								>
									<button className='group relative px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 overflow-hidden border-2 border-blue-400/30' aria-describedby="primary-cta-description">
										<div className='absolute inset-0 bg-gradient-to-r from-blue-400/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
										<div className='relative flex items-center gap-3'>
											<Play className='h-6 w-6 group-hover:scale-110 transition-transform duration-200' aria-hidden="true" />
											{user
												? "Continue Reading"
												: "Get Started"}
										</div>
									</button>
								</Link>

								<Link href='/stories' aria-label="Browse our library of reading adventures">
									<button className='group px-10 py-5 bg-white/80 backdrop-blur-xl border-2 border-gray-200/60 text-blue-700 font-bold text-lg rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:bg-white/90 hover:border-gray-300/70' aria-describedby="browse-library-description">
										<div className='flex items-center gap-3'>
											<BookOpen className='h-6 w-6 group-hover:scale-110 transition-transform duration-200 text-blue-600' aria-hidden="true" />
											Browse Library
										</div>
									</button>
								</Link>
							</div>

							{/* Screen reader descriptions */}
							<div className="sr-only">
								<div id="primary-cta-description">
									{user
										? "Access your personalized reading dashboard with your stories and progress"
										: "Start your AI-powered reading adventure with personalized stories for children"
									}
								</div>
								<div id="browse-library-description">
									Explore our collection of engaging stories for young readers
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Featured Stories Carousel */}
			{!loading && featuredStories.length > 0 && (
				<section className='py-16 px-4' aria-label="Featured Stories Collection">
					<div className='container mx-auto max-w-7xl'>
						<div className='relative mt-16'>
							<div className='flex items-center justify-between mb-8'>
								<div>
									<h2 className='text-3xl md:text-4xl font-black text-gray-900 mb-2' id="featured-stories-heading">
										✨ Featured Stories
									</h2>
									<p className='text-text-secondary font-medium'>
										Handpicked adventures for you
									</p>
								</div>
								<div className='flex gap-3' role="group" aria-label="Featured stories carousel controls">
									<button
										onClick={() =>
											setCurrentSlide((prev) =>
												prev === 0
													? featuredStories.length -
													  1
													: prev - 1
											)
										}
										className='p-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-0.5'
										aria-label="Previous featured stories"
										aria-describedby="featured-stories-heading"
									>
										<ChevronLeft className='h-5 w-5 text-gray-700' aria-hidden="true" />
									</button>
									<button
										onClick={() =>
											setCurrentSlide(
												(prev) =>
													(prev + 1) %
													featuredStories.length
											)
										}
										className='p-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-0.5'
										aria-label="Next featured stories"
										aria-describedby="featured-stories-heading"
									>
										<ChevronRight className='h-5 w-5 text-gray-700' aria-hidden="true" />
									</button>
								</div>
							</div>
							<div className='relative'>
								<div
									className='flex transition-transform duration-700 ease-out'
									style={{
										transform: `translateX(-${
											currentSlide * 100
										}%)`,
									}}
								>
									{featuredStories.map(
										(story, index) => (
											<div
												key={story.id}
												className='min-w-full'
											>
												<div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2'>
													{featuredStories
														.slice(
															index *
																4,
															(index +
																1) *
																4
														)
														.map(
															(
																story
															) => (
																<StoryCard
																	key={
																		story.id
																	}
																	story={
																		story
																	}
																	size='large'
																/>
															)
														)}
												</div>
											</div>
										)
									)}
								</div>
							</div>

							{/* Modern Carousel indicators */}
							<div className='flex justify-center space-x-3 mt-10'>
								{Array.from({
									length: Math.ceil(
										featuredStories.length / 4
									),
								}).map((_, index) => (
									<button
										key={index}
										onClick={() =>
											setCurrentSlide(index)
										}
										className={`h-2 rounded-full transition-all duration-300 ${
											currentSlide === index
												? "w-8 bg-gradient-to-r from-primary to-purple-500 shadow-lg"
												: "w-3 bg-gray-300 hover:bg-gray-400"
										}`}
									/>
								))}
							</div>
						</div>
					</div>
				</section>
			)}

			{/* Latest Stories Section */}
			{!loading && latestStories.length > 0 && (
				<section className='py-16 px-4 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 relative overflow-hidden'>
					{/* Background Pattern */}
					<div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.05),transparent_70%)]' />

					<div className='container mx-auto max-w-7xl relative z-10'>
						<div className='flex items-center justify-between mb-12'>
							<div>
								<h2 className='text-3xl md:text-4xl font-black text-gray-900 mb-3'>
									📚 Latest Stories
								</h2>
								<p className='text-text-secondary font-medium text-lg'>
									Fresh adventures just added!
								</p>
							</div>
							<Link href='/stories'>
								<button className='hidden sm:flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl border border-white/20 text-gray-700 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5'>
									View All
									<ArrowRight className='h-4 w-4' />
								</button>
							</Link>
						</div>
						<div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8'>
							{latestStories.slice(0, 10).map((story) => (
								<StoryCard
									key={story.id}
									story={story}
								/>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Trending Stories Section */}
			{!loading && trendingStories.length > 0 && (
				<section className='py-16 px-4 bg-gradient-to-br from-slate-50 via-emerald-50/50 to-teal-50/30 relative overflow-hidden'>
					{/* Background Pattern */}
					<div className='absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.05),transparent_70%)]' />

					<div className='container mx-auto max-w-7xl relative z-10'>
						<div className='flex items-center justify-between mb-12'>
							<div>
								<h2 className='text-3xl md:text-4xl font-black text-gray-900 mb-3'>
									🔥 Popular Stories
								</h2>
								<p className='text-text-secondary font-medium text-lg'>
									What everyone&apos;s reading right
									now
								</p>
							</div>
							<Link href='/stories'>
								<button className='hidden sm:flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl border border-white/20 text-gray-700 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5'>
									View All
									<ArrowRight className='h-4 w-4' />
								</button>
							</Link>
						</div>
						<div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
							{trendingStories.slice(0, 8).map((story) => (
								<StoryCard
									key={story.id}
									story={story}
								/>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Modern Features Section */}
			<section className='py-20 px-4 bg-gradient-to-br from-slate-50 via-orange-50/30 to-yellow-50/20 relative overflow-hidden'>
				{/* Background Elements */}
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(251,191,36,0.05),transparent_70%)]' />
				<div className='absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl' />
				<div className='absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-br from-orange-200/20 to-red-200/20 rounded-full blur-3xl' />

				<div className='container mx-auto max-w-6xl relative z-10'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl md:text-5xl font-black text-gray-900 mb-4'>
							🌟 Why Kids Love PrimaryReading
						</h2>
						<p className='text-xl text-text-secondary max-w-2xl mx-auto font-medium'>
							Reading has never been this exciting!
						</p>
					</div>

					<div className='grid md:grid-cols-3 gap-8'>
						{[
							{
								icon: (
									<Sparkles className='h-10 w-10 text-primary' />
								),
								title: "✨ AI Story Magic",
								description:
									"Create personalized stories about dragons, space adventures, detective mysteries, and anything you can imagine!",
								gradient:
									"from-primary/10 to-purple-500/10",
								borderGradient:
									"from-primary/20 to-purple-500/20",
							},
							{
								icon: (
									<Trophy className='h-10 w-10 text-emerald-600' />
								),
								title: "🏆 Reading Rewards",
								description:
									"Earn badges, build reading streaks, level up, and unlock new adventures. Reading becomes as fun as your favorite games!",
								gradient:
									"from-emerald-500/10 to-green-500/10",
								borderGradient:
									"from-emerald-500/20 to-green-500/20",
							},
							{
								icon: (
									<Heart className='h-10 w-10 text-pink-600' />
								),
								title: "❤️ Interactive Fun",
								description:
									"Answer questions, play mini-games, and explore interactive activities that make learning stick and keep you engaged!",
								gradient:
									"from-pink-500/10 to-rose-500/10",
								borderGradient:
									"from-pink-500/20 to-rose-500/20",
							},
						].map((feature, index) => (
							<div
								key={index}
								className='group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2'
							>
								{/* Gradient Background */}
								<div
									className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-500`}
								/>

								<div className='relative p-8 text-center'>
									{/* Icon */}
									<div className='mx-auto w-20 h-20 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500'>
										{feature.icon}
									</div>

									{/* Title */}
									<h3 className='text-2xl font-bold text-gray-900 mb-4 group-hover:scale-105 transition-transform duration-300'>
										{feature.title}
									</h3>

									{/* Description */}
									<p className='text-text-secondary leading-relaxed font-medium'>
										{feature.description}
									</p>
								</div>

								{/* Bottom accent border */}
								<div
									className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.borderGradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center`}
								/>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Popular Themes Section */}
			<section className='py-16 px-4 bg-gradient-to-br from-purple-50 to-pink-50'>
				<div className='container mx-auto max-w-6xl'>
					<div className='text-center space-y-4 mb-12'>
						<h2 className='text-3xl md:text-4xl font-bold'>
							🎯 Choose Your Adventure!
						</h2>
						<p className='text-lg text-text-secondary max-w-2xl mx-auto'>
							What kind of story adventure sounds exciting
							to you?
						</p>
					</div>

					<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
						{[
							{
								name: "🔍 Mystery Detective",
								color: "bg-gradient-to-br from-purple-100 to-purple-50 border-purple-200 hover:from-purple-200 hover:to-purple-100",
							},
							{
								name: "🦕 Dinosaur Adventures",
								color: "bg-gradient-to-br from-green-100 to-green-50 border-green-200 hover:from-green-200 hover:to-green-100",
							},
							{
								name: "🏰 Fantasy & Magic",
								color: "bg-gradient-to-br from-blue-100 to-blue-50 border-blue-200 hover:from-blue-200 hover:to-blue-100",
							},
							{
								name: "😂 Comedy & Humor",
								color: "bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-200 hover:from-yellow-200 hover:to-yellow-100",
							},
							{
								name: "🚀 Space Exploration",
								color: "bg-gradient-to-br from-indigo-100 to-indigo-50 border-indigo-200 hover:from-indigo-200 hover:to-indigo-100",
							},
							{
								name: "🐾 Animal Rescue",
								color: "bg-gradient-to-br from-emerald-100 to-emerald-50 border-emerald-200 hover:from-emerald-200 hover:to-emerald-100",
							},
							{
								name: "🎮 Gaming Quests",
								color: "bg-gradient-to-br from-pink-100 to-pink-50 border-pink-200 hover:from-pink-200 hover:to-pink-100",
							},
							{
								name: "🤖 Robot Adventures",
								color: "bg-gradient-to-br from-slate-100 to-slate-50 border-slate-200 hover:from-slate-200 hover:to-slate-100",
							},
						].map((theme, index) => (
							<div
								key={index}
								className={`p-4 rounded-xl border-2 text-center font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer ${theme.color}`}
							>
								{theme.name}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className='py-20 px-4'>
				<div className='container mx-auto max-w-4xl'>
					<div className='grid md:grid-cols-3 gap-8 text-center'>
						<div className='space-y-2'>
							<div className='text-4xl font-bold text-primary'>
								10,000+
							</div>
							<p className='text-muted'>Stories Created</p>
						</div>
						<div className='space-y-2'>
							<div className='text-4xl font-bold text-success'>
								95%
							</div>
							<p className='text-muted'>Kids Want More</p>
						</div>
						<div className='space-y-2'>
							<div className='text-4xl font-bold text-secondary'>
								2x
							</div>
							<p className='text-muted'>
								Reading Improvement
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Call to Action */}
			<section className='py-16 px-4 bg-gradient-to-br from-primary/10 via-purple-50 to-pink-50'>
				<div className='container mx-auto max-w-4xl text-center space-y-6'>
					<h2 className='text-3xl md:text-4xl font-bold text-gray-800'>
						🌟 Ready for Your Next Adventure?
					</h2>
					<p className='text-lg text-text-secondary max-w-2xl mx-auto'>
						Join thousands of young readers discovering that
						stories can be the best part of their day!
					</p>

					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						<Button
							size='lg'
							className='text-lg px-8 py-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300'
							asChild
						>
							<Link href={user ? "/dashboard" : "/welcome"}>
								<Zap className='h-5 w-5 mr-2' />
								{user
									? "Go to Dashboard"
									: "Get Started Now"}
							</Link>
						</Button>
						<Button
							variant='outline'
							size='lg'
							className='text-lg px-8 py-4 border-2 hover:bg-primary/5'
							asChild
						>
							<Link href='/create'>
								<Sparkles className='h-5 w-5 mr-2' />
								Create Story
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className='py-12 px-4 border-t border-border'>
				<div className='container mx-auto max-w-6xl'>
					<div className='text-center space-y-4'>
						<div className='flex items-center justify-center space-x-2'>
							<BookOpen className='h-6 w-6 text-primary' />
							<span className='text-xl font-bold text-primary'>
								PrimaryReading
							</span>
						</div>
						<p className='text-muted max-w-2xl mx-auto'>
							Making reading fun, exciting, and accessible
							for every child. Built with love for young
							learners everywhere.
						</p>
						<div className='flex justify-center space-x-6 text-sm text-muted'>
							<Link
								href='/privacy'
								className='hover:text-primary transition-colors'
							>
								Privacy
							</Link>
							<Link
								href='/terms'
								className='hover:text-primary transition-colors'
							>
								Terms
							</Link>
							<Link
								href='/support'
								className='hover:text-primary transition-colors'
							>
								Support
							</Link>
							<Link
								href='/educators'
								className='hover:text-primary transition-colors'
							>
								For Educators
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</>
	);
}
