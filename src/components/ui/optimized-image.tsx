'use client';

import Image, { ImageProps } from 'next/image';
import { useState, memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoadingComplete'> {
  fallbackSrc?: string;
  showLoadingState?: boolean;
  loadingClassName?: string;
  errorClassName?: string;
}

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  showLoadingState = true,
  loadingClassName,
  errorClassName,
  className,
  ...props
}: OptimizedImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = useState(src);

  const handleLoad = () => {
    setImageState('loaded');
  };

  const handleError = () => {
    setImageState('error');
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setImageState('loading');
    }
  };

  return (
    <div className="relative overflow-hidden">
      <Image
        {...props}
        src={imageSrc}
        alt={alt}
        className={cn(
          "transition-all duration-300",
          imageState === 'loading' && showLoadingState && "blur-sm scale-105",
          imageState === 'loaded' && "blur-0 scale-100",
          imageState === 'error' && errorClassName,
          className
        )}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        onLoad={handleLoad}
        onError={handleError}
        priority={props.priority}
        loading={props.priority ? undefined : (props.loading || "lazy")}
        sizes={props.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      />

      {imageState === 'loading' && showLoadingState && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse",
          loadingClassName
        )}>
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {imageState === 'error' && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500",
          errorClassName
        )}>
          <div className="text-center">
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-sm font-medium">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
});

export const StoryImage = memo(function StoryImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      src={src}
      alt={alt}
      className={cn(
        "w-full h-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300",
        className
      )}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
      fallbackSrc="/images/story-placeholder.svg"
    />
  );
});

export const AvatarImage = memo(function AvatarImage({
  src,
  alt,
  size = 40,
  className,
  ...props
}: OptimizedImageProps & { size?: number }) {
  return (
    <OptimizedImage
      {...props}
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn(
        "rounded-full object-cover border-2 border-white shadow-md",
        className
      )}
      sizes={`${size}px`}
      fallbackSrc="/images/default-avatar.svg"
    />
  );
});

export const HeroImage = memo(function HeroImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      src={src}
      alt={alt}
      className={cn(
        "w-full h-auto object-cover",
        className
      )}
      priority={true}
      sizes="100vw"
      showLoadingState={false}
    />
  );
});