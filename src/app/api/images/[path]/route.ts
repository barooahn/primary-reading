import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@/utils/images/storage";

export async function GET(
	request: NextRequest,
	{ params }: { params: { path: string } }
) {
	try {
		const path = decodeURIComponent(params.path);
		
		if (!path || typeof path !== 'string') {
			return NextResponse.json(
				{ error: "Path is required" },
				{ status: 400 }
			);
		}

		const signedUrl = await getSignedUrl(path);
		
		if (!signedUrl) {
			return NextResponse.json(
				{ error: "Failed to get signed URL" },
				{ status: 404 }
			);
		}

		// Redirect to the signed URL
		return NextResponse.redirect(signedUrl);
	} catch (error) {
		console.error("Error getting signed URL:", error);
		return NextResponse.json(
			{ error: "Failed to get image URL" },
			{ status: 500 }
		);
	}
}