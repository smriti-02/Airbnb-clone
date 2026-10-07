"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { hostApi } from "@/lib/hostApi";
import Image from "next/image";
import toast from "react-hot-toast";

export default function BecomeAHostIntro() {
  const { user } = useUser();
  const router = useRouter();
  
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/become-a-host/signup");
      return;
    }
    
    if (user.is_host) {
      hostApi.getMyListings()
        .then(res => setDrafts(res.filter(l => l.status === "draft")))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, router]);

  const handleStart = async () => {
    try {
      const draft = await hostApi.createDraft();
      router.push(`/become-a-host/${draft.id}/property-type`);
    } catch (err: any) {
      toast.error(err.message || "Failed to start");
    }
  };

  const handleContinue = (id: number, step: string = "property-type") => {
    router.push(`/become-a-host/${id}/${step}`);
  };

  if (!user || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
          It's easy to get started on Airbnb
        </h1>
      </div>
      
      <div className="flex-1 w-full max-w-lg">
        {drafts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4">Continue your draft</h2>
            <div className="grid gap-4">
              {drafts.map(draft => (
                <div 
                  key={draft.id} 
                  onClick={() => handleContinue(draft.id)}
                  className="flex items-center gap-4 p-4 border rounded-xl hover:shadow-md cursor-pointer transition"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {draft.cover_photo ? (
                      <img src={draft.cover_photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🏠</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{draft.title || "Untitled listing"}</p>
                    <p className="text-sm text-gray-500">Draft</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-8">
          <div className="flex gap-4">
            <span className="text-2xl font-semibold">1</span>
            <div>
              <h3 className="text-xl font-bold mb-1">Tell us about your place</h3>
              <p className="text-gray-500">Share some basic info, like where it is and how many guests can stay.</p>
            </div>
            <div className="text-4xl shrink-0">🛏️</div>
          </div>
          
          <div className="border-t pt-8 flex gap-4">
            <span className="text-2xl font-semibold">2</span>
            <div>
              <h3 className="text-xl font-bold mb-1">Make it stand out</h3>
              <p className="text-gray-500">Add 5 or more photos plus a title and description—we'll help you out.</p>
            </div>
            <div className="text-4xl shrink-0">📸</div>
          </div>
          
          <div className="border-t pt-8 flex gap-4">
            <span className="text-2xl font-semibold">3</span>
            <div>
              <h3 className="text-xl font-bold mb-1">Finish up and publish</h3>
              <p className="text-gray-500">Choose if you'd like to start with an experienced guest, set a starting price, and publish your listing.</p>
            </div>
            <div className="text-4xl shrink-0">🎉</div>
          </div>
        </div>
        
        <div className="mt-12 border-t pt-6 text-right">
          <button 
            onClick={handleStart}
            className="bg-[#E51D53] text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-[#D70466] transition"
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  );
}
