"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ArrowLeft, AlertCircle, CheckCircle, Settings } from "lucide-react";

// This would typically come from a context or prop, but for now we'll use the same structure
interface ChildProfile {
	id: string;
	name: string;
	yearLevel: number;
	age: number;
	gender: 'boy' | 'girl' | 'other';
	preferences: {
		favoriteGenres: string[];
		contentFilters: string[];
		allowedTopics: string[];
		blockedTopics: string[];
	};
	createdAt: Date;
}

// Same topics structure as parent-setup page
const ALL_TOPICS = {
	adventure: [
		'🏴‍☠️ Pirates & Treasure',
		'🦕 Dinosaurs',
		'🚀 Space Exploration',
		'🏰 Knights & Castles',
		'🌊 Ocean Adventures',
		'🏔️ Mountain Climbing',
		'🏜️ Desert Expeditions'
	],
	fantasy: [
		'🧙‍♂️ Wizards & Magic',
		'🦄 Unicorns',
		'🐉 Dragons',
		'🧚‍♀️ Fairies',
		'🏰 Fantasy Kingdoms',
		'🌟 Magical Creatures',
		'⚡ Superpowers'
	],
	animals: [
		'🐱 Cats & Kittens',
		'🐶 Dogs & Puppies',
		'🐻 Forest Animals',
		'🐧 Arctic Animals',
		'🦁 Safari Animals',
		'🐠 Ocean Life',
		'🦋 Bugs & Insects',
		'🐎 Horses',
		'🐸 Pond Life'
	],
	everyday: [
		'👨‍👩‍👧‍👦 Family Stories',
		'🏫 School Adventures',
		'🎂 Birthdays & Parties',
		'🏠 Home Life',
		'👫 Friendship',
		'🚗 Transportation',
		'🏪 Community Helpers'
	],
	sports: [
		'⚽ Soccer/Football',
		'🏀 Basketball',
		'🏈 American Football',
		'⚾ Baseball',
		'🎾 Tennis',
		'🏊‍♀️ Swimming',
		'🚴‍♂️ Cycling',
		'🏃‍♀️ Running & Athletics'
	],
	creative: [
		'🎨 Art & Drawing',
		'🎵 Music & Singing',
		'💃 Dancing',
		'🎭 Theater & Acting',
		'📚 Writing Stories',
		'🧩 Puzzles & Games',
		'🔧 Building & Making'
	],
	science: [
		'🔬 Science Experiments',
		'🌱 Plants & Gardens',
		'🌤️ Weather',
		'⭐ Stars & Planets',
		'🤖 Robots & Technology',
		'🏗️ How Things Work',
		'🧬 Nature & Discovery'
	],
	gaming: [
		'🎮 Video Games',
		'🔲 Minecraft',
		'🎭 Roblox',
		'👾 Among Us',
		'🎯 Fortnite',
		'🏆 Gaming Adventures'
	],
	youtube: [
		'📱 YouTube Adventures',
		'🎬 Content Creation',
		'📺 Kid YouTubers',
		'🎥 Making Videos'
	]
};

// Get age and gender appropriate topic suggestions
const getTopicSuggestions = (age: number, gender: 'boy' | 'girl' | 'other') => {
	let suggestions: string[] = [];

	// Base suggestions for all children
	const baseSuggestions = [
		...ALL_TOPICS.everyday,
		...ALL_TOPICS.animals,
		...ALL_TOPICS.creative.slice(0, 3)
	];

	// Age-based suggestions
	if (age <= 6) { // Years 1-2
		suggestions = [
			...baseSuggestions,
			...ALL_TOPICS.fantasy.slice(0, 3), // Unicorns, fairies, magic
			...ALL_TOPICS.adventure.slice(0, 2) // Pirates, dinosaurs
		];
	} else if (age <= 8) { // Years 3-4
		suggestions = [
			...baseSuggestions,
			...ALL_TOPICS.fantasy,
			...ALL_TOPICS.adventure.slice(0, 4),
			...ALL_TOPICS.science.slice(0, 3),
			...ALL_TOPICS.sports.slice(0, 3)
		];
	} else { // Years 5-6
		suggestions = [
			...baseSuggestions,
			...ALL_TOPICS.fantasy,
			...ALL_TOPICS.adventure,
			...ALL_TOPICS.science,
			...ALL_TOPICS.sports,
			...ALL_TOPICS.gaming.slice(0, 3),
			...ALL_TOPICS.youtube.slice(0, 2)
		];
	}

	// Gender-based adjustments (as suggestions, not restrictions)
	if (gender === 'boy') {
		suggestions = [
			...suggestions,
			'🤖 Robots & Technology',
			'🏈 American Football',
			'🚀 Space Exploration'
		];
	} else if (gender === 'girl') {
		suggestions = [
			...suggestions,
			'🦄 Unicorns',
			'🧚‍♀️ Fairies',
			'🐎 Horses',
			'💃 Dancing'
		];
	}

	// Remove duplicates and return
	return [...new Set(suggestions)];
};

