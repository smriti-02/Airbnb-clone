"use client";

import { HostListingDraft } from "@/lib/hostTypes";

const TAGS = ["Peaceful", "Unique", "Family-friendly", "Stylish", "Central", "Spacious"];

export default function HighlightsStep({ value, onChange }: { value: HostListingDraft; onChange: (v: any) => void }) {
  const highlights = value.highlights || [];
  
  const toggle = (tag: string) => {
    if (highlights.includes(tag)) {
      onChange({ highlights: highlights.filter(t => t !== tag) });
    } else if (highlights.length < 2) {
      onChange({ highlights: [...highlights, tag] });
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-4">Next, let's describe your place</h2>
      <p className="text-gray-500 mb-8">Choose up to 2 highlights. We'll use these to get your description started.</p>
      
      <div className="flex flex-wrap gap-4">
        {TAGS.map(tag => {
          const isSelected = highlights.includes(tag);
          const isDisabled = !isSelected && highlights.length >= 2;
          return (
            <button
              key={tag}
              onClick={() => toggle(tag)}
              disabled={isDisabled}
              className={`px-6 py-3 rounded-full border-2 font-semibold transition ${isSelected ? "border-black bg-gray-50" : "border-gray-200 hover:border-black"} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
