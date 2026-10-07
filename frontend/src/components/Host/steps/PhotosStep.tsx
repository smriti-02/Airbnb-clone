"use client";

import { HostListingDraft } from "@/lib/hostTypes";
import { hostApi } from "@/lib/hostApi";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

export default function PhotosStep({ value, onChange }: { value: HostListingDraft; onChange: (v: any) => void }) {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  
  const photos = value.photos || [];

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB.");
      return;
    }
    
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await hostApi.addPhotos(value.id, fd);
      const res = await hostApi.getDraft(value.id);
      onChange({ photos: res.photos });
      toast.success("Photo uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("url", url);
      await hostApi.addPhotos(value.id, fd);
      const res = await hostApi.getDraft(value.id);
      onChange({ photos: res.photos });
      setUrl("");
      toast.success("Photo added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add URL");
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId: number) => {
    try {
      await hostApi.deletePhoto(value.id, photoId);
      onChange({ photos: photos.filter(p => p.id !== photoId) });
    } catch (err) {
      toast.error("Failed to delete photo");
    }
  };

  const movePhoto = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= photos.length) return;
    
    const newPhotos = [...photos];
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[newIndex];
    newPhotos[newIndex] = temp;
    
    // optimistic update
    onChange({ photos: newPhotos });
    
    try {
      await hostApi.reorderPhotos(value.id, newPhotos.map(p => p.id));
    } catch (err) {
      toast.error("Failed to reorder");
      // revert could happen here by refetching
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-2">Add some photos of your house</h2>
      <p className="text-gray-500 mb-8">You'll need 5 photos to get started. You can add more or make changes later.</p>
      
      {/* Upload Zone */}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center flex flex-col items-center justify-center hover:bg-gray-50 transition cursor-pointer mb-8"
        onClick={() => fileRef.current?.click()}
      >
        <span className="text-5xl mb-4">📸</span>
        <h3 className="text-xl font-bold mb-2">Drag your photos here</h3>
        <p className="text-gray-500 text-sm mb-6">Choose at least 5 photos</p>
        <button className="underline font-semibold">Upload from your device</button>
        <input 
          type="file" 
          ref={fileRef}
          hidden 
          accept="image/jpeg,image/png,image/webp" 
          onChange={e => {
            if (e.target.files?.[0]) handleUpload(e.target.files[0]);
          }} 
        />
      </div>
      
      <form onSubmit={handleAddUrl} className="flex gap-4 mb-8 pb-8 border-b">
        <input 
          type="url" 
          placeholder="Or add photo by URL"
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="flex-1 border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black"
        />
        <button type="submit" disabled={uploading || !url} className="px-6 bg-black text-white font-bold rounded-lg disabled:opacity-50">
          Add
        </button>
      </form>

      {/* Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {photos.map((photo, i) => (
            <div key={photo.id} className={`relative bg-gray-100 rounded-lg overflow-hidden group aspect-video ${i === 0 ? "col-span-2 row-span-2 aspect-auto h-full" : ""}`}>
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              {i === 0 && <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded text-xs font-bold shadow">Cover Photo</div>}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                {i > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); movePhoto(i, -1); }} className="bg-white p-2 rounded-full shadow hover:scale-110 transition">⬆️</button>
                )}
                {i < photos.length - 1 && (
                  <button onClick={(e) => { e.stopPropagation(); movePhoto(i, 1); }} className="bg-white p-2 rounded-full shadow hover:scale-110 transition">⬇️</button>
                )}
                <button onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }} className="bg-white p-2 rounded-full shadow hover:scale-110 transition text-red-500">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <p className="text-center font-semibold text-gray-500">
        {photos.length < 5 ? `${photos.length} of 5 minimum` : `${photos.length} photos added`}
      </p>
    </div>
  );
}
