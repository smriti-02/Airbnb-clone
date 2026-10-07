"use client";
import { useState } from "react";
import { Modal } from "@/components/UI";
import { GripHorizontal } from "lucide-react";
import SafeImage from "../SafeImage";

export default function PhotoGallery({ photos }: { photos: any[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const sortedPhotos = photos.sort((a, b) => a.position - b.position);

  if (!sortedPhotos.length) return <div className="h-[400px] bg-neutral-200 rounded-xl" />;

  return (
    <div className="relative pt-6">
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[400px] lg:h-[500px] rounded-xl overflow-hidden group">
        <div className="col-span-4 md:col-span-2 row-span-2 relative cursor-pointer hover:brightness-90 transition" onClick={() => setModalOpen(true)}>
          <SafeImage src={sortedPhotos[0]?.url} alt="Listing Photo 1" fill />
        </div>
        <div className="hidden md:block col-span-1 row-span-1 relative cursor-pointer hover:brightness-90 transition" onClick={() => setModalOpen(true)}>
          <SafeImage src={sortedPhotos[1]?.url} alt="Listing Photo 2" fill />
        </div>
        <div className="hidden md:block col-span-1 row-span-1 relative cursor-pointer hover:brightness-90 transition" onClick={() => setModalOpen(true)}>
          <SafeImage src={sortedPhotos[2]?.url} alt="Listing Photo 3" fill />
        </div>
        <div className="hidden md:block col-span-1 row-span-1 relative cursor-pointer hover:brightness-90 transition" onClick={() => setModalOpen(true)}>
          <SafeImage src={sortedPhotos[3]?.url} alt="Listing Photo 4" fill />
        </div>
        <div className="hidden md:block col-span-1 row-span-1 relative cursor-pointer hover:brightness-90 transition" onClick={() => setModalOpen(true)}>
          <SafeImage src={sortedPhotos[4]?.url} alt="Listing Photo 5" fill />
        </div>
      </div>
      
      <button 
        onClick={() => setModalOpen(true)}
        className="absolute bottom-4 right-4 bg-white px-4 py-1.5 rounded-lg border border-black shadow-sm font-semibold text-sm flex items-center gap-2 hover:bg-neutral-100 transition"
      >
        <GripHorizontal size={16} /> Show all photos
      </button>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="All Photos">
        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2">
          {sortedPhotos.map((p, i) => (
            <div key={i} className="relative w-full aspect-video rounded-lg overflow-hidden">
              <SafeImage src={p.url} alt={`Photo ${i+1}`} fill />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
