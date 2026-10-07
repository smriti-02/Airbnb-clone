"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { hostApi } from "@/lib/hostApi";
import { Reservation } from "@/lib/hostTypes";
import { formatINR } from "@/lib/format";
import Link from "next/link";
import toast from "react-hot-toast";

export default function TodayPage() {
  const { user } = useUser();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [bucket, setBucket] = useState("arriving_soon");
  
  const buckets = [
    { id: "checking_out", label: "Checking out" },
    { id: "hosting", label: "Currently hosting" },
    { id: "arriving_soon", label: "Arriving soon" },
    { id: "upcoming", label: "Upcoming" }
  ];

  useEffect(() => {
    setLoading(true);
    hostApi.getReservations(bucket)
      .then((res: any) => setReservations(res.items || []))
      .catch((err) => {
        console.error(err);
        setReservations([]);
      })
      .finally(() => setLoading(false));
  }, [bucket]);

  const updateNote = async (id: number, note: string) => {
    try {
      await hostApi.updateReservationNote(id, note);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, host_note: note } : r));
      toast.success("Note saved");
    } catch (e: any) {
      toast.error(e.message || "Failed to save note");
    }
  };

  const formatDateRange = (inDate: string, outDate: string) => {
    const d1 = new Date(inDate);
    const d2 = new Date(outDate);
    const m1 = d1.toLocaleString('default', { month: 'short' });
    const m2 = d2.toLocaleString('default', { month: 'short' });
    if (m1 === m2) return `${d1.getDate()}-${d2.getDate()} ${m1}`;
    return `${d1.getDate()} ${m1} - ${d2.getDate()} ${m2}`;
  };

  if (!user) return null;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Welcome, {user.name.split(' ')[0]}!</h1>
      
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6 hide-scrollbar">
        {buckets.map(b => (
          <button
            key={b.id}
            onClick={() => setBucket(b.id)}
            className={`whitespace-nowrap px-6 py-2 rounded-full font-semibold border-2 transition ${bucket === b.id ? "border-black bg-gray-50" : "border-transparent bg-white shadow-sm hover:border-gray-200"}`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-xl font-semibold mb-2">You don't have any guests {buckets.find(b => b.id === bucket)?.label.toLowerCase()}</h2>
          <Link href="/host/calendar" className="inline-block mt-4 underline font-semibold">Go to your calendar</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map(res => (
            <div key={res.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-6 flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 shrink-0">
                  {res.guest_avatar && <img src={res.guest_avatar} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl">{res.guest_name}</h3>
                  <p className="text-gray-500 text-sm">{formatDateRange(res.check_in, res.check_out)} • {res.guests} guest{res.guests > 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 flex items-center gap-4">
                <div className="w-12 h-10 rounded overflow-hidden bg-gray-200 shrink-0">
                  {res.listing_cover && <img src={res.listing_cover} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{res.listing_title}</p>
                  <p className="text-gray-500 text-xs">Payout: {formatINR(res.host_earning || res.total_price)}</p>
                </div>
              </div>
              
              <div className="p-4 border-t flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Private Note</p>
                <textarea 
                  className="w-full bg-yellow-50/50 border border-yellow-100 rounded-lg p-3 text-sm outline-none resize-none focus:ring-1 focus:ring-yellow-300 transition"
                  placeholder="Add a note (only you can see this)..."
                  defaultValue={res.host_note || ""}
                  onBlur={e => {
                    if (e.target.value !== (res.host_note || "")) {
                      updateNote(res.id, e.target.value);
                    }
                  }}
                />
              </div>
              
              <div className="p-4 bg-blue-50 text-blue-800 text-sm font-semibold border-t">
                {bucket === "arriving_soon" && "Say hello before they arrive"}
                {bucket === "hosting" && "Ask how the stay is going"}
                {bucket === "checking_out" && "Remind them of check-out instructions"}
                {bucket === "upcoming" && "Prepare your place for their arrival"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
