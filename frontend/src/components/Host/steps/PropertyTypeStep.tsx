"use client";

import { HostListingDraft } from "@/lib/hostTypes";

const TYPES = [
  { id: "House", icon: "🏠" },
  { id: "Apartment", icon: "🏢" },
  { id: "Villa", icon: "🏡" },
  { id: "Cabin", icon: "🪵" },
  { id: "Farm", icon: "🚜" },
  { id: "Treehouse", icon: "🌳" },
  { id: "Tiny home", icon: "🛖" },
  { id: "Castle", icon: "🏰" },
  { id: "Houseboat", icon: "🛶" },
  { id: "Guest house", icon: "🛋️" },
  { id: "Hotel", icon: "🏨" },
  { id: "Room", icon: "🚪" },
  { id: "Homestay", icon: "🛏️" }
];

export default function PropertyTypeStep({ value, onChange }: { value: HostListingDraft; onChange: (v: any) => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-8">Which of these best describes your place?</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => onChange({ property_type: type.id })}
            className={`flex flex-col items-start p-4 border rounded-xl transition hover:border-black ${value.property_type === type.id ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200"}`}
          >
            <span className="text-3xl mb-2">{type.icon}</span>
            <span className="font-semibold">{type.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
