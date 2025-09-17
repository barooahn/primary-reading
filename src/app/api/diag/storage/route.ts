import { NextResponse } from "next/server";
import { ensureStorageBucket, getSignedUrl } from "@/utils/images/storage";
import { createAdminClient } from "@/utils/supabase/admin";

const STORIES_BUCKET = "story-images";

export async function GET() {
  try {
    // 1) Ensure bucket exists / is accessible
    const bucketReady = await ensureStorageBucket();
    if (!bucketReady) {
      return NextResponse.json(
        { success: false, step: "ensureBucket", error: "Bucket not ready" },
        { status: 500 }
      );
    }

    // 2) Upload a tiny 1x1 PNG (base64) to verify write permissions
    const supabase = createAdminClient();
    const ts = Date.now();
    const path = `diag/diag_${ts}.png`;

    // Tiny transparent 1x1 PNG
    const base64PNG =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
    const buffer = Buffer.from(base64PNG, "base64");

    const { error: uploadError } = await supabase.storage
      .from(STORIES_BUCKET)
      .upload(path, buffer, {
        contentType: "image/png",
        upsert: false,
        cacheControl: "60",
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, step: "upload", error: uploadError.message },
        { status: 500 }
      );
    }

    // 3) Try to sign the uploaded file
    const signedUrl = await getSignedUrl(path);

    // 4) Clean up
    await supabase.storage.from(STORIES_BUCKET).remove([path]);

    return NextResponse.json({
      success: true,
      bucket: STORIES_BUCKET,
      testPath: path,
      signedUrl,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}

