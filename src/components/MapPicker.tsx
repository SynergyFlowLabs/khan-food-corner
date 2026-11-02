"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Point Leaflet's default marker icons at unpkg so images resolve in Next.js.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CENTER: [number, number] = [33.57, 73.06]; // Rawalpindi / Islamabad
const NOMINATIM_UA = "KhanFoodCorner/1.0";

export type MapLocation = {
  lat: number;
  lng: number;
  address: string; // human readable (display_name)
  shortAddress: string; // street-ish portion, good for the address textarea
};

interface MapPickerProps {
  onSelect: (loc: MapLocation) => void;
  value?: MapLocation | null;
  className?: string;
}

export function MapPicker({ onSelect, value, className }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapRefInst = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<
    Array<{ lat: number; lng: number; display_name: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16`,
          { headers: { "User-Agent": NOMINATIM_UA } }
        );
        const data = await res.json();
        const full = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        const parts = data.address || {};
        // Build a concise street-level address for the textarea.
        const short =
          [parts.house_number, parts.road, parts.suburb, parts.city].filter(
            Boolean
          ).join(", ") || full;
        onSelect({
          lat,
          lng,
          address: full,
          shortAddress: short,
        });
      } catch {
        onSelect({
          lat,
          lng,
          address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          shortAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        });
      }
    },
    [onSelect]
  );

  // Initialize the map once.
  useEffect(() => {
    if (!mapRef.current || mapRefInst.current) return;
    const map = L.map(mapRef.current, {
      center: value ? ([value.lat, value.lng] as [number, number]) : CENTER,
      zoom: 13,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const marker = L.marker(
      value ? ([value.lat, value.lng] as [number, number]) : CENTER,
      { draggable: true }
    ).addTo(map);
    markerRef.current = marker;
    mapRefInst.current = map;

    const onMove = async () => {
      const p = marker.getLatLng();
      await reverseGeocode(p.lat, p.lng);
    };

    marker.on("dragend", onMove);
    map.on("click", async (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      await reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      marker.off("dragend", onMove);
      map.off("click");
      map.remove();
      mapRefInst.current = null;
      markerRef.current = null;
    };
  }, []);

  // Sync marker/map when the external value changes.
  useEffect(() => {
    if (!mapRefInst.current || !value) return;
    mapRefInst.current.setView([value.lat, value.lng] as [number, number], 14);
    markerRef.current?.setLatLng([value.lat, value.lng] as [number, number]);
  }, [value]);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!search.trim()) return;
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(
            search
          )}`,
          { headers: { "User-Agent": NOMINATIM_UA } }
        );
        const data = await res.json();
        setResults(
          data.map((d: any) => ({
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
            display_name: d.display_name,
          }))
        );
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  const pickResult = useCallback(
    (r: { lat: number; lng: number; display_name: string }) => {
      setResults([]);
      mapRefInst.current?.setView([r.lat, r.lng], 15);
      markerRef.current?.setLatLng([r.lat, r.lng]);
      onSelect({
        lat: r.lat,
        lng: r.lng,
        address: r.display_name,
        shortAddress: r.display_name,
      });
    },
    [onSelect]
  );

  return (
    <section className={className}>
      <h2 className="font-display text-2xl font-semibold mb-2">2. Pick your delivery location</h2>
      <p className="text-sm text-ink/60 mb-4">
        Drag the pin (or tap the map) to your exact spot — the address fills in automatically.
      </p>
      <div className="rounded-2xl border border-ink/10 bg-paper overflow-hidden shadow-sm">
        <div className="relative h-[360px]">
          <div ref={mapRef} className="w-full h-full" />
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                className="h-10 w-64 rounded-xl border-0 bg-paper px-3 py-2 text-sm outline-none ring-1 ring-ink/15 focus:ring-2 focus:ring-ember"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search area / landmark…"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-10 px-3 rounded-xl bg-ember text-xs font-bold text-paper disabled:opacity-60"
              >
                {loading ? "…" : "Find"}
              </button>
            </form>
            {results.length > 0 && (
              <div className="bg-paper rounded-xl border border-ink/10 shadow-lg max-h-48 overflow-y-auto z-[40]">
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => pickResult(r)}
                    className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-ember/10 transition"
                  >
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-ink/50 text-center">
          Powered by OpenStreetMap · Drag the pin to refine your spot
        </p>
      </div>
    </section>
  );
}
