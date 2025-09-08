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

		if (!code) {
			return NextResponse.redirect(`${origin}/auth/auth-error`);
		}

		const { createClient } = await import("@/utils/supabase/server");
		const supabase = await createClient();
		
		try {
			const { error } = await supabase.auth.exchangeCodeForSession(code);
			if (error) {
				console.error("Password reset error:", error);
				return NextResponse.redirect(`${origin}/auth/auth-error`);
			}

			// Redirect to password update page after successful email verification
			return NextResponse.redirect(`${origin}/auth/update-password`);
		} catch (err) {
			console.error("Password reset session exchange error:", err);
			return NextResponse.redirect(`${origin}/auth/auth-error`);
		}
	} catch (err) {
		console.error("Password reset route error:", err);
		return NextResponse.redirect(`http://localhost:3000/auth/auth-error`);
	}
}