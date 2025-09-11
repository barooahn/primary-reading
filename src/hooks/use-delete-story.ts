"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteStoryOptions {
  onSuccess?: (storyId: string) => void;
  onError?: (error: string) => void;
  redirectAfterDelete?: string;
}

export function useDeleteStory(options: DeleteStoryOptions = {}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const deleteStory = async (storyId: string) => {
    if (!storyId) {
      setError("Story ID is required");
      return false;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete story");
      }

      // Success callback
      if (options.onSuccess) {
        options.onSuccess(storyId);
      }

      // Optional redirect
      if (options.redirectAfterDelete) {
        router.push(options.redirectAfterDelete);
      }

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      
      if (options.onError) {
        options.onError(errorMessage);
      }
      
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteStory,
    isDeleting,
    error,
    clearError: () => setError(null),
  };
}