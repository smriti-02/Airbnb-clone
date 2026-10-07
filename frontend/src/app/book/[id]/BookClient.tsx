"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button, Skeleton } from "@/components/UI";
import { ChevronLeft, Star, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { formatINR, formatDateShort } from "@/lib/format";

export default function BookClient({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const check_in = searchParams.get("check_in");
  const check_out = searchParams.get("check_out");
  const guests = parseInt(searchParams.get("guests") || "1");

  const [listing, setListing] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Mock form state
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    if (!check_in || !check_out) {
      toast.error("Missing booking details");
      router.push(`/listings/${id}`);
      return;
    }

    const fetchData = async () => {
      try {
        const [lData, qData] = await Promise.all([
          apiFetch<any>(`/listings/${id}`),
          apiFetch<any>(`/bookings/quote`, {
            method: "POST",
            body: JSON.stringify({ listing_id: parseInt(id), check_in, check_out, guests })
          })
        ]);
        setListing(lData);
        setQuote(qData);
      } catch (err: any) {
        toast.error(err.message || "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, check_in, check_out, guests, router]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (card.length < 15 || exp.length < 5 || cvv.length < 3) {
      toast.error("Please complete the payment details properly.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch<any>(`/bookings`, {
        method: "POST",
        body: JSON.stringify({ listing_id: parseInt(id), check_in, check_out, guests })
      });
      toast.success("Booking confirmed!");
      router.push(`/book/success?id=${res.id}`);
    } catch (err: any) {
      // Handle the 409 Conflict correctly with a friendly toast!
      toast.error(err.message || "Those dates just became unavailable! Please choose another date.", { duration: 5000 });
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-[1120px] mx-auto p-10"><Skeleton className="h-[500px] w-full" /></div>;
  if (!listing || !quote) return null;

  return (
    <div className="max-w-[1120px] mx-auto xl:px-0 px-4 pt-10 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-neutral-100 rounded-full transition"><ChevronLeft /></button>
        <h1 className="text-3xl font-bold">Confirm and pay</h1>
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-16">
        
        {/* Left side: Payment Form */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="border-b border-neutral-200 pb-8">
            <h2 className="text-2xl font-bold mb-6">Your trip</h2>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-semibold">Dates</div>
                <div>{formatDateShort(check_in as string)} - {formatDateShort(check_out as string)}</div>
              </div>
              <button onClick={() => router.back()} className="font-semibold underline">Edit</button>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">Guests</div>
                <div>{guests} guest{guests > 1 ? 's' : ''}</div>
              </div>
              <button onClick={() => router.back()} className="font-semibold underline">Edit</button>
            </div>
          </div>

          <div className="border-b border-neutral-200 pb-8">
            <h2 className="text-2xl font-bold mb-6">Pay with</h2>
            <form onSubmit={handleConfirm} className="flex flex-col gap-4">
              <div className="border border-neutral-400 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-neutral-400 flex items-center gap-3 bg-white">
                  <CreditCard className="text-neutral-500" />
                  <input 
                    type="text" placeholder="Card number (mock)" className="outline-none w-full" 
                    value={card} onChange={e => setCard(e.target.value)} required
                  />
                </div>
                <div className="flex bg-white">
                  <div className="p-4 border-r border-neutral-400 flex-1">
                    <input 
                      type="text" placeholder="Expiration (MM/YY)" className="outline-none w-full" 
                      value={exp} onChange={e => setExp(e.target.value)} required
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <input 
                      type="text" placeholder="CVV" className="outline-none w-full" 
                      value={cvv} onChange={e => setCvv(e.target.value)} required
                    />
                  </div>
                </div>
              </div>
              <div className="text-xs text-neutral-500 mt-1">This is a mock payment form. No real transaction occurs.</div>
              
              <hr className="my-4 border-neutral-200" />
              <div className="text-sm font-semibold mb-2">Ground rules</div>
              <div className="text-sm text-neutral-600 mb-6">We ask every guest to remember a few simple things about what makes a great guest. <br/>• Follow the house rules <br/>• Treat your Host's home like your own</div>
              
              <Button primary className="py-4 text-xl flex justify-center items-center gap-2" disabled={submitting}>
                {submitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : null}
                Confirm and pay
              </Button>
            </form>
          </div>
        </div>

        {/* Right side: Summary Card */}
        <div className="w-full md:w-[400px]">
          <div className="border border-neutral-300 rounded-2xl p-6 sticky top-28 shadow-[var(--shadow-airbnb)] bg-white">
            <div className="flex gap-4 border-b border-neutral-200 pb-6 mb-6">
              <img src={listing.photos[0]?.url} className="w-28 h-28 object-cover rounded-xl" />
              <div className="flex flex-col justify-between">
                <div>
                  <div className="text-xs text-neutral-500 mb-1">{listing.property_type}</div>
                  <div className="font-semibold text-sm line-clamp-2">{listing.title}</div>
                </div>
                <div className="text-xs flex items-center gap-1 font-semibold"><Star size={12} className="fill-black"/> {listing.avg_rating || "New"} ({listing.review_count} reviews)</div>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Price details</h2>
            <div className="flex flex-col gap-3 text-neutral-700">
              <div className="flex justify-between">
                <span>{formatINR(listing.price_per_night)} x {quote.nights} nights</span>
                <span>{formatINR(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="underline">Cleaning fee</span>
                <span>{formatINR(quote.cleaning_fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="underline">Airbnb service fee</span>
                <span>{formatINR(quote.service_fee)}</span>
              </div>
              <hr className="my-2 border-neutral-200" />
              <div className="flex justify-between font-bold text-black text-lg">
                <span>Total (INR)</span>
                <span>{formatINR(quote.total)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
