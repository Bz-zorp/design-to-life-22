import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapMarker {
  lat: number;
  lng: number;
  label: string;
}

interface LeafletMapProps {
  markers: MapMarker[];
  center: [number, number];
  zoom: number;
}

function LeafletMap({ markers, center, zoom }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const timer = setTimeout(() => {
      if (!mapRef.current) return;

      const map = L.map(mapRef.current).setView(center, zoom);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const medicalIcon = L.divIcon({
        html: `<div style="background: hsl(142, 60%, 45%); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">+</div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      markers.forEach((marker) => {
        L.marker([marker.lat, marker.lng], { icon: medicalIcon })
          .addTo(map)
          .bindPopup(`<strong>${marker.label}</strong>`);
      });

      const userIcon = L.divIcon({
        html: `<div style="position:relative;"><div style="background: hsl(211, 70%, 50%); width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div><div style="position:absolute;top:-5px;left:-5px;width:24px;height:24px;border-radius:50%;background:hsl(211,70%,50%,0.15);"></div></div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      L.marker(center, { icon: userIcon }).addTo(map).bindPopup("Your Location");

      setTimeout(() => map.invalidateSize(), 100);
    }, 50);

    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [markers, center, zoom]);

  return <div ref={mapRef} className="w-full h-full min-h-[300px]" />;
}

export default LeafletMap;
