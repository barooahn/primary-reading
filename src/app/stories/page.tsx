"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

// Tiny base64 placeholder for blur-up effect
const BLUR_DATA_URL =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

// Force dynamic rendering to avoid SSR issues
export const dynamic = "force-dynamic";

// Mock data for stories - moved outside component to prevent hoisting issues
const MOCK_STORIES_DATA = [
	{
		id: "1",
		title: "The Secret Dragon Academy",
		description:
			"Join Maya as she discovers a hidden school for dragon riders and learns to fly with her new dragon friend!",
		genre: "Fantasy",
		readingLevel: "intermediate",
		difficulty: 3,
		estimatedTime: 12,
		isPopular: true,
		isNew: false,
		rating: 4.8,
		totalReads: 1240,
		image: "/placeholder.svg",
		tags: ["Dragons", "Magic", "Adventure", "Friendship"],
	},
	{
		id: "2",
		title: "Detective Pixel's Digital Mystery",
		description:
			"A mysterious computer virus is causing chaos in the digital world. Can Detective Pixel solve the case?",
		genre: "Mystery",
		readingLevel: "intermediate",
		difficulty: 3,
		estimatedTime: 10,
		isPopular: false,
		isNew: true,
		rating: 4.6,
		totalReads: 856,
		image: "/placeholder.svg",
		tags: ["Technology", "Detective", "Problem Solving"],
	},
];

