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
          image_url,
          image_path,
          thumbnail_url,
          thumbnail_path
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

    // Collect all image files that need to be deleted from storage
    const imagesToDelete: string[] = [];
    
    // Add cover images if they exist
    if (story.cover_image_url) {
      const coverFileName = extractFileNameFromUrl(story.cover_image_url);
      if (coverFileName) {
        imagesToDelete.push(coverFileName);
      }
    }
    if (story.cover_image_path) {
      imagesToDelete.push(story.cover_image_path);
    }
    if (story.cover_thumbnail_url) {
      const thumbFileName = extractFileNameFromUrl(story.cover_thumbnail_url);
      if (thumbFileName) {
        imagesToDelete.push(thumbFileName);
      }
    }
    if (story.cover_thumbnail_path) {
      imagesToDelete.push(story.cover_thumbnail_path);
    }

    // Add segment images if they exist
    if (story.story_segments) {
      story.story_segments.forEach((segment: any) => {
        // Main image
        if (segment.image_url) {
          const segmentFileName = extractFileNameFromUrl(segment.image_url);
          if (segmentFileName) {
            imagesToDelete.push(segmentFileName);
          }
        }
        if (segment.image_path) {
          imagesToDelete.push(segment.image_path);
        }
        
        // Thumbnail image
        if (segment.thumbnail_url) {
          const thumbFileName = extractFileNameFromUrl(segment.thumbnail_url);
          if (thumbFileName) {
            imagesToDelete.push(thumbFileName);
          }
        }
        if (segment.thumbnail_path) {
          imagesToDelete.push(segment.thumbnail_path);
        }
      });
    }

    // Delete related records first (foreign key constraints)
    // Note: Most tables have CASCADE DELETE so they'll be automatically cleaned up,
    // but we'll delete some manually for better control and logging
    const deleteOperations = [];

    console.log(`Starting deletion of story ${storyId} and all related data...`);

    // Delete user answers for this story's questions
    deleteOperations.push(
      supabase
        .from("user_answers")
        .delete()
        .eq("story_id", storyId)
    );

    // Delete user progress records
    deleteOperations.push(
      supabase
        .from("user_progress") 
        .delete()
        .eq("story_id", storyId)
    );

    // Delete story ratings
    deleteOperations.push(
      supabase
        .from("story_ratings")
        .delete()
        .eq("story_id", storyId)
    );

    // Delete questions (will cascade to user_answers if any remain)
    deleteOperations.push(
      supabase
        .from("questions")
        .delete()
        .eq("story_id", storyId)
    );

    // Delete story segments (will cascade to questions if any remain)
    deleteOperations.push(
      supabase
        .from("story_segments")
        .delete()
        .eq("story_id", storyId)
    );

    // Legacy table cleanup (if they exist)
    deleteOperations.push(
      supabase
        .from("comprehension_questions")
        .delete()
        .eq("story_id", storyId)
    );

    deleteOperations.push(
      supabase
        .from("story_images")
        .delete()
        .eq("story_id", storyId)
    );

    // Execute deletions
    const results = await Promise.allSettled(deleteOperations);
    
    // Log results for each deletion operation
    const operationNames = [
      "user_answers",
      "user_progress", 
      "story_ratings",
      "questions",
      "story_segments",
      "comprehension_questions (legacy)",
      "story_images (legacy)"
    ];

    let deletedRecords = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const count = (result.value as any)?.count || 0;
        if (count > 0) {
          console.log(`✓ Deleted ${count} records from ${operationNames[index]}`);
          deletedRecords += count;
        }
      } else {
        console.warn(`✗ Failed to delete from ${operationNames[index]}:`, result.reason);
      }
    });

    console.log(`Total related records deleted: ${deletedRecords}`);
    
    // Check if any critical deletions failed
    const criticalFailures = results.filter((result) => result.status === 'rejected');
    if (criticalFailures.length > 0) {
      console.error("Some related record deletions failed, but continuing with story deletion");
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

    console.log(`✓ Story ${storyId} and all related data deleted successfully`);

    return NextResponse.json({
      success: true,
      message: "Story and all related data deleted successfully",
      details: {
        storyId: storyId,
        relatedRecordsDeleted: deletedRecords,
        imagesDeleted: imagesToDelete.length - imageCleanupFailures.length,
        imagesFailed: imageCleanupFailures.length,
        totalImages: imagesToDelete.length,
        cleanupComplete: imageCleanupFailures.length === 0
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