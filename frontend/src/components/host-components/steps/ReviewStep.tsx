"use client";

import { HostListingDraft } from "@/lib/hostTypes";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatINR } from "@/lib/format";

export default function ReviewStep({ value }: { value: HostListingDraft }) {
  const { id } = useParams();
  const coverUrl = value.photos?.[0]?.url;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-8">Review your listing</h2>
      
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Listing Card Preview */}
        <div className="w-full md:w-[320px] shrink-0">
          <div className="rounded-xl overflow-hidden shadow-[0_6px_16px_rgba(0,0,0,0.12)] bg-white">
            <div className="aspect-[20/19] bg-gray-200 relative">
              {coverUrl ? (
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">No photo</div>
              )}
              {value.new_listing_promo && (
                <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded shadow text-sm font-bold border">
                  Guest favorite
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold truncate pr-4">{value.city || "City"}, {value.country || "Country"}</h3>
                <span className="flex items-center gap-1 text-sm"><span className="text-xs">★</span> New</span>
              </div>
              <p className="text-gray-500 text-sm truncate">{value.title || "Title"}</p>
              <p className="mt-2">
                <span className="font-semibold">{formatINR(value.price_per_night || 0)}</span> <span className="text-sm">night</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Summary List */}
        <div className="flex-1 space-y-4">
          <h3 className="text-xl font-bold mb-4">What's next?</h3>
          
          <div className="flex justify-between py-4 border-b">
            <div>
              <p className="font-semibold">Settings</p>
              <p className="text-gray-500">{value.property_type}</p>
            </div>
            <Link href={`/become-a-host/${id}/property-type`} className="underline font-semibold text-sm">Edit</Link>
          </div>
          
          <div className="flex justify-between py-4 border-b">
            <div>
              <p className="font-semibold">Pricing</p>
              <p className="text-gray-500">{formatINR(value.price_per_night || 0)} / night</p>
            </div>
            <Link href={`/become-a-host/${id}/price`} className="underline font-semibold text-sm">Edit</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
