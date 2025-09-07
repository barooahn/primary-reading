"use client";

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
		image: "/api/placeholder/300/200",
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
		image: "/api/placeholder/300/200",
		tags: ["Technology", "Detective", "Problem Solving"],
	},
];

export default function StoriesPage() {
	const [selectedGenre, setSelectedGenre] = useState("All");
	const [selectedLevel, setSelectedLevel] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [, setDbStories] = useState([]);
	const [, setLoading] = useState(true);

	// Load stories from database
	useEffect(() => {
		loadStoriesFromDatabase();
	}, []);

	const loadStoriesFromDatabase = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/stories?limit=20");
			const data = await response.json();

			if (data.success) {
				setDbStories(data.stories);
			} else {
				console.error("Failed to load stories:", data.error);
			}
		} catch (error) {
			console.error("Failed to load stories:", error);
			// Fallback to empty array for demo purposes
			setDbStories([]);
		} finally {
			setLoading(false);
		}
	};

	// Simple filtering without complex type checking
	const filteredStories = MOCK_STORIES_DATA.filter((story) => {
		const matchesGenre =
			selectedGenre === "All" || story.genre === selectedGenre;
		const matchesLevel =
			selectedLevel === "All" ||
			story.readingLevel === selectedLevel.toLowerCase();
		const matchesSearch =
			story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			story.description
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
				<div className='mb-8 space-y-4'>
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
											{story.estimatedTime} min
											read
										</span>
									</div>

									<div className='flex items-center justify-between'>
										<div className='flex items-center space-x-1'>
											<span className='text-yellow-500'>
												★
											</span>
											<span className='text-sm font-medium'>
												{story.rating}
											</span>
											<span className='text-xs text-muted'>
												({story.totalReads}{" "}
												reads)
											</span>
										</div>
									</div>

									<Button className='w-full' asChild>
										<a href={`/read/${story.id}`}>
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
						<p className='text-muted text-lg'>
							No stories match your search criteria.
						</p>
						<Button
							onClick={() => {
								setSearchQuery("");
								setSelectedGenre("All");
								setSelectedLevel("All");
							}}
							className='mt-4'
						>
							Clear Filters
						</Button>
					</div>
				)}
			</div>
		</>
	);
}
