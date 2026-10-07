"use client";

import { useState } from "react";
import { Modal, Button } from "@/components/UI";
import { useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";

export default function FilterModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const router = useRouter();
  const params = useSearchParams();

  const [minPrice, setMinPrice] = useState(params.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("max_price") || "");
  const [bedrooms, setBedrooms] = useState(params.get("bedrooms") || "0");

  const onSubmit = () => {
    let currentQuery = {};
    if (params) {
      currentQuery = qs.parse(params.toString());
    }

    const updatedQuery: any = {
      ...currentQuery,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      bedrooms: bedrooms !== "0" ? bedrooms : undefined,
      page: 1
    };

    const url = qs.stringifyUrl({
      url: "/",
      query: updatedQuery
    }, { skipNull: true });

    router.push(url);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filters">
      <div className="flex flex-col gap-6">
        {/* Price Range */}
        <div>
          <h3 className="font-semibold text-lg">Price range</h3>
          <p className="text-neutral-500 text-sm mb-4">Nightly prices before fees and taxes</p>
          <div className="flex items-center gap-4">
            <div className="border border-[color:var(--color-airbnb-border)] rounded-xl p-3 w-full flex flex-col focus-within:border-black transition">
              <span className="text-xs text-neutral-500">Minimum</span>
              <div className="flex items-center"><span className="mr-1">₹</span><input type="number" className="outline-none w-full bg-transparent" value={minPrice} onChange={e => setMinPrice(e.target.value)} /></div>
            </div>
            <div className="text-neutral-500">-</div>
            <div className="border border-[color:var(--color-airbnb-border)] rounded-xl p-3 w-full flex flex-col focus-within:border-black transition">
              <span className="text-xs text-neutral-500">Maximum</span>
              <div className="flex items-center"><span className="mr-1">₹</span><input type="number" className="outline-none w-full bg-transparent" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} /></div>
            </div>
          </div>
        </div>
        
        <hr className="border-[color:var(--color-airbnb-border)]" />
        
        {/* Rooms */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Rooms and beds</h3>
          <div className="flex justify-between items-center">
            <div>Bedrooms</div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setBedrooms(b => Math.max(0, parseInt(b) - 1).toString())}
                className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:border-black"
              >-</button>
              <span>{bedrooms === "0" ? "Any" : bedrooms}</span>
              <button 
                onClick={() => setBedrooms(b => (parseInt(b) + 1).toString())}
                className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:border-black"
              >+</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 border-t border-[color:var(--color-airbnb-border)] pt-4 flex justify-between items-center">
        <button onClick={() => { setMinPrice(""); setMaxPrice(""); setBedrooms("0"); }} className="underline font-semibold text-sm">Clear all</button>
        <Button primary onClick={onSubmit}>Show places</Button>
      </div>
    </Modal>
  );
}
