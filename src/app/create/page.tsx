"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getGradeLevelConfig } from "@/config/grade-levels";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ShareStory } from "@/components/social/share-story";
import {
	Sparkles,
	Wand2,
	BookOpen,
	Clock,
	Star,
	ChevronRight,
	Lightbulb,
	RefreshCw,
	Play,
	Search,
} from "lucide-react";
import Link from "next/link";

const getAllThemes = () => {
	return [
		// Year 1 themes (Age 6) - Simple, colorful, familiar
		{
			name: "🐱 Pet Adventures",
			description: "Stories about cute pets and their daily fun",
			year: 1,
			category: "animals",
			keywords: ["pets", "cats", "dogs", "animals", "cute"],
		},
		{
			name: "🏠 Family Time",
			description: "Happy moments with mom, dad, and siblings",
			year: 1,
			category: "family",
			keywords: ["family", "home", "parents", "siblings", "love"],
		},
		{
			name: "🎨 Rainbow World",
			description: "A magical world full of bright colors",
			year: 1,
			category: "fantasy",
			keywords: ["colors", "rainbow", "bright", "magic", "pretty"],
		},
		{
			name: "🦆 Farm Friends",
			description: "Meeting cows, pigs, chickens, and sheep",
			year: 1,
			category: "animals",
			keywords: ["farm", "animals", "cow", "pig", "chicken", "sheep"],
		},
		{
			name: "🧨 Toy Box Magic",
			description: "When your favorite toys come alive to play",
			year: 1,
			category: "fantasy",
			keywords: ["toys", "play", "magic", "alive", "fun"],
		},
		{
			name: "🌳 Garden Explorers",
			description: "Discovering bugs, flowers, and garden secrets",
			year: 1,
			category: "nature",
			keywords: ["garden", "flowers", "bugs", "explore", "nature"],
		},
		{
			name: "🔮 Minecraft Blocks",
			description: "Building simple houses with colorful blocks",
			year: 1,
			category: "minecraft",
			keywords: ["minecraft", "blocks", "building", "simple", "house"],
		},
		{
			name: "🌈 YouTube Kids Shows",
			description: "Fun with Bluey, Peppa Pig, and other favorites",
			year: 1,
			category: "youtube",
			keywords: [
				"youtube",
				"bluey",
				"peppa pig",
				"kids shows",
				"cartoons",
			],
		},
		{
			name: "🎵 Nursery Rhyme Fun",
			description: "Classic songs and rhymes come to life",
			year: 1,
			category: "music",
			keywords: [
				"songs",
				"nursery rhymes",
				"music",
				"singing",
				"classic",
			],
		},
		{
			name: "🎂 Birthday Party",
			description: "Planning the best birthday party ever",
			year: 1,
			category: "celebration",
			keywords: [
				"birthday",
				"party",
				"cake",
				"friends",
				"celebration",
			],
		},
		// Year 2 themes (Age 7) - Learning, school, community
		{
			name: "🏫 School Adventures",
			description: "Making friends and learning cool things at school",
			year: 2,
			category: "school",
			keywords: [
				"school",
				"friends",
				"learning",
				"teacher",
				"classroom",
			],
		},
		{
			name: "🐾 Animal Heroes",
			description: "Rescuing animals and becoming their hero",
			year: 2,
			category: "animals",
			keywords: ["animals", "rescue", "hero", "save", "help"],
		},
		{
			name: "🌦️ Weather Magic",
			description: "Adventures in rain, sunshine, and snow",
			year: 2,
			category: "nature",
			keywords: ["weather", "rain", "sun", "snow", "storm", "rainbow"],
		},
		{
			name: "👩‍🚒 Community Heroes",
			description: "Working with firefighters, doctors, and police",
			year: 2,
			category: "community",
			keywords: [
				"firefighter",
				"police",
				"doctor",
				"teacher",
				"helper",
			],
		},
		{
			name: "🚂 Vehicle Adventures",
			description: "Riding trains, flying planes, and driving cars",
			year: 2,
			category: "vehicles",
			keywords: ["train", "plane", "car", "bus", "vehicle", "travel"],
		},
		{
			name: "🎉 Party Planning",
			description: "Organizing amazing celebrations and parties",
			year: 2,
			category: "celebration",
			keywords: ["party", "celebration", "birthday", "fun", "friends"],
		},
		{
			name: "⛏️ Minecraft Village",
			description: "Building villages and meeting friendly villagers",
			year: 2,
			category: "minecraft",
			keywords: [
				"minecraft",
				"village",
				"building",
				"villager",
				"house",
			],
		},
		{
			name: "🎥 Kid YouTube Stars",
			description: "Fun with Ryan, Vlad, and other kid YouTubers",
			year: 2,
			category: "youtube",
			keywords: ["ryan", "vlad", "youtube", "toys", "kids", "review"],
		},
		{
			name: "🏮 Simple Roblox",
			description: "Easy and fun Roblox games for beginners",
			year: 2,
			category: "roblox",
			keywords: ["roblox", "simple", "games", "fun", "easy"],
		},
		{
			name: "🎨 Art Creation",
			description: "Making beautiful drawings, crafts, and artwork",
			year: 2,
			category: "creative",
			keywords: ["art", "drawing", "craft", "create", "painting"],
		},
		// Year 3 themes (Age 8) - More complex stories, gaming
		{
			name: "🔍 Mystery Detective",
			description: "Solving puzzles and catching sneaky villains",
			year: 3,
			category: "mystery",
			keywords: ["mystery", "detective", "puzzle", "solve", "clues"],
		},
		{
			name: "🏰 Magic Kingdom",
			description: "Wizards, dragons, and magical adventures",
			year: 3,
			category: "fantasy",
			keywords: ["magic", "wizard", "dragon", "fantasy", "kingdom"],
		},
		{
			name: "😂 Comedy Show",
			description: "Funny characters in hilarious situations",
			year: 3,
			category: "comedy",
			keywords: ["funny", "comedy", "laugh", "silly", "humor"],
		},
		{
			name: "⚽ Sports Champions",
			description: "Winning the big game with teamwork and skill",
			year: 3,
			category: "sports",
			keywords: ["sports", "soccer", "basketball", "team", "win"],
		},
		{
			name: "🔩 Minecraft Survival",
			description: "Surviving creepers and building amazing bases",
			year: 3,
			category: "minecraft",
			keywords: ["minecraft", "survival", "creeper", "build", "base"],
		},
		{
			name: "🏮 Roblox Obbies",
			description: "Jumping through tricky obstacle courses",
			year: 3,
			category: "roblox",
			keywords: ["roblox", "obby", "obstacle", "jump", "challenge"],
		},
		{
			name: "🚀 Among Us Space",
			description: "Finding imposters and fixing the spaceship",
			year: 3,
			category: "among us",
			keywords: ["among us", "imposter", "space", "tasks", "crew"],
		},
		{
			name: "🎭 Preston & Friends",
			description: "Hilarious challenges with Preston and Brianna",
			year: 3,
			category: "youtube",
			keywords: [
				"preston",
				"brianna",
				"challenge",
				"youtube",
				"funny",
			],
		},
		{
			name: "🎵 Music Adventures",
			description: "Singing, dancing, and making awesome music",
			year: 3,
			category: "music",
			keywords: ["music", "sing", "dance", "song", "band"],
		},
		{
			name: "🏆 Gaming Tournaments",
			description: "Competing in epic video game competitions",
			year: 3,
			category: "gaming",
			keywords: [
				"gaming",
				"tournament",
				"compete",
				"video games",
				"win",
			],
		},
		// Year 4 themes (Age 9) - Adventure, strategy, popular culture
		{
			name: "🦕 Dinosaur Expedition",
			description:
				"Discovering T-Rex, velociraptors, and fossil secrets",
			year: 4,
			category: "adventure",
			keywords: [
				"dinosaur",
				"t-rex",
				"fossil",
				"prehistoric",
				"expedition",
			],
		},
		{
			name: "🚀 Space Mission",
			description: "Meeting aliens and exploring mysterious planets",
			year: 4,
			category: "space",
			keywords: ["space", "alien", "planet", "rocket", "astronaut"],
		},
		{
			name: "🏰 Minecraft Empire",
			description: "Building massive castles and ruling kingdoms",
			year: 4,
			category: "minecraft",
			keywords: ["minecraft", "castle", "kingdom", "empire", "build"],
		},
		{
			name: "💼 Roblox Business",
			description: "Creating successful tycoons and earning millions",
			year: 4,
			category: "roblox",
			keywords: ["roblox", "tycoon", "business", "money", "success"],
		},
		{
			name: "💰 MrBeast Challenges",
			description: "Crazy challenges that help people and win prizes",
			year: 4,
			category: "youtube",
			keywords: ["mrbeast", "challenge", "help", "prize", "charity"],
		},
		{
			name: "🎆 Fortnite Legends",
			description: "Epic battles, building, and Victory Royales",
			year: 4,
			category: "fortnite",
			keywords: [
				"fortnite",
				"battle",
				"victory royale",
				"build",
				"epic",
			],
		},
		{
			name: "👾 Among Us Crew",
			description: "Musical crewmates solving mysteries with songs",
			year: 4,
			category: "among us",
			keywords: ["among us", "musical", "crew", "mystery", "song"],
		},
		{
			name: "💨 Speedrun Masters",
			description: "Racing to beat games in record time",
			year: 4,
			category: "gaming",
			keywords: ["speedrun", "fast", "record", "race", "gaming"],
		},
		{
			name: "🦄 Unicorn Magic",
			description: "Rainbow adventures with magical unicorn friends",
			year: 4,
			category: "fantasy",
			keywords: [
				"unicorn",
				"magic",
				"rainbow",
				"fantasy",
				"friendship",
			],
		},
		{
			name: "🔬 Science Lab",
			description: "Amazing experiments and cool inventions",
			year: 4,
			category: "science",
			keywords: [
				"science",
				"experiment",
				"lab",
				"invention",
				"discovery",
			],
		},
		// Year 5 themes (Age 10) - Complex gaming, social media, creativity
		{
			name: "🎮 Epic Gaming Quest",
			description: "Multi-level adventures inspired by favorite games",
			year: 5,
			category: "gaming",
			keywords: ["gaming", "quest", "adventure", "level", "epic"],
		},
		{
			name: "🏴‍☠️ Pirate Legends",
			description: "Searching for legendary treasure across the seas",
			year: 5,
			category: "adventure",
			keywords: ["pirate", "treasure", "ship", "ocean", "legend"],
		},
		{
			name: "🌍 Minecraft Modded",
			description: "Exploring modded worlds with insane new features",
			year: 5,
			category: "minecraft",
			keywords: ["minecraft", "mods", "modded", "features", "explore"],
		},
		{
			name: "🏮 Roblox Horror",
			description: "Surviving spooky games like Doors and Piggy",
			year: 5,
			category: "roblox",
			keywords: [
				"roblox",
				"horror",
				"doors",
				"piggy",
				"scary",
				"survive",
			],
		},
		{
			name: "🏆 Fortnite Pro",
			description: "Competing in tournaments like a real esports star",
			year: 5,
			category: "fortnite",
			keywords: [
				"fortnite",
				"tournament",
				"pro",
				"esports",
				"compete",
			],
		},
		{
			name: "📱 TikTok Viral",
			description: "Creating the next big dance or trend",
			year: 5,
			category: "social media",
			keywords: ["tiktok", "viral", "dance", "trend", "famous"],
		},
		{
			name: "🌈 Preston Academy",
			description: "Learning epic life hacks and gaming tricks",
			year: 5,
			category: "youtube",
			keywords: ["preston", "life hack", "tricks", "gaming", "learn"],
		},
		{
			name: "🎬 YouTube Creator",
			description: "Making viral shorts and building a channel",
			year: 5,
			category: "youtube",
			keywords: ["youtube", "shorts", "creator", "viral", "channel"],
		},
		{
			name: "🦸 Superhero Academy",
			description: "Training to become the world's next superhero",
			year: 5,
			category: "superhero",
			keywords: ["superhero", "powers", "academy", "training", "hero"],
		},
		{
			name: "📚 Time Travel",
			description: "Adventures through different periods in history",
			year: 5,
			category: "adventure",
			keywords: [
				"time travel",
				"history",
				"past",
				"future",
				"adventure",
			],
		},
		// Year 6 themes (Age 11) - Advanced concepts, leadership, complex stories
		{
			name: "🛸 Tech Innovation",
			description: "Inventing AI, robots, and futuristic gadgets",
			year: 6,
			category: "technology",
			keywords: ["technology", "AI", "robot", "future", "invention"],
		},
		{
			name: "👑 Leadership Challenge",
			description: "Leading teams through impossible missions",
			year: 6,
			category: "leadership",
			keywords: [
				"leader",
				"team",
				"mission",
				"challenge",
				"responsibility",
			],
		},
		{
			name: "🗺️ Dream SMP Legacy",
			description: "Epic server politics, wars, and alliances",
			year: 6,
			category: "minecraft",
			keywords: ["dream smp", "server", "politics", "war", "alliance"],
		},
		{
			name: "🏆 Esports Champion",
			description: "Competing in world championship tournaments",
			year: 6,
			category: "gaming",
			keywords: [
				"esports",
				"champion",
				"tournament",
				"competition",
				"pro",
			],
		},
		{
			name: "💰 Philanthropy Hero",
			description: "Like MrBeast, changing the world through giving",
			year: 6,
			category: "social impact",
			keywords: ["mrbeast", "charity", "help", "world", "giving"],
		},
		{
			name: "🎬 Content Empire",
			description: "Building a multimedia entertainment business",
			year: 6,
			category: "business",
			keywords: [
				"content",
				"business",
				"empire",
				"entertainment",
				"creator",
			],
		},
		{
			name: "🐾 Aphmau Universe",
			description: "Complex storylines with werewolves and magic",
			year: 6,
			category: "minecraft",
			keywords: ["aphmau", "werewolf", "magic", "story", "roleplay"],
		},
		{
			name: "🌍 Global Impact",
			description: "Solving real-world problems like climate change",
			year: 6,
			category: "social impact",
			keywords: ["global", "climate", "environment", "solve", "world"],
		},
		{
			name: "📺 Viral Phenomenon",
			description: "Creating content that breaks the internet",
			year: 6,
			category: "social media",
			keywords: [
				"viral",
				"internet",
				"famous",
				"content",
				"phenomenon",
			],
		},
		{
			name: "🌌 Space Colonist",
			description: "Building the first cities on Mars and beyond",
			year: 6,
			category: "space",
			keywords: ["space", "mars", "colony", "city", "planet"],
		},
	];
};

