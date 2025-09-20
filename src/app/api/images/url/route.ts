import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@/utils/images/storage";

export async function POST(request: NextRequest) {
	try {
		const { path } = await request.json();
		
		if (!path || typeof path !== 'string') {
			return NextResponse.json(
				{ success: false, error: "Path is required" },
				{ status: 400 }
			);
		}

		const signedUrl = await getSignedUrl(path);
		
		return NextResponse.json({
			success: true,
			url: signedUrl
		});
	} catch (error) {
		console.error("Error getting signed URL:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get image URL" },
			{ status: 500 }
		);
	}
}