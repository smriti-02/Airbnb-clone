"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { hostApi } from "@/lib/hostApi";
import { HostListingDraft } from "@/lib/hostTypes";
import toast from "react-hot-toast";
import Link from "next/link";
import PropertyTypeStep from "@/components/host-components/steps/PropertyTypeStep";
import PlaceTypeStep from "@/components/host-components/steps/PlaceTypeStep";
import LocationStep from "@/components/host-components/steps/LocationStep";
import BasicsStep from "@/components/host-components/steps/BasicsStep";
import AmenitiesStep from "@/components/host-components/steps/AmenitiesStep";
import PhotosStep from "@/components/host-components/steps/PhotosStep";
import TitleStep from "@/components/host-components/steps/TitleStep";
import HighlightsStep from "@/components/host-components/steps/HighlightsStep";
import DescriptionStep from "@/components/host-components/steps/DescriptionStep";
import BookingSettingsStep from "@/components/host-components/steps/BookingSettingsStep";
import PriceStep from "@/components/host-components/steps/PriceStep";
import DiscountsStep from "@/components/host-components/steps/DiscountsStep";
import SafetyStep from "@/components/host-components/steps/SafetyStep";
import ReviewStep from "@/components/host-components/steps/ReviewStep";
import VerifyStep from "@/components/host-components/steps/VerifyStep";

const WIZARD_STEPS = [
  { id: "stage-1", stage: 1, intro: true },
  { id: "structure", stage: 1 },
  { id: "place-type", stage: 1 },
  { id: "location", stage: 1 },
  { id: "basics", stage: 1 },
  
  { id: "stage-2", stage: 2, intro: true },
  { id: "amenities", stage: 2 },
  { id: "photos", stage: 2 },
  { id: "title", stage: 2 },
  { id: "highlights", stage: 2 },
  { id: "description", stage: 2 },
  
  { id: "stage-3", stage: 3, intro: true },
  { id: "booking-settings", stage: 3 },
  { id: "price", stage: 3 },
  { id: "discounts", stage: 3 },
  { id: "safety", stage: 3 },
  { id: "review", stage: 3 },
  { id: "verify", stage: 3 },
  { id: "publish", stage: 3 }
];

