"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { hostApi } from "@/lib/hostApi";
import { HostListingDraft } from "@/lib/hostTypes";
import toast from "react-hot-toast";

import PhotosStep from "@/components/host/steps/PhotosStep";
import TitleStep from "@/components/host/steps/TitleStep";
import PropertyTypeStep from "@/components/host/steps/PropertyTypeStep";
import PlaceTypeStep from "@/components/host/steps/PlaceTypeStep";
import LocationStep from "@/components/host/steps/LocationStep";
import BasicsStep from "@/components/host/steps/BasicsStep";
import AmenitiesStep from "@/components/host/steps/AmenitiesStep";
import HighlightsStep from "@/components/host/steps/HighlightsStep";
import DescriptionStep from "@/components/host/steps/DescriptionStep";
import BookingSettingsStep from "@/components/host/steps/BookingSettingsStep";
import PriceStep from "@/components/host/steps/PriceStep";
import DiscountsStep from "@/components/host/steps/DiscountsStep";
import SafetyStep from "@/components/host/steps/SafetyStep";

const SECTIONS = [
  { id: "photos", title: "Photo tour", comp: PhotosStep },
  { id: "title", title: "Title", comp: TitleStep },
  { id: "property-type", title: "Property type", comp: PropertyTypeStep },
  { id: "place-type", title: "Place type", comp: PlaceTypeStep },
  { id: "location", title: "Location", comp: LocationStep },
  { id: "basics", title: "Basics", comp: BasicsStep },
  { id: "amenities", title: "Amenities", comp: AmenitiesStep },
  { id: "highlights", title: "Highlights", comp: HighlightsStep },
  { id: "description", title: "Description", comp: DescriptionStep },
  { id: "booking-settings", title: "Booking settings", comp: BookingSettingsStep },
  { id: "price", title: "Pricing", comp: PriceStep },
  { id: "discounts", title: "Discounts", comp: DiscountsStep },
  { id: "safety", title: "Safety", comp: SafetyStep },
];

export default function EditorPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [listing, setListing] = useState<HostListingDraft | null>(null);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileDetail, setMobileDetail] = useState(false);

  useEffect(() => {
    hostApi.getDraft(parseInt(id as string))
      .then(setListing)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = (updates: any) => {
    setListing(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleSave = async () => {
    if (!listing) return;
    setSaving(true);
    setError(null);
    try {
      await hostApi.updateDraft(listing.id, listing);
      toast.success("Saved successfully");
      if (mobileDetail) setMobileDetail(false);
    } catch (err: any) {
      setError(err.message || "Failed to save");
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !listing) {
    return <div className="p-12 text-center">Loading editor...</div>;
  }

  const ActiveComponent = SECTIONS.find(s => s.id === activeSection)?.comp || PhotosStep;
  const activeTitle = SECTIONS.find(s => s.id === activeSection)?.title;

  return (
    <div className="max-w-screen-xl mx-auto md:px-6">
      
      {/* Mobile list view */}
      <div className={`md:hidden ${mobileDetail ? 'hidden' : 'block'}`}>
        <div className="p-6 border-b sticky top-0 bg-white z-10 flex items-center gap-4">
          <button onClick={() => router.push("/host/listings")} className="p-2 -ml-2">←</button>
          <h1 className="text-xl font-bold">Editor</h1>
        </div>
        <div className="flex flex-col">
          {SECTIONS.map(s => (
            <button 
              key={s.id} 
              onClick={() => { setActiveSection(s.id); setMobileDetail(true); }}
              className="px-6 py-4 border-b text-left font-semibold flex justify-between items-center"
            >
              {s.title}
              <span className="text-gray-400">&gt;</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Mobile detail view or Desktop standard view */}
      <div className={`md:flex ${!mobileDetail ? 'hidden md:flex' : 'block'}`}>
        
        {/* Left Nav (Desktop) */}
        <div className="hidden md:block w-64 shrink-0 py-8 pr-8 border-r min-h-[calc(100vh-80px)]">
          <button onClick={() => router.push("/host/listings")} className="text-sm font-semibold underline text-gray-500 mb-8 block">← Back to listings</button>
          <div className="sticky top-28 space-y-1">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition ${activeSection === s.id ? "bg-gray-100" : "text-gray-500 hover:bg-gray-50"}`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
        
        {/* Right Content */}
        <div className="flex-1 min-h-[calc(100vh-80px)] relative">
          
          <div className="md:hidden sticky top-0 bg-white z-10 border-b p-4 flex items-center justify-between">
            <button onClick={() => setMobileDetail(false)} className="p-2">← Back</button>
            <span className="font-bold">{activeTitle}</span>
            <div className="w-10"></div>
          </div>
          
          <div className="p-6 md:p-12 pb-32">
            <ActiveComponent value={listing} onChange={handleUpdate} />
            {error && <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg font-semibold text-sm">{error}</div>}
          </div>
          
          <div className="fixed md:absolute bottom-0 left-0 md:left-auto right-0 bg-white border-t p-4 md:p-6 flex justify-end z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        
      </div>
      
    </div>
  );
}
