import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { deleteImage } from "@/utils/images/storage";

// DELETE /api/stories/[id]/delete
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();
    
    const params = await context.params;
    const storyId = params?.id;
    
    if (!storyId) {
      return NextResponse.json(
        { success: false, error: "Story ID is required" },
        { status: 400 }
      );
    }

    // Get current user for authorization
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // First, get the story to verify ownership and collect image URLs
    const { data: story, error: fetchError } = await supabase
      .from("stories")
      .select(`
        *,
        story_segments (
          id,
          image_url
        )
      `)
      .eq("id", storyId)
      .eq("created_by", user.id) // Ensure user owns the story
      .single();

    if (fetchError || !story) {
      return NextResponse.json(
        { success: false, error: "Story not found or access denied" },
        { status: 404 }
      );
    }

    // Collect all image URLs that need to be deleted
    const imagesToDelete: string[] = [];
    
    // Add cover image if it exists
    if (story.cover_image_url) {
      // Extract filename from Supabase Storage URL
      const coverFileName = extractFileNameFromUrl(story.cover_image_url);
      if (coverFileName) {
        imagesToDelete.push(coverFileName);
      }
    }

    // Add segment images if they exist
    if (story.story_segments) {
      story.story_segments.forEach((segment: any) => {
        if (segment.image_url) {
          const segmentFileName = extractFileNameFromUrl(segment.image_url);
          if (segmentFileName) {
            imagesToDelete.push(segmentFileName);
          }
        }
      });
    }

    // Delete related records first (foreign key constraints)
    const deleteOperations = [];

    // Delete comprehension questions
    deleteOperations.push(
      supabase
        .from("comprehension_questions")
        .delete()
        .eq("story_id", storyId)
    );

    // Delete story segments  
    deleteOperations.push(
      supabase
        .from("story_segments")
        .delete()
        .eq("story_id", storyId)
    );

    // Execute deletions
    const results = await Promise.allSettled(deleteOperations);
    
    // Check if any critical deletions failed
    const criticalFailures = results.filter((result) => result.status === 'rejected');
    if (criticalFailures.length > 0) {
      console.error("Failed to delete related records:", criticalFailures);
      // Continue anyway - we'll still try to delete the main story
    }

    // Delete the main story record
    const { error: storyDeleteError } = await supabase
      .from("stories")
      .delete()
      .eq("id", storyId)
      .eq("created_by", user.id);

    if (storyDeleteError) {
      console.error("Story deletion error:", storyDeleteError);
      return NextResponse.json(
        { success: false, error: "Failed to delete story" },
        { status: 500 }
      );
    }

    // Delete images from storage (do this after story deletion to ensure cleanup)
    const imageCleanupResults = await Promise.allSettled(
      imagesToDelete.map(fileName => deleteImage(fileName))
    );

    const imageCleanupFailures = imageCleanupResults.filter(
      (result) => result.status === 'rejected' || !result.value
    );

    if (imageCleanupFailures.length > 0) {
      console.warn(`Failed to delete ${imageCleanupFailures.length} images out of ${imagesToDelete.length}`);
      // Don't fail the whole operation - the story is deleted, images are just cleanup
    }

    return NextResponse.json({
      success: true,
      message: "Story deleted successfully",
      details: {
        imagesDeleted: imagesToDelete.length - imageCleanupFailures.length,
        imagesFailed: imageCleanupFailures.length,
        totalImages: imagesToDelete.length
      }
    });

  } catch (error) {
    console.error("Delete story error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Extract filename from Supabase Storage URL
 * Example: https://project.supabase.co/storage/v1/object/public/story-images/filename.webp -> filename.webp
 */
function extractFileNameFromUrl(url: string): string | null {
  try {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1] || null;
  } catch {
    return null;
  }
}