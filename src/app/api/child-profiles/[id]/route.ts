import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { UpdateChildProfileRequest } from "@/types/child-profile";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
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

		const { id } = await params;

		// Get specific child profile
		const { data: profile, error } = await supabase
			.from('child_profiles')
			.select('*')
			.eq('id', id)
			.eq('parent_user_id', user.id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				return NextResponse.json(
					{ error: "Child profile not found" },
					{ status: 404 }
				);
			}
			console.error('Error fetching child profile:', error);
			return NextResponse.json(
				{ error: "Failed to fetch child profile" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			profile
		});

	} catch (error) {
		console.error('Unexpected error in GET /api/child-profiles/[id]:', error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
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

		const { id } = await params;
		const body: UpdateChildProfileRequest = await request.json();

		// Validate optional fields if provided
		if (body.year_level !== undefined && (body.year_level < 1 || body.year_level > 6)) {
			return NextResponse.json(
				{ error: "Year level must be between 1 and 6" },
				{ status: 400 }
			);
		}

		if (body.age !== undefined && (body.age < 5 || body.age > 12)) {
			return NextResponse.json(
				{ error: "Age must be between 5 and 12" },
				{ status: 400 }
			);
		}

		if (body.gender !== undefined && !['boy', 'girl', 'other'].includes(body.gender)) {
			return NextResponse.json(
				{ error: "Gender must be 'boy', 'girl', or 'other'" },
				{ status: 400 }
			);
		}

		// Build update object
		const updateData: Record<string, unknown> = {};
		if (body.name !== undefined) updateData.name = body.name.trim();
		if (body.year_level !== undefined) updateData.year_level = body.year_level;
		if (body.age !== undefined) updateData.age = body.age;
		if (body.gender !== undefined) updateData.gender = body.gender;
		if (body.preferences !== undefined) updateData.preferences = body.preferences;

		// Update the child profile
		const { data: profile, error } = await supabase
			.from('child_profiles')
			.update(updateData)
			.eq('id', id)
			.eq('parent_user_id', user.id)
			.select()
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				return NextResponse.json(
					{ error: "Child profile not found" },
					{ status: 404 }
				);
			}
			console.error('Error updating child profile:', error);
			return NextResponse.json(
				{ error: "Failed to update child profile" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			profile
		});

	} catch (error) {
		console.error('Unexpected error in PATCH /api/child-profiles/[id]:', error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
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

		const { id } = await params;

		// Delete the child profile
		const { error } = await supabase
			.from('child_profiles')
			.delete()
			.eq('id', id)
			.eq('parent_user_id', user.id);

		if (error) {
			console.error('Error deleting child profile:', error);
			return NextResponse.json(
				{ error: "Failed to delete child profile" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Child profile deleted successfully"
		});

	} catch (error) {
		console.error('Unexpected error in DELETE /api/child-profiles/[id]:', error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}