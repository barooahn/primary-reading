"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
	Shield,
} from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import { PinModal } from "@/components/auth/pin-modal";
import { useAuth } from "@/contexts/auth-context";

export const Header = memo(function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [currentTime, setCurrentTime] = useState(new Date());
	const [streakCount] = useState(7);
	const [dailyProgress] = useState(65);
	const [isPinModalOpen, setIsPinModalOpen] = useState(false);
	const [isParentMode, setIsParentMode] = useState(false);
	const { user } = useAuth();
	const pathname = usePathname();
	const router = useRouter();
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

	const getTimeBasedGreeting = useCallback(() => {
		const hour = currentTime.getHours();
		if (hour < 12) return "Good Morning";
		if (hour < 17) return "Good Afternoon";
		return "Good Evening";
	}, [currentTime]);

	return (
		<header
			ref={menuRef}
			className='sticky top-0 z-[100000] w-full bg-white shadow-lg border-b-2 border-student dark:bg-slate-900 dark:border-student-secondary text-gray-800 dark:text-white'
			style={{ height: "80px", boxSizing: "border-box" }}
		>
			<div className='mx-auto px-6 sm:px-8 md:px-12 py-3 w-full h-full'>
				<div className='flex h-full items-center justify-between gap-6 min-w-0 xl:grid xl:grid-cols-[1fr_auto_1fr]'>
					{/* Modern Logo */}
					<Link
						href='/'
						className='group flex items-center space-x-3 hover:scale-105 transition-all duration-300 flex-shrink-0 xl:justify-self-start'
						data-testid='logo'
						aria-label='PrimaryReading Home'
					>
						<div className='relative'>
							<div className='bg-gradient-to-br from-student to-student-secondary p-2.5 rounded-xl shadow-xl'>
								<BookOpen className='h-7 w-7 text-white' />
								<Sparkles className='h-3 w-3 text-yellow-200 absolute -top-1 -right-1 animate-pulse' />
							</div>
						</div>
						<div className='hidden sm:block'>
							<h1 className='text-2xl font-black bg-gradient-to-r from-student to-student-secondary bg-clip-text text-transparent'>
								PrimaryReading
							</h1>
							<p className='text-xs text-gray-500 font-medium tracking-wide uppercase'>
								Learn • Read • Grow
							</p>
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
							icon={<Rocket className='h-5 w-5' />}
							label='Dashboard'
							colorClass='text-white bg-student hover:bg-student-hover shadow-md hover:shadow-lg dark:bg-student-secondary dark:hover:bg-student-secondary/90'
							compact={compactNav}
						/>
						<IconNavButton
							href='/stories'
							icon={<BookOpen className='h-5 w-5' />}
							label='Stories'
							colorClass='text-white bg-parent hover:bg-parent-hover shadow-md hover:shadow-lg dark:bg-parent dark:hover:bg-parent-hover'
							compact={compactNav}
						/>
						<IconNavButton
							href='/create'
							icon={<Sparkles className='h-5 w-5' />}
							label='Create'
							colorClass='text-white bg-student-secondary hover:bg-student-secondary/90 shadow-md hover:shadow-lg dark:bg-student dark:hover:bg-student-hover'
							compact={compactNav}
						/>
						<IconNavButton
							href='/progress'
							icon={<Trophy className='h-5 w-5' />}
							label='Progress'
							colorClass='text-white bg-parent hover:bg-parent-hover shadow-md hover:shadow-lg dark:bg-student-secondary dark:hover:bg-student-secondary/90'
							compact={compactNav}
						/>
					</nav>

					{/* Right Side Container - Groups all right elements together */}
					<div className='flex items-center gap-2 flex-shrink-0 xl:justify-self-end'>
						{/* Right Actions */}
						<div className='flex items-center gap-2'>
							{user && showStats && (
								<div className='hidden xl:flex items-center gap-3'>
									{/* Combined Stats */}
									<div className='group relative'>
										<div
											className={`flex items-center ${
												compactNav
													? "px-2.5 py-1 h-10"
													: "px-3 py-1.5 h-12"
											} bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-gray-200/70 dark:border-slate-700 rounded-full shadow-sm transition-all duration-200 cursor-default`}
										>
											<div className='relative w-4 h-4 mr-2'>
												<svg
													className='w-4 h-4 transform -rotate-90'
													viewBox='0 0 36 36'
												>
													<path
														className='stroke-light-gray'
														strokeWidth='4'
														fill='transparent'
														d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
													/>
													<path
														className='stroke-parent'
														strokeWidth='4'
														strokeDasharray={`${dailyProgress}, 100`}
														strokeLinecap='round'
														fill='transparent'
														d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
													/>
												</svg>
											</div>
											<span className='text-sm font-semibold text-parent mr-3'>
												{dailyProgress}%
											</span>
											<Flame className='h-4 w-4 text-student mr-1' />
											<span className='text-sm font-bold text-student mr-3'>
												{streakCount}
											</span>
											<Crown className='h-4 w-4 text-student-secondary' />
										</div>
										<div className='absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100001]'>
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

							{/* Parent/Teacher Access */}
							{user && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsPinModalOpen(true)}
									className={`hidden sm:flex items-center gap-2 ${
										compactNav ? "h-10" : "h-12"
									} px-3 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-parent/30 dark:border-slate-700 rounded-full shadow-sm transition-all duration-200 text-xs font-medium text-parent dark:text-parent hover:text-parent-hover dark:hover:text-parent-hover`}
									title="Parent/Teacher Access"
								>
									<Shield className="h-3.5 w-3.5" />
									{isParentMode ? "Exit" : "Parent"}
								</Button>
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
								<X className='h-4 w-4 text-student' />
							) : (
								<Menu className='h-4 w-4 text-student' />
							)}
						</Button>
					</div>
				</div>

				{/* Mobile/Tablet Navigation */}
				{isMenuOpen && (
					<>
						{/* Overlay */}
						<div
							className='xl:hidden fixed inset-0 top-[70px] bg-black/20 dark:bg-black/40 z-[99998]'
							onClick={() => setIsMenuOpen(false)}
						/>
						{/* Menu */}
						<div
							className='xl:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-purple-200/30 dark:border-purple-900/30 shadow-lg z-[99999] max-h-[calc(100vh-70px)] overflow-y-auto'
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

								{/* Parent/Teacher Access for Mobile */}
								<div
									className='flex items-center space-x-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 active:bg-gray-100 dark:active:bg-slate-700 transition-all duration-200 min-h-[44px] touch-manipulation select-none cursor-pointer'
									onClick={() => {
										setIsMenuOpen(false);
										setIsPinModalOpen(true);
									}}
									onTouchStart={() => {}}
								>
									<div className='flex-shrink-0 text-text-secondary dark:text-slate-200'>
										<Shield className='h-4 w-4' />
									</div>
									<span className='text-sm font-medium text-text-primary dark:text-slate-100'>
										{isParentMode ? "Exit Parent Mode" : "Parent/Teacher Access"}
									</span>
									<div className='ml-auto'>
										<Zap className='h-3.5 w-3.5 text-yellow-400' />
									</div>
								</div>

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
													<Target className='h-5 w-5 text-parent mx-auto mb-1' />
													<div className='text-xs font-semibold text-parent'>
														Today
													</div>
													<div className='text-sm font-bold text-parent'>
														{
															dailyProgress
														}
														%
													</div>
												</div>
												<div className='text-center p-2 bg-white/70 rounded-lg'>
													<Flame className='h-5 w-5 text-student mx-auto mb-1' />
													<div className='text-xs font-semibold text-student'>
														Streak
													</div>
													<div className='text-sm font-bold text-student'>
														{
															streakCount
														}
													</div>
												</div>
												<div className='text-center p-2 bg-white/70 rounded-lg'>
													<Crown className='h-5 w-5 text-student-secondary mx-auto mb-1' />
													<div className='text-xs font-semibold text-student-secondary'>
														Level
													</div>
													<div className='text-sm font-bold text-student-secondary'>
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

			{/* PIN Modal */}
			<PinModal
				isOpen={isPinModalOpen}
				onClose={() => setIsPinModalOpen(false)}
				onSuccess={() => {
					if (isParentMode) {
						// Exit parent mode - return to child dashboard
						setIsParentMode(false);
						router.push("/dashboard");
					} else {
						// Enter parent mode - navigate to parent settings
						setIsParentMode(true);
						router.push("/parent-settings");
					}
				}}
				title={isParentMode ? "Exit Parent Mode" : "Parent/Teacher Access"}
				description={
					isParentMode
						? "Enter your PIN to return to child mode"
						: "Enter your PIN to access parent/teacher settings"
				}
			/>
		</header>
	);
});

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
		? "px-4 py-2 h-10"
		: "px-6 py-2.5 h-12";
	return (
		<Link
			href={href}
			className={`group relative flex items-center gap-2 ${sizeClass} rounded-xl ${colorClass} transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex-shrink-0 font-semibold text-sm`}
			aria-label={label}
		>
			<div className='flex-shrink-0'>{icon}</div>
			<span className='whitespace-nowrap'>
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
			<div className='flex-shrink-0 text-text-secondary dark:text-slate-200'>
				{icon}
			</div>
			<span className='text-sm font-medium text-text-primary dark:text-slate-100'>
				{label}
			</span>
			<div className='ml-auto'>
				<Zap className='h-3.5 w-3.5 text-yellow-400' />
			</div>
		</Link>
	);
}
