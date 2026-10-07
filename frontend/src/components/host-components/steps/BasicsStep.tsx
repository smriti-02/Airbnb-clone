"use client";

import { HostListingDraft } from "@/lib/hostTypes";

export default function BasicsStep({ value, onChange }: { value: HostListingDraft; onChange: (v: any) => void }) {
  const inc = (field: keyof HostListingDraft, max: number) => {
    const current = (value[field] as number) || 0;
    if (current < max) onChange({ [field]: current + 1 });
  };
  
  const dec = (field: keyof HostListingDraft, min: number) => {
    const current = (value[field] as number) || 0;
    if (current > min) onChange({ [field]: current - 1 });
  };

  const steppers = [
    { id: "max_guests" as keyof HostListingDraft, label: "Guests", min: 1, max: 16 },
    { id: "bedrooms" as keyof HostListingDraft, label: "Bedrooms", min: 0, max: 20 },
    { id: "beds" as keyof HostListingDraft, label: "Beds", min: 1, max: 20 },
    { id: "bathrooms" as keyof HostListingDraft, label: "Bathrooms", min: 1, max: 20 },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-8">Share some basics about your place</h2>
      <p className="text-gray-500 mb-6">You'll add more details later, like bed types.</p>
      
      <div className="space-y-6">
        {steppers.map(s => (
          <div key={s.id} className="flex justify-between items-center py-4 border-b">
            <span className="text-lg">{s.label}</span>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => dec(s.id, s.min)}
                disabled={(value[s.id] as number || s.min) <= s.min}
                className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-black disabled:opacity-30"
              >-</button>
              <span className="w-4 text-center">{ (value[s.id as keyof HostListingDraft] as number) || s.min }</span>
              <button 
                onClick={() => inc(s.id, s.max)}
                disabled={(value[s.id] as number || s.min) >= s.max}
                className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-black disabled:opacity-30"
              >+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