export default function StoriesPage() {
	const [selectedGenre, setSelectedGenre] = useState("All");
	const [selectedLevel, setSelectedLevel] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [dbStories, setDbStories] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [ownerFilter, setOwnerFilter] = useState<"all" | "mine">("all");
	const [message, setMessage] = useState<string | null>(null);

	// Load stories from database
	useEffect(() => {
		loadStoriesFromDatabase();
	}, [ownerFilter]);

	const loadStoriesFromDatabase = async () => {
		try {
			setLoading(true);
			const url = `/api/stories?limit=20${
				ownerFilter === "mine" ? "&user_created_only=true" : ""
			}`;
			const response = await fetch(url, { credentials: "include" });
			if (response.status === 401) {
				setMessage("Please sign in to see your stories.");
				setDbStories([]);
				return;
			}
			const data = await response.json();

			if (data.success) {
				setDbStories(data.stories || []);
				setMessage(null);
			} else {
				console.error("Failed to load stories:", data.error);
				setMessage("Failed to load stories.");
			}
		} catch (error) {
			console.error("Failed to load stories:", error);
			setDbStories([]);
			setMessage("Failed to load stories.");
		} finally {
			setLoading(false);
		}
	};

	// Build display list: prefer DB stories; for "All", fallback to mock data
	const mapDb = (arr: any[]) =>
		arr.map((s: any) => ({
			id: s.id,
			title: (s.title ?? "Untitled").replace(/\*\*/g, "").trim(),
			description: (
				s.description ??
				(typeof s.content === "string"
					? s.content.slice(0, 140) + "..."
					: "")
			)
				.replace(/^\*+\s*/, "")
				.replace(/\*\*/g, "")
				.trim(),
			genre: s.genre ?? "",
			readingLevel: (s.reading_level ?? "").toString(),
			estimatedTime: s.estimated_reading_time ?? 10,
			image:
				s.cover_thumbnail_url ??
				s.cover_image_url ??
				"/placeholder.svg",
			isNew: true,
			isPopular: !!s.is_featured,
			rating: s.average_rating ?? 0,
			totalReads: s.total_reads ?? 0,
		}));

	const displayStories =
		ownerFilter === "mine"
			? dbStories && dbStories.length > 0
				? mapDb(dbStories)
				: []
			: dbStories && dbStories.length > 0
			? mapDb(dbStories)
			: MOCK_STORIES_DATA;

	// Simple filtering without complex type checking
	const filteredStories = displayStories.filter((story: any) => {
		const matchesGenre =
			selectedGenre === "All" || story.genre === selectedGenre;
		const matchesLevel =
			selectedLevel === "All" ||
			story.readingLevel === selectedLevel.toLowerCase();
		const matchesSearch =
			story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			String(story.description || "")
				.toLowerCase()
				.includes(searchQuery.toLowerCase());

		return matchesGenre && matchesLevel && matchesSearch;
	});

	return (
		<>
			<div className='container mx-auto px-4 py-8 max-w-7xl'>
				{/* Header Section */}
				<div className='mb-8'>
					<h1 className='text-4xl font-bold text-center mb-4'>
						Story Library
					</h1>
					<p className='text-xl text-muted text-center max-w-2xl mx-auto'>
						Discover amazing stories tailored for young
						readers. Choose your adventure!
					</p>
				</div>

				{/* Search and Filters */}
				{/* Auth CTA for My stories */}
				{ownerFilter === "mine" && message && (
					<div className='mb-4 p-4 border rounded-lg bg-yellow-50 text-yellow-800 flex items-center justify-between'>
						<span>{message}</span>
						<Button asChild>
							<Link href='/login'>Sign in</Link>
						</Button>
					</div>
				)}
				<div className='mb-8 space-y-4'>
					<div className='flex gap-2'>
						<Button
							variant={
								ownerFilter === "all"
									? "default"
									: "outline"
							}
							onClick={() => setOwnerFilter("all")}
						>
							All stories
						</Button>
						<Button
							variant={
								ownerFilter === "mine"
									? "default"
									: "outline"
							}
							onClick={() => setOwnerFilter("mine")}
						>
							My stories
						</Button>
					</div>
					<div className='flex flex-col md:flex-row gap-4'>
						<div className='flex-1'>
							<input
								type='text'
								placeholder='Search stories...'
								value={searchQuery}
								onChange={(e) =>
									setSearchQuery(e.target.value)
								}
								className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
							/>
						</div>
						<select
							value={selectedGenre}
							onChange={(e) =>
								setSelectedGenre(e.target.value)
							}
							className='px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
						>
							<option value='All'>All Genres</option>
							<option value='Fantasy'>Fantasy</option>
							<option value='Mystery'>Mystery</option>
							<option value='Adventure'>Adventure</option>
							<option value='Science'>Science</option>
						</select>
						<select
							value={selectedLevel}
							onChange={(e) =>
								setSelectedLevel(e.target.value)
							}
							className='px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
						>
							<option value='All'>All Levels</option>
							<option value='beginner'>Beginner</option>
							<option value='intermediate'>
								Intermediate
							</option>
							<option value='advanced'>Advanced</option>
						</select>
					</div>
				</div>

				{/* Stories Grid */}
				{loading ? (
					<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{Array.from({ length: 6 }).map((_, idx) => (
							<Card key={idx} className='overflow-hidden'>
								<div className='w-full h-48 bg-gray-200 animate-pulse' />
								<CardHeader>
									<div className='h-5 w-3/4 bg-gray-200 animate-pulse rounded mb-2' />
									<div className='h-4 w-full bg-gray-200 animate-pulse rounded' />
								</CardHeader>
								<CardContent>
									<div className='h-10 w-full bg-gray-200 animate-pulse rounded' />
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<>
						<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{filteredStories.map((story) => (
								<Card
									key={story.id}
									className='overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105'
								>
									<div className='relative'>
										<Image
											src={story.image}
											alt={story.title}
											width={300}
											height={200}
											className='w-full h-48 object-cover'
											placeholder='blur'
											blurDataURL={
												BLUR_DATA_URL
											}
										/>
										{story.isNew && (
											<div className='absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold'>
												NEW
											</div>
										)}
										{story.isPopular && (
											<div className='absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold'>
												POPULAR
											</div>
										)}
									</div>
									<CardHeader>
										<CardTitle className='text-lg font-semibold text-foreground line-clamp-2'>
											{story.title}
										</CardTitle>
										<CardDescription className='text-muted line-clamp-3'>
											{story.description}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className='space-y-3'>
											<div className='flex items-center justify-between text-sm'>
												<span className='bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium'>
													{story.genre}
												</span>
												<span className='text-muted'>
													{
														story.estimatedTime
													}{" "}
													min read
												</span>
											</div>
											<div className='flex items-center justify-between'>
												<div className='flex items-center space-x-1'>
													<span className='text-yellow-500'>
														★
													</span>
													<span className='text-sm font-medium'>
														{
															story.rating
														}
													</span>
													<span className='text-xs text-muted'>
														(
														{
															story.totalReads
														}{" "}
														reads)
													</span>
												</div>
											</div>
											<Button
												className='w-full'
												asChild
											>
												<a
													href={`/read/${story.id}`}
												>
													Start Reading
												</a>
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
						{filteredStories.length === 0 && (
							<div className='text-center py-12'>
								{ownerFilter === "mine" ? (
									<>
										<p className='text-muted text-lg'>
											You haven’t saved any
											stories yet.
										</p>
										<Button
											asChild
											className='mt-4'
										>
											<Link href='/create'>
												Create a story
											</Link>
										</Button>
									</>
								) : (
									<>
										<p className='text-muted text-lg'>
											No stories match your
											search criteria.
										</p>
										<Button
											onClick={() => {
												setSearchQuery("");
												setSelectedGenre(
													"All"
												);
												setSelectedLevel(
													"All"
												);
											}}
											className='mt-4'
										>
											Clear Filters
										</Button>
									</>
								)}
							</div>
						)}
					</>
				)}
			</div>
		</>
	);
}
