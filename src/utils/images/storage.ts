import { createAdminClient } from "@/utils/supabase/admin";
import sharp from "sharp";

// Storage bucket name for story images
const STORIES_BUCKET = "story-images";

interface ImageUploadOptions {
	quality?: number;
	width?: number;
	height?: number;
	format?: "webp" | "jpeg" | "png";
}

export async function getSignedUrl(
	path: string,
	expiresInSeconds: number = 60 * 60 * 24 * 7 // 7 days
): Promise<string | null> {
	try {
		const supabase = await createAdminClient();
		const { data, error } = await supabase.storage
			.from(STORIES_BUCKET)
			.createSignedUrl(path, expiresInSeconds);
		if (error) return null;
		return data?.signedUrl ?? null;
	} catch {
		return null;
	}
}

/**
 * Downloads an image from a URL, optimizes it, and uploads to Supabase Storage (private bucket)
 */
export async function uploadImageFromUrl(
	imageUrl: string,
	fileName: string,
	options: ImageUploadOptions = {}
): Promise<{ path: string; signedUrl: string | null } | null> {
	try {
		const supabase = await createAdminClient();

		// Default optimization settings
		const {
			quality = 85,
			width = 1024,
			height = 1024,
			format = "webp",
		} = options;

		// Download the image from OpenAI's temporary URL
		const response = await fetch(imageUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.statusText}`);
		}

		const imageBuffer = await response.arrayBuffer();

		// Optimize the image using Sharp
		const optimizedBuffer = await sharp(Buffer.from(imageBuffer))
			.resize(width, height, {
				fit: "inside",
				withoutEnlargement: true,
			})
			.webp({ quality })
			.toBuffer();

		// Generate a unique file name with timestamp
		const timestamp = Date.now();
		const fileExtension = format === "webp" ? "webp" : format;
		const fullFileName = `${fileName}_${timestamp}.${fileExtension}`;

		// Upload to Supabase Storage (private) with long cache
		const { data, error } = await supabase.storage
			.from(STORIES_BUCKET)
			.upload(fullFileName, optimizedBuffer, {
				contentType: `image/${format}`,
				upsert: false,
				cacheControl: "31536000, immutable",
			});

		if (error || !data) {
			console.error("Supabase Storage upload error:", error);
			return null;
		}

		// Return signed URL and storage path
		const signedUrl = await getSignedUrl(data.path);
		return { path: data.path, signedUrl };
	} catch (error) {
		console.error("Image upload error:", error);
		return null;
	}
}

/**
 * Creates thumbnail and full-size versions of an image
 */
export async function createImageVariants(
	imageUrl: string,
	baseName: string
): Promise<{
	thumbnail: { path: string; signedUrl: string | null } | null;
	fullSize: { path: string; signedUrl: string | null } | null;
}> {
	const [thumbnail, fullSize] = await Promise.all([
		uploadImageFromUrl(imageUrl, `${baseName}_thumb`, {
			width: 400,
			height: 300,
			quality: 80,
			format: "webp",
		}),
		uploadImageFromUrl(imageUrl, `${baseName}_full`, {
			width: 1024,
			height: 1024,
			quality: 85,
			format: "webp",
		}),
	]);

	return { thumbnail, fullSize };
}

/**
 * Ensures the storage bucket exists and has proper policies
 */
export async function ensureStorageBucket(): Promise<boolean> {
	try {
		const supabase = await createAdminClient();

		// Check if bucket exists
		const { data: buckets, error: listError } =
			await supabase.storage.listBuckets();

		if (listError) {
			console.error("Failed to list buckets:", listError);
			return false;
		}

		const bucketExists = buckets?.some(
			(bucket) => bucket.name === STORIES_BUCKET
		);

		if (!bucketExists) {
			// Create the bucket
			const { error: createError } =
				await supabase.storage.createBucket(STORIES_BUCKET, {
					public: false,
					allowedMimeTypes: [
						"image/webp",
						"image/jpeg",
						"image/png",
					],
					fileSizeLimit: 10 * 1024 * 1024, // 10MB
				});

			if (createError) {
				console.error(
					"Failed to create storage bucket:",
					createError
				);
				return false;
			}
		}

		return true;
	} catch (error) {
		console.error("Storage bucket setup error:", error);
		return false;
	}
}

/**
 * Delete an image from storage (cleanup function)
 */
export async function deleteImage(fileName: string): Promise<boolean> {
	try {
		const supabase = await createAdminClient();
		const { error } = await supabase.storage
			.from(STORIES_BUCKET)
			.remove([fileName]);

		if (error) {
			console.error("Image deletion error:", error);
			return false;
		}

		return true;
	} catch (error) {
		console.error("Image deletion error:", error);
		return false;
	}
}
