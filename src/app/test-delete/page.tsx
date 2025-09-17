"use client";

import { useState } from "react";
import { DeleteStoryButton } from "@/components/stories/delete-story-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestDeletePage() {
	const [stories, setStories] = useState([
		{
			id: "test-story-1",
			title: "The Adventures of Captain Code",
			hasImages: true,
		},
		{
			id: "test-story-2",
			title: "Magic Garden Mystery",
			hasImages: false,
		},
		{
			id: "test-story-3",
			title: "Space Explorers Unite",
			hasImages: true,
		},
	]);

	const handleStoryDeleted = (deletedId: string) => {
		setStories((prev) => prev.filter((story) => story.id !== deletedId));
	};

	return (
		<div className='container mx-auto px-4 py-8 max-w-4xl'>
			<div className='mb-6'>
				<h1 className='text-3xl font-bold mb-2'>
					Delete Story Test Page
				</h1>
				<p className='text-text-secondary'>
					This page demonstrates the delete story functionality
					with confirmation dialogs.
				</p>
			</div>

			<div className='grid gap-4'>
				{stories.map((story) => (
					<Card key={story.id}>
						<CardHeader>
							<CardTitle className='flex items-center justify-between'>
								<span>{story.title}</span>
								<div className='flex items-center gap-2'>
									{story.hasImages && (
										<span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
											Has Images
										</span>
									)}
									<DeleteStoryButton
										storyId={story.id}
										storyTitle={story.title}
										hasImages={story.hasImages}
										onDeleted={() =>
											handleStoryDeleted(
												story.id
											)
										}
										redirectAfterDelete=''
										variant='destructive'
										size='sm'
									/>
								</div>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-sm text-text-muted'>
								Story ID: {story.id}
							</p>
							<p className='text-sm text-text-muted'>
								Images: {story.hasImages ? "Yes" : "No"}
							</p>
						</CardContent>
					</Card>
				))}

				{stories.length === 0 && (
					<Card>
						<CardContent className='p-8 text-center'>
							<p className='text-text-secondary'>
								All test stories have been deleted!
								Refresh the page to reset.
							</p>
						</CardContent>
					</Card>
				)}
			</div>

			<div className='mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
				<h3 className='font-semibold text-yellow-800 mb-2'>
					⚠️ Note
				</h3>
				<p className='text-sm text-yellow-700'>
					This is a test page with mock data. The actual delete
					API calls will fail for these test stories since they
					don&apos;t exist in the database. Use this page to test
					the UI components and dialog behavior.
				</p>
			</div>
		</div>
	);
}
