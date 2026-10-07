"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Categories from "@/components/Categories";
import ListingCard from "@/components/ListingCard";
import FilterModal from "@/components/FilterModal";
import { useListings } from "@/hooks/useListings";
import { Skeleton, Button } from "@/components/UI";
import { SlidersHorizontal, Map, List } from "lucide-react";
import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";

const HomeMap = dynamic(() => import("@/components/HomeMap"), { 
  ssr: false, 
  loading: () => <Skeleton className="h-[calc(100vh-160px)] w-full rounded-2xl mt-6" /> 
});

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { listings, loading, hasMore, total } = useListings(searchParams);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasMore && !loading && !showMap) {
      const currentPage = parseInt(searchParams.get("page") || "1");
      const url = new URL(window.location.href);
      url.searchParams.set("page", (currentPage + 1).toString());
      router.push(url.pathname + url.search, { scroll: false });
    }
  }, [inView, hasMore, loading, showMap]);

  return (
    <>
      <div className="sticky top-[80px] z-30 bg-white border-b border-[#EBEBEB] py-4 h-[80px] flex items-center">
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 flex items-center justify-between gap-4 w-full">
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

      <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-8 min-h-screen">
        {showMap ? (
          <HomeMap listings={listings} />
        ) : (
          <>
            <div className="mb-6 mt-2">
              <h1 className="text-2xl font-bold">
                {total > 0 || !loading ? `${total} stay${total !== 1 ? 's' : ''}${searchParams.get('location') ? ` in ${searchParams.get('location')}` : ''}` : ''}
              </h1>
            </div>
            {listings.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h2 className="text-2xl font-bold mb-2">No stays match your search</h2>
                <p className="text-neutral-500 mb-6">Try changing or removing some of your filters.</p>
                <Button onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('location');
                  url.searchParams.delete('check_in');
                  url.searchParams.delete('check_out');
                  url.searchParams.delete('guests');
                  url.searchParams.delete('page');
                  router.push(url.pathname + url.search);
                }} primary>Clear search</Button>
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
          </>
        )}
      </div>

      {/* Floating Map/List Toggle */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 transition transform hover:scale-105 active:scale-95">
        <button 
          onClick={() => setShowMap(!showMap)}
          className="bg-[color:var(--color-airbnb-text)] text-white px-5 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition"
        >
          {showMap ? (
            <>Show list <List size={18} /></>
          ) : (
            <>Show map <Map size={18} /></>
          )}
        </button>
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