const getThemesForYear = (year: number) => {
	return getAllThemes().filter((theme) => theme.year === year);
};

const STORY_PROMPTS = [
	"A robot that learns to paint beautiful pictures",
	"The school cafeteria food that comes to life",
	"A time machine hidden in the library",
	"The day gravity stopped working",
	"A friendship between a dragon and a scientist",
	"The mystery of the disappearing homework",
	"A talking bicycle that gives tours of the city",
	"The kid who could communicate with computers",
	"A secret door that leads to different time periods",
	"The day all the animals in the zoo switched personalities",
	"A Minecraft world where the blocks start building themselves",
	"Getting trapped inside a Roblox horror game at midnight",
	"A YouTube video that magically brings Sunny and Melon to life",
	"The day all Fortnite skins appeared in your neighborhood",
	"A TikTok dance that opens portals to different dimensions",
	"Finding a secret portal to the Dream SMP server",
	"The Among Us crewmates who crash-land at your school",
	"A kid who discovers they can spawn Minecraft items in real life",
	"The day all your favorite YouTubers moved to your town",
	"A Preston challenge that accidentally saves the world",
	"The Aphmau characters who need help solving a real mystery",
	"A Roblox tycoon game that controls your actual allowance",
	"The MrBeast challenge that turns everyone into millionaires",
	"A Fortnite storm that appears in real life but makes everything fun",
	"The day when all video game NPCs came to life as your friends",
	"A TikTok algorithm that predicts exactly what will make you happy",
	"The Minecraft villager who becomes your best friend and life coach",
	"A Roblox obby that teaches you to fly in real life",
	"The speedrun challenge where you have to complete a day of school",
	"An Among Us meeting where you have to solve real-world problems",
];

