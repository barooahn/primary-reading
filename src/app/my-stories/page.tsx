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

// Tiny base64 placeholder for blur-up effect
const BLUR_DATA_URL =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

export const dynamic = "force-dynamic";

export default function MyStoriesPage() {
	const [stories, setStories] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		const load = async () => {
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
					setStories(data.stories || []);
					setMessage(null);
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
		load();
	}, []);

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
		image:
			s.cover_thumbnail_url ?? s.cover_image_url ?? "/placeholder.svg",
		rating: s.average_rating ?? 0,
		totalReads: s.total_reads ?? 0,
	}));

	return (
		<div className='container mx-auto px-4 py-8 max-w-7xl'>
			<div className='mb-8 flex items-center justify-between'>
				<div>
					<h1 className='text-4xl font-bold'>Your Stories</h1>
					<p className='text-muted-foreground mt-2'>
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
				<div className='mb-6 p-4 border rounded-lg bg-yellow-50 text-yellow-800 flex items-center justify-between'>
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
						{displayStories.map((story) => (
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
										blurDataURL={BLUR_DATA_URL}
									/>
								</div>
								<CardHeader>
									<CardTitle className='text-lg font-semibold line-clamp-2'>
										{story.title}
									</CardTitle>
									<CardDescription className='line-clamp-3'>
										{story.description}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-3'>
										<div className='flex items-center justify-between text-sm'>
											<span className='bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium'>
												{story.genre}
											</span>
											<span className='text-muted-foreground'>
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
													{story.rating}
												</span>
												<span className='text-xs text-muted-foreground'>
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
							<p className='text-muted-foreground text-lg'>
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
