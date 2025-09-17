import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		let urlObj: URL;
		try {
			urlObj = new URL(request.url);
		} catch {
			return NextResponse.redirect(
				`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/auth-error`
			);
		}
		const { searchParams, origin } = urlObj;
		const code = searchParams.get("code");
		const type = searchParams.get("type");
		const originParam = searchParams.get("origin") || "/";

		if (!code) {
			return NextResponse.redirect(`${origin}/auth/auth-error`);
		}

		const { createClient } = await import("@/utils/supabase/server");
		const supabase = await createClient();
		
		try {
			const { data, error } = await supabase.auth.exchangeCodeForSession(code);
			if (error) {
				// If regular exchange fails, try OTP verification for recovery flows
				if (error.message?.includes('flow state') || error.code === 'flow_state_not_found' || error.code === 'validation_failed') {
					try {
						const { error: otpError } = await supabase.auth.verifyOtp({
							token_hash: code,
							type: 'recovery'
						});
						
						if (otpError) {
							return NextResponse.redirect(`${origin}/auth/auth-error`);
						}
						
						// For successful OTP verification, redirect to update password
						return NextResponse.redirect(`${origin}/auth/update-password`);
					} catch {
						return NextResponse.redirect(`${origin}/auth/auth-error`);
					}
				}
				
				return NextResponse.redirect(`${origin}/auth/auth-error`);
			}

			// Check if this is a password recovery flow
			if (type === "recovery") {
				return NextResponse.redirect(`${origin}/auth/update-password`);
			}

			// Additional check: if the user has a recovery session but no type param
			if (data?.user?.recovery_sent_at) {
				return NextResponse.redirect(`${origin}/auth/update-password`);
			}

			// For regular authentication flows
			let targetPath = "/dashboard";
			try {
				if (originParam && originParam.startsWith("/")) {
					targetPath = decodeURIComponent(originParam);
				}
			} catch {
				targetPath = "/dashboard";
			}

			return NextResponse.redirect(`${origin}${targetPath}`);
		} catch {
			return NextResponse.redirect(`${origin}/auth/auth-error`);
		}
	} catch {
		return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/auth-error`);
	}
}
