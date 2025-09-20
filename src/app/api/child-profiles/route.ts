import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { CreateChildProfileRequest } from "@/types/child-profile";

export async function GET() {
	try {
		const supabase = await createClient();

		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Get child profiles for the current user
		const { data: profiles, error } = await supabase
			.from('child_profiles')
			.select('*')
			.eq('parent_user_id', user.id)
			.order('created_at', { ascending: true });

		if (error) {
			console.error('Error fetching child profiles:', error);
			return NextResponse.json(
				{ error: "Failed to fetch child profiles" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			profiles: profiles || []
		});

	} catch (error) {
		console.error('Unexpected error in GET /api/child-profiles:', error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();

		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body: CreateChildProfileRequest = await request.json();

		// Validate required fields
		if (!body.name || !body.year_level || !body.age || !body.gender) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Validate year level
		if (body.year_level < 1 || body.year_level > 6) {
			return NextResponse.json(
				{ error: "Year level must be between 1 and 6" },
				{ status: 400 }
			);
		}

		// Validate age
		if (body.age < 5 || body.age > 12) {
			return NextResponse.json(
				{ error: "Age must be between 5 and 12" },
				{ status: 400 }
			);
		}

		// Validate gender
		if (!['boy', 'girl', 'other'].includes(body.gender)) {
			return NextResponse.json(
				{ error: "Gender must be 'boy', 'girl', or 'other'" },
				{ status: 400 }
			);
		}

		// Create the child profile
		const { data: profile, error } = await supabase
			.from('child_profiles')
			.insert({
				parent_user_id: user.id,
				name: body.name.trim(),
				year_level: body.year_level,
				age: body.age,
				gender: body.gender,
				preferences: body.preferences || {
					favoriteGenres: [],
					contentFilters: ["age-appropriate"],
					allowedTopics: [],
					blockedTopics: []
				}
			})
			.select()
			.single();

		if (error) {
			console.error('Error creating child profile:', error);
			return NextResponse.json(
				{ error: "Failed to create child profile" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			profile
		}, { status: 201 });

	} catch (error) {
		console.error('Unexpected error in POST /api/child-profiles:', error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}