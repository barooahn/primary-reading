import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
	try {
		const supabase = await createClient();

		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({
				success: false,
				error: "Not authenticated",
				authError: authError?.message,
				user: null
			});
		}

		// Test database connection by checking if table exists
		const { error: tableError } = await supabase
			.from('child_profiles')
			.select('count(*)')
			.limit(1);

		// Try to fetch child profiles
		const { data: profiles, error: profilesError } = await supabase
			.from('child_profiles')
			.select('*')
			.eq('parent_user_id', user.id)
			.order('created_at', { ascending: true });

		return NextResponse.json({
			success: true,
			debug: {
				user: {
					id: user.id,
					email: user.email
				},
				tableExists: !tableError,
				tableError: tableError?.message || null,
				profilesCount: profiles?.length || 0,
				profilesError: profilesError?.message || null,
				profiles: profiles || []
			}
		});

	} catch (error) {
		console.error('Debug endpoint error:', error);
		return NextResponse.json({
			success: false,
			error: "Debug endpoint failed",
			details: error instanceof Error ? error.message : String(error)
		});
	}
}