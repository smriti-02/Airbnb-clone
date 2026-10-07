"use client";

import { useState } from "react";
import { Home } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function SafeImage({ src, alt, fill, className, sizes, width, height, priority }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-[#EBEBEB] text-[#B0B0B0] w-full h-full ${className || ''}`}>
        <Home size={40} />
      </div>
    );
  }

  // Use standard img tag to bypass Next.js image optimization (which requires a server restart to apply next.config.ts changes)
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`object-cover ${fill ? 'absolute inset-0 w-full h-full' : ''} ${className || ''}`}
      onError={() => setError(true)}
    />
  );
}
