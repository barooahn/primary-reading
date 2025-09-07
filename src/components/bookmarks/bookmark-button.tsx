'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkPlus } from 'lucide-react';

interface BookmarkButtonProps {
  storyId: string;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BookmarkButton({ 
  storyId, 
  className = '', 
  showText = false,
  size = 'md'
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load bookmark status on component mount
  useEffect(() => {
    loadBookmarkStatus();
  }, [loadBookmarkStatus]);

  const loadBookmarkStatus = useCallback(async () => {
    try {
      // In a real app, this would check with Supabase
      // For now, use localStorage as a demo
      const bookmarks = JSON.parse(localStorage.getItem('story_bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(storyId));
    } catch (error) {
      console.error('Failed to load bookmark status:', error);
    }
  }, [storyId]);

  const toggleBookmark = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // In a real app, this would use Supabase
      // For now, use localStorage as a demo
      const bookmarks = JSON.parse(localStorage.getItem('story_bookmarks') || '[]');
      
      if (isBookmarked) {
        // Remove bookmark
        const updatedBookmarks = bookmarks.filter((id: string) => id !== storyId);
        localStorage.setItem('story_bookmarks', JSON.stringify(updatedBookmarks));
        setIsBookmarked(false);
      } else {
        // Add bookmark
        const updatedBookmarks = [...bookmarks, storyId];
        localStorage.setItem('story_bookmarks', JSON.stringify(updatedBookmarks));
        setIsBookmarked(true);
      }
      
      // In a real app, make API call to Supabase here:
      /*
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storyId, 
          action: isBookmarked ? 'remove' : 'add' 
        })
      });
      */
      
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      // Revert state on error
      setIsBookmarked(!isBookmarked);
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  }[size];

  const buttonSize = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2'
  }[size];

  if (showText) {
    return (
      <Button
        variant={isBookmarked ? "default" : "outline"}
        onClick={toggleBookmark}
        disabled={isLoading}
        className={`flex items-center space-x-2 ${buttonSize} ${className}`}
      >
        {isBookmarked ? (
          <Bookmark className={`${iconSize} fill-current`} />
        ) : (
          <BookmarkPlus className={iconSize} />
        )}
        <span>
          {isLoading ? 'Saving...' : isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant={isBookmarked ? "default" : "ghost"}
      size="icon"
      onClick={toggleBookmark}
      disabled={isLoading}
      className={`${className} ${isBookmarked ? 'text-white' : 'text-muted hover:text-foreground'}`}
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {isBookmarked ? (
        <Bookmark className={`${iconSize} fill-current`} />
      ) : (
        <BookmarkPlus className={iconSize} />
      )}
    </Button>
  );
}