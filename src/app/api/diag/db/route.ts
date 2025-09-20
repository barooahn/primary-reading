import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function checkColumnExists(
  table: string,
  column: string
): Promise<{ present: boolean; error?: string }> {
  const supabase = createAdminClient();
  try {
    const { error } = await supabase
      .from(table)
      // Selecting only the target column keeps this cheap and reveals column-missing errors
      .select(`${column}`)
      .limit(1);

    if (error) {
      const msg = error.message || String(error);
      // PostgREST error patterns when column is missing
      const missing =
        msg.includes("Could not find the") ||
        msg.includes("does not exist") ||
        msg.toLowerCase().includes("column") && msg.toLowerCase().includes("not") && msg.toLowerCase().includes("exist");
      return { present: !missing, error: missing ? msg : undefined };
    }
    return { present: true };
  } catch (e: any) {
    return { present: false, error: e?.message || String(e) };
  }
}

export async function GET() {
  try {
    const results = {
      stories: {
        cover_image_path: await checkColumnExists("stories", "cover_image_path"),
        cover_thumbnail_path: await checkColumnExists(
          "stories",
          "cover_thumbnail_path"
        ),
      },
      story_segments: {
        image_path: await checkColumnExists("story_segments", "image_path"),
        thumbnail_path: await checkColumnExists(
          "story_segments",
          "thumbnail_path"
        ),
      },
    } as const;

    return NextResponse.json({ success: true, results });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}

