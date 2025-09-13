"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	BookOpen,
	Menu,
	X,
	Sparkles,
	Trophy,
	Zap,
	Rocket,
	Target,
	Crown,
	Flame,
	Settings,
} from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import { useAuth } from "@/contexts/auth-context";

export function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [currentTime, setCurrentTime] = useState(new Date());
	const [streakCount] = useState(7);
	const [dailyProgress] = useState(65);
	const { user } = useAuth();
	const pathname = usePathname();
	const menuRef = useRef<HTMLDivElement>(null);
	const settings =
		(user?.user_metadata?.settings as Record<string, unknown>) || {};
	const showStats = settings.show_stats !== false;

	const compactNav = settings.compact_nav === true;

	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 60000);
		return () => clearInterval(timer);
	}, []);

	// Close menu when pathname changes (navigation)
	useEffect(() => {
		setIsMenuOpen(false);
	}, [pathname]);

	// Close menu when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setIsMenuOpen(false);
			}
		}

		if (isMenuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			// Prevent body scroll when menu is open
			document.body.style.overflow = "hidden";
		} else {
			// Restore body scroll when menu is closed
			document.body.style.overflow = "";
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.body.style.overflow = "";
		};
	}, [isMenuOpen]);

	// Close menu on escape key
	useEffect(() => {
		function handleEscapeKey(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsMenuOpen(false);
			}
		}

		if (isMenuOpen) {
			document.addEventListener("keydown", handleEscapeKey);
		}

		return () => {
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, [isMenuOpen]);

	const getTimeBasedGreeting = () => {
		const hour = currentTime.getHours();
		if (hour < 12) return "Good Morning";
		if (hour < 17) return "Good Afternoon";
		return "Good Evening";
	};

	return (
		<header
			ref={menuRef}
			className='sticky top-0 z-50 w-full bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b border-purple-200/30 shadow-sm dark:bg-gradient-to-r dark:from-indigo-900 dark:via-purple-900 dark:to-fuchsia-900 dark:border-purple-900/40 text-slate-900 dark:text-white'
			style={{ height: "70px", boxSizing: "border-box" }}
		>
			<div className='mx-auto px-4 sm:px-6 md:px-8 py-2 sm:py-2 w-full h-full'>
				<div className='flex h-full items-center justify-between gap-4 min-w-0 xl:grid xl:grid-cols-[1fr_auto_1fr]'>
					{/* Compact Logo */}
					<Link
						href='/'
						className='group flex items-center space-x-1.5 sm:space-x-2 hover:scale-105 transition-all duration-300 flex-shrink-0 min-h-[44px] xl:justify-self-start'
						data-testid='logo'
						aria-label='PrimaryReading Home'
					>
						<div className='relative'>
							<div className='bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg shadow-lg'>
								<BookOpen className='h-5 w-5 text-white' />
								<Sparkles className='h-2.5 w-2.5 text-yellow-300 absolute -top-0.5 -right-0.5 animate-pulse' />
							</div>
						</div>
						<div className='flex flex-col hidden sm:flex'>
							<span className='text-lg font-bold text-slate-900 dark:text-white leading-none'>
								Primary
							</span>
							<span className='text-lg font-bold text-slate-900 dark:text-white leading-none'>
								Reading
							</span>
						</div>
					</Link>

					{/* Navigation */}
					<nav
						className={`hidden xl:flex items-center ${
							compactNav ? "gap-2" : "gap-3"
						} xl:justify-self-center`}
					>
						<IconNavButton
							href='/dashboard'
							icon={<Rocket className='h-4 w-4' />}
							label='Adventures'
							colorClass='text-orange-800 bg-orange-100 hover:bg-orange-200 hover:text-orange-900 dark:text-orange-100 dark:bg-orange-900/40 dark:hover:bg-orange-800/60 dark:hover:text-white'
							compact={compactNav}
						/>
						<IconNavButton
							href='/stories'
							icon={<BookOpen className='h-4 w-4' />}
							label='Stories'
							colorClass='text-blue-800 bg-blue-100 hover:bg-blue-200 hover:text-blue-900 dark:text-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-800/60 dark:hover:text-white'
							compact={compactNav}
						/>
						<IconNavButton
							href='/create'
							icon={<Sparkles className='h-4 w-4' />}
							label='Create'
							colorClass='text-purple-800 bg-purple-100 hover:bg-purple-200 hover:text-purple-900 dark:text-purple-100 dark:bg-purple-900/40 dark:hover:bg-purple-800/60 dark:hover:text-white'
							compact={compactNav}
						/>
						<IconNavButton
							href='/progress'
							icon={<Trophy className='h-4 w-4' />}
							label='Progress'
							colorClass='text-green-800 bg-green-100 hover:bg-green-200 hover:text-green-900 dark:text-green-100 dark:bg-green-900/40 dark:hover:bg-green-800/60 dark:hover:text-white'
							compact={compactNav}
						/>
					</nav>

					{/* Right Actions */}
					<div className='flex items-center gap-2 flex-shrink-0 xl:justify-self-end'>
						{user && showStats && (
							<div className='hidden xl:flex items-center gap-3'>
								{/* Combined Stats */}
								<div className='group relative'>
									<div
										className={`flex items-center ${
											compactNav
												? "px-2.5 py-1 h-8"
												: "px-3 py-1.5 h-9"
										} bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-gray-200/70 dark:border-slate-700 rounded-full shadow-sm transition-all duration-200 cursor-default`}
									>
										<div className='relative w-4 h-4 mr-2'>
											<svg
												className='w-4 h-4 transform -rotate-90'
												viewBox='0 0 36 36'
											>
												<path
													className='stroke-emerald-200'
													strokeWidth='4'
													fill='transparent'
													d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
												/>
												<path
													className='stroke-emerald-500'
													strokeWidth='4'
													strokeDasharray={`${dailyProgress}, 100`}
													strokeLinecap='round'
													fill='transparent'
													d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
												/>
											</svg>
										</div>
										<span className='text-sm font-semibold text-emerald-800 mr-3'>
											{dailyProgress}%
										</span>
										<Flame className='h-4 w-4 text-orange-600 mr-1' />
										<span className='text-sm font-bold text-orange-800 mr-3'>
											{streakCount}
										</span>
										<Crown className='h-4 w-4 text-yellow-700' />
									</div>
									<div className='absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50'>
										{dailyProgress}% Today • 🔥
										{streakCount} • 👑L3
									</div>
								</div>
							</div>
						)}

						{/* Divider between stats and user menu on desktop */}
						{user && showStats && (
							<div className='hidden xl:block h-6 w-px bg-gray-200/70 mx-2' />
						)}

						{/* User Menu */}
						<div className='flex items-center justify-center'>
							<UserMenu />
						</div>
					</div>

					{/* Mobile/Tablet Menu Button */}
					<Button
						variant='ghost'
						size='icon'
						className='xl:hidden bg-white/80 hover:bg-white active:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 dark:active:bg-slate-600 rounded-lg shadow-sm min-h-[44px] min-w-[44px] h-10 w-10 touch-manipulation'
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						onTouchStart={() => {}} // Enable :active pseudo-class on iOS
						data-testid='mobile-menu'
						aria-label='Toggle mobile menu'
						aria-expanded={isMenuOpen}
					>
						{isMenuOpen ? (
							<X className='h-4 w-4' />
						) : (
							<Menu className='h-4 w-4' />
						)}
					</Button>
				</div>

				{/* Mobile/Tablet Navigation */}
				{isMenuOpen && (
					<>
						{/* Overlay */}
						<div
							className='xl:hidden fixed inset-0 top-[70px] bg-black/20 dark:bg-black/40 z-40'
							onClick={() => setIsMenuOpen(false)}
						/>
						{/* Menu */}
						<div
							className='xl:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-purple-200/30 dark:border-purple-900/30 shadow-lg z-50 max-h-[calc(100vh-70px)] overflow-y-auto'
							data-testid='mobile-nav'
						>
							<nav className='p-3 space-y-1'>
								<MobileNavLink
									href='/dashboard'
									icon={
										<Rocket className='h-4 w-4' />
									}
									label='My Adventures'
									onClick={() =>
										setIsMenuOpen(false)
									}
									testId='mobile-nav-dashboard'
								/>
								<MobileNavLink
									href='/stories'
									icon={
										<BookOpen className='h-4 w-4' />
									}
									label='Story Library'
									onClick={() =>
										setIsMenuOpen(false)
									}
									testId='mobile-nav-stories'
								/>
								<MobileNavLink
									href='/my-stories'
									icon={
										<BookOpen className='h-4 w-4' />
									}
									label='My Stories'
									onClick={() =>
										setIsMenuOpen(false)
									}
									testId='mobile-nav-my-stories'
								/>

								<MobileNavLink
									href='/create'
									icon={
										<Sparkles className='h-4 w-4' />
									}
									label='Create Story'
									onClick={() =>
										setIsMenuOpen(false)
									}
									testId='mobile-nav-create'
								/>
								<MobileNavLink
									href='/progress'
									icon={
										<Trophy className='h-4 w-4' />
									}
									label='My Progress'
									onClick={() =>
										setIsMenuOpen(false)
									}
									testId='mobile-nav-progress'
								/>
								<MobileNavLink
									href='/settings'
									icon={
										<Settings className='h-4 w-4' />
									}
									label='Settings'
									onClick={() =>
										setIsMenuOpen(false)
									}
									testId='mobile-nav-settings'
								/>

								{user && (
									<div className='pt-3 border-t border-purple-100 mt-3'>
										<div className='bg-gradient-to-br from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200'>
											<div className='text-center mb-2'>
												<span className='text-base font-bold text-purple-800'>
													{getTimeBasedGreeting()}
													, Champion! 👑
												</span>
											</div>
											<div className='grid grid-cols-3 gap-2'>
												<div className='text-center p-2 bg-white/70 rounded-lg'>
													<Target className='h-5 w-5 text-emerald-600 mx-auto mb-1' />
													<div className='text-xs font-semibold text-emerald-800'>
														Today
													</div>
													<div className='text-sm font-bold text-emerald-900'>
														{
															dailyProgress
														}
														%
													</div>
												</div>
												<div className='text-center p-2 bg-white/70 rounded-lg'>
													<Flame className='h-5 w-5 text-orange-600 mx-auto mb-1' />
													<div className='text-xs font-semibold text-orange-800'>
														Streak
													</div>
													<div className='text-sm font-bold text-orange-900'>
														{
															streakCount
														}
													</div>
												</div>
												<div className='text-center p-2 bg-white/70 rounded-lg'>
													<Crown className='h-5 w-5 text-yellow-700 mx-auto mb-1' />
													<div className='text-xs font-semibold text-yellow-800'>
														Level
													</div>
													<div className='text-sm font-bold text-yellow-900'>
														3
													</div>
												</div>
											</div>
										</div>
										<div className='flex justify-center mt-3'>
											<UserMenu />
										</div>
									</div>
								)}
							</nav>
						</div>
					</>
				)}
			</div>
		</header>
	);
}

