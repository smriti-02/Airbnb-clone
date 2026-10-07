"use client";

import { HostListingDraft } from "@/lib/hostTypes";

export default function SafetyStep({ value, onChange }: { value: HostListingDraft; onChange: (v: any) => void }) {
  const safety = value.safety_details || {};
  
  const toggle = (key: string) => {
    onChange({ safety_details: { ...safety, [key]: !safety[key] } });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-8">Just a few last details...</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Does your place have any of these?</h3>
          <div className="space-y-4 border-b pb-6">
            <label className="flex items-start gap-4 cursor-pointer">
              <input type="checkbox" className="mt-1 w-5 h-5 accent-black" checked={safety.camera || false} onChange={() => toggle("camera")} />
              <div>
                <p className="font-semibold">Exterior security cameras on property</p>
              </div>
            </label>
            <label className="flex items-start gap-4 cursor-pointer">
              <input type="checkbox" className="mt-1 w-5 h-5 accent-black" checked={safety.noise_monitor || false} onChange={() => toggle("noise_monitor")} />
              <div>
                <p className="font-semibold">Noise decibel monitor</p>
              </div>
            </label>
            <label className="flex items-start gap-4 cursor-pointer">
              <input type="checkbox" className="mt-1 w-5 h-5 accent-black" checked={safety.weapons || false} onChange={() => toggle("weapons")} />
              <div>
                <p className="font-semibold">Weapon(s) on the property</p>
              </div>
            </label>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Important things to know</h3>
          <label className="flex items-start gap-4 cursor-pointer bg-gray-50 p-4 rounded-xl border">
            <input type="checkbox" className="mt-1 w-5 h-5 accent-black" checked={safety.complies || false} onChange={() => toggle("complies")} />
            <div>
              <p className="font-semibold">I confirm that my listing complies with local laws and the terms</p>
              <p className="text-sm text-gray-500">You must check this box to proceed.</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
