"use client";

import { HostListingDraft } from "@/lib/hostTypes";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AmenitiesStep({ value, onChange }: { value: HostListingDraft; onChange: (v: any) => void }) {
  const [amenitiesList, setAmenitiesList] = useState<{id: number, name: string, icon: string}[]>([]);

  useEffect(() => {
    apiFetch<any[]>("/amenities").then(setAmenitiesList).catch(console.error);
  }, []);

  const toggle = (am: any) => {
    const current = value.amenities || [];
    const exists = current.find(a => a.id === am.id);
    if (exists) {
      onChange({ amenities: current.filter(a => a.id !== am.id) });
    } else {
      onChange({ amenities: [...current, am] });
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-8">Tell guests what your place has to offer</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {amenitiesList.map(am => {
          const isSelected = (value.amenities || []).some(a => a.id === am.id);
          return (
            <button
              key={am.id}
              onClick={() => toggle(am)}
              className={`flex flex-col items-start p-4 border rounded-xl transition hover:border-black ${isSelected ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200"}`}
            >
              <span className="text-3xl mb-2">{am.icon || "✨"}</span>
              <span className="font-semibold text-left">{am.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
