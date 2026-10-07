"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { formatSearchDates } from "@/lib/format";

export default function SearchBarCompact({ onClick, onMobileFilter }: { onClick: () => void, onMobileFilter?: () => void }) {
  const searchParams = useSearchParams();
  const location = searchParams.get("location") || "Anywhere";
  const checkIn = searchParams.get("check_in");
  const checkOut = searchParams.get("check_out");
  const dates = formatSearchDates(checkIn, checkOut) || "Anytime";
  const guests = parseInt(searchParams.get("guests") || "0");
  const guestsLabel = guests > 0 ? `${guests} guest${guests > 1 ? 's' : ''}` : "Add guests";

  return (
    <div className="w-full flex justify-center">
      {/* Desktop */}
      <div 
        onClick={onClick}
        className="hidden md:flex border border-[#DDD] h-[48px] rounded-full shadow-[0_1px_2px_rgba(0,0,0,.08)] hover:shadow-[0_2px_4px_rgba(0,0,0,.12)] transition cursor-pointer items-center justify-between"
      >
        <div className="text-sm font-medium px-4 border-r border-[#DDD] whitespace-nowrap">{location}</div>
        <div className="text-sm font-medium px-4 border-r border-[#DDD] whitespace-nowrap">{dates}</div>
        <div className="text-sm pl-4 pr-2 text-[#717171] flex items-center gap-3">
          <div className="font-medium">{guestsLabel}</div>
          <div className="w-8 h-8 bg-[#FF385C] rounded-full flex items-center justify-center text-white">
            <Search size={14} strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div 
        onClick={onClick}
        className="md:hidden flex flex-row border border-[#DDD] h-[56px] rounded-full shadow-md bg-white cursor-pointer items-center justify-between px-4 w-full max-w-[400px]"
      >
        <div className="flex flex-row items-center gap-4">
          <Search size={20} className="text-black font-bold" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{location !== "Anywhere" ? location : "Where to?"}</span>
            <span className="text-xs text-[#717171]">{location} • {dates} • {guestsLabel}</span>
          </div>
        </div>
        <div 
          className="w-9 h-9 border border-[#DDD] rounded-full flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); if (onMobileFilter) onMobileFilter(); }}
        >
          <SlidersHorizontal size={16} className="text-black" />
        </div>
      </div>
    </div>
  );
}
