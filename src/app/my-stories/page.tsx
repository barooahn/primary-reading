"use client";
 

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DeleteStoryButton } from "@/components/stories/delete-story-button";
import { StoryWithMetadata } from "@/types/api";
// Tiny base64 placeholder for blur-up effect
const BLUR_DATA_URL =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

export const dynamic = "force-dynamic";

// Helper function to get proper image URL using API
async function getImageUrl(story: any): Promise<string | null> {
	// Check if we have a direct URL first
	if (story.cover_thumbnail_url && isValidUrl(story.cover_thumbnail_url)) {
		return story.cover_thumbnail_url;
	}
	if (story.cover_image_url && isValidUrl(story.cover_image_url)) {
		return story.cover_image_url;
	}
	
	// If we have storage paths, convert to signed URLs via API
	if (story.cover_thumbnail_path) {
		try {
			const response = await fetch('/api/images/url', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ path: story.cover_thumbnail_path })
			});
			const data = await response.json();
			if (data.success && data.url) return data.url;
		} catch (error) {
			console.error('Error getting thumbnail URL:', error);
		}
	}
	
	if (story.cover_image_path) {
		try {
			const response = await fetch('/api/images/url', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ path: story.cover_image_path })
			});
			const data = await response.json();
			if (data.success && data.url) return data.url;
		} catch (error) {
			console.error('Error getting cover URL:', error);
		}
	}
	
	return null;
}

// Helper function to validate URLs
function isValidUrl(str: string): boolean {
	if (!str || typeof str !== 'string') return false;
	try {
		new URL(str);
		return true;
	} catch {
		return false;
	}
}

export default function MyStoriesPage() {
	const [stories, setStories] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);
	const [storyImages, setStoryImages] = useState<Map<string, string | null>>(new Map());

	const loadStories = async () => {
			try {
				setLoading(true);
				const res = await fetch(
					"/api/stories?limit=50&user_created_only=true",
					{ credentials: "include" }
				);
				if (res.status === 401) {
					setMessage("Please sign in to see your stories.");
					setStories([]);
					return;
				}
				const data = await res.json();
				if (data.success) {
					const storiesList = data.stories || [];
					console.log('Loaded stories:', storiesList.map((s: StoryWithMetadata) => ({ id: s.id, title: s.title, created_by: s.created_by })));
					setStories(storiesList);
					setMessage(null);
					
					// Load image URLs for all stories
					const imageMap = new Map<string, string | null>();
					await Promise.all(
						storiesList.map(async (story: any) => {
							const imageUrl = await getImageUrl(story);
							imageMap.set(story.id, imageUrl);
						})
					);
					setStoryImages(imageMap);
				} else {
					setMessage("Failed to load your stories.");
					setStories([]);
				}
			} catch {
				setMessage("Failed to load your stories.");
				setStories([]);
			} finally {
				setLoading(false);
			}
		};

	useEffect(() => {
		loadStories();
	}, []);

	const handleStoryDeleted = () => {
		loadStories(); // Refresh the stories list after deletion
	};

	const displayStories = (stories || []).map((s: any) => ({
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
		estimatedTime: s.estimated_reading_time ?? 10,
		image: storyImages.get(s.id) || null,
		rating: s.average_rating ?? 0,
		totalReads: s.total_reads ?? 0,
	}));

	return (
		<div className='container mx-auto px-4 py-8 max-w-7xl'>
			<div className='mb-8 flex items-center justify-between'>
				<div>
					<h1 className='text-4xl font-bold text-gray-900'>Your Stories</h1>
					<p className='text-gray-600 mt-2'>
						All stories you created and saved.
					</p>
				</div>
				<div className='flex gap-2'>
					<Button asChild variant='outline'>
						<Link href='/stories'>Browse Library</Link>
					</Button>
					<Button asChild>
						<Link href='/create'>Create Story</Link>
					</Button>
				</div>
			</div>

			{message && (
				<div className='mb-6 p-4 border border-[#EF7722] rounded-lg bg-[#EF7722]/10 text-gray-900 flex items-center justify-between'>
					<span>{message}</span>
					<Button asChild>
						<Link href='/login'>Sign in</Link>
					</Button>
				</div>
			)}

			{loading ? (
				<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{Array.from({ length: 6 }).map((_, idx) => (
						<Card key={idx} className='overflow-hidden'>
							<div className='w-full h-48 bg-[#EBEBEB] animate-pulse' />
							<CardHeader>
								<div className='h-5 w-3/4 bg-[#EBEBEB] animate-pulse rounded mb-2' />
								<div className='h-4 w-full bg-[#EBEBEB] animate-pulse rounded' />
							</CardHeader>
							<CardContent>
								<div className='h-10 w-full bg-[#EBEBEB] animate-pulse rounded' />
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<>
					<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{displayStories.map((story) => (
							<Card
								key={story.id}
								className='overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105'
							>
								<div className='relative'>
									{story.image ? (
										<Image
											src={story.image}
											alt={story.title}
											width={300}
											height={200}
											className='w-full h-48 object-cover'
											placeholder='blur'
											blurDataURL={BLUR_DATA_URL}
										/>
									) : (
										<div className='w-full h-48 bg-[#EF7722]/10 flex items-center justify-center'>
											<div className='text-center'>
												<div className='text-4xl mb-2'>📚</div>
												<div className='text-sm text-gray-900'>No Image</div>
											</div>
										</div>
									)}
									<div className='absolute top-2 right-2'>
										<DeleteStoryButton
											storyId={story.id}
											storyTitle={story.title}
											hasImages={!!story.image}
											variant="ghost"
											size="sm"
											showText={false}
											onDeleted={handleStoryDeleted}
											redirectAfterDelete="/my-stories"
											className="bg-white/80 hover:bg-white shadow-sm"
										/>
									</div>
								</div>
								<CardHeader>
									<CardTitle className='text-lg font-semibold line-clamp-2 text-gray-900'>
										{story.title}
									</CardTitle>
									<CardDescription className='line-clamp-3 text-gray-600'>
										{story.description}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-3'>
										<div className='flex items-center justify-between text-sm'>
											<span className='bg-[#EF7722]/10 text-[#EF7722] px-2 py-1 rounded-full text-xs font-medium border border-[#EF7722]'>
												{story.genre}
											</span>
											<span className='text-gray-600'>
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
												<span className='text-sm font-medium text-gray-900'>
													{story.rating}
												</span>
												<span className='text-xs text-gray-600'>
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

					{displayStories.length === 0 && (
						<div className='text-center py-12'>
							<p className='text-gray-600 text-lg'>
								You haven’t saved any stories yet.
							</p>
							<div className='mt-4 flex gap-2 justify-center'>
								<Button asChild variant='outline'>
									<Link href='/stories'>
										Browse Library
									</Link>
								</Button>
								<Button asChild>
									<Link href='/create'>
										Create a story
									</Link>
								</Button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