export default function EditTopicsPage() {
	const params = useParams();
	const router = useRouter();
	const childId = params.childId as string;

	const [child, setChild] = useState<ChildProfile | null>(null);
	const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// In a real app, you'd fetch this from context or API
	useEffect(() => {
		// Simulate loading child data - in real app this would come from context/API
		// For now, create a mock child for demonstration
		const mockChild: ChildProfile = {
			id: childId,
			name: "Demo Child",
			yearLevel: 3,
			age: 7,
			gender: 'other',
			preferences: {
				favoriteGenres: [],
				contentFilters: ["age-appropriate"],
				allowedTopics: ['🐱 Cats & Kittens', '🏫 School Adventures', '🎨 Art & Drawing'],
				blockedTopics: []
			},
			createdAt: new Date()
		};

		setChild(mockChild);
		setSelectedTopics([...mockChild.preferences.allowedTopics]);
		setIsLoading(false);
	}, [childId]);

	const handleTopicToggle = (topic: string) => {
		setSelectedTopics(prev =>
			prev.includes(topic)
				? prev.filter(t => t !== topic)
				: [...prev, topic]
		);
	};

	const getAllTopics = () => {
		return Object.values(ALL_TOPICS).flat();
	};

	const handleSelectAllTopics = () => {
		setSelectedTopics(getAllTopics());
	};

	const handleSelectNoneTopics = () => {
		setSelectedTopics([]);
	};

	const handleSelectSuggestedTopics = () => {
		if (child) {
			const suggestions = getTopicSuggestions(child.age, child.gender);
			setSelectedTopics(suggestions);
		}
	};

	const handleSelectAllInCategory = (category: string) => {
		const categoryTopics = ALL_TOPICS[category as keyof typeof ALL_TOPICS];
		setSelectedTopics(prev => {
			const otherTopics = prev.filter(topic => !categoryTopics.includes(topic));
			return [...otherTopics, ...categoryTopics];
		});
	};

	const handleSelectNoneInCategory = (category: string) => {
		const categoryTopics = ALL_TOPICS[category as keyof typeof ALL_TOPICS];
		setSelectedTopics(prev => prev.filter(topic => !categoryTopics.includes(topic)));
	};

	const handleSave = () => {
		// In a real app, you'd save to context/API
		console.log('Saving topics:', selectedTopics);
		// Navigate back to parent setup
		router.push('/parent-setup');
	};

	const handleCancel = () => {
		router.push('/parent-setup');
	};

	if (isLoading) {
		return (
			<ProtectedRoute>
				<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			</ProtectedRoute>
		);
	}

	if (!child) {
		return (
			<ProtectedRoute>
				<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
					<Card className="max-w-md">
						<CardContent className="p-6 text-center">
							<AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
							<h2 className="text-lg font-semibold mb-2">Child Not Found</h2>
							<p className="text-gray-600 mb-4">The child profile could not be loaded.</p>
							<Button onClick={() => router.push('/parent-setup')}>
								Back to Parent Setup
							</Button>
						</CardContent>
					</Card>
				</div>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
				<div className="container mx-auto px-4 py-8 max-w-4xl">
					{/* Header */}
					<div className="flex items-center space-x-4 mb-8">
						<Button
							variant="ghost"
							onClick={handleCancel}
							className="p-2"
						>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center space-x-2">
								<Settings className="h-6 w-6 text-blue-600" />
								<span>Edit Topics for {child.name}</span>
							</h1>
							<p className="text-gray-600 mt-1">
								Year {child.yearLevel} • Age {child.age} • {child.gender === 'other' ? 'Child' : child.gender === 'boy' ? 'Boy' : 'Girl'}
							</p>
						</div>
					</div>

					{/* Warning for no topics selected */}
					{selectedTopics.length === 0 && (
						<Card className="mb-6 border-red-200 bg-red-50">
							<CardContent className="p-4">
								<div className="flex items-center space-x-2 text-red-800">
									<AlertCircle className="h-5 w-5" />
									<h3 className="font-semibold">No Topics Selected</h3>
								</div>
								<p className="text-sm text-red-700 mt-2">
									Please select at least one topic that {child.name} would enjoy reading about.
									You can use the &quot;Select Suggested&quot; button below to quickly choose age-appropriate topics.
								</p>
							</CardContent>
						</Card>
					)}

					{/* Global Controls */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle className="text-lg">Quick Actions</CardTitle>
							<CardDescription>
								Use these buttons to quickly select multiple topics at once
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between">
								<div className="flex space-x-3 flex-wrap">
									<Button
										variant="outline"
										onClick={handleSelectSuggestedTopics}
										className="text-blue-700 border-blue-300 hover:bg-blue-50"
									>
										⭐ Select Suggested ({getTopicSuggestions(child.age, child.gender).length})
									</Button>
									<Button
										variant="outline"
										onClick={handleSelectAllTopics}
										className="text-green-700 border-green-300 hover:bg-green-50"
									>
										✓ Select All ({getAllTopics().length})
									</Button>
									<Button
										variant="outline"
										onClick={handleSelectNoneTopics}
										className="text-red-700 border-red-300 hover:bg-red-50"
									>
										✗ Select None
									</Button>
								</div>
								<div className="text-sm text-gray-600">
									<strong>{selectedTopics.length}</strong> of <strong>{getAllTopics().length}</strong> topics selected
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Topics Grid */}
					<div className="space-y-6">
						{Object.entries(ALL_TOPICS).map(([category, topics]) => {
							const selectedInCategory = topics.filter(topic => selectedTopics.includes(topic)).length;
							const allSelected = selectedInCategory === topics.length;
							const noneSelected = selectedInCategory === 0;

							return (
								<Card key={category}>
									<CardHeader className="pb-4">
										<div className="flex items-center justify-between">
											<CardTitle className="text-lg capitalize flex items-center space-x-2">
												<span className="text-2xl">
													{category === 'adventure' && '🏴‍☠️'}
													{category === 'fantasy' && '🧙‍♂️'}
													{category === 'animals' && '🐱'}
													{category === 'everyday' && '👨‍👩‍👧‍👦'}
													{category === 'sports' && '⚽'}
													{category === 'creative' && '🎨'}
													{category === 'science' && '🔬'}
													{category === 'gaming' && '🎮'}
													{category === 'youtube' && '📱'}
												</span>
												<span>{category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
												<span className="text-sm text-gray-500 font-normal">
													({selectedInCategory}/{topics.length})
												</span>
											</CardTitle>
											<div className="flex space-x-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleSelectAllInCategory(category)}
													disabled={allSelected}
													className={`text-xs px-3 py-1 h-7 border ${
														allSelected
															? 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50'
															: 'text-green-600 border-green-300 hover:bg-green-50 hover:border-green-400'
													}`}
												>
													✓ All
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleSelectNoneInCategory(category)}
													disabled={noneSelected}
													className={`text-xs px-3 py-1 h-7 border ${
														noneSelected
															? 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50'
															: 'text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400'
													}`}
												>
													✗ None
												</Button>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
											{topics.map((topic) => {
												const isSelected = selectedTopics.includes(topic);
												const isSuggested = getTopicSuggestions(child.age, child.gender).includes(topic);
												return (
													<button
														key={topic}
														onClick={() => handleTopicToggle(topic)}
														className={`p-3 rounded-lg border-2 text-left transition-all ${
															isSelected
																? "border-green-500 bg-green-50 text-green-800"
																: "border-gray-200 hover:border-gray-300 text-gray-700"
														} ${isSuggested && !isSelected ? "border-blue-300 bg-blue-50" : ""}`}
													>
														<div className="flex items-center justify-between">
															<span className="text-sm font-medium">{topic}</span>
															{isSelected && <span className="text-green-600 text-lg">✓</span>}
															{isSuggested && !isSelected && <span className="text-blue-600 text-lg">⭐</span>}
														</div>
													</button>
												);
											})}
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>

					{/* Save/Cancel Actions */}
					<Card className="mt-8 sticky bottom-4 shadow-lg">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div className="text-sm text-gray-600">
									<strong>{selectedTopics.length}</strong> topics selected for {child.name}
								</div>
								<div className="flex space-x-3">
									<Button
										variant="outline"
										onClick={handleCancel}
									>
										Cancel
									</Button>
									<Button
										onClick={handleSave}
										disabled={selectedTopics.length === 0}
										className={`${
											selectedTopics.length === 0
												? 'bg-gray-400 cursor-not-allowed'
												: 'bg-green-600 hover:bg-green-700'
										}`}
									>
										<CheckCircle className="h-4 w-4 mr-2" />
										Save Changes ({selectedTopics.length} topics)
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</ProtectedRoute>
	);
}