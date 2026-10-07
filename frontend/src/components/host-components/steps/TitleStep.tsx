"use client";

import { HostListingDraft } from "@/lib/hostTypes";

export default function TitleStep({ value, onChange }: { value: HostListingDraft; onChange: (v: any) => void }) {
  const title = value.title || "";
  
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-4">Now, let's give your house a title</h2>
      <p className="text-gray-500 mb-8">Short titles work best. Have fun with it—you can always change it later.</p>
      
      <div className="relative">
        <textarea 
          value={title}
          onChange={e => onChange({ title: e.target.value })}
          maxLength={50}
          className="w-full border border-gray-300 rounded-lg p-4 h-40 resize-none text-xl outline-none focus:border-black focus:ring-1 focus:ring-black"
          placeholder="e.g. Cozy house in the mountains"
        />
        <div className="absolute bottom-4 right-4 text-sm font-semibold text-gray-500">
          {title.length} / 50
        </div>
      </div>
    </div>
  );
}