// Icon-First Navigation Button - Compact Design
interface IconNavButtonProps {
	href: string;
	icon: React.ReactNode;
	label: string;
	colorClass: string;
	compact?: boolean;
}

function IconNavButton({
	href,
	icon,
	label,
	colorClass,
	compact,
}: IconNavButtonProps) {
	const sizeClass = compact
		? "p-1.5 min-w-[68px] h-10"
		: "p-2 min-w-[80px] h-12";
	const iconMargin = compact ? "mb-0.5" : "mb-1";
	return (
		<Link
			href={href}
			className={`group relative flex flex-col items-center justify-center ${sizeClass} rounded-lg ${colorClass} transition-all duration-200 hover:scale-105 hover:shadow-sm flex-shrink-0`}
			aria-label={label}
		>
			<div className={`flex-shrink-0 ${iconMargin}`}>{icon}</div>
			<span className='text-xs font-medium text-center leading-tight whitespace-nowrap'>
				{label}
			</span>
		</Link>
	);
}

// Mobile/Tablet Navigation Link Component
interface MobileNavLinkProps {
	href: string;
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
	testId: string;
}

function MobileNavLink({
	href,
	icon,
	label,
	onClick,
	testId,
}: MobileNavLinkProps) {
	return (
		<Link
			href={href}
			className='flex items-center space-x-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 active:bg-gray-100 dark:active:bg-slate-700 transition-all duration-200 min-h-[44px] touch-manipulation select-none'
			onClick={onClick}
			onTouchStart={() => {}} // Enable :active pseudo-class on iOS
			data-testid={testId}
		>
			<div className='flex-shrink-0 text-slate-700 dark:text-slate-200'>
				{icon}
			</div>
			<span className='text-sm font-medium text-slate-800 dark:text-slate-100'>
				{label}
			</span>
			<div className='ml-auto'>
				<Zap className='h-3.5 w-3.5 text-yellow-400' />
			</div>
		</Link>
	);
}
