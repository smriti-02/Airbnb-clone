"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Share, Heart, Star, Medal } from "lucide-react";
import PhotoGallery from "@/components/ListingDetail/PhotoGallery";
import BookingWidget from "@/components/ListingDetail/BookingWidget";
import Map from "@/components/ListingDetail/Map";
import Reviews from "@/components/ListingDetail/Reviews";
import { Skeleton } from "@/components/UI";

export default function ListingDetailClient({ id }: { id: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/listings/${id}`)
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="max-w-[1120px] mx-auto px-4 pt-6"><Skeleton className="w-full h-[500px]" /></div>;
  }
  if (!data) return <div className="p-20 text-center">Listing not found</div>;

  return (
    <div className="max-w-[1120px] mx-auto xl:px-0 px-4 pt-6 pb-20">
      <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
      <div className="flex justify-between items-center text-sm font-semibold">
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1"><Star size={14} className="fill-black"/> {data.avg_rating || "New"}</span>
          <span className="underline cursor-pointer">{data.review_count} reviews</span>
          <span className="underline cursor-pointer">{data.city}, {data.state}, {data.country}</span>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 hover:bg-neutral-100 p-2 rounded-lg transition"><Share size={16}/> Share</button>
          <button className="flex items-center gap-2 hover:bg-neutral-100 p-2 rounded-lg transition"><Heart size={16}/> Save</button>
        </div>
      </div>

      <PhotoGallery photos={data.photos} />

      <div className="grid grid-cols-1 md:grid-cols-3 mt-12 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex justify-between items-center pb-6 border-b border-neutral-200">
            <div>
              <h2 className="text-2xl font-bold mb-1">Hosted by {data.host.name}</h2>
              <div className="text-neutral-500">
                {data.max_guests} guests · {data.bedrooms} bedrooms · {data.beds} beds · {data.bathrooms} baths
              </div>
            </div>
            <img src={data.host.avatar_url} className="w-14 h-14 rounded-full" />
          </div>
          
          <div className="py-6 border-b border-neutral-200 flex gap-4 items-start">
             <Medal size={28} />
             <div>
               <h3 className="font-bold">{data.host.name} is a Superhost</h3>
               <p className="text-neutral-500">Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.</p>
             </div>
          </div>

          <div className="py-6 border-b border-neutral-200">
            <p className="line-clamp-6 text-neutral-800">{data.description}</p>
            <button className="font-semibold underline mt-4">Show more &gt;</button>
          </div>
          
          <div className="py-6 border-b border-neutral-200">
            <h2 className="text-2xl font-bold mb-6">What this place offers</h2>
            <div className="grid grid-cols-2 gap-4">
              {data.amenities.slice(0, 10).map((a: any) => (
                <div key={a.id} className="flex items-center gap-4 text-neutral-700">
                  <div className="w-6 h-6 border rounded border-[color:var(--color-airbnb-border)] flex items-center justify-center text-[10px]">{a.icon || "✓"}</div>
                  {a.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-1 relative hidden md:block">
          <BookingWidget listing={data} />
        </div>
      </div>
      
      <Reviews listingId={id} avgRating={data.avg_rating} reviewCount={data.review_count} />

      <div className="py-10 border-t border-[color:var(--color-airbnb-border)] mt-6">
        <h2 className="text-2xl font-bold mb-6">Where you'll be</h2>
        <Map lat={data.latitude} lng={data.longitude} />
      </div>
      
      {/* Mobile Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-[color:var(--color-airbnb-border)] p-4 flex justify-between items-center z-50">
        <div>
          <div className="font-bold">${data.price_per_night} <span className="font-normal text-sm">night</span></div>
          <div className="text-sm underline cursor-pointer">Select dates</div>
        </div>
        <button className="bg-[color:var(--color-airbnb-primary)] text-white px-6 py-3 rounded-xl font-bold">Reserve</button>
      </div>
    </div>
  );
}
