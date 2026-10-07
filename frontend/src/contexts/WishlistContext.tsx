"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "./UserContext";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";

interface WishlistContextType {
  wishlistIds: Set<number>;
  toggleWishlist: (listingId: number) => void;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: new Set(),
  toggleWishlist: () => {},
});

export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (user) {
      apiFetch<any[]>("/wishlist")
        .then((listings) => {
          setWishlistIds(new Set(listings.map((l) => l.id)));
        })
        .catch(() => {
          // ignore error
        });
    } else {
      setWishlistIds(new Set());
    }
  }, [user]);

  const toggleWishlist = async (listingId: number) => {
    if (!user) {
      toast.error("Please log in to save to your wishlist.");
      return;
    }

    const wasSaved = wishlistIds.has(listingId);
    
    // Optimistic update
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(listingId);
      else next.add(listingId);
      return next;
    });

    try {
      if (wasSaved) {
        await apiFetch(`/wishlist/${listingId}`, { method: "DELETE" });
      } else {
        await apiFetch(`/wishlist/${listingId}`, { method: "POST" });
      }
    } catch (e: any) {
      // Revert optimistic update on error
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(listingId);
        else next.delete(listingId);
        return next;
      });
      toast.error(e.message || "Failed to update wishlist");
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
