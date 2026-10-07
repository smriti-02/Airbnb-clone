"use client";
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });

export default function Map({ lat, lng }: { lat: number, lng: number }) {
  const [icon, setIcon] = useState<any>(null);

  useEffect(() => {
    import('leaflet').then((L) => {
      setIcon(L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        iconAnchor: [12, 41]
      }));
    });
  }, []);

  if (!icon) return <div className="h-[400px] w-full bg-neutral-100 animate-pulse rounded-xl" />;

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden z-0 relative">
      <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} className="h-full w-full z-0">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]} icon={icon} />
      </MapContainer>
    </div>
  );
}
