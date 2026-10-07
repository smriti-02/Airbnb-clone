"use client";

import { HostListingDraft } from "@/lib/hostTypes";
import { hostApi } from "@/lib/hostApi";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function VerifyStep({ value, setValid }: { value: HostListingDraft; setValid: (v: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState("Aadhaar");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>(value.status === "verified" ? "verified" : "idle"); // idle, pending, verified

  useEffect(() => {
    let interval: any;
    if (status === "pending") {
      interval = setInterval(async () => {
        try {
          const res = await hostApi.checkVerification();
          if (res.status === "verified") {
            setStatus("verified");
            setValid(true);
            clearInterval(interval);
          }
        } catch (e) {}
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [status, setValid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id_type", docType);
      formData.append("file", file);
      
      await hostApi.submitVerification(formData);
      setStatus("pending");
      toast.success("Document uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (status === "verified") {
    return (
      <div className="animate-in fade-in flex flex-col items-center justify-center text-center py-20">
        <div className="text-6xl text-green-500 mb-4">✅</div>
        <h2 className="text-3xl font-bold mb-2">You're verified!</h2>
        <p className="text-gray-500">Your identity has been confirmed. You can now publish your listing.</p>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="animate-in fade-in flex flex-col items-center justify-center text-center py-20">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-6"></div>
        <h2 className="text-3xl font-bold mb-2">Verification in progress</h2>
        <p className="text-gray-500">This usually takes a few seconds. Hang tight!</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-4">Verify your identity</h2>
      <p className="text-gray-500 mb-8">Before you can publish, we need to verify who you are.</p>
      
      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-8 text-sm font-semibold flex items-start gap-2">
        <span>ℹ️</span>
        <p>Demo only: your document is not stored and will be automatically approved after a few seconds.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-2">ID Type</label>
          <select 
            value={docType}
            onChange={e => setDocType(e.target.value)}
            className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black"
          >
            <option>Aadhaar</option>
            <option>Passport</option>
            <option>Driving licence</option>
          </select>
        </div>
        
        <div>
          <label className="block font-semibold mb-2">Upload document</label>
          <input 
            type="file" 
            accept="image/*,.pdf"
            required
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full border p-3 rounded-lg outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-black hover:file:bg-gray-100"
          />
        </div>
        
        <button
          disabled={loading || !file}
          type="submit"
          className="w-full bg-black text-white py-3 rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Submit for verification"}
        </button>
      </form>
    </div>
  );
}
