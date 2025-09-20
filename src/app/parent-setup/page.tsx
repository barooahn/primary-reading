"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getGradeLevelConfig } from "@/config/grade-levels";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
	Users,
	UserPlus,
	Settings,
	BookOpen,
	Shield,
	Trash2,
	Edit3,
	CheckCircle,
	AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChildProfiles } from "@/hooks/use-child-profiles";
import { ChildProfile } from "@/types/child-profile";
import { useAuth } from "@/contexts/auth-context";

// Available topics organized by category
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
		// Boys might be more interested in these (but all topics remain available)
		suggestions = [
			...suggestions,
			'🤖 Robots & Technology',
			'🏈 American Football',
			'🚀 Space Exploration'
		];
	} else if (gender === 'girl') {
		// Girls might be more interested in these (but all topics remain available)
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

export default function ParentSetupPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { user, loading: authLoading } = useAuth();
	const {
		fetchChildProfiles,
		createChildProfile,
		updateChildProfile,
		deleteChildProfile
	} = useChildProfiles();

	const [children, setChildren] = useState<ChildProfile[]>([]);
	const [isAddingChild, setIsAddingChild] = useState(false);
	const [newChildName, setNewChildName] = useState("");
	const [newChildYear, setNewChildYear] = useState(3);
	const [newChildGender, setNewChildGender] = useState<'boy' | 'girl' | 'other'>('other');
	const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
	const [editingChild, setEditingChild] = useState<string | null>(null);
	const [currentStep, setCurrentStep] = useState<'basic' | 'topics'>('basic');
	const [message, setMessage] = useState<string | null>(null);
	const [isRequired, setIsRequired] = useState(false);

	// Check for URL parameters on mount
	useEffect(() => {
		const urlMessage = searchParams.get('message');
		const urlRequired = searchParams.get('required');

		if (urlMessage) {
			setMessage(urlMessage);
			// Clear message after 15 seconds for longer setup process
			const timer = setTimeout(() => setMessage(null), 15000);
			return () => clearTimeout(timer);
		}

		if (urlRequired === 'true') {
			setIsRequired(true);
		}
	}, [searchParams]);

	// Load child profiles only after authentication is complete
	useEffect(() => {
		const loadChildren = async () => {
			// Don't make API calls if user is not authenticated or still loading
			if (authLoading || !user) {
				return;
			}

			try {
				const profiles = await fetchChildProfiles();
				setChildren(profiles);

				// If this is required setup and we already have profiles, auto-start adding another
				if (isRequired && profiles.length === 0 && !isAddingChild) {
					setIsAddingChild(true);
				}
			} catch (error) {
				console.error('Failed to load child profiles:', error);
			}
		};

		loadChildren();
	}, [fetchChildProfiles, user, authLoading, isRequired, isAddingChild]);

	const handleProceedToTopics = () => {
		if (!newChildName.trim()) return;

		// Get suggested topics based on age and gender
		const suggestions = getTopicSuggestions(newChildYear + 4, newChildGender);
		setSelectedTopics(suggestions);
		setCurrentStep('topics');
	};

	const handleAddChild = async () => {
		try {
			const profileData = {
				name: newChildName.trim(),
				year_level: newChildYear,
				age: newChildYear + 4,
				gender: newChildGender,
				preferences: {
					favoriteGenres: [],
					contentFilters: ["age-appropriate"],
					allowedTopics: selectedTopics,
					blockedTopics: []
				}
			};

			const newProfile = await createChildProfile(profileData);
			setChildren(prev => [...prev, newProfile]);

			// Reset form
			setNewChildName("");
			setNewChildYear(3);
			setNewChildGender('other');
			setSelectedTopics([]);
			setCurrentStep('basic');
			setIsAddingChild(false);

			// If this was required setup, show completion message and provide navigation
			if (isRequired) {
				setMessage("✅ Child profile created successfully! Students can now start reading.");
				setIsRequired(false);

				// Auto-redirect to welcome page after a short delay
				setTimeout(() => {
					router.push("/welcome");
				}, 3000);
			}
		} catch (error) {
			console.error('Failed to create child profile:', error);
			// You might want to show an error message to the user here
		}
	};

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
		const suggestions = getTopicSuggestions(newChildYear + 4, newChildGender);
		setSelectedTopics(suggestions);
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

	const handleDeleteChild = async (childId: string) => {
		if (confirm("Are you sure you want to remove this child's profile?")) {
			try {
				await deleteChildProfile(childId);
				setChildren(prev => prev.filter(child => child.id !== childId));
			} catch (error) {
				console.error('Failed to delete child profile:', error);
				// You might want to show an error message to the user here
			}
		}
	};

	const handleUpdateChildYear = async (childId: string, newYear: number) => {
		try {
			const updatedProfile = await updateChildProfile(childId, {
				year_level: newYear,
				age: newYear + 4
			});
			setChildren(prev => prev.map(child =>
				child.id === childId ? updatedProfile : child
			));
			setEditingChild(null);
		} catch (error) {
			console.error('Failed to update child profile:', error);
			// You might want to show an error message to the user here
		}
	};

	const handleNavigateToEditTopics = (childId: string) => {
		router.push(`/parent-setup/edit-topics/${childId}`);
	};

	return (
		<ProtectedRoute>
			<div className='min-h-screen bg-gradient-to-br from-parent-light via-purple-50 to-pink-50'>
				<div className='container mx-auto px-4 py-8 max-w-6xl'>
					{/* Header */}
					<div className='text-center mb-8'>
						<div className='flex items-center justify-center space-x-2 mb-4'>
							<Users className='h-8 w-8 text-parent' />
							<h1 className='text-3xl md:text-4xl font-bold text-gray-900'>
								{isRequired
									? "Required Setup"
									: "Parent Dashboard"}
							</h1>
						</div>
						<p className='text-lg text-gray-600 max-w-2xl mx-auto'>
							{isRequired
								? "Please create a child profile before students can access reading content"
								: "Manage your children's reading experience and set appropriate content levels"}
						</p>
					</div>

					{/* Alert Message */}
					{message && (
						<div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg mx-auto max-w-4xl'>
							<div className='flex items-center gap-2'>
								<div className='h-4 w-4 bg-blue-500 rounded-full flex-shrink-0' />
								<p className='text-blue-800 font-medium'>
									{message}
								</p>
							</div>
						</div>
					)}

					{/* Required Setup Warning */}
					{isRequired && children.length === 0 && (
						<div className='mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg mx-auto max-w-4xl'>
							<div className='flex items-center gap-2'>
								<AlertCircle className='h-5 w-5 text-amber-600 flex-shrink-0' />
								<div>
									<p className='text-amber-800 font-medium'>
										Setup Required
									</p>
									<p className='text-amber-700 text-sm mt-1'>
										You must create at least one
										child profile before students
										can start reading. This
										ensures age-appropriate
										content and proper tracking.
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Welcome Card for First Time */}
					{children.length === 0 && !isAddingChild && (
						<Card className='mb-8 border-2 border-parent/30 bg-parent-light'>
							<CardHeader className='text-center'>
								<div className='mx-auto w-16 h-16 bg-parent/20 rounded-full flex items-center justify-center mb-4'>
									<Shield className='h-8 w-8 text-parent' />
								</div>
								<CardTitle className='text-2xl text-parent'>
									Welcome to PrimaryReading!
								</CardTitle>
								<CardDescription className='text-base'>
									Let&apos;s set up reading profiles
									for your children or students. This
									ensures they get age-appropriate
									content and you can track their
									progress.
								</CardDescription>
							</CardHeader>
							<CardContent className='text-center'>
								<div className='grid md:grid-cols-3 gap-6 mb-6'>
									<div className='space-y-2'>
										<div className='text-3xl'>
											🔒
										</div>
										<h3 className='font-semibold'>
											Safe Content
										</h3>
										<p className='text-sm text-gray-600'>
											Age-appropriate stories
											and activities
										</p>
									</div>
									<div className='space-y-2'>
										<div className='text-3xl'>
											📊
										</div>
										<h3 className='font-semibold'>
											Track Progress
										</h3>
										<p className='text-sm text-gray-600'>
											Monitor reading levels
											and achievements
										</p>
									</div>
									<div className='space-y-2'>
										<div className='text-3xl'>
											⚙️
										</div>
										<h3 className='font-semibold'>
											Full Control
										</h3>
										<p className='text-sm text-gray-600'>
											Adjust settings as they
											grow
										</p>
									</div>
								</div>
								<Button
									onClick={() =>
										setIsAddingChild(true)
									}
									size='lg'
									className='bg-parent hover:bg-parent-hover text-white'
								>
									<UserPlus className='h-5 w-5 mr-2' />
									Add Your First Child
								</Button>
							</CardContent>
						</Card>
					)}

					{/* Add Child Form */}
					{isAddingChild && (
						<Card className='mb-8'>
							<CardHeader>
								<CardTitle className='flex items-center space-x-2'>
									<UserPlus className='h-5 w-5 text-primary' />
									<span>
										Add New Child - Step{" "}
										{currentStep === "basic"
											? "1"
											: "2"}{" "}
										of 2
									</span>
								</CardTitle>
								<CardDescription>
									{currentStep === "basic"
										? "Create a reading profile with the appropriate level for this child"
										: "Choose topics your child would enjoy reading about"}
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6'>
								{currentStep === "basic" ? (
									<>
										<div className='grid md:grid-cols-2 gap-6'>
											<div className='space-y-4'>
												<div>
													<Label htmlFor='childName'>
														Child&apos;s
														Name
													</Label>
													<Input
														id='childName'
														value={
															newChildName
														}
														onChange={(
															e
														) =>
															setNewChildName(
																e
																	.target
																	.value
															)
														}
														placeholder="Enter child's name"
														className='mt-1'
													/>
												</div>
												<div>
													<Label>
														Gender
														(helps us
														suggest
														appropriate
														topics)
													</Label>
													<div className='flex space-x-2 mt-2'>
														{[
															{
																value: "boy" as const,
																label: "👦 Boy",
																emoji: "👦",
															},
															{
																value: "girl" as const,
																label: "👧 Girl",
																emoji: "👧",
															},
															{
																value: "other" as const,
																label: "🧒 Other",
																emoji: "🧒",
															},
														].map(
															(
																option
															) => (
																<button
																	key={
																		option.value
																	}
																	onClick={() =>
																		setNewChildGender(
																			option.value
																		)
																	}
																	className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
																		newChildGender ===
																		option.value
																			? "border-primary bg-primary/10"
																			: "border-gray-200 hover:border-primary/50"
																	}`}
																>
																	<div className='text-2xl mb-1'>
																		{
																			option.emoji
																		}
																	</div>
																	<div className='text-sm font-medium'>
																		{
																			option.label.split(
																				" "
																			)[1]
																		}
																	</div>
																</button>
															)
														)}
													</div>
												</div>
											</div>
											<div className='space-y-4'>
												<div>
													<Label>
														School
														Year Level
													</Label>
													<div className='grid grid-cols-3 gap-2 mt-2'>
														{[
															1, 2,
															3, 4,
															5, 6,
														].map(
															(
																year
															) => {
																return (
																	<button
																		key={
																			year
																		}
																		onClick={() =>
																			setNewChildYear(
																				year
																			)
																		}
																		className={`p-3 rounded-lg border-2 text-center transition-all ${
																			newChildYear ===
																			year
																				? "border-primary bg-primary/10"
																				: "border-gray-200 hover:border-primary/50"
																		}`}
																	>
																		<div className='font-semibold'>
																			Year{" "}
																			{
																				year
																			}
																		</div>
																		<div className='text-xs text-gray-600'>
																			Age{" "}
																			{year +
																				4}
																			+
																		</div>
																	</button>
																);
															}
														)}
													</div>
												</div>
											</div>
										</div>
									</>
								) : (
									<>
										{/* Topic Selection Step */}
										<div className='space-y-4'>
											<div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
												<h3 className='font-semibold text-blue-900 mb-2'>
													✨ Suggested
													Topics for{" "}
													{newChildName}{" "}
													(Age{" "}
													{newChildYear +
														4}
													,{" "}
													{newChildGender ===
													"other"
														? "Child"
														: newChildGender ===
														  "boy"
														? "Boy"
														: "Girl"}
													)
												</h3>
												<p className='text-sm text-blue-700'>
													We&apos;ve
													pre-selected
													topics that are
													popular with
													children of
													this age and
													gender. You can
													uncheck any
													topics you
													don&apos;t
													want, or add
													more from the
													full list
													below.
												</p>
											</div>

											{/* Global Select All/None Controls */}
											<div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200'>
												<div className='flex items-center space-x-4'>
													<h4 className='font-semibold text-gray-800'>
														Quick
														Actions:
													</h4>
													<div className='flex space-x-2 flex-wrap'>
														<Button
															size='sm'
															variant='outline'
															onClick={
																handleSelectSuggestedTopics
															}
															className='text-blue-700 border-blue-300 hover:bg-blue-50'
														>
															⭐
															Select
															Suggested
															(
															{
																getTopicSuggestions(
																	newChildYear +
																		4,
																	newChildGender
																)
																	.length
															}
															)
														</Button>
														<Button
															size='sm'
															variant='outline'
															onClick={
																handleSelectAllTopics
															}
															className='text-green-700 border-green-300 hover:bg-green-50'
														>
															✓
															Select
															All (
															{
																getAllTopics()
																	.length
															}
															)
														</Button>
														<Button
															size='sm'
															variant='outline'
															onClick={
																handleSelectNoneTopics
															}
															className='text-red-700 border-red-300 hover:bg-red-50'
														>
															✗
															Select
															None
														</Button>
													</div>
												</div>
												<div className='text-sm text-gray-600'>
													<strong>
														{
															selectedTopics.length
														}
													</strong>{" "}
													of{" "}
													<strong>
														{
															getAllTopics()
																.length
														}
													</strong>{" "}
													topics selected
												</div>
											</div>

											{/* Topic Categories */}
											{Object.entries(
												ALL_TOPICS
											).map(
												([
													category,
													topics,
												]) => {
													const selectedInCategory =
														topics.filter(
															(
																topic
															) =>
																selectedTopics.includes(
																	topic
																)
														).length;
													const allSelected =
														selectedInCategory ===
														topics.length;
													const noneSelected =
														selectedInCategory ===
														0;

													return (
														<div
															key={
																category
															}
															className='space-y-3'
														>
															<div className='flex items-center justify-between'>
																<h4 className='font-semibold text-gray-800 capitalize flex items-center space-x-2'>
																	<span className='text-lg'>
																		{category ===
																			"adventure" &&
																			"🏴‍☠️"}
																		{category ===
																			"fantasy" &&
																			"🧙‍♂️"}
																		{category ===
																			"animals" &&
																			"🐱"}
																		{category ===
																			"everyday" &&
																			"👨‍👩‍👧‍👦"}
																		{category ===
																			"sports" &&
																			"⚽"}
																		{category ===
																			"creative" &&
																			"🎨"}
																		{category ===
																			"science" &&
																			"🔬"}
																		{category ===
																			"gaming" &&
																			"🎮"}
																		{category ===
																			"youtube" &&
																			"📱"}
																	</span>
																	<span>
																		{category
																			.replace(
																				/([A-Z])/g,
																				" $1"
																			)
																			.replace(
																				/^./,
																				(
																					str
																				) =>
																					str.toUpperCase()
																			)}
																	</span>
																	<span className='text-sm text-gray-500'>
																		(
																		{
																			selectedInCategory
																		}
																		/
																		{
																			topics.length
																		}
																		)
																	</span>
																</h4>
																<div className='flex space-x-1'>
																	<Button
																		size='sm'
																		variant='outline'
																		onClick={() =>
																			handleSelectAllInCategory(
																				category
																			)
																		}
																		disabled={
																			allSelected
																		}
																		className={`text-xs px-3 py-1 h-7 border ${
																			allSelected
																				? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
																				: "text-green-600 border-green-300 hover:bg-green-50 hover:border-green-400"
																		}`}
																	>
																		✓
																		All
																	</Button>
																	<Button
																		size='sm'
																		variant='outline'
																		onClick={() =>
																			handleSelectNoneInCategory(
																				category
																			)
																		}
																		disabled={
																			noneSelected
																		}
																		className={`text-xs px-3 py-1 h-7 border ${
																			noneSelected
																				? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
																				: "text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
																		}`}
																	>
																		✗
																		None
																	</Button>
																</div>
															</div>
															<div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
																{topics.map(
																	(
																		topic
																	) => {
																		const isSelected =
																			selectedTopics.includes(
																				topic
																			);
																		const isSuggested =
																			getTopicSuggestions(
																				newChildYear +
																					4,
																				newChildGender
																			).includes(
																				topic
																			);
																		return (
																			<button
																				key={
																					topic
																				}
																				onClick={() =>
																					handleTopicToggle(
																						topic
																					)
																				}
																				className={`p-2 rounded-lg border-2 text-left text-sm transition-all ${
																					isSelected
																						? "border-green-500 bg-green-50 text-green-800"
																						: "border-gray-200 hover:border-gray-300 text-gray-700"
																				} ${
																					isSuggested &&
																					!isSelected
																						? "border-blue-300 bg-blue-50"
																						: ""
																				}`}
																			>
																				<div className='flex items-center justify-between'>
																					<span>
																						{
																							topic
																						}
																					</span>
																					{isSelected && (
																						<span className='text-green-600'>
																							✓
																						</span>
																					)}
																					{isSuggested &&
																						!isSelected && (
																							<span className='text-blue-600'>
																								⭐
																							</span>
																						)}
																				</div>
																			</button>
																		);
																	}
																)}
															</div>
														</div>
													);
												}
											)}

											<div className='bg-gray-50 p-3 rounded-lg'>
												<p className='text-sm text-gray-600'>
													<strong>
														Selected:
													</strong>{" "}
													{
														selectedTopics.length
													}{" "}
													topics |
													<strong className='ml-2'>
														Available:
													</strong>{" "}
													{
														getAllTopics()
															.length
													}{" "}
													total topics
												</p>
											</div>
										</div>
									</>
								)}
								{currentStep === "basic" && (
									<>
										{/* Year Level Info */}
										<div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
											<h3 className='font-semibold text-blue-900 mb-2'>
												Year {newChildYear}{" "}
												Reading Level
											</h3>
											<div className='grid md:grid-cols-3 gap-4 text-sm'>
												<div>
													<span className='text-gray-600'>
														Age Range:
													</span>
													<p className='font-medium'>
														{
															getGradeLevelConfig(
																newChildYear
															).age
														}
														+ years
													</p>
												</div>
												<div>
													<span className='text-gray-600'>
														Reading
														Level:
													</span>
													<p className='font-medium capitalize'>
														{
															getGradeLevelConfig(
																newChildYear
															)
																.readingLevel
														}
													</p>
												</div>
												<div>
													<span className='text-gray-600'>
														Story
														Length:
													</span>
													<p className='font-medium'>
														~
														{
															getGradeLevelConfig(
																newChildYear
															)
																.wordCount
																.recommended
														}{" "}
														words
													</p>
												</div>
											</div>
											<p className='text-xs text-blue-700 mt-2'>
												{
													getGradeLevelConfig(
														newChildYear
													)
														.vocabularyLevel
														.description
												}
											</p>
										</div>

										<div className='flex space-x-4'>
											<Button
												variant='outline'
												onClick={() => {
													if (
														isRequired &&
														children.length ===
															0
													) {
														// Don't allow canceling if setup is required and no profiles exist
														alert(
															"You must create at least one child profile before continuing. Students cannot access reading content without proper age verification."
														);
														return;
													}
													setIsAddingChild(
														false
													);
													setNewChildName(
														""
													);
													setNewChildYear(
														3
													);
													setNewChildGender(
														"other"
													);
													setSelectedTopics(
														[]
													);
													setCurrentStep(
														"basic"
													);
												}}
												disabled={
													isRequired &&
													children.length ===
														0
												}
												className={`flex-1 ${
													isRequired &&
													children.length ===
														0
														? "opacity-50 cursor-not-allowed"
														: ""
												}`}
												title={
													isRequired &&
													children.length ===
														0
														? "Setup is required - you must create a child profile"
														: "Cancel"
												}
											>
												{isRequired &&
												children.length ===
													0
													? "Setup Required"
													: "Cancel"}
											</Button>
											<Button
												onClick={
													handleProceedToTopics
												}
												disabled={
													!newChildName.trim()
												}
												className='flex-1 bg-parent hover:bg-parent-hover text-white'
											>
												Next: Choose Topics
												→
											</Button>
										</div>
									</>
								)}

								{currentStep === "topics" && (
									<>
										{/* Warning for no topics selected */}
										{selectedTopics.length ===
											0 && (
											<div className='bg-red-50 p-4 rounded-lg border border-red-200'>
												<div className='flex items-center space-x-2 text-red-800'>
													<AlertCircle className='h-5 w-5' />
													<h4 className='font-semibold'>
														No Topics
														Selected
													</h4>
												</div>
												<p className='text-sm text-red-700 mt-2'>
													Please select
													at least one
													topic that your
													child would
													enjoy reading
													about. You can
													use the
													&quot;Select
													Suggested&quot;
													button above to
													quickly choose
													age-appropriate
													topics.
												</p>
											</div>
										)}

										<div className='flex space-x-4'>
											<Button
												variant='outline'
												onClick={() =>
													setCurrentStep(
														"basic"
													)
												}
												className='flex-1'
											>
												← Back
											</Button>
											<Button
												onClick={
													handleAddChild
												}
												disabled={
													selectedTopics.length ===
													0
												}
												className={`flex-1 ${
													selectedTopics.length ===
													0
														? "bg-gray-400 cursor-not-allowed"
														: "bg-green-600 hover:bg-green-700"
												}`}
											>
												<CheckCircle className='h-4 w-4 mr-2' />
												Create Profile (
												{
													selectedTopics.length
												}{" "}
												topics)
											</Button>
										</div>
									</>
								)}
							</CardContent>
						</Card>
					)}

					{/* Children Profiles */}
					{children.length > 0 && (
						<div className='space-y-6'>
							<div className='flex items-center justify-between'>
								<h2 className='text-2xl font-bold text-gray-900'>
									Children&apos;s Profiles (
									{children.length})
								</h2>
								{!isAddingChild && (
									<Button
										onClick={() =>
											setIsAddingChild(true)
										}
										variant='outline'
										className='border-parent/30 text-parent hover:bg-parent/10'
									>
										<UserPlus className='h-4 w-4 mr-2' />
										Add Another Child
									</Button>
								)}
							</div>

							<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
								{children.map((child) => (
									<Card
										key={child.id}
										className='relative group'
									>
										<CardHeader className='pb-4'>
											<div className='flex items-start justify-between'>
												<div className='space-y-1'>
													<CardTitle className='text-lg'>
														{
															child.name
														}
													</CardTitle>
													<CardDescription>
														Year{" "}
														{
															child.year_level
														}{" "}
														• Age{" "}
														{
															child.age
														}
													</CardDescription>
												</div>
												<div className='flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
													<Button
														size='sm'
														variant='ghost'
														onClick={() =>
															setEditingChild(
																child.id
															)
														}
														title='Edit year level'
													>
														<Edit3 className='h-4 w-4' />
													</Button>
													<Button
														size='sm'
														variant='ghost'
														onClick={() =>
															handleNavigateToEditTopics(
																child.id
															)
														}
														title='Edit topics'
														className='text-blue-600 hover:text-blue-700 hover:bg-blue-50'
													>
														<Settings className='h-4 w-4' />
													</Button>
													<Button
														size='sm'
														variant='ghost'
														onClick={() =>
															handleDeleteChild(
																child.id
															)
														}
														className='text-red-600 hover:text-red-700 hover:bg-red-50'
													>
														<Trash2 className='h-4 w-4' />
													</Button>
												</div>
											</div>
										</CardHeader>
										<CardContent className='space-y-4'>
											{editingChild ===
											child.id ? (
												/* Year Level Edit Mode */
												<div className='space-y-4'>
													<div>
														<Label className='text-sm'>
															Change
															Year
															Level
														</Label>
														<div className='grid grid-cols-3 gap-1 mt-2'>
															{[
																1,
																2,
																3,
																4,
																5,
																6,
															].map(
																(
																	year
																) => (
																	<button
																		key={
																			year
																		}
																		onClick={() =>
																			handleUpdateChildYear(
																				child.id,
																				year
																			)
																		}
																		className={`p-2 rounded text-xs border transition-all ${
																			year ===
																			child.year_level
																				? "border-primary bg-primary text-white"
																				: "border-gray-200 hover:border-primary"
																		}`}
																	>
																		Year{" "}
																		{
																			year
																		}
																	</button>
																)
															)}
														</div>
													</div>
													<div className='flex space-x-2'>
														<Button
															size='sm'
															variant='outline'
															onClick={() =>
																setEditingChild(
																	null
																)
															}
															className='flex-1'
														>
															Cancel
														</Button>
													</div>
												</div>
											) : (
												/* Display Mode */
												<div className='space-y-3'>
													<div className='bg-gray-50 p-3 rounded-lg'>
														<div className='text-xs text-gray-600 mb-1'>
															Reading
															Level
														</div>
														<div className='font-medium capitalize'>
															{
																getGradeLevelConfig(
																	child.year_level
																)
																	.readingLevel
															}
														</div>
													</div>
													<div className='bg-blue-50 p-3 rounded-lg'>
														<div className='text-xs text-blue-600 mb-1'>
															Selected
															Topics
														</div>
														<div className='text-xs text-blue-800 font-medium'>
															{
																child
																	.preferences
																	.allowedTopics
																	.length
															}{" "}
															topics
															selected
														</div>
														<div className='text-xs text-blue-700 mt-1'>
															{child.preferences.allowedTopics
																.slice(
																	0,
																	3
																)
																.join(
																	", "
																)}
															{child
																.preferences
																.allowedTopics
																.length >
																3 &&
																` +${
																	child
																		.preferences
																		.allowedTopics
																		.length -
																	3
																} more`}
														</div>
													</div>
													<div className='text-xs text-gray-600'>
														<div className='flex items-center space-x-2 mb-1'>
															<BookOpen className='h-3 w-3' />
															<span>
																Stories:
																~
																{
																	getGradeLevelConfig(
																		child.year_level
																	)
																		.wordCount
																		.recommended
																}{" "}
																words
															</span>
														</div>
														<div className='flex items-center space-x-2'>
															<Shield className='h-3 w-3' />
															<span>
																Age-appropriate
																content
																only
															</span>
														</div>
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					)}

					{/* Next Steps */}
					{children.length > 0 && (
						<Card className='mt-8 bg-green-50 border-green-200'>
							<CardHeader>
								<CardTitle className='flex items-center space-x-2 text-green-800'>
									<CheckCircle className='h-5 w-5' />
									<span>Setup Complete!</span>
								</CardTitle>
								<CardDescription className='text-green-700'>
									{isRequired
										? "Required setup is complete! Students can now start reading."
										: "Your children's profiles are ready. They can now access age-appropriate content."}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									<div className='text-sm text-green-800'>
										<p>
											<strong>
												What happens next:
											</strong>
										</p>
										<ul className='list-disc list-inside space-y-1 mt-2'>
											<li>
												Children will see
												stories matched to
												their reading level
											</li>
											<li>
												Age settings cannot
												be changed during
												story creation
											</li>
											<li>
												You can update these
												settings anytime
												from this dashboard
											</li>
											{isRequired && (
												<li>
													<strong>
														Students
														can now
														use
														&ldquo;Start
														Reading!&ldquo;
														from the
														welcome
														page
													</strong>
												</li>
											)}
										</ul>
									</div>
									<div className='flex space-x-4'>
										{isRequired ? (
											<>
												<Button
													asChild
													className='bg-green-600 hover:bg-green-700 flex-1'
												>
													<Link href='/welcome'>
														<BookOpen className='h-4 w-4 mr-2' />
														Return to
														Welcome
														Page
													</Link>
												</Button>
												<Button
													variant='outline'
													asChild
													className='flex-1'
												>
													<Link href='/dashboard'>
														Parent
														Dashboard
													</Link>
												</Button>
											</>
										) : (
											<>
												<Button
													asChild
													className='bg-green-600 hover:bg-green-700'
												>
													<Link href='/dashboard'>
														<BookOpen className='h-4 w-4 mr-2' />
														Go to
														Reading
														Dashboard
													</Link>
												</Button>
												<Button
													variant='outline'
													asChild
												>
													<Link href='/create'>
														Create
														First
														Story
													</Link>
												</Button>
											</>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Info Card */}
					<Card className='mt-8 border-yellow-200 bg-yellow-50'>
						<CardHeader>
							<CardTitle className='flex items-center space-x-2 text-yellow-800'>
								<AlertCircle className='h-5 w-5' />
								<span>Important Notes</span>
							</CardTitle>
						</CardHeader>
						<CardContent className='text-sm text-yellow-800 space-y-2'>
							<p>
								• <strong>Age Control:</strong> Children
								cannot change their year level when
								creating stories - only you can adjust
								these settings.
							</p>
							<p>
								• <strong>Content Safety:</strong> All
								stories are automatically filtered for
								age-appropriate content based on the
								year level you set.
							</p>
							<p>
								• <strong>Progress Tracking:</strong>{" "}
								You can monitor each child&apos;s
								reading progress and achievements from
								your dashboard.
							</p>
							<p>
								• <strong>Privacy:</strong> Each
								child&apos;s reading data is kept
								separate and secure.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</ProtectedRoute>
	);
}