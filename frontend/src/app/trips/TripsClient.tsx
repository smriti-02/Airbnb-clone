"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button, Modal, Skeleton } from "@/components/UI";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export default function TripsClient() {
  const { user } = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");

  const [cancelModal, setCancelModal] = useState<number | null>(null);
  
  // Review Modal state
  const [reviewModal, setReviewModal] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    fetchBookings();
  }, [user, router]);

  const fetchBookings = async () => {
    try {
      const data = await apiFetch<any[]>("/bookings/me");
      setBookings(data);
    } catch (e: any) {
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    try {
      await apiFetch(`/bookings/${cancelModal}/cancel`, { method: "POST" });
      toast.success("Booking cancelled successfully");
      setCancelModal(null);
      fetchBookings(); // refresh
    } catch(e: any) {
      toast.error(e.message || "Failed to cancel");
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    setSubmitting(true);
    try {
      await apiFetch(`/reviews`, {
        method: "POST",
        body: JSON.stringify({ booking_id: reviewModal, rating, comment })
      });
      toast.success("Review posted!");
      setReviewModal(null);
      setComment("");
    } catch(e: any) {
      toast.error(e.message || "Failed to post review. You may have already reviewed this trip.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || loading) return <div className="max-w-[1120px] mx-auto p-10"><Skeleton className="h-64 w-full" /></div>;

  const today = new Date().toISOString().split('T')[0];
  
  const upcoming = bookings.filter(b => b.status === "confirmed" && b.check_out >= today);
  const past = bookings.filter(b => b.status === "confirmed" && b.check_out < today);
  const cancelled = bookings.filter(b => b.status === "cancelled");

  let activeList = upcoming;
  if (tab === "past") activeList = past;
  if (tab === "cancelled") activeList = cancelled;

  return (
    <div className="max-w-[1120px] mx-auto xl:px-0 px-4 pt-10 pb-20">
      <h1 className="text-3xl font-bold mb-8">Trips</h1>
      
      <div className="flex gap-6 border-b border-neutral-200 mb-8 font-semibold text-neutral-500">
        <div onClick={() => setTab("upcoming")} className={`pb-4 cursor-pointer transition hover:text-black ${tab === "upcoming" ? "text-black border-b-2 border-black" : ""}`}>Upcoming</div>
        <div onClick={() => setTab("past")} className={`pb-4 cursor-pointer transition hover:text-black ${tab === "past" ? "text-black border-b-2 border-black" : ""}`}>Past</div>
        <div onClick={() => setTab("cancelled")} className={`pb-4 cursor-pointer transition hover:text-black ${tab === "cancelled" ? "text-black border-b-2 border-black" : ""}`}>Cancelled</div>
      </div>

      {activeList.length === 0 ? (
        <div className="py-10 border border-neutral-200 rounded-2xl p-8 bg-neutral-50 flex flex-col items-start gap-4">
          <div className="text-xl font-semibold">No trips booked... yet!</div>
          <div className="text-neutral-600 mb-2">Time to dust off your bags and start planning your next adventure.</div>
          <Button primary onClick={() => router.push("/")}>Start searching</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeList.map(b => (
            <div key={b.id} className="border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div 
                className="h-48 w-full bg-cover bg-center cursor-pointer hover:opacity-90 transition" 
                style={{ backgroundImage: `url(${b.listing?.photos?.[0]?.url})` }}
                onClick={() => router.push(`/listings/${b.listing_id}`)}
              />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-neutral-500 font-bold uppercase mb-1">{b.listing?.city}, {b.listing?.country}</div>
                  <div className="font-semibold text-lg line-clamp-1 mb-1">{b.listing?.title}</div>
                  <div className="text-neutral-600 text-sm mb-4">
                    {new Date(b.check_in).toLocaleDateString()} - {new Date(b.check_out).toLocaleDateString()} · {b.guests} guest{b.guests>1?'s':''}
                  </div>
                  <div className="font-bold">Total: ${b.total}</div>
                </div>
                
                <div className="mt-6">
                  {tab === "upcoming" && (
                    <Button className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setCancelModal(b.id)}>Cancel reservation</Button>
                  )}
                  {tab === "past" && (
                    <Button primary className="w-full" onClick={() => setReviewModal(b.id)}>Leave a review</Button>
                  )}
                  {tab === "cancelled" && (
                    <div className="text-sm font-semibold text-red-500 bg-red-50 p-3 rounded-lg text-center">Cancelled</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <Modal isOpen={cancelModal !== null} onClose={() => setCancelModal(null)} title="Cancel Reservation">
        <div className="flex flex-col gap-4">
          <p>Are you sure you want to cancel this reservation? This action cannot be undone.</p>
          <p className="text-sm text-neutral-500">Refunds are subject to the Host's cancellation policy.</p>
          <div className="flex gap-4 mt-4">
            <Button className="flex-1" onClick={() => setCancelModal(null)}>Keep booking</Button>
            <Button className="flex-1 bg-red-600 text-white hover:bg-red-700 border-red-600" onClick={handleCancel}>Yes, cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={reviewModal !== null} onClose={() => setReviewModal(null)} title="Leave a review">
        <div className="flex flex-col gap-6">
          <div>
            <div className="font-semibold mb-2">Overall rating</div>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(star => (
                <Star 
                  key={star} 
                  size={32} 
                  className={`cursor-pointer transition ${star <= rating ? "fill-[color:var(--color-airbnb-primary)] text-[color:var(--color-airbnb-primary)]" : "text-neutral-300"}`} 
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Share your experience</div>
            <textarea 
              className="w-full border border-neutral-300 rounded-xl p-4 outline-none focus:border-black transition h-32" 
              placeholder="What did you love about this place?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <Button className="flex-1" onClick={() => setReviewModal(null)}>Cancel</Button>
            <Button primary className="flex-1" onClick={handleSubmitReview} disabled={submitting}>Submit Review</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
