"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { Upload, Camera } from "lucide-react";

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
				<h1 className='text-2xl font-bold tracking-tight mb-4 text-gray-900'>
					Profile
				</h1>

				<div className='rounded-xl border border-[#EF7722] bg-[#EF7722]/10 shadow-sm p-4 space-y-5 max-w-xl'>
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
							<span className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#EF7722] text-white text-base font-semibold'>
								{initials}
							</span>
						)}
						<div>
							<div className='text-base font-semibold text-gray-900'>
								{displayName}
							</div>
							<div className='text-sm text-gray-600'>
								{user?.email}
							</div>
						</div>
					</div>

					<div className='space-y-3'>
						<label className='block'>
							<div className='text-sm font-medium mb-1 text-gray-900'>
								Display name
							</div>
							<input
								value={displayName}
								onChange={(e) =>
									setDisplayName(e.target.value)
								}
								className='w-full h-9 rounded-md border border-[#EF7722] bg-white px-2 text-sm text-gray-900 focus:border-[#EF7722] focus:ring-1 focus:ring-[#EF7722] focus:outline-none'
								placeholder='Your name'
							/>
						</label>

						<label className='block'>
							<div className='text-sm font-medium mb-1 text-gray-900'>
								Avatar URL
							</div>
							<input
								value={avatarUrl}
								onChange={(e) =>
									setAvatarUrl(e.target.value)
								}
								className='w-full h-9 rounded-md border border-[#EF7722] bg-white px-2 text-sm text-gray-900 focus:border-[#EF7722] focus:ring-1 focus:ring-[#EF7722] focus:outline-none'
								placeholder='https://...'
							/>
							<div className='text-xs text-gray-500 mt-1'>
								Paste a direct image URL, or upload a
								file below.
							</div>
						</label>

						<div className='block'>
							<div className='text-sm font-medium mb-2 text-gray-900'>
								Upload avatar
							</div>
							<div className='flex items-center gap-3'>
								<label className='inline-flex items-center justify-center h-9 px-4 rounded-md bg-[#EF7722]/10 border border-[#EF7722] text-gray-900 text-sm font-medium hover:bg-[#EF7722]/20 cursor-pointer transition-colors'>
									<Upload className='h-4 w-4 mr-2' />
									Choose Image
									<input
										type='file'
										accept='image/*'
										onChange={(e) =>
											setFile(
												e.target.files?.[0] || null
											)
										}
										className='sr-only'
									/>
								</label>
								{file && (
									<div className='flex items-center text-sm text-[#EF7722]'>
										<Camera className='h-4 w-4 mr-1' />
										{file.name}
									</div>
								)}
							</div>
							<div className='text-xs text-gray-500 mt-1'>
								Supported formats: JPG, PNG, WebP (max 10MB). The avatar bucket will be created automatically if needed.
							</div>
						</div>
					</div>

					<div className='pt-2 flex items-center gap-3'>
						<button
							type='button'
							onClick={onSave}
							disabled={saving}
							className='inline-flex items-center justify-center h-9 px-4 rounded-md bg-[#EF7722] text-white text-sm disabled:opacity-60 hover:bg-[#FAA533] transition-colors'
						>
							{saving ? "Saving…" : "Save changes"}
						</button>
						{message && (
							<span className='text-sm text-gray-900'>
								{message}
							</span>
						)}
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}
