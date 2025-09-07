import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { BookOpen, Sparkles, Trophy, Users, Zap, Heart } from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<>
			{/* Hero Section */}
			<section className='relative py-20 px-4 bg-gradient-to-br from-primary/10 via-secondary/5 to-success/10'>
				<div className='container mx-auto max-w-6xl'>
					<div className='text-center space-y-8'>
						<div className='inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20'>
							<Sparkles className='h-4 w-4 text-primary' />
							<span className='text-sm font-medium text-primary'>
								AI-Powered Reading Adventures
							</span>
						</div>

						<h1 className='text-4xl md:text-6xl font-bold tracking-tight'>
							Reading Made
							<span className='text-primary block'>
								Fun & Exciting!
							</span>
						</h1>

						<p className='text-xl text-muted max-w-3xl mx-auto leading-relaxed'>
							Join thousands of kids on amazing reading
							adventures! Create your own stories, solve
							mysteries, and become a reading superhero
							with AI-powered tales and games.
						</p>

						<div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
							<Button
								size='lg'
								className='text-lg px-8 py-6'
								asChild
							>
								<Link href='/dashboard'>
									<Zap className='h-5 w-5 mr-2' />
									Start Your Adventure
								</Link>
							</Button>
							<Button
								variant='outline'
								size='lg'
								className='text-lg px-8 py-6'
								asChild
							>
								<Link href='/stories'>
									<BookOpen className='h-5 w-5 mr-2' />
									Explore Stories
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className='py-20 px-4'>
				<div className='container mx-auto max-w-6xl'>
					<div className='text-center space-y-4 mb-16'>
						<h2 className='text-3xl md:text-4xl font-bold'>
							Why Kids Love PrimaryReading
						</h2>
						<p className='text-xl text-muted max-w-2xl mx-auto'>
							We&apos;ve made reading as exciting as your
							favorite video game!
						</p>
					</div>

					<div className='grid md:grid-cols-3 gap-8'>
						<Card className='hover:shadow-xl transition-all duration-300 hover:scale-105'>
							<CardHeader className='text-center'>
								<div className='mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4'>
									<Sparkles className='h-6 w-6 text-primary' />
								</div>
								<CardTitle className='text-xl'>
									AI Story Magic
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className='text-center text-base leading-relaxed'>
									Create personalized stories about
									dragons, space adventures,
									detective mysteries, and anything
									you can imagine! Each story is
									unique and made just for you.
								</CardDescription>
							</CardContent>
						</Card>

						<Card className='hover:shadow-xl transition-all duration-300 hover:scale-105'>
							<CardHeader className='text-center'>
								<div className='mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-4'>
									<Trophy className='h-6 w-6 text-success' />
								</div>
								<CardTitle className='text-xl'>
									Reading Rewards
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className='text-center text-base leading-relaxed'>
									Earn badges, build reading streaks,
									level up, and unlock new story
									categories! Reading becomes as
									rewarding as your favorite games.
								</CardDescription>
							</CardContent>
						</Card>

						<Card className='hover:shadow-xl transition-all duration-300 hover:scale-105'>
							<CardHeader className='text-center'>
								<div className='mx-auto w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4'>
									<Heart className='h-6 w-6 text-orange-500' />
								</div>
								<CardTitle className='text-xl'>
									Interactive Fun
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className='text-center text-base leading-relaxed'>
									Answer questions by drawing,
									recording your voice, or playing
									mini-games. Every story comes with
									exciting activities that make
									learning stick!
								</CardDescription>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Popular Themes Section */}
			<section className='py-20 px-4 bg-secondary/5'>
				<div className='container mx-auto max-w-6xl'>
					<div className='text-center space-y-4 mb-16'>
						<h2 className='text-3xl md:text-4xl font-bold'>
							Adventure Awaits!
						</h2>
						<p className='text-xl text-muted max-w-2xl mx-auto'>
							Choose from exciting themes that kids
							actually want to read about
						</p>
					</div>

					<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
						{[
							{
								name: "🔍 Mystery Detective",
								color: "bg-purple-100 border-purple-200",
							},
							{
								name: "🦕 Dinosaur Adventures",
								color: "bg-green-100 border-green-200",
							},
							{
								name: "🏰 Fantasy & Magic",
								color: "bg-blue-100 border-blue-200",
							},
							{
								name: "😂 Comedy & Humor",
								color: "bg-yellow-100 border-yellow-200",
							},
							{
								name: "🚀 Space Exploration",
								color: "bg-indigo-100 border-indigo-200",
							},
							{
								name: "🐾 Animal Rescue",
								color: "bg-emerald-100 border-emerald-200",
							},
							{
								name: "🃺 YouTube Creator",
								color: "bg-red-100 border-red-200",
							},
							{
								name: "🎮 Gaming Quests",
								color: "bg-pink-100 border-pink-200",
							},
							{
								name: "🤖 Robot Adventures",
								color: "bg-slate-100 border-slate-200",
							},
							{
								name: "📱 Social Media Fun",
								color: "bg-cyan-100 border-cyan-200",
							},
							{
								name: "🎥 Movie Making",
								color: "bg-orange-100 border-orange-200",
							},
							{
								name: "🥋 Ninja Training",
								color: "bg-stone-100 border-stone-200",
							},
						].map((theme, index) => (
							<div
								key={index}
								className={`p-4 rounded-xl border-2 text-center font-semibold hover:scale-105 transition-transform cursor-pointer ${theme.color}`}
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
			<section className='py-20 px-4 bg-primary/5'>
				<div className='container mx-auto max-w-4xl text-center space-y-8'>
					<h2 className='text-3xl md:text-4xl font-bold'>
						Ready to Begin Your Reading Adventure?
					</h2>
					<p className='text-xl text-muted max-w-2xl mx-auto'>
						Join thousands of kids who&apos;ve discovered that
						reading can be the most exciting part of their
						day!
					</p>

					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						<Button
							size='lg'
							className='text-lg px-8 py-6'
							asChild
						>
							<Link href='/dashboard'>
								<Users className='h-5 w-5 mr-2' />
								Start Reading Now
							</Link>
						</Button>
						<Button
							variant='outline'
							size='lg'
							className='text-lg px-8 py-6'
							asChild
						>
							<Link href='/stories'>
								<BookOpen className='h-5 w-5 mr-2' />
								Browse Stories
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
