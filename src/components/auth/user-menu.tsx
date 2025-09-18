"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
	User,
	ChevronDown,
	LogOut,
	LayoutDashboard,
	BookOpen,
	Sparkles,
	Trophy,
	Settings as SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function UserMenu() {
	const { user, loading, signOut } = useAuth();

	const router = useRouter();
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target as Node)
			) {
				setOpen(false);
			}
		};
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKey);
		};
	}, []);

	// Derived user display
	const displayName =
		(user?.user_metadata?.display_name as string) ||
		user?.email?.split("@")[0] ||
		"You";
	const avatarUrl = (user?.user_metadata?.avatar_url as string) || undefined;

	// Keyboard navigation for menu
	const itemRefs = useRef<
		Array<HTMLAnchorElement | HTMLButtonElement | null>
	>([]);
	const [highlightedIndex, setHighlightedIndex] = useState(0);
	const setItemRef = (
		el: HTMLAnchorElement | HTMLButtonElement | null,
		idx: number
	) => {
		itemRefs.current[idx] = el;
	};

	useEffect(() => {
		if (open) {
			setHighlightedIndex(0);
			setTimeout(() => itemRefs.current[0]?.focus(), 0);
		}
	}, [open]);

	const handleMenuKeyDown = (e: React.KeyboardEvent) => {
		const max = itemRefs.current.length - 1;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			const next = highlightedIndex >= max ? 0 : highlightedIndex + 1;
			setHighlightedIndex(next);
			itemRefs.current[next]?.focus();
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			const prev = highlightedIndex <= 0 ? max : highlightedIndex - 1;
			setHighlightedIndex(prev);
			itemRefs.current[prev]?.focus();
		} else if (e.key === "Escape") {
			setOpen(false);
		}
	};

	const handleSignOut = async () => {
		await signOut();
		router.push("/");
	};

	if (loading) {
		return (
			<div className='flex items-center gap-2'>
				<div className='h-8 w-8 rounded-full bg-gray-200 animate-pulse' />
				<div className='h-4 w-20 bg-gray-200 animate-pulse rounded' />
			</div>
		);
	}

	if (!user) {
		return (
			<Link href='/login'>
				<Button variant='default' size='sm'>
					Sign in
				</Button>
			</Link>
		);
	}

	return (
		<div className='relative' ref={menuRef}>
			<button
				type='button'
				aria-haspopup='menu'
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
				className='flex items-center gap-2 h-9 pl-2 pr-3 rounded-full bg-white/80 hover:bg-white hover:shadow-md border border-gray-200/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EF7722]/30 text-slate-800 transition-all duration-200'
			>
				{avatarUrl ? (
					<Image
						src={avatarUrl}
						alt='Avatar'
						width={24}
						height={24}
						className='h-6 w-6 rounded-full object-cover'
					/>
				) : (
					<span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#EF7722] to-[#FAA533] text-gray-700 text-[10px] font-semibold'>
						{displayName
							.split(" ")
							.map((s) => s[0])
							.join("")
							.slice(0, 2)
							.toUpperCase()}
					</span>
				)}
				<span className='text-sm font-medium whitespace-nowrap text-gray-700'>
					{displayName}
				</span>
				<ChevronDown className='h-4 w-4 text-gray-700' />
			</button>
			{open && (
				<div
					role='menu'
					aria-label='User menu'
					onKeyDown={handleMenuKeyDown}
					className='absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-50 overflow-hidden'
				>
					<Link
						href='/profile'
						onClick={() => setOpen(false)}
						role='menuitem'
						tabIndex={-1}
						ref={(el) => setItemRef(el, 0)}
						className='flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#0BA6DF]/10 hover:text-[#0BA6DF] text-gray-700 focus:bg-[#0BA6DF]/10 focus:text-[#0BA6DF] focus:outline-none transition-colors duration-150'
					>
						<User className='h-4 w-4' />
						Profile
					</Link>
					<Link
						href='/dashboard'
						onClick={() => setOpen(false)}
						role='menuitem'
						tabIndex={-1}
						ref={(el) => setItemRef(el, 1)}
						className='flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#0BA6DF]/10 hover:text-[#0BA6DF] text-gray-700 focus:bg-[#0BA6DF]/10 focus:text-[#0BA6DF] focus:outline-none transition-colors duration-150'
					>
						<LayoutDashboard className='h-4 w-4' />
						My Dashboard
					</Link>
					<Link
						href='/settings'
						onClick={() => setOpen(false)}
						role='menuitem'
						tabIndex={-1}
						ref={(el) => setItemRef(el, 2)}
						className='flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#0BA6DF]/10 hover:text-[#0BA6DF] text-gray-700 focus:bg-[#0BA6DF]/10 focus:text-[#0BA6DF] focus:outline-none transition-colors duration-150'
					>
						<SettingsIcon className='h-4 w-4' />
						Settings
					</Link>
					<Link
						href='/stories'
						onClick={() => setOpen(false)}
						role='menuitem'
						tabIndex={-1}
						ref={(el) => setItemRef(el, 3)}
						className='flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#0BA6DF]/10 hover:text-[#0BA6DF] text-gray-700 focus:bg-[#0BA6DF]/10 focus:text-[#0BA6DF] focus:outline-none transition-colors duration-150'
					>
						<BookOpen className='h-4 w-4' />
						Story Library
					</Link>
					<Link
						href='/my-stories'
						onClick={() => setOpen(false)}
						role='menuitem'
						tabIndex={-1}
						ref={(el) => setItemRef(el, 4)}
						className='flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#0BA6DF]/10 hover:text-[#0BA6DF] text-gray-700 focus:bg-[#0BA6DF]/10 focus:text-[#0BA6DF] focus:outline-none transition-colors duration-150'
					>
						<BookOpen className='h-4 w-4' />
						My Stories
					</Link>
					<Link
						href='/create'
						onClick={() => setOpen(false)}
						role='menuitem'
						tabIndex={-1}
						ref={(el) => setItemRef(el, 5)}
						className='flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#0BA6DF]/10 hover:text-[#0BA6DF] text-gray-700 focus:bg-[#0BA6DF]/10 focus:text-[#0BA6DF] focus:outline-none transition-colors duration-150'
					>
						<Sparkles className='h-4 w-4' />
						Create Story
					</Link>
					<Link
						href='/progress'
						onClick={() => setOpen(false)}
						role='menuitem'
						tabIndex={-1}
						ref={(el) => setItemRef(el, 6)}
						className='flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#0BA6DF]/10 hover:text-[#0BA6DF] text-gray-700 focus:bg-[#0BA6DF]/10 focus:text-[#0BA6DF] focus:outline-none transition-colors duration-150'
					>
						<Trophy className='h-4 w-4' />
						My Progress
					</Link>
					<div className='h-px bg-gray-200 my-1' />
					<button
						onClick={handleSignOut}
						role='menuitem'
						tabIndex={-1}
						ref={(el) => setItemRef(el, 7)}
						className='w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#EF7722]/10 hover:text-[#EF7722] text-[#EF7722] focus:bg-[#EF7722]/10 focus:text-[#EF7722] focus:outline-none transition-colors duration-150'
					>
						<LogOut className='h-4 w-4' />
						Sign out
					</button>
				</div>
			)}
		</div>
	);
}
