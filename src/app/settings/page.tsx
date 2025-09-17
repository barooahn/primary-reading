"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
	const { user, updateUserMetadata } = useAuth();
	const { setTheme: applyTheme } = useTheme();
	const existing = (user?.user_metadata?.settings as Record<string, unknown>) || {};

	const [showStats, setShowStats] = useState<boolean>(
		Boolean(existing.show_stats ?? true)
	);
	const [compactNav, setCompactNav] = useState<boolean>(
		Boolean(existing.compact_nav ?? false)
	);
	const [theme, setTheme] = useState<string>(String(existing.theme || "system"));
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		// keep in sync if user changes
		const ex = (user?.user_metadata?.settings as Record<string, unknown>) || {};
		setShowStats(Boolean(ex.show_stats ?? true));
		setCompactNav(Boolean(ex.compact_nav ?? false));
		setTheme(String(ex.theme || "system"));
	}, [user?.id, user?.user_metadata?.settings]);

	// Apply current selection immediately for live preview
	useEffect(() => {
		applyTheme(theme);
	}, [theme, applyTheme]);

	const onSave = async () => {
		setSaving(true);
		setMessage(null);
		const merged = {
			...(user?.user_metadata?.settings as Record<string, unknown>),
			show_stats: showStats,
			compact_nav: compactNav,
			theme,
		};
		const res = await updateUserMetadata({ settings: merged });
		if (!res.ok) setMessage(res.error || "Failed to save settings");
		else setMessage("Settings saved");
		setSaving(false);
	};

	return (
		<ProtectedRoute>
			<div className='container mx-auto px-4 py-8'>
				<h1 className='text-2xl font-bold tracking-tight mb-4'>
					Settings
				</h1>

				<div className='rounded-xl border border-gray-200 bg-white/70 shadow-sm p-4 space-y-4 max-w-xl'>
					<div className='flex items-center justify-between'>
						<div>
							<div className='font-medium'>
								Show reading stats in header
							</div>
							<div className='text-sm text-gray-600'>
								Toggle the progress/streak chip on
								desktop.
							</div>
						</div>
						<button
							type='button'
							onClick={() => setShowStats((v) => !v)}
							className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
								showStats
									? "bg-emerald-500"
									: "bg-gray-300"
							}`}
						>
							<span
								className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
									showStats
										? "translate-x-5"
										: "translate-x-1"
								}`}
							/>
						</button>
					</div>

					<div className='flex items-center justify-between'>
						<div>
							<div className='font-medium'>
								Compact navigation
							</div>
							<div className='text-sm text-gray-600'>
								Make header controls slightly tighter.
							</div>
						</div>
						<button
							type='button'
							onClick={() => setCompactNav((v) => !v)}
							className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
								compactNav
									? "bg-emerald-500"
									: "bg-gray-300"
							}`}
						>
							<span
								className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
									compactNav
										? "translate-x-5"
										: "translate-x-1"
								}`}
							/>
						</button>
					</div>

					<div className='flex items-center justify-between'>
						<div>
							<div className='font-medium'>Theme</div>
							<div className='text-sm text-gray-600'>
								Choose Light, Dark, or follow System.
							</div>
						</div>
						<select
							value={theme}
							onChange={(e) => setTheme(e.target.value)}
							className='h-9 rounded-md border border-gray-300 bg-white px-2 text-sm'
						>
							<option value='system'>System</option>
							<option value='light'>Light</option>
							<option value='dark'>Dark</option>
						</select>
					</div>

					<div className='pt-2 flex items-center gap-3'>
						<button
							type='button'
							onClick={onSave}
							disabled={saving}
							className='inline-flex items-center justify-center h-9 px-4 rounded-md bg-purple-600 text-white text-sm disabled:opacity-60'
						>
							{saving ? "Saving…" : "Save settings"}
						</button>
						{message && (
							<span className='text-sm text-gray-700'>
								{message}
							</span>
						)}
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}
