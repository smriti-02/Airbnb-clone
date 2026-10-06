"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Button, Modal, Skeleton } from "@/components/UI";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function HostDashboardClient() {
  const router = useRouter();
  const [tab, setTab] = useState<"listings" | "reservations">("listings");
  const [listings, setListings] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lData, rData] = await Promise.all([
        apiFetch<any[]>("/host/listings"),
        apiFetch<any[]>("/host/bookings")
      ]);
      setListings(lData);
      setReservations(rData);
    } catch(e: any) {
      toast.error(e.message || "Failed to load host data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await apiFetch(`/host/listings/${deleteModal}`, { method: "DELETE" });
      toast.success("Listing deleted");
      setListings(prev => prev.filter(l => l.id !== deleteModal));
    } catch(e: any) {
      toast.error(e.message || "Failed to delete listing");
    } finally {
      setDeleteModal(null);
    }
  };

  if (loading) return <div className="p-10"><Skeleton className="h-64 w-full" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Host Dashboard</h1>
        <Button primary className="flex items-center gap-2" onClick={() => router.push("/host/listings/new")}>
          <Plus size={18} /> Create Listing
        </Button>
      </div>

      <div className="flex gap-6 border-b border-neutral-200 mb-8 font-semibold text-neutral-500">
        <div onClick={() => setTab("listings")} className={`pb-4 cursor-pointer transition hover:text-black ${tab === "listings" ? "text-black border-b-2 border-black" : ""}`}>My Listings ({listings.length})</div>
        <div onClick={() => setTab("reservations")} className={`pb-4 cursor-pointer transition hover:text-black ${tab === "reservations" ? "text-black border-b-2 border-black" : ""}`}>Reservations ({reservations.length})</div>
      </div>

      {tab === "listings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(l => (
            <div key={l.id} className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-[var(--shadow-airbnb)] flex flex-col">
              <div 
                className="h-48 w-full bg-cover bg-center cursor-pointer hover:opacity-90 transition" 
                style={{ backgroundImage: `url(${l.photos?.[0]?.url || 'https://placehold.co/400'})` }}
                onClick={() => router.push(`/listings/${l.id}`)}
              />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-lg line-clamp-1 mb-1 text-[color:var(--color-airbnb-text)]">{l.title}</div>
                  <div className="text-neutral-500 text-sm mb-4">{l.city}, {l.country}</div>
                  <div className="font-bold text-[color:var(--color-airbnb-text)]">${l.price_per_night} <span className="font-normal text-sm">/ night</span></div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button className="flex-1 flex justify-center items-center gap-2 border-neutral-300 hover:border-black" onClick={() => router.push(`/host/listings/${l.id}/edit`)}>
                    <Edit2 size={16} /> Edit
                  </Button>
                  <Button className="flex-1 flex justify-center items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition" onClick={() => setDeleteModal(l.id)}>
                    <Trash2 size={16} /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {listings.length === 0 && <div className="col-span-full py-10 text-center text-neutral-500">You don't have any active listings yet.</div>}
        </div>
      )}

      {tab === "reservations" && (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-[var(--shadow-airbnb)]">
          {reservations.length === 0 ? (
            <div className="py-10 text-center text-neutral-500">No reservations yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-sm">
                    <th className="p-4 font-semibold">Guest</th>
                    <th className="p-4 font-semibold">Listing</th>
                    <th className="p-4 font-semibold">Dates</th>
                    <th className="p-4 font-semibold">Total</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(r => (
                    <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition">
                      <td className="p-4 flex items-center gap-3">
                        <img src={r.guest?.avatar_url} className="w-8 h-8 rounded-full" />
                        <span className="font-semibold text-[color:var(--color-airbnb-text)]">{r.guest?.name}</span>
                      </td>
                      <td className="p-4 font-medium text-[color:var(--color-airbnb-text)]">{r.listing?.title}</td>
                      <td className="p-4 text-sm text-neutral-600">{new Date(r.check_in).toLocaleDateString()} - {new Date(r.check_out).toLocaleDateString()}</td>
                      <td className="p-4 font-semibold text-[color:var(--color-airbnb-text)]">${r.total}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${r.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={deleteModal !== null} onClose={() => setDeleteModal(null)} title="Delete Listing">
        <p className="mb-6">Are you sure you want to delete this listing? All associated photos and future bookings may be affected. This action cannot be undone.</p>
        <div className="flex gap-4">
          <Button className="flex-1" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button className="flex-1 bg-red-600 text-white border-red-600 hover:bg-red-700" onClick={handleDelete}>Yes, Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
