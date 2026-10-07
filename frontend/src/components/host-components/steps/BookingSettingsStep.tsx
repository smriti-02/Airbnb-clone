"use client";

import { HostListingDraft } from "@/lib/hostTypes";

export default function BookingSettingsStep({ value, onChange }: { value: HostListingDraft; onChange: (v: any) => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-8">Decide how you'll confirm reservations</h2>
      
      <div className="space-y-4 mb-12">
        <button
          onClick={() => onChange({ instant_book: true })}
          className={`w-full flex items-center justify-between p-6 border rounded-xl transition hover:border-black ${value.instant_book ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200"}`}
        >
          <div className="text-left">
            <h3 className="text-lg font-semibold">Use Instant Book</h3>
            <p className="text-gray-500 mt-1">Guests can book automatically.</p>
          </div>
          <div className="text-4xl">⚡</div>
        </button>
        
        <button
          disabled
          className="w-full flex items-center justify-between p-6 border border-gray-200 rounded-xl opacity-50 cursor-not-allowed"
        >
          <div className="text-left">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Approve your first 5 bookings
              <span className="bg-gray-200 text-xs px-2 py-1 rounded">Coming soon</span>
            </h3>
            <p className="text-gray-500 mt-1">You'll review and approve each request.</p>
          </div>
          <div className="text-4xl">💬</div>
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">Minimum stay</h2>
      <div className="flex justify-between items-center py-4 border-b">
        <span className="text-lg">Minimum nights</span>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onChange({ min_nights: Math.max(1, (value.min_nights || 1) - 1) })}
            disabled={(value.min_nights || 1) <= 1}
            className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-black disabled:opacity-30"
          >-</button>
          <span className="w-4 text-center">{value.min_nights || 1}</span>
          <button 
            onClick={() => onChange({ min_nights: Math.min(30, (value.min_nights || 1) + 1) })}
            disabled={(value.min_nights || 1) >= 30}
            className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-black disabled:opacity-30"
          >+</button>
        </div>
      </div>
    </div>
  );
}
