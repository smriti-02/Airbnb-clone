"use client";

import { HostListingDraft } from "@/lib/hostTypes";
import { formatINR } from "@/lib/format";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function PriceStep({ value, onChange }: { value: HostListingDraft; onChange: (v: any) => void }) {
  const [suggested, setSuggested] = useState<string>("Rs 1,500 to Rs 3,500");

  useEffect(() => {
    if (value.city) {
      // Mocked price suggestion logic to avoid creating new endpoints unless necessary
      setSuggested(`Rs 1,500 to Rs 3,500`);
    }
  }, [value.city]);

  const price = value.price_per_night || 0;
  const cleaning = value.cleaning_fee || 0;
  
  const guestPrice = price + cleaning; // simplified display
  const youEarn = Math.round(price * 0.97); // rough 3% host fee

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto">
      <h2 className="text-3xl font-bold mb-4">Now, set your price</h2>
      <p className="text-gray-500 mb-8">You can change it anytime.</p>
      
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-center text-6xl font-bold">
          <span className="mr-2">₹</span>
          <input
            type="number"
            value={price || ""}
            onChange={e => onChange({ price_per_night: parseInt(e.target.value) || 0 })}
            className="w-48 text-center outline-none bg-transparent"
            placeholder="0"
          />
        </div>
        {price > 0 && (price < 500 || price > 100000) && (
          <p className="text-red-500 text-sm mt-2">Price must be between ₹500 and ₹1,00,000</p>
        )}
      </div>

      <div className="border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Cleaning fee</h3>
            <p className="text-sm text-gray-500">Optional</p>
          </div>
          <div className="flex items-center border rounded-lg px-3 py-2">
            <span>₹</span>
            <input 
              type="number"
              value={cleaning || ""}
              onChange={e => onChange({ cleaning_fee: parseInt(e.target.value) || 0 })}
              className="w-20 outline-none text-right ml-2"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between text-gray-500 mb-2">
            <span>Guest price (before taxes)</span>
            <span>{formatINR(guestPrice)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>You earn</span>
            <span>{formatINR(youEarn)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-gray-50 p-4 rounded-xl flex items-center gap-4">
        <div className="text-3xl">💡</div>
        <div>
          <p className="font-semibold">Similar stays in {value.city || "your area"}</p>
          <p className="text-gray-500 text-sm">{suggested}</p>
        </div>
      </div>
    </div>
  );
}
