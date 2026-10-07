"use client";

import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SafeImage from "./SafeImage";
import { formatINR } from "@/lib/format";
import WishlistButton from "./WishlistButton";

export default React.memo(function ListingCard({ data }: { data: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentIdx, setCurrentIdx] = useState(0);

  const photos = data.photos && data.photos.length > 0 
    ? data.photos.sort((a: any, b: any) => a.position - b.position) 
    : [{ url: "https://placehold.co/400?text=No+Photo" }];

  const nextPhoto = (e: any) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % photos.length);
  };
  const prevPhoto = (e: any) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleCardClick = () => {
    const params = new URLSearchParams();
    if (searchParams.get("check_in")) params.set("check_in", searchParams.get("check_in")!);
    if (searchParams.get("check_out")) params.set("check_out", searchParams.get("check_out")!);
    if (searchParams.get("guests")) params.set("guests", searchParams.get("guests")!);
    const qStr = params.toString();
    router.push(`/listings/${data.id}${qStr ? '?' + qStr : ''}`);
  };

  return (
    <div 
      onClick={handleCardClick} 
      className="col-span-1 cursor-pointer group"
    >
      <div className="flex flex-col gap-2 w-full">
        <div className="aspect-square w-full relative overflow-hidden rounded-xl">
          <div 
            className="flex h-full w-full transition-transform duration-300"
            style={{ transform: `translateX(-${currentIdx * 100}%)` }}
          >
            {photos.map((photo: any, i: number) => (
              <div key={i} className="relative h-full min-w-full group-hover:scale-105 transition duration-300">
                <SafeImage 
                  src={photo.url} 
                  alt={data.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
          
          <div className="absolute top-3 right-3 z-10">
            <WishlistButton listingId={data.id} size={26} />
          </div>

          {photos.length > 1 && (
            <>
              <div onClick={prevPhoto} className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:bg-white z-10">
                <ChevronLeft size={16} />
              </div>
              <div onClick={nextPhoto} className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:bg-white z-10">
                <ChevronRight size={16} />
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {photos.map((_: any, i: number) => (
                  <div key={i} className={`w-[6px] h-[6px] rounded-full transition ${i === currentIdx ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-between items-start mt-2">
          <div className="font-semibold truncate text-[color:var(--color-airbnb-text)]">{data.city}, {data.country}</div>
          <div className="flex items-center gap-1 text-sm">
            <Star size={14} className="fill-black" />
            {data.avg_rating || "New"}
          </div>
        </div>
        
        <div className="text-neutral-500 text-sm truncate">
          {data.property_type} · {data.bedrooms} beds
        </div>
        <div className="text-neutral-500 text-sm">
          Hosted by {data.host?.name || "Host"}
        </div>
        
        <div className="flex flex-row items-center gap-1 mt-1 text-[color:var(--color-airbnb-text)]">
          {data.nights ? (
             <><span className="font-semibold underline decoration-solid decoration-1 underline-offset-2">{formatINR(data.total_for_stay)}</span> <span className="font-light">total for {data.nights} night{data.nights>1?'s':''}</span></>
          ) : (
             <><span className="font-semibold">{formatINR(data.price_per_night)}</span> <span className="font-light">night</span></>
          )}
        </div>
      </div>
    </div>
  );
});
