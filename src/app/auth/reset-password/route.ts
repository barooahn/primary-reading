import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		let urlObj: URL;
		try {
			urlObj = new URL(request.url);
		} catch {
			return NextResponse.redirect(
				`http://localhost:3000/auth/auth-error`
			);
		}
		const { searchParams, origin } = urlObj;
		const code = searchParams.get("code");
		const token = searchParams.get("token");
		
		// Use token if available, otherwise fall back to code
		const authToken = token || code;

		if (!authToken) {
			return NextResponse.redirect(`${origin}/auth/auth-error`);
		}

		const { createClient } = await import("@/utils/supabase/server");
		const supabase = await createClient();
		
		try {
			const { error } = await supabase.auth.verifyOtp({
				token_hash: authToken,
				type: 'recovery'
			});
			
			if (error) {
				return NextResponse.redirect(`${origin}/auth/auth-error`);
			}

			// Redirect to password update page after successful email verification
			return NextResponse.redirect(`${origin}/auth/update-password`);
		} catch {
			return NextResponse.redirect(`${origin}/auth/auth-error`);
		}
	} catch {
		return NextResponse.redirect(`http://localhost:3000/auth/auth-error`);
	}
}