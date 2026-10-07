"use client";

import { useEffect, useState } from "react";
import { hostApi } from "@/lib/hostApi";
import { Reservation, HostListingDraft } from "@/lib/hostTypes";
import { formatINR } from "@/lib/format";

export default function ReservationsPage() {
  const [bucket, setBucket] = useState("upcoming");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [listings, setListings] = useState<HostListingDraft[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [listingFilter, setListingFilter] = useState("all");

  const tabs = [
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "all", label: "All" }
  ];

  useEffect(() => {
    hostApi.getMyListings()
      .then(setListings)
      .catch(console.error);
  }, []);

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

  const filtered = reservations.filter(r => {
    const mSearch = search === "" || r.guest_name?.toLowerCase().includes(search.toLowerCase());
    const mListing = listingFilter === "all" || r.listing_id.toString() === listingFilter;
    return mSearch && mListing;
  });

  const formatDateRange = (inDate: string, outDate: string) => {
    const d1 = new Date(inDate);
    const d2 = new Date(outDate);
    const m1 = d1.toLocaleString('default', { month: 'short' });
    const m2 = d2.toLocaleString('default', { month: 'short' });
    if (m1 === m2) return `${d1.getDate()}-${d2.getDate()} ${m1} ${d1.getFullYear()}`;
    return `${d1.getDate()} ${m1} - ${d2.getDate()} ${m2} ${d1.getFullYear()}`;
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Reservations</h1>
      
      <div className="flex gap-4 border-b mb-8 overflow-x-auto hide-scrollbar">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setBucket(t.id)}
            className={`py-4 font-semibold px-2 border-b-2 whitespace-nowrap transition ${bucket === t.id ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input 
          type="text"
          placeholder="Search by guest name"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-black flex-1 max-w-sm"
        />
        <select 
          value={listingFilter}
          onChange={e => setListingFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-black min-w-[200px]"
        >
          <option value="all">All listings</option>
          {listings.map(l => (
            <option key={l.id} value={l.id.toString()}>{l.title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-gray-50 text-gray-500">
          No reservations found.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto border rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Guest</th>
                  <th className="p-4 font-semibold">Dates</th>
                  <th className="p-4 font-semibold">Booked</th>
                  <th className="p-4 font-semibold">Listing</th>
                  <th className="p-4 font-semibold text-right">Total payout</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                        ${r.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : ''}
                        ${r.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        ${r.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                      `}>{r.status}</span>
                    </td>
                    <td className="p-4 font-semibold">{r.guest_name} <span className="text-gray-500 font-normal text-sm block">{r.guests} guests</span></td>
                    <td className="p-4 whitespace-nowrap">{formatDateRange(r.check_in, r.check_out)}</td>
                    <td className="p-4 text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-4 max-w-[200px] truncate">{r.listing_title}</td>
                    <td className="p-4 text-right font-semibold">{formatINR(r.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filtered.map(r => (
              <div key={r.id} className="border rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold">{r.guest_name}</h3>
                    <p className="text-sm text-gray-500">{formatDateRange(r.check_in, r.check_out)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                        ${r.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : ''}
                        ${r.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        ${r.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                      `}>{r.status}</span>
                </div>
                <div className="text-sm mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-gray-500 truncate pr-4">{r.listing_title}</span>
                  <span className="font-semibold">{formatINR(r.total_price)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
