"use client";
import { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/UI";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';

export default function BookingWidget({ listing }: { listing: any }) {
  const { user } = useUser();
  const router = useRouter();
  
  const [dateRange, setDateRange] = useState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
  const [guests, setGuests] = useState(1);
  const [quote, setQuote] = useState<any>(null);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const today = new Date();
        const m1 = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}`;
        const next = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const m2 = `${next.getFullYear()}-${String(next.getMonth()+1).padStart(2, '0')}`;
        
        const [res1, res2] = await Promise.all([
          apiFetch<any>(`/listings/${listing.id}/availability?month=${m1}`),
          apiFetch<any>(`/listings/${listing.id}/availability?month=${m2}`)
        ]);
        
        const dates = [...(res1.unavailable_dates || []), ...(res2.unavailable_dates || [])].map(d => new Date(d));
        setUnavailableDates(dates);
      } catch(e) {}
    };
    fetchDates();
  }, [listing.id]);

  useEffect(() => {
    const fetchQuote = async () => {
      const { startDate, endDate } = dateRange[0];
      if (startDate < endDate) {
        try {
          const res = await apiFetch<any>(`/bookings/quote`, {
            method: "POST",
            body: JSON.stringify({
              listing_id: listing.id,
              check_in: startDate.toISOString().split('T')[0],
              check_out: endDate.toISOString().split('T')[0],
              guests
            })
          });
          setQuote(res);
        } catch(e: any) {
          setQuote(null);
        }
      } else {
        setQuote(null);
      }
    };
    fetchQuote();
  }, [dateRange, guests, listing.id]);

  const onReserve = () => {
    if (!user) {
      toast.error("Please select a User (Guest) from the top right menu to book.");
      return;
    }
    const { startDate, endDate } = dateRange[0];
    const ci = startDate.toISOString().split('T')[0];
    const co = endDate.toISOString().split('T')[0];
    
    // Redirect to Confirm and Pay page
    router.push(`/book/${listing.id}?check_in=${ci}&check_out=${co}&guests=${guests}`);
  };

  return (
    <div className="bg-white border border-[color:var(--color-airbnb-border)] rounded-2xl p-6 shadow-[var(--shadow-airbnb)] sticky top-28">
      <div className="flex items-end gap-1 mb-6">
        <span className="text-2xl font-bold">${listing.price_per_night}</span>
        <span className="text-neutral-500 mb-1">night</span>
      </div>
      
      <div className="border border-[color:var(--color-airbnb-border)] rounded-xl overflow-hidden mb-4">
        <div className="border-b border-[color:var(--color-airbnb-border)] p-3">
          <DateRange
            ranges={dateRange}
            onChange={item => setDateRange([item.selection as any])}
            months={1}
            direction="horizontal"
            rangeColors={["#FF385C"]}
            disabledDates={unavailableDates}
            minDate={new Date()}
            className="w-full text-xs"
          />
        </div>
        <div className="p-3 hover:bg-neutral-50 transition cursor-pointer">
          <div className="text-xs font-bold">GUESTS</div>
          <input 
            type="number" min="1" max={listing.max_guests}
            className="w-full outline-none bg-transparent" 
            value={guests} 
            onChange={e => setGuests(parseInt(e.target.value))}
          />
        </div>
      </div>
      
      <Button primary className="w-full py-3 text-lg" onClick={onReserve} disabled={!quote}>
        Reserve
      </Button>
      <p className="text-center text-sm text-neutral-500 mt-2">You won't be charged yet</p>
      
      {quote && (
        <div className="mt-4 flex flex-col gap-3 text-neutral-600">
          <div className="flex justify-between">
            <span className="underline">${listing.price_per_night} x {quote.nights} nights</span>
            <span>${quote.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Cleaning fee</span>
            <span>${quote.cleaning_fee}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Airbnb service fee</span>
            <span>${quote.service_fee}</span>
          </div>
          <hr className="border-[color:var(--color-airbnb-border)]" />
          <div className="flex justify-between font-bold text-[color:var(--color-airbnb-text)] text-lg">
            <span>Total before taxes</span>
            <span>${quote.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
