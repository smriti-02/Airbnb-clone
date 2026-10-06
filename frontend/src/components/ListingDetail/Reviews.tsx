"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Star } from "lucide-react";
import { Modal } from "@/components/UI";

export default function Reviews({ listingId, avgRating, reviewCount }: { listingId: string, avgRating: number, reviewCount: number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    apiFetch(`/listings/${listingId}/reviews`).then((res: any) => setReviews(res)).catch(() => {});
  }, [listingId]);

  if (reviews.length === 0) return null;

  return (
    <div className="py-10 border-t border-[color:var(--color-airbnb-border)] mt-6">
      <div className="flex items-center gap-2 text-2xl font-bold mb-8 text-[color:var(--color-airbnb-text)]">
        <Star size={24} className="fill-black" />
        {avgRating} · {reviewCount} reviews
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
        {reviews.slice(0, 6).map(r => (
          <div key={r.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <img src={r.guest?.avatar_url || "https://placehold.co/100"} className="w-12 h-12 rounded-full" />
              <div>
                <div className="font-semibold">{r.guest?.name}</div>
                <div className="text-sm text-neutral-500">{new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
              </div>
            </div>
            <p className="text-[color:var(--color-airbnb-text)] line-clamp-3">{r.comment}</p>
          </div>
        ))}
      </div>

      {reviews.length > 6 && (
        <div className="mt-8">
          <button 
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 border border-black rounded-xl font-semibold hover:bg-neutral-50 transition"
          >
            Show all {reviews.length} reviews
          </button>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`🌟 ${avgRating} · ${reviewCount} reviews`}>
        <div className="flex flex-col gap-8 max-h-[70vh] overflow-y-auto pr-4">
          {reviews.map(r => (
            <div key={r.id} className="flex flex-col gap-3 pb-6 border-b border-[color:var(--color-airbnb-border)]">
              <div className="flex items-center gap-4">
                <img src={r.guest?.avatar_url || "https://placehold.co/100"} className="w-12 h-12 rounded-full" />
                <div>
                  <div className="font-semibold">{r.guest?.name}</div>
                  <div className="text-sm text-neutral-500">{new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
              <p className="text-[color:var(--color-airbnb-text)]">{r.comment}</p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
