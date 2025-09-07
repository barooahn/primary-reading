"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

export default function ProfilePage() {
	const { user, updateUserMetadata } = useAuth();
	const supabase = useMemo(() => createClient(), []);

	const initialDisplayName =
		(user?.user_metadata?.display_name as string) ||
		user?.email?.split("@")[0] ||
		"Reader";
	const initialAvatarUrl = (user?.user_metadata?.avatar_url as string) || "";

	const [displayName, setDisplayName] = useState(initialDisplayName);
	const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
	const [file, setFile] = useState<File | null>(null);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	const initials = (displayName || "Reader")
		.split(" ")
		.map((s) => s[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const onSave = async () => {
		setSaving(true);
		setMessage(null);

		let finalAvatarUrl = avatarUrl;

		try {
			if (file && user?.id) {
				const fileExt = file.name.split(".").pop();
				const path = `${user.id}/${Date.now()}.${fileExt}`;
				const { error: uploadError } = await supabase.storage
					.from("avatars")
					.upload(path, file, {
						cacheControl: "3600",
						upsert: true,
					});
				if (uploadError) throw uploadError;
				const { data } = supabase.storage
					.from("avatars")
					.getPublicUrl(path);
				finalAvatarUrl = data.publicUrl;
			}

			const res = await updateUserMetadata({
				display_name: displayName,
				avatar_url: finalAvatarUrl || null,
			});
			if (!res.ok)
				throw new Error(res.error || "Failed to update profile");
			setMessage("Profile updated");
		} catch (e: unknown) {
			setMessage(e instanceof Error ? e.message : "Something went wrong");
		}
		setSaving(false);
	};

	return (
		<ProtectedRoute>
			<div className='container mx-auto px-4 py-8'>
				<h1 className='text-2xl font-bold tracking-tight mb-4'>
					Profile
				</h1>

				<div className='rounded-xl border border-gray-200 bg-white/70 shadow-sm p-4 space-y-5 max-w-xl'>
					<div className='flex items-center gap-3'>
						{avatarUrl ? (
							<Image
								src={avatarUrl}
								alt='Avatar'
								width={48}
								height={48}
								className='h-12 w-12 rounded-full object-cover'
							/>
						) : (
							<span className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-base font-semibold'>
								{initials}
							</span>
						)}
						<div>
							<div className='text-base font-semibold'>
								{displayName}
							</div>
							<div className='text-sm text-gray-600'>
								{user?.email}
							</div>
						</div>
					</div>

					<div className='space-y-3'>
						<label className='block'>
							<div className='text-sm font-medium mb-1'>
								Display name
							</div>
							<input
								value={displayName}
								onChange={(e) =>
									setDisplayName(e.target.value)
								}
								className='w-full h-9 rounded-md border border-gray-300 bg-white px-2 text-sm'
								placeholder='Your name'
							/>
						</label>

						<label className='block'>
							<div className='text-sm font-medium mb-1'>
								Avatar URL
							</div>
							<input
								value={avatarUrl}
								onChange={(e) =>
									setAvatarUrl(e.target.value)
								}
								className='w-full h-9 rounded-md border border-gray-300 bg-white px-2 text-sm'
								placeholder='https://...'
							/>
							<div className='text-xs text-gray-500 mt-1'>
								Paste a direct image URL, or upload a
								file below.
							</div>
						</label>

						<label className='block'>
							<div className='text-sm font-medium mb-1'>
								Upload avatar
							</div>
							<input
								type='file'
								accept='image/*'
								onChange={(e) =>
									setFile(
										e.target.files?.[0] || null
									)
								}
								className='text-sm'
							/>
							<div className='text-xs text-gray-500 mt-1'>
								Uploads use the Supabase storage bucket
								&quot;avatars&quot;. If you see an error, please
								ensure the bucket exists and is public
								or has appropriate policies.
							</div>
						</label>
					</div>

					<div className='pt-2 flex items-center gap-3'>
						<button
							type='button'
							onClick={onSave}
							disabled={saving}
							className='inline-flex items-center justify-center h-9 px-4 rounded-md bg-purple-600 text-white text-sm disabled:opacity-60'
						>
							{saving ? "Saving…" : "Save changes"}
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
