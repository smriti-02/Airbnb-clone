import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icon issue in Next.js/Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const CITY_COORDS: Record<string, [number, number]> = {
  "Mumbai": [19.0760, 72.8777],
  "New Delhi": [28.6139, 77.2090],
  "Bengaluru": [12.9716, 77.5946],
  "Goa": [15.2993, 74.1240],
  "Jaipur": [26.9124, 75.7873],
  "Chennai": [13.0827, 80.2707],
  "Kolkata": [22.5726, 88.3639],
  // Default India center
  "India": [20.5937, 78.9629]
};

function DraggableMarker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (l: number, lg: number) => void }) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      }
    },
  };

  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    }
  });

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[lat, lng]}
      ref={markerRef}
    />
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapComponent({ city, lat, lng, onChange }: { city: string | null; lat: number | null; lng: number | null; onChange: (lat: number, lng: number) => void }) {
  const defaultCenter = CITY_COORDS[city || "India"] || CITY_COORDS["India"];
  
  const currentLat = lat || defaultCenter[0];
  const currentLng = lng || defaultCenter[1];

  return (
    <MapContainer center={[currentLat, currentLng]} zoom={5} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={[currentLat, currentLng]} />
      <DraggableMarker lat={currentLat} lng={currentLng} onChange={onChange} />
    </MapContainer>
  );
}
