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
  const [geolocating, setGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

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

  const setPosition = useCallback(
    async (lat: number, lng: number, zoom = 15) => {
      mapRefInst.current?.setView([lat, lng] as [number, number], zoom);
      markerRef.current?.setLatLng([lat, lng] as [number, number]);
      await reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  // Use the browser's Geolocation API to centre the map on the user's spot.
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Your browser doesn't support location services.");
      return;
    }
    setGeolocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await setPosition(latitude, longitude);
        setGeolocating(false);
      },
      (err) => {
        setGeolocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError("Location access was denied.");
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            setGeoError("Location request timed out.");
            break;
          default:
            setGeoError("Unable to retrieve your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [setPosition]);

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
      setResults([]);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=8&q=${encodeURIComponent(
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
      setPosition(r.lat, r.lng, 15);
      onSelect({
        lat: r.lat,
        lng: r.lng,
        address: r.display_name,
        shortAddress: r.display_name,
      });
    },
    [setPosition, onSelect]
  );

  return (
    <section className={className}>
      <h2 className="font-display text-2xl font-semibold mb-2">
        2. Pick your delivery location
      </h2>
      <p className="text-sm text-ink/60 mb-4">
        Drag the pin (or tap the map) to your exact spot — the address fills in
        automatically.
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
            <button
              onClick={handleUseMyLocation}
              disabled={geolocating}
              className="w-full h-9 rounded-xl border border-ink/15 bg-paper px-3 py-2 text-xs font-semibold text-ink transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 hover:border-ink/40"
            >
              {geolocating ? (
                <>
                  <span className="h-3 w-3 rounded-full border-2 border-ink/40 border-t-paper animate-spin" />
                  <span className="text-ink/60">Locating…</span>
                </>
              ) : (
                <>
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  <span>Use my current location</span>
                </>
              )}
            </button>
            {geoError && (
              <p className="text-xs text-ember mt-1">{geoError}</p>
            )}
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
