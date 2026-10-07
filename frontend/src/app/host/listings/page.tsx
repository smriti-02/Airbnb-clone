"use client";

import { useEffect, useState } from "react";
import { hostApi } from "@/lib/hostApi";
import { HostListingDraft } from "@/lib/hostTypes";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ListingsPage() {
  const [listings, setListings] = useState<HostListingDraft[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [deleteModal, setDeleteModal] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = () => {
    setLoading(true);
    hostApi.getMyListings()
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleUnlist = async (id: number) => {
    try {
      await hostApi.unlistListing(id);
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: "unlisted" } : l));
      toast.success("Listing unlisted");
    } catch (e: any) {
      toast.error(e.message || "Failed to unlist");
    }
  };

  const handleRelist = async (id: number) => {
    try {
      await hostApi.relistListing(id);
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: "published" } : l));
      toast.success("Listing relisted");
    } catch (e: any) {
      toast.error(e.message || "Failed to relist");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await hostApi.deleteListing(id);
      setListings(prev => prev.filter(l => l.id !== id));
      setDeleteModal(null);
      toast.success("Listing deleted");
    } catch (e: any) {
      if (e.message?.includes("Unlist it instead") || e.message?.includes("reservations")) {
        setDeleteError(e.message);
      } else {
        toast.error(e.message || "Failed to delete");
        setDeleteModal(null);
      }
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Your listings</h1>
        <Link href="/become-a-host" className="bg-black text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <span>+</span> Create listing
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-2">You don't have any listings</h2>
          <p className="text-gray-500 mb-6">Create a listing to start hosting.</p>
          <Link href="/become-a-host" className="bg-black text-white px-6 py-3 rounded-lg font-bold inline-block">Create your first listing</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map(l => (
            <div key={l.id} className="border rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col group relative">
              <div className="aspect-[4/3] bg-gray-200 relative">
                {l.cover_photo && <img src={l.cover_photo} alt="" className="w-full h-full object-cover" />}
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full shadow text-sm font-bold flex items-center gap-2">
                  {l.status === "published" && <><span className="w-2 h-2 rounded-full bg-green-500"></span>Listed</>}
                  {l.status === "unlisted" && <><span className="w-2 h-2 rounded-full bg-gray-400"></span>Unlisted</>}
                  {l.status === "draft" && <><span className="w-2 h-2 rounded-full bg-gray-200"></span>In progress</>}
                  {l.status === "pending_verification" && <><span className="w-2 h-2 rounded-full bg-yellow-500"></span>Needs verification</>}
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg truncate mb-1">{l.title || l.property_type || "Untitled"}</h3>
                <p className="text-gray-500 text-sm">{l.city || "No location"}</p>
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                  {l.status === "draft" ? (
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div className="bg-black h-1.5 rounded-full" style={{ width: `${l.completion_pct || 0}%` }}></div>
                      </div>
                      <Link href={`/become-a-host/${l.id}/${l.wizard_step || "structure"}`} className="font-semibold underline text-sm">Continue</Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 relative">
                      <ListingMenu 
                        listing={l} 
                        onDelete={() => setDeleteModal(l.id)} 
                        onUnlist={() => handleUnlist(l.id)} 
                        onRelist={() => handleRelist(l.id)} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setDeleteModal(null); setDeleteError(null); }}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Delete this listing?</h2>
            {deleteError ? (
              <div className="mb-6">
                <p className="text-gray-700 mb-2">{deleteError}</p>
              </div>
            ) : (
              <p className="text-gray-500 mb-6">This action cannot be undone. Are you sure you want to permanently delete this listing?</p>
            )}
            
            <div className="flex gap-4">
              {deleteError ? (
                <>
                  <button onClick={() => { setDeleteModal(null); setDeleteError(null); }} className="flex-1 py-3 font-semibold rounded-lg hover:bg-gray-100">Cancel</button>
                  <button onClick={() => { handleUnlist(deleteModal); setDeleteModal(null); setDeleteError(null); }} className="flex-1 py-3 font-bold rounded-lg bg-black text-white">Unlist instead</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setDeleteModal(null); setDeleteError(null); }} className="flex-1 py-3 font-semibold rounded-lg hover:bg-gray-100">Cancel</button>
                  <button onClick={() => handleDelete(deleteModal)} className="flex-1 py-3 font-bold rounded-lg bg-red-600 text-white">Delete</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ListingMenu({ listing, onDelete, onUnlist, onRelist }: { listing: HostListingDraft, onDelete: () => void, onUnlist: () => void, onRelist: () => void }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center font-bold">⋮</button>
      {open && (
        <div className="absolute bottom-10 right-0 w-48 bg-white border rounded-xl shadow-lg py-2 z-10 text-sm">
          <Link href={`/host/listings/${listing.id}/edit`} className="block w-full text-left px-4 py-2 hover:bg-gray-100 font-semibold">Edit</Link>
          <Link href={`/listings/${listing.id}`} target="_blank" className="block w-full text-left px-4 py-2 hover:bg-gray-100">View as guest</Link>
          {listing.status === "published" && <button onClick={() => { setOpen(false); onUnlist(); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Unlist</button>}
          {listing.status === "unlisted" && <button onClick={() => { setOpen(false); onRelist(); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Relist</button>}
          <button onClick={() => { setOpen(false); onDelete(); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">Delete</button>
        </div>
      )}
    </div>
  );
}
