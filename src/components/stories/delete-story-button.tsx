"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteStoryDialog } from "@/components/ui/confirm-dialog";
import { useDeleteStory } from "@/hooks/use-delete-story";
import { Trash2 } from "lucide-react";

interface DeleteStoryButtonProps {
  storyId: string;
  storyTitle: string;
  hasImages?: boolean;
  variant?: "ghost" | "outline" | "destructive" | "secondary";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  onDeleted?: () => void;
  redirectAfterDelete?: string;
  className?: string;
}

export function DeleteStoryButton({
  storyId,
  storyTitle,
  hasImages = false,
  variant = "ghost",
  size = "sm",
  showText = true,
  onDeleted,
  redirectAfterDelete = "/dashboard",
  className = "",
}: DeleteStoryButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  const { deleteStory, isDeleting } = useDeleteStory({
    onSuccess: () => {
      console.log(`Story "${storyTitle}" has been permanently deleted.`);
      
      if (onDeleted) {
        onDeleted();
      }
    },
    onError: (error) => {
      console.error("Failed to delete story:", error);
      alert(`Failed to delete story: ${error}`);
    },
    redirectAfterDelete,
  });

  const handleConfirmDelete = async () => {
    await deleteStory(storyId);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowDialog(true)}
        disabled={isDeleting}
        className={`text-destructive hover:text-destructive-foreground hover:bg-destructive ${className}`}
      >
        <Trash2 className="h-4 w-4" />
        {showText && <span className="ml-2">Delete</span>}
      </Button>

      <DeleteStoryDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleConfirmDelete}
        storyTitle={storyTitle}
        hasImages={hasImages}
        loading={isDeleting}
      />
    </>
  );
}

// Dropdown menu item version for use in dropdown menus
interface DeleteStoryMenuItemProps {
  storyId: string;
  storyTitle: string;
  hasImages?: boolean;
  onDeleted?: () => void;
  redirectAfterDelete?: string;
}

export function DeleteStoryMenuItem({
  storyId,
  storyTitle,
  hasImages = false,
  onDeleted,
  redirectAfterDelete = "/dashboard",
}: DeleteStoryMenuItemProps) {
  const [showDialog, setShowDialog] = useState(false);

  const { deleteStory, isDeleting } = useDeleteStory({
    onSuccess: () => {
      console.log(`Story "${storyTitle}" has been permanently deleted.`);
      
      if (onDeleted) {
        onDeleted();
      }
    },
    onError: (error) => {
      console.error("Failed to delete story:", error);
      alert(`Failed to delete story: ${error}`);
    },
    redirectAfterDelete,
  });

  const handleConfirmDelete = async () => {
    await deleteStory(storyId);
  };

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        disabled={isDeleting}
        className="flex w-full items-center px-2 py-1.5 text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-sm transition-colors"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Story
      </button>

      <DeleteStoryDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleConfirmDelete}
        storyTitle={storyTitle}
        hasImages={hasImages}
        loading={isDeleting}
      />
    </>
  );
}