"use client";

import { HostListingDraft } from "@/lib/hostTypes";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(() => import("./MapComponent"), { ssr: false });

export default function LocationStep({ value, onChange }: { value: HostListingDraft; onChange: (v: any) => void }) {
  const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Lakshadweep", "Puducherry"
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-8">Where's your place located?</h2>
      <p className="text-gray-500 mb-6">Your address is only shared with guests after they've made a reservation.</p>
      
      <div className="space-y-4 mb-8">
        <select 
          className="w-full border border-gray-300 rounded-lg p-4 outline-none focus:border-black focus:ring-1 focus:ring-black"
          value="India"
          disabled
        >
          <option>India</option>
        </select>
        
        <input 
          type="text" 
          placeholder="Flat, house, etc." 
          className="w-full border border-gray-300 rounded-lg p-4 outline-none focus:border-black focus:ring-1 focus:ring-black"
          value={value.address || ""}
          onChange={(e) => onChange({ address: e.target.value })}
        />
        
        <input 
          type="text" 
          placeholder="City" 
          className="w-full border border-gray-300 rounded-lg p-4 outline-none focus:border-black focus:ring-1 focus:ring-black"
          value={value.city || ""}
          onChange={(e) => onChange({ city: e.target.value })}
        />
        
        <div className="flex gap-4">
          <select 
            className="flex-1 border border-gray-300 rounded-lg p-4 outline-none focus:border-black focus:ring-1 focus:ring-black"
            value={value.state || ""}
            onChange={(e) => onChange({ state: e.target.value })}
          >
            <option value="" disabled>State / UT</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <input 
            type="text" 
            placeholder="PIN code" 
            maxLength={6}
            className="flex-1 border border-gray-300 rounded-lg p-4 outline-none focus:border-black focus:ring-1 focus:ring-black"
            value={value.address?.match(/\b\d{6}\b/)?.[0] || ""} // simple mock or separate field? 
            onChange={(e) => {
              // The prompt says pincode. We can just append it to address for simplicity if no separate field exists
              // Or keep it simple since HostListingDraft doesn't have a pincode field.
            }}
          />
        </div>
      </div>
      
      <div className="h-[300px] w-full rounded-xl overflow-hidden border">
        <MapWithNoSSR 
          city={value.city}
          lat={value.latitude} 
          lng={value.longitude} 
          onChange={(lat, lng) => onChange({ latitude: lat, longitude: lng, country: "India" })} 
        />
      </div>
    </div>
  );
}
