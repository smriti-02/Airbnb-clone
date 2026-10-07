"use client";

import { HostListingDraft } from "@/lib/hostTypes";

const TYPES = [
  { id: "Entire place", title: "An entire place", desc: "Guests have the whole place to themselves.", icon: "🏠" },
  { id: "Private room", title: "A private room", desc: "Guests sleep in a private room but some areas may be shared.", icon: "🚪" },
  { id: "Shared room", title: "A shared room", desc: "Guests sleep in a room or common area that may be shared with you or others.", icon: "🛋️" }
];

export default function PlaceTypeStep({ value, onChange }: { value: HostListingDraft; onChange: (v: any) => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-8">What type of place will guests have?</h2>
      <div className="flex flex-col gap-4">
        {TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => onChange({ place_type: type.id })}
            className={`flex items-center justify-between p-6 border rounded-xl transition hover:border-black ${value.place_type === type.id ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200"}`}
          >
            <div className="text-left">
              <h3 className="text-lg font-semibold">{type.title}</h3>
              <p className="text-gray-500 mt-1">{type.desc}</p>
            </div>
            <div className="text-4xl ml-4">{type.icon}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
