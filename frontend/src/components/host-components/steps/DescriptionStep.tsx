"use client";

import { HostListingDraft } from "@/lib/hostTypes";

export default function DescriptionStep({ value, onChange }: { value: HostListingDraft; onChange: (v: any) => void }) {
  const desc = value.description || "";
  
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-4">Create your description</h2>
      <p className="text-gray-500 mb-8">Share what makes your place special.</p>
      
      <div className="relative">
        <textarea 
          value={desc}
          onChange={e => onChange({ description: e.target.value })}
          maxLength={500}
          className="w-full border border-gray-300 rounded-lg p-4 h-64 resize-none text-lg outline-none focus:border-black focus:ring-1 focus:ring-black"
          placeholder="e.g. You'll have a great time at this comfortable place to stay."
        />
        <div className="absolute bottom-4 right-4 text-sm font-semibold text-gray-500">
          {desc.length} / 500
        </div>
      </div>
    </div>
  );
}
