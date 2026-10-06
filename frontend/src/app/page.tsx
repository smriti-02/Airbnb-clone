"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Categories from "@/components/Categories";
import ListingCard from "@/components/ListingCard";
import FilterModal from "@/components/FilterModal";
import { useListings } from "@/hooks/useListings";
import { Skeleton, Button } from "@/components/UI";
import { SlidersHorizontal } from "lucide-react";
import { useInView } from "react-intersection-observer";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { listings, loading, hasMore, total } = useListings(searchParams);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasMore && !loading) {
      const currentPage = parseInt(searchParams.get("page") || "1");
      const url = new URL(window.location.href);
      url.searchParams.set("page", (currentPage + 1).toString());
      router.push(url.pathname + url.search, { scroll: false });
    }
  }, [inView, hasMore, loading]);

  return (
    <>
      <div className="sticky top-[81px] z-30 bg-white shadow-sm border-b pb-4 pt-4">
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 flex items-center justify-between gap-4">
          <div className="flex-1 overflow-hidden">
            <Categories />
          </div>
          <button 
            onClick={() => setFilterModalOpen(true)}
            className="hidden md:flex items-center gap-2 border border-[color:var(--color-airbnb-border)] rounded-xl px-4 py-3 hover:border-black hover:bg-neutral-50 transition font-semibold text-sm whitespace-nowrap"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-8">
        {listings.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-2xl font-bold mb-2">No exact matches</h2>
            <p className="text-neutral-500 mb-6">Try changing or removing some of your filters.</p>
            <Button onClick={() => router.push("/")} primary>Remove all filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {listings.map(listing => (
              <ListingCard key={listing.id} data={listing} />
            ))}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mt-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="w-full aspect-square rounded-xl" />
                <Skeleton className="w-3/4 h-4 rounded mt-2" />
                <Skeleton className="w-1/2 h-4 rounded" />
              </div>
            ))}
          </div>
        )}
        
        <div ref={ref} className="h-10 mt-4 opacity-0" />
      </div>

      <FilterModal isOpen={filterModalOpen} onClose={() => setFilterModalOpen(false)} />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]"></div></div>}>
      <HomeContent />
    </Suspense>
  );
}
