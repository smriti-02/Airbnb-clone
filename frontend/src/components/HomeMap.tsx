"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

// Create custom price pins
const createPriceIcon = (price: number) => {
  return L.divIcon({
    className: "custom-price-marker",
    html: `<div style="background-color: white; border: 1px solid #ddd; border-radius: 20px; padding: 4px 10px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 14px; text-align: center; cursor: pointer; transition: transform 0.2s; white-space: nowrap;">
             $${price}
           </div>`,
    iconSize: [auto, auto],
    iconAnchor: [30, 15],
  });
};

export default function HomeMap({ listings }: { listings: any[] }) {
  const router = useRouter();
  
  if (!listings || listings.length === 0) return null;
  
  // Center roughly based on first listing
  const center: [number, number] = [listings[0].latitude || 0, listings[0].longitude || 0];

  return (
    <div className="h-[calc(100vh-160px)] w-full rounded-2xl overflow-hidden mt-6 shadow-[var(--shadow-airbnb)] border border-[color:var(--color-airbnb-border)]">
      <MapContainer center={center} zoom={3} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {listings.map(l => (
          l.latitude && l.longitude && (
            <Marker 
              key={l.id} 
              position={[l.latitude, l.longitude]}
              icon={createPriceIcon(l.price_per_night)}
            >
              <Popup className="custom-popup" closeButton={false}>
                <div className="flex flex-col cursor-pointer hover:opacity-90" onClick={() => router.push(`/listings/${l.id}`)}>
                  <div className="w-[200px] h-[150px] bg-cover bg-center rounded-t-xl mb-2" style={{ backgroundImage: `url(${l.photos?.[0]?.url})` }} />
                  <div className="px-3 pb-3">
                    <div className="font-semibold text-[color:var(--color-airbnb-text)] flex justify-between">
                      <span className="line-clamp-1">{l.city}, {l.country}</span>
                      <span className="flex items-center gap-1 text-xs"><Star size={12} className="fill-black"/> {l.avg_rating || "New"}</span>
                    </div>
                    <div className="text-neutral-500 text-xs my-1">{l.title}</div>
                    <div className="font-bold text-sm">${l.price_per_night} <span className="font-normal text-xs text-neutral-500">night</span></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