interface StorySettings {
	theme: string;
	yearLevel: number; // Year 1-6
	storyType: "fiction" | "non_fiction";
	customPrompt: string;
	includeQuestions: boolean;
	includeImages: boolean;
}

export default function CreatePage() {
	const [currentStep, setCurrentStep] = useState<
		"theme" | "details" | "generating" | "preview"
	>("theme");
	const [settings, setSettings] = useState<StorySettings>({
		theme: "",
		yearLevel: 3,
		storyType: "fiction",
		customPrompt: "",
		includeQuestions: true,
		includeImages: true,
	});
	const [customPromptMode, setCustomPromptMode] = useState(false);
	const [generatedStory, setGeneratedStory] = useState<{
		title: string;
		content: string;
		description?: string;
		imageUrl?: string;
		reading_level?: string;
		word_count?: number;
		estimated_reading_time?: number;
		difficulty_rating?: number;
		id?: string;
		estimatedReadingTime?: number;
		questions?: Array<{
			question: string;
			type: string;
			options: string[];
			correct: string;
		}>;
	} | null>(null);
	const [generatedImages, setGeneratedImages] = useState<
		Array<{
			segmentId: string;
			imageUrl: string; // signed URL for immediate display
			thumbnailUrl?: string; // signed URL for preview
			storagePath?: string; // private storage path
			thumbnailStoragePath?: string; // private storage path for thumb
			prompt?: string;
			revisedPrompt?: string;
			type?: "cover" | "segment";
		}>
	>([]);
	const [, setIsGenerating] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	const handleThemeSelect = (theme: string) => {
		setSettings({ ...settings, theme });
		if (!customPromptMode) {
			setCurrentStep("details");
		}
	};

	const saveStoryToDatabase = async () => {
		if (!generatedStory) return;

		setIsSaving(true);
		// Prepare images and segments
		const coverImage =
			generatedImages.find((i) => i.type === "cover") ||
			generatedImages[0];
		const coverImageUrl = coverImage?.storagePath || coverImage?.imageUrl;
		const coverThumbUrl =
			coverImage?.thumbnailStoragePath || coverImage?.thumbnailUrl;
		const imageMap = new Map<string, string>(
			generatedImages.map((i) => [
				i.segmentId,
				i.storagePath || i.imageUrl,
			])
		);
		const thumbMap = new Map<string, string | undefined>(
			generatedImages.map((i) => [
				i.segmentId,
				i.thumbnailStoragePath || i.thumbnailUrl,
			])
		);
		const promptMap = new Map<string, string | undefined>(
			generatedImages.map((i) => [i.segmentId, i.prompt])
		);

		const parseSegmentsForSave = (raw: string) => {
			let parts = raw.split(/#### Segment \d+:/);
			if (parts.length === 1)
				parts = raw.split(/### \*\*Segment \d+:/);
			if (parts.length === 1)
				parts = raw.split(/\*\*Segment \d+:\*\*/);
			const clean = (t: string) =>
				t
					.replace(/^#{1,6}\s+/gm, "")
					.replace(/\*\*(.*?)\*\*/g, "$1")
					.replace(/\*(.*?)\*/g, "$1")
					.replace(/\*\*\[Image Prompt:.*?\]\*\*/g, "")
					.replace(/\[Image Prompt:.*?\]/g, "")
					.replace(/Image Prompt:.*$/gm, "")
					.replace(/Suggested Image Prompt:.*$/gm, "")
					.trim();

			if (parts.length > 1) {
				return parts.slice(1).map((part, idx) => {
					const lines = part.trim().split("\n");
					const title = clean(
						(lines[0] || "").replace(/\*\*$/, "")
					);
					const contentLines = lines.slice(1).filter((ln) => {
						const x = ln.trim();
						return (
							x &&
							!x.startsWith("####") &&
							!x.startsWith("###") &&
							!x.startsWith("**[Image") &&
							!x.startsWith("[Image") &&
							!x.startsWith("*Image Prompt:") &&
							!x.includes("Suggested Comprehension")
						);
					});
					const content = clean(contentLines.join("\n"));
					const order = idx + 1;
					return {
						segment_order: order,
						title,
						content,
						image_url: imageMap.get(`segment_${order}`),
						thumbnail_url: thumbMap.get(`segment_${order}`),
						image_prompt: promptMap.get(`segment_${order}`),
					};
				});
			}
			// Fallback single segment
			return [
				{
					segment_order: 1,
					title: generatedStory.title,
					content: clean(raw),
					image_url: imageMap.get("segment_1") || coverImageUrl,
					thumbnail_url:
						thumbMap.get("segment_1") || coverThumbUrl,
					image_prompt: promptMap.get("segment_1"),
				},
			];
		};

		const segmentsToSave = parseSegmentsForSave(generatedStory.content);

		try {
			const response = await fetch("/api/save-story", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: generatedStory.title,
					description:
						generatedStory.description ||
						`A ${settings.storyType} story about ${settings.theme}`,
					content: generatedStory.content,
					genre: settings.theme,
					theme: settings.customPrompt || settings.theme,
					reading_level:
						generatedStory.reading_level ||
						getGradeLevelConfig(settings.yearLevel)
							.readingLevel,
					story_type: settings.storyType,
					grade_level: settings.yearLevel,
					word_count:
						generatedStory.word_count ||
						getGradeLevelConfig(settings.yearLevel).wordCount
							.recommended,
					estimated_reading_time:
						generatedStory.estimated_reading_time ||
						Math.ceil(
							getGradeLevelConfig(settings.yearLevel)
								.wordCount.recommended / 100
						),
					difficulty_rating:
						generatedStory.difficulty_rating ||
						getGradeLevelConfig(settings.yearLevel)
							.questionComplexity,
					cover_image_url: coverImageUrl,
					cover_thumbnail_url: coverThumbUrl,
					segments: segmentsToSave,
				}),
			});

			const data = await response.json();

			if (data.success) {
				setSaved(true);
				// Update the story with the database ID
				setGeneratedStory({
					...generatedStory,
					id: data.story.id,
				});
			} else {
				console.error("Failed to save story:", data.error);
				alert("Failed to save story to library. Please try again.");
			}
		} catch (error) {
			console.error("Error saving story:", error);
			alert("Failed to save story to library. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const generateStory = async () => {
		setIsGenerating(true);
		setCurrentStep("generating");

		try {
			const response = await fetch("/api/generate-story", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					theme: settings.theme,
					customTopic: settings.customPrompt || undefined,
					gradeLevel: settings.yearLevel,
					storyType: settings.storyType,
					generateImages: settings.includeImages,
					imageStyle: "illustration",
				}),
			});

			const data = await response.json();

			if (data.success) {
				const storyObj =
					typeof data.story === "string"
						? data.storyData
							? {
									title: data.storyData.title,
									content: data.storyData.content,
									description:
										data.storyData.description,
									reading_level:
										data.storyData.reading_level,
									word_count:
										data.storyData.word_count,
									estimated_reading_time:
										data.storyData
											.estimated_reading_time,
									difficulty_rating:
										data.storyData
											.difficulty_rating,
							  }
							: {
									title: "Untitled Story",
									content: data.story,
							  }
						: data.story;

				setGeneratedStory(storyObj);
				if (Array.isArray(data.images) && data.images.length) {
					setGeneratedImages(data.images);
				}
				setCurrentStep("preview");
			} else {
				console.error("Story generation failed:", data.error);
				// Fallback to mock data for demo
				setGeneratedStory({
					id: "generated-1",
					title: "The Mystery of the Coding Cat",
					content: `Once upon a time, in a small town called Bitburg, there lived a very unusual cat named Pixel. Unlike other cats who spent their days napping and chasing mice, Pixel had a secret passion – computer programming!

Every night, when the Thompson family was asleep, Pixel would sneak downstairs to their home office. With her tiny paws, she would tap away at the keyboard, writing code that could solve problems no human programmer had ever tackled.

One morning, young Emma Thompson woke up to find something incredible on the computer screen. Her math homework had been completed overnight – and not just completed, but transformed into a fun, interactive game!

"Mom, Dad!" Emma called excitedly. "Someone turned my boring math problems into an amazing puzzle adventure!"

But who could have done such a thing? Emma was determined to solve this mystery. She decided to stay up late and discover the truth...

That night, Emma hid behind the couch in the living room. As the clock struck midnight, she heard the soft tap-tap-tapping of keys. Peeking around the corner, she gasped at what she saw.

There was Pixel, sitting upright at the computer, her green eyes focused intently on the glowing screen. Lines of colorful code scrolled by as the clever cat programmed with incredible speed and precision.

"Pixel!" Emma whispered in amazement. "You're a programmer!"

The cat turned around, expecting to be in trouble. But instead, Emma's face lit up with the biggest smile.

"This is the coolest thing ever! Can you teach me how to code too?"

And that's how Emma and Pixel became the best programming team in Bitburg, creating games and apps that helped kids all over town learn and have fun at the same time.`,
					estimatedReadingTime: 8,
					questions: [
						{
							question: "What was Pixel's secret talent?",
							type: "multiple_choice",
							options: [
								"Singing",
								"Computer Programming",
								"Painting",
								"Dancing",
							],
							correct: "Computer Programming",
						},
					],
				});
				setCurrentStep("preview");
			}
		} catch (error) {
			console.error("Error generating story:", error);
			// Fallback for demo
			setGeneratedStory({
				title: "Demo Story",
				content: "Story generation failed. Please check your API keys and try again.",
				estimatedReadingTime: 1,
			});
			setCurrentStep("preview");
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<ProtectedRoute>
			<div className='container mx-auto px-4 py-8 max-w-4xl'>
				{/* Header */}
				<div className='text-center mb-8'>
					<h1 className='text-3xl font-bold text-foreground mb-2'>
						Create Your Own Story ✨
					</h1>
					<p className='text-muted text-lg'>
						Let AI help you create an amazing, personalized
						adventure story!
					</p>
				</div>

				{/* Progress Steps */}
				<div className='flex items-center justify-center space-x-4 mb-8'>
					{[
						"Choose Theme",
						"Story Details",
						"Generating",
						"Preview",
					].map((step, index) => {
						const stepKeys = [
							"theme",
							"details",
							"generating",
							"preview",
						];
						const currentIndex =
							stepKeys.indexOf(currentStep);
						const isActive = index === currentIndex;
						const isCompleted = index < currentIndex;

						return (
							<div
								key={step}
								className='flex items-center'
							>
								<div
									className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
										isActive
											? "bg-primary text-white"
											: isCompleted
											? "bg-success text-white"
											: "bg-muted text-muted-foreground"
									}`}
								>
									{index + 1}
								</div>
								<span
									className={`ml-2 text-sm ${
										isActive
											? "text-foreground font-medium"
											: "text-muted"
									}`}
								>
									{step}
								</span>
								{index < 3 && (
									<ChevronRight className='h-4 w-4 text-muted ml-4' />
								)}
							</div>
						);
					})}
				</div>

				{/* Step 1: Theme Selection */}
				{currentStep === "theme" && (
					<div className='space-y-6'>
						{/* Year Level Selector */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center space-x-2'>
									<BookOpen className='h-5 w-5 text-primary' />
									<span>What year are you in?</span>
								</CardTitle>
								<CardDescription>
									This helps us create a story
									that&apos;s perfect for your
									reading level!
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-6 gap-3'>
									{[1, 2, 3, 4, 5, 6].map((year) => {
										const config =
											getGradeLevelConfig(
												year
											);
										return (
											<button
												key={year}
												onClick={() =>
													setSettings({
														...settings,
														yearLevel:
															year,
													})
												}
												className={`p-4 rounded-lg border-2 text-center transition-all hover:scale-105 ${
													settings.yearLevel ===
													year
														? "border-primary bg-primary/10"
														: "border-border hover:border-primary/50"
												}`}
											>
												<div className='text-2xl font-bold text-primary mb-1'>
													Year {year}
												</div>
												<div className='text-xs text-muted'>
													Age{" "}
													{`${
														year + 4
													}+`}{" "}
													•{" "}
													{
														config.readingLevel
													}
												</div>
												<div className='text-xs text-muted mt-1'>
													~
													{
														config
															.wordCount
															.recommended
													}{" "}
													words
												</div>
											</button>
										);
									})}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className='flex items-center space-x-2'>
									<Lightbulb className='h-5 w-5 text-secondary' />
									<span>
										What kind of adventure do you
										want?
									</span>
								</CardTitle>
								<CardDescription>
									These themes are perfect for Year{" "}
									{settings.yearLevel} readers!
									Choose one or create your own
									custom story idea.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='flex justify-center mb-6'>
									<div className='flex space-x-1 bg-muted/20 p-1 rounded-lg'>
										<button
											onClick={() =>
												setCustomPromptMode(
													false
												)
											}
											className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
												!customPromptMode
													? "bg-primary text-white shadow-sm"
													: "text-muted hover:text-foreground"
											}`}
										>
											Choose Theme
										</button>
										<button
											onClick={() =>
												setCustomPromptMode(
													true
												)
											}
											className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
												customPromptMode
													? "bg-primary text-white shadow-sm"
													: "text-muted hover:text-foreground"
											}`}
										>
											Custom Idea
										</button>
									</div>
								</div>

								{!customPromptMode ? (
									<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
										{getThemesForYear(
											settings.yearLevel
										).map((theme, index) => (
											<button
												key={index}
												onClick={() =>
													handleThemeSelect(
														theme.name
													)
												}
												className={`p-4 rounded-lg border-2 text-left transition-all hover:scale-105 ${
													settings.theme ===
													theme.name
														? "border-primary bg-primary/10"
														: "border-border hover:border-primary/50"
												}`}
											>
												<h3 className='font-semibold text-base mb-1'>
													{theme.name}
												</h3>
												<p className='text-sm text-muted'>
													{
														theme.description
													}
												</p>
											</button>
										))}
									</div>
								) : (
									<div className='space-y-4'>
										<div>
											<label className='block text-sm font-medium mb-2'>
												Your Story Idea
											</label>
											<textarea
												className='w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
												rows={4}
												placeholder="Describe your story idea... For example: 'A story about a kid who finds a magical skateboard that can fly through clouds and has to save the sky kingdom from an evil storm wizard.'"
												value={
													settings.customPrompt
												}
												onChange={(e) =>
													setSettings({
														...settings,
														customPrompt:
															e
																.target
																.value,
													})
												}
											/>
										</div>

										<div>
											<h3 className='font-medium mb-3 flex items-center space-x-2'>
												<Lightbulb className='h-4 w-4 text-secondary' />
												<span>
													Need
													inspiration?
													Try these
													ideas:
												</span>
											</h3>
											<div className='grid md:grid-cols-2 gap-3'>
												{STORY_PROMPTS.slice(
													0,
													6
												).map(
													(
														prompt,
														index
													) => (
														<button
															key={
																index
															}
															onClick={() =>
																setSettings(
																	{
																		...settings,
																		customPrompt:
																			prompt,
																	}
																)
															}
															className='p-3 text-left rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all'
														>
															<p className='text-sm'>
																{
																	prompt
																}
															</p>
														</button>
													)
												)}
											</div>
										</div>

										<Button
											onClick={() =>
												setCurrentStep(
													"details"
												)
											}
											disabled={
												!settings.customPrompt.trim()
											}
											className='w-full'
										>
											Continue with Custom Idea
											<ChevronRight className='h-4 w-4 ml-2' />
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				)}

				{/* Step 2: Story Details */}
				{currentStep === "details" && (
					<div className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center space-x-2'>
									<Wand2 className='h-5 w-5 text-primary' />
									<span>Story Settings</span>
								</CardTitle>
								<CardDescription>
									Let&apos;s customize your story to
									make it perfect for you!
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6'>
								{/* Selected Theme Display */}
								<div className='p-4 bg-primary/10 rounded-lg border border-primary/20'>
									<h3 className='font-medium mb-1'>
										Your Story Theme:
									</h3>
									<p className='text-primary font-semibold'>
										{settings.theme ||
											settings.customPrompt}
									</p>
								</div>

								{/* Year Level Display */}
								<div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
									<h3 className='font-medium mb-2'>
										Story Configuration for Year{" "}
										{settings.yearLevel}
									</h3>
									<div className='grid md:grid-cols-3 gap-4 text-sm'>
										<div>
											<span className='text-muted'>
												Age Group:
											</span>
											<div className='font-medium'>
												{
													getGradeLevelConfig(
														settings.yearLevel
													).age
												}{" "}
												years old
											</div>
										</div>
										<div>
											<span className='text-muted'>
												Reading Level:
											</span>
											<div className='font-medium capitalize'>
												{
													getGradeLevelConfig(
														settings.yearLevel
													).readingLevel
												}
											</div>
										</div>
										<div>
											<span className='text-muted'>
												Story Length:
											</span>
											<div className='font-medium'>
												~
												{
													getGradeLevelConfig(
														settings.yearLevel
													).wordCount
														.recommended
												}{" "}
												words
											</div>
										</div>
									</div>
									<p className='text-xs text-muted mt-2'>
										✨ Vocabulary:{" "}
										{
											getGradeLevelConfig(
												settings.yearLevel
											).vocabularyLevel
												.description
										}
									</p>
								</div>

								{/* Story Type */}
								<div>
									<label className='block text-sm font-medium mb-3'>
										Story Type
									</label>
									<div className='grid grid-cols-2 gap-4'>
										<button
											onClick={() =>
												setSettings({
													...settings,
													storyType:
														"fiction",
												})
											}
											className={`p-4 rounded-lg border-2 text-center transition-all hover:scale-105 ${
												settings.storyType ===
												"fiction"
													? "border-primary bg-primary/10"
													: "border-border hover:border-primary/50"
											}`}
										>
											<div className='text-2xl mb-2'>
												📚
											</div>
											<div className='font-medium'>
												Fiction
											</div>
											<div className='text-sm text-muted'>
												Made-up stories with
												imagination
											</div>
										</button>
										<button
											onClick={() =>
												setSettings({
													...settings,
													storyType:
														"non_fiction",
												})
											}
											className={`p-4 rounded-lg border-2 text-center transition-all hover:scale-105 ${
												settings.storyType ===
												"non_fiction"
													? "border-primary bg-primary/10"
													: "border-border hover:border-primary/50"
											}`}
										>
											<div className='text-2xl mb-2'>
												🔍
											</div>
											<div className='font-medium'>
												Non-Fiction
											</div>
											<div className='text-sm text-muted'>
												Real facts and
												information
											</div>
										</button>
									</div>
								</div>

								{/* Additional Options */}
								<div className='space-y-4'>
									<h3 className='font-medium'>
										Extra Features
									</h3>
									<div className='space-y-3'>
										<label className='flex items-center space-x-3'>
											<input
												type='checkbox'
												checked={
													settings.includeQuestions
												}
												onChange={(e) =>
													setSettings({
														...settings,
														includeQuestions:
															e
																.target
																.checked,
													})
												}
												className='w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded'
											/>
											<span className='text-sm'>
												Include
												comprehension
												questions
												(recommended)
											</span>
										</label>
										<label className='flex items-center space-x-3'>
											<input
												type='checkbox'
												checked={
													settings.includeImages
												}
												onChange={(e) =>
													setSettings({
														...settings,
														includeImages:
															e
																.target
																.checked,
													})
												}
												className='w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded'
											/>
											<span className='text-sm'>
												Generate AI
												illustrations
											</span>
										</label>
									</div>
								</div>

								<div className='flex space-x-4'>
									<Button
										variant='outline'
										onClick={() =>
											setCurrentStep("theme")
										}
										className='flex-1'
									>
										Back
									</Button>
									<Button
										onClick={generateStory}
										className='flex-1'
									>
										<Sparkles className='h-4 w-4 mr-2' />
										Create My Story!
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Step 3: Generating */}
				{currentStep === "generating" && (
					<div className='text-center py-12'>
						<Card className='max-w-md mx-auto'>
							<CardContent className='p-8'>
								<div className='animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
								<h2 className='text-xl font-semibold mb-2'>
									Creating your story...
								</h2>
								<p className='text-muted mb-4'>
									Our AI is crafting an amazing
									adventure just for you!
								</p>
								<div className='space-y-2 text-sm text-muted'>
									<div className='flex items-center justify-center space-x-2'>
										<Search className='h-4 w-4' />
										<span>
											Researching your topic...
										</span>
									</div>
									<div className='flex items-center justify-center space-x-2'>
										<Wand2 className='h-4 w-4' />
										<span>
											{generatedImages.length >
												0 && (
												<div className='space-y-2'>
													<h4 className='font-medium'>
														Generated
														Images
													</h4>
													<div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
														{generatedImages.map(
															(
																img,
																idx
															) => (
																<div
																	key={
																		idx
																	}
																	className='flex flex-col items-center'
																>
																	{/* eslint-disable-next-line @next/next/no-img-element */}
																	<img
																		src={
																			img.thumbnailUrl ||
																			img.imageUrl
																		}
																		alt={`Story image ${
																			idx +
																			1
																		}`}
																		className='w-full h-32 object-cover rounded border'
																	/>
																	<div className='text-xs text-muted mt-1 truncate w-full'>
																		{img.type ===
																		"cover"
																			? "Cover"
																			: img.segmentId}
																	</div>
																</div>
															)
														)}
													</div>
												</div>
											)}
											Writing your personalized
											story...
										</span>
									</div>
									{settings.includeQuestions && (
										<div className='flex items-center justify-center space-x-2'>
											<Star className='h-4 w-4' />
											<span>
												Creating fun
												questions...
											</span>
										</div>
									)}
									{settings.includeImages && (
										<div className='flex items-center justify-center space-x-2'>
											<Sparkles className='h-4 w-4' />
											<span>
												Generating colorful
												illustrations...
											</span>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Step 4: Preview */}
				{currentStep === "preview" && generatedStory && (
					<div className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center space-x-2'>
									<BookOpen className='h-5 w-5 text-success' />
									<span>
										Your Story is Ready! 🎉
									</span>
								</CardTitle>
								<CardDescription>
									Here&apos;s a preview of your
									personalized adventure story
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									<div className='text-center p-6 bg-gradient-to-br from-success/10 to-primary/10 rounded-lg border border-success/20'>
										<h2 className='text-2xl font-bold text-foreground mb-2'>
											{generatedStory.title}
										</h2>
										<div className='flex items-center justify-center space-x-4 text-sm text-muted'>
											<span className='flex items-center space-x-1'>
												<Clock className='h-4 w-4' />
												<span>
													{generatedStory.estimatedReadingTime ||
														generatedStory.estimated_reading_time}{" "}
													min read
												</span>
											</span>
											<span className='capitalize'>
												Year{" "}
												{settings.yearLevel}
											</span>
											<span className='capitalize'>
												{settings.storyType}
											</span>
										</div>
									</div>

									<div className='max-h-64 overflow-y-auto p-4 bg-muted/10 rounded-lg border'>
										<div className='reading-text text-sm leading-relaxed'>
											{generatedStory.content}
										</div>
									</div>

									{/* Save to Library */}
									{!saved && (
										<div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
											<div className='flex items-center justify-between'>
												<div>
													<h3 className='font-medium text-blue-900'>
														Save to
														Story
														Library
													</h3>
													<p className='text-sm text-blue-700'>
														Add this
														story to
														the
														library so
														other
														students
														can read
														it too!
													</p>
												</div>
												<Button
													onClick={
														saveStoryToDatabase
													}
													disabled={
														isSaving
													}
												>
													{isSaving
														? "Saving..."
														: "Save to Library"}
												</Button>
											</div>
										</div>
									)}

									{saved && (
										<div className='p-4 bg-green-50 rounded-lg border border-green-200'>
											<div className='flex items-center space-x-2'>
												<div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'>
													<span className='text-white text-sm'>
														✓
													</span>
												</div>
												<div>
													<h3 className='font-medium text-green-900'>
														Story
														Saved!
													</h3>
													<p className='text-sm text-green-700'>
														Your story
														is now
														available
														in the
														library
														for
														everyone
														to enjoy.
													</p>
												</div>
											</div>
										</div>
									)}

									<div className='flex space-x-4'>
										<Button
											variant='outline'
											onClick={() =>
												setCurrentStep(
													"details"
												)
											}
											className='flex-1'
										>
											<RefreshCw className='h-4 w-4 mr-2' />
											Create Different Story
										</Button>
										<Button
											className='flex-1'
											asChild
										>
											<Link
												href={
													generatedStory.id
														? `/read/${generatedStory.id}`
														: "/stories"
												}
											>
												<Play className='h-4 w-4 mr-2' />
												{generatedStory.id
													? "Start Reading!"
													: "Browse Stories"}
											</Link>
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Social Sharing */}
						{generatedStory.id && (
							<ShareStory
								story={{
									id: generatedStory.id,
									title: generatedStory.title,
									description:
										generatedStory.description ||
										`A ${settings.storyType} story about ${settings.theme}`,
									content: generatedStory.content,
									grade_level: settings.yearLevel,
									estimated_reading_time:
										generatedStory.estimatedReadingTime ||
										generatedStory.estimated_reading_time ||
										5,
									created_by: "current_user", // This would be the actual user ID in a real app
								}}
								showDownload={true}
							/>
						)}
					</div>
				)}
			</div>
		</ProtectedRoute>
	);
}