export default function WizardShell() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  
  const listingId = parseInt(params.id as string);
  const stepSlug = params.step as string;
  
  const [draft, setDraft] = useState<HostListingDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  
  const stepIndex = WIZARD_STEPS.findIndex(s => s.id === stepSlug);
  const currentStepDef = WIZARD_STEPS[stepIndex];

  useEffect(() => {
    if (!user) {
      router.replace("/become-a-host/signup");
      return;
    }
    
    hostApi.getDraft(listingId)
      .then(res => {
        setDraft(res);
        // Resume logic: if opening a draft without a step param or if URL is way ahead
        if (!stepSlug && res.wizard_step) {
          router.replace(`/become-a-host/${listingId}/${res.wizard_step}`);
        } else if (res.wizard_step) {
          const savedIdx = WIZARD_STEPS.findIndex(s => s.id === res.wizard_step);
          if (stepIndex > savedIdx + 1) { // Redirect if trying to skip ahead too much
            router.replace(`/become-a-host/${listingId}/${res.wizard_step}`);
          }
        }
      })
      .catch(err => {
        if (err.message?.includes("404")) router.replace("/become-a-host");
        else toast.error("Failed to load draft");
      })
      .finally(() => setLoading(false));
  }, [user, listingId, stepSlug, router]);

  if (loading || !draft || !currentStepDef) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  // Determine if valid to proceed
  const isValid = (() => {
    if (currentStepDef.intro) return true;
    switch(stepSlug) {
      case "structure": return !!draft.property_type;
      case "place-type": return !!draft.place_type;
      case "location": return !!draft.city && !!draft.address;
      case "basics": return true; // always has defaults
      case "amenities": return true; // optional
      case "photos": return draft.photos?.length >= 5;
      case "title": return draft.title && draft.title.length >= 8;
      case "highlights": return draft.highlights?.length > 0 && draft.highlights.length <= 2;
      case "description": return draft.description && draft.description.length >= 50;
      case "booking-settings": return true;
      case "price": return (draft.price_per_night || 0) >= 500 && (draft.price_per_night || 0) <= 100000;
      case "discounts": return true;
      case "safety": return draft.safety_details?.complies === true;
      case "review": return true;
      case "verify": return draft.status === "verified"; // we'll use a hack or context for verified status if needed
      case "publish": return true;
      default: return true;
    }
  })();

  const handleNext = async () => {
    if (!isValid) return;
    if (stepSlug === "publish") {
      try {
        setSaving(true);
        await hostApi.publishListing(listingId);
        // Show celebration
        document.getElementById("publish-modal")?.classList.remove("hidden");
      } catch (err: any) {
        if (err.message && err.message.missing) {
          toast.error("Missing required fields");
          setLocalErrors(err.message.missing);
        } else {
          toast.error(err.message || "Failed to publish");
        }
      } finally {
        setSaving(false);
      }
      return;
    }
    
    const nextStep = WIZARD_STEPS[stepIndex + 1];
    if (nextStep) {
      try {
        setSaving(true);
        await hostApi.updateDraft(listingId, { wizard_step: nextStep.id });
        router.push(`/become-a-host/${listingId}/${nextStep.id}`);
      } catch (err: any) {
        toast.error("Failed to save progress");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveAndExit = async () => {
    try {
      setSaving(true);
      await hostApi.updateDraft(listingId, { wizard_step: stepSlug });
      toast.success("Draft saved");
      router.push("/host/listings");
    } catch (err: any) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateDraft = (data: Partial<HostListingDraft>) => {
    setDraft({ ...draft, ...data });
    // In background, autosave certain fields if needed? No, wait for Next.
  };

  const renderContent = () => {
    if (currentStepDef.intro) {
      const titles = {
        1: ["Step 1", "Tell us about your place", "Share some basic info, like where it is and how many guests can stay.", "🛏️"],
        2: ["Step 2", "Make it stand out", "Add 5 or more photos plus a title and description—we'll help you out.", "📸"],
        3: ["Step 3", "Finish up and publish", "Choose if you'd like to start with an experienced guest, set a starting price, and publish your listing.", "🎉"]
      };
      const [stepNum, title, desc, icon] = (titles as any)[currentStepDef.stage];
      return (
        <div className="flex h-full items-center">
          <div className="flex-1 pr-12">
            <p className="font-semibold text-lg mb-4">{stepNum}</p>
            <h2 className="text-5xl font-bold mb-6">{title}</h2>
            <p className="text-xl text-gray-600">{desc}</p>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="text-9xl">{icon}</div>
          </div>
        </div>
      );
    }

    const props = { value: draft, onChange: updateDraft, errors: localErrors };
    
    switch(stepSlug) {
      case "structure": return <PropertyTypeStep {...props} />;
      case "place-type": return <PlaceTypeStep {...props} />;
      case "location": return <LocationStep {...props} />;
      case "basics": return <BasicsStep {...props} />;
      case "amenities": return <AmenitiesStep {...props} />;
      case "photos": return <PhotosStep {...props} />;
      case "title": return <TitleStep {...props} />;
      case "highlights": return <HighlightsStep {...props} />;
      case "description": return <DescriptionStep {...props} />;
      case "booking-settings": return <BookingSettingsStep {...props} />;
      case "price": return <PriceStep {...props} />;
      case "discounts": return <DiscountsStep {...props} />;
      case "safety": return <SafetyStep {...props} />;
      case "review": return <ReviewStep {...props} />;
      case "verify": return <VerifyStep {...props} setValid={(v: boolean) => updateDraft({ status: v ? "verified" : "draft" })} />;
      case "publish": return (
        <div className="text-center py-20">
          <h2 className="text-3xl font-bold mb-4">Ready to publish!</h2>
          <p className="text-gray-500 mb-8">Review your details and hit publish.</p>
          {localErrors.length > 0 && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-left inline-block">
              <p className="font-bold mb-2">Missing required fields:</p>
              <ul className="list-disc pl-5">
                {localErrors.map(e => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>
      );
      default: return <div>Unknown step</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top Bar */}
      <header className="h-20 px-8 flex items-center justify-between shrink-0">
        <Link href="/" className="text-red-500 hover:text-red-600">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.011.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.709-3.386l-.257-.26-.172-.179h-.139l-.117.116c-2.393 2.376-5.23 3.71-7.853 3.71C3.119 31 0 27.632 0 23.327c0-1.85.344-3.411 1.096-5.235l.182-.424c.732-1.637 4.195-8.487 5.76-11.53.51-1.026 1.01-1.996 1.488-2.89C9.896 1.156 11.233 1 12.83 1h3.17zm0 2h-3.17c-1.127 0-1.928.601-2.923 2.502l-.248.48c-2.366 4.764-5.32 10.742-6.134 12.639l-.159.385C2.668 20.672 2.4 21.905 2.4 23.327c0 3.09 2.21 5.273 4.697 5.273 2.158 0 4.544-1.221 6.837-3.568l.38-.396.199-.214.137-.146h1.705l.128.136.216.223.364.368c2.146 2.062 4.168 3 6.09 3 2.656 0 4.157-1.579 4.157-4.278 0-.962-.23-1.688-.8-3.045l-.132-.303c-.933-2.181-4.757-10.155-6.815-14.194l-.391-.749c-1.024-1.83-1.642-2.434-2.56-2.434H16zm0 10.518c2.476 0 4.478 2.08 4.478 4.646 0 2.56-1.99 4.636-4.464 4.646h-.028c-2.476 0-4.478-2.08-4.478-4.646 0-2.566 2.002-4.646 4.492-4.646z"></path>
          </svg>
        </Link>
        <div className="flex gap-4">
          <button className="font-semibold text-sm hover:bg-gray-100 rounded-full px-4 py-2 transition">
            Questions?
          </button>
          <button 
            onClick={handleSaveAndExit}
            className="font-semibold text-sm hover:bg-gray-100 rounded-full px-4 py-2 transition"
          >
            Save & exit
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[640px] mx-auto py-12 px-6 pb-32 h-full fade-slide-in">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-24 bg-white border-t z-50 flex flex-col justify-end pb-4">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 flex gap-2 px-10">
          <div className="flex-1 bg-gray-200">
            <div className="h-full bg-black transition-all" style={{ width: currentStepDef.stage > 1 ? "100%" : currentStepDef.stage === 1 ? `${(stepIndex / 4) * 100}%` : "0%" }}></div>
          </div>
          <div className="flex-1 bg-gray-200">
            <div className="h-full bg-black transition-all" style={{ width: currentStepDef.stage > 2 ? "100%" : currentStepDef.stage === 2 ? `${((stepIndex - 5) / 5) * 100}%` : "0%" }}></div>
          </div>
          <div className="flex-1 bg-gray-200">
            <div className="h-full bg-black transition-all" style={{ width: currentStepDef.stage > 3 ? "100%" : currentStepDef.stage === 3 ? `${((stepIndex - 11) / 7) * 100}%` : "0%" }}></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center px-10 pt-2">
          {stepIndex > 0 ? (
            <Link 
              href={`/become-a-host/${listingId}/${WIZARD_STEPS[stepIndex - 1].id}`}
              className="font-semibold underline hover:bg-gray-100 p-2 rounded-lg transition"
            >
              Back
            </Link>
          ) : <div></div>}
          
          <button 
            onClick={handleNext}
            disabled={!isValid || saving}
            className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {stepSlug === "publish" ? "Publish" : "Next"}
          </button>
        </div>
      </footer>

      {/* Publish Modal Celebration */}
      <div id="publish-modal" className="hidden fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold mb-4">Congratulations!</h1>
        <p className="text-xl text-gray-500 mb-8">Your listing is live.</p>
        <div className="flex gap-4">
          <Link href={`/listings/${listingId}`} className="border border-black px-6 py-3 rounded-lg font-bold hover:bg-gray-50">View listing</Link>
          <Link href="/host" className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800">Go to dashboard</Link>
        </div>
      </div>
      
      <style>{`
        .fade-slide-in {
          animation: fadeSlide 200ms ease-out forwards;
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fade-slide-in { animation: none; }
        }
      `}</style>
    </div>
  );
}
