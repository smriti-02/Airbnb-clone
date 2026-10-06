"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";
import { Skeleton, Button } from "@/components/UI";
import ListingCard from "@/components/ListingCard";
import { useRouter } from "next/navigation";

export default function WishlistsClient() {
  const { user } = useUser();
  const router = useRouter();
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    apiFetch("/wishlist")
      .then((res: any) => setWishlists(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  if (loading) return <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-10"><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-10 pb-20 min-h-[70vh]">
      <h1 className="text-3xl font-bold mb-8">Wishlists</h1>
      {wishlists.length === 0 ? (
        <div className="py-10">
          <h2 className="text-xl font-semibold mb-2">Create your first wishlist</h2>
          <p className="text-neutral-500 mb-6">As you search, tap the heart icon to save your favorite places and Experiences to a wishlist.</p>
          <Button primary onClick={() => router.push("/")}>Start exploring</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {wishlists.map(listing => (
            <ListingCard key={listing.id} data={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
