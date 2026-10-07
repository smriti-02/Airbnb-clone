"use client";
import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { MouseEvent } from "react";

interface WishlistButtonProps {
  listingId: number;
  className?: string;
  size?: number;
  withText?: boolean;
}

export default function WishlistButton({ listingId, className = "", size = 24, withText = false }: WishlistButtonProps) {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const isSaved = wishlistIds.has(listingId);

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(listingId);
  };

  return (
    <button 
      onClick={handleClick}
      className={`flex items-center gap-2 hover:opacity-80 transition active:scale-95 ${className}`}
      type="button"
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={size}
        className={`transition-colors ${
          isSaved ? "fill-[color:var(--color-airbnb-primary)] text-[color:var(--color-airbnb-primary)]" : "fill-[rgba(0,0,0,0.5)] text-white"
        }`}
      />
      {withText && <span className="underline font-semibold">{isSaved ? "Saved" : "Save"}</span>}
    </button>
  );
}
