"use client";

import { HostListingDraft } from "@/lib/hostTypes";

export default function DiscountsStep({ value, onChange }: { value: HostListingDraft; onChange: (v: any) => void }) {
  const toggle = (field: keyof HostListingDraft, defaultVal: number) => {
    const current = value[field] as number;
    onChange({ [field]: current > 0 ? 0 : defaultVal });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-4">Add discounts</h2>
      <p className="text-gray-500 mb-8">Help your place stand out to get booked faster and earn your first reviews.</p>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-6 border rounded-xl bg-gray-50">
          <div className="flex-1 pr-4">
            <h3 className="font-semibold text-lg">20% New listing promotion</h3>
            <p className="text-gray-500">Offer 20% off your first 3 bookings to help you stand out.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={value.new_listing_promo} onChange={() => onChange({ new_listing_promo: !value.new_listing_promo })} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
          </label>
        </div>

        <div className="flex justify-between items-center p-6 border rounded-xl">
          <div className="flex-1 pr-4">
            <h3 className="font-semibold text-lg">Weekly discount</h3>
            <p className="text-gray-500">For stays of 7 nights or more.</p>
          </div>
          <div className="flex items-center gap-4">
            {value.weekly_discount_pct > 0 && (
              <div className="flex items-center border rounded-lg px-2 py-1">
                <input 
                  type="number"
                  min="1" max="99"
                  className="w-10 text-right outline-none"
                  value={value.weekly_discount_pct}
                  onChange={e => onChange({ weekly_discount_pct: parseInt(e.target.value) || 0 })}
                />
                <span className="ml-1">%</span>
              </div>
            )}
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={value.weekly_discount_pct > 0} onChange={() => toggle("weekly_discount_pct", 10)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border rounded-xl">
          <div className="flex-1 pr-4">
            <h3 className="font-semibold text-lg">Monthly discount</h3>
            <p className="text-gray-500">For stays of 28 nights or more.</p>
          </div>
          <div className="flex items-center gap-4">
            {value.monthly_discount_pct > 0 && (
              <div className="flex items-center border rounded-lg px-2 py-1">
                <input 
                  type="number"
                  min="1" max="99"
                  className="w-10 text-right outline-none"
                  value={value.monthly_discount_pct}
                  onChange={e => onChange({ monthly_discount_pct: parseInt(e.target.value) || 0 })}
                />
                <span className="ml-1">%</span>
              </div>
            )}
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={value.monthly_discount_pct > 0} onChange={() => toggle("monthly_discount_pct", 20)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-4 text-center">Only one discount applies per booking.</p>
    </div>
  );
}
