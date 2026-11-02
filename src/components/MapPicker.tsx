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
const DEBOUNCE_MS = 300;

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

/** Haversine distance in km between two lat/lng points. */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function MapPicker({ onSelect, value, className }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapRefInst = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<
    Array<{ lat: number; lng: number; display_name: string; distKm?: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Reference point used to sort results nearest-first.
  // Defaults to Rawalpindi centre; updated by geolocation or picking a result.
  const [refPoint, setRefPoint] = useState<{ lat: number; lng: number }>({
    lat: CENTER[0],
    lng: CENTER[1],
  });

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
      setRefPoint({ lat, lng });
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
      setRefPoint({ lat: p.lat, lng: p.lng });
      await reverseGeocode(p.lat, p.lng);
    };

    marker.on("dragend", onMove);
    map.on("click", async (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setRefPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
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
    setRefPoint({ lat: value.lat, lng: value.lng });
  }, [value]);

  // Debounced real-time search: fetch + sort nearest-first as the user types.
  const runSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=10&q=${encodeURIComponent(
            q
          )}`,
          { headers: { "User-Agent": NOMINATIM_UA } }
        );
        const data = await res.json();
        type SearchResult = {
          lat: string;
          lon: string;
          display_name: string;
        };
        const withDist = (data as SearchResult[]).map((d) => ({
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
          display_name: d.display_name,
          distKm: haversineKm(refPoint.lat, refPoint.lng, parseFloat(d.lat), parseFloat(d.lon)),
        }));
        // Sort nearest first.
        withDist.sort(
          (a, b) => (a.distKm ?? 0) - (b.distKm ?? 0)
        );
        setResults(withDist);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [refPoint]
  );

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!search.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    debounceTimer.current = setTimeout(() => {
      runSearch(search);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search, runSearch]);

  const pickResult = useCallback(
    (r: { lat: number; lng: number; display_name: string; distKm?: number }) => {
      setResults([]);
      setRefPoint({ lat: r.lat, lng: r.lng });
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

      {/* Controls above the map — clearly visible, not overlapping the map */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1 relative">
          <input
            className="h-11 w-full rounded-xl border-0 bg-paper px-4 py-3 text-sm outline-none ring-1 ring-ink/15 focus:ring-2 focus:ring-ember"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search area / landmark…"
          />
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-ink/40 border-t-paper animate-spin" />
          )}
          {results.length > 0 && (
            <div className="mt-1 bg-paper rounded-xl border border-ink/10 shadow-lg max-h-48 overflow-y-auto z-20">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => pickResult(r)}
                  className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-ember/10 transition border-b border-ink/5 last:border-b-0"
                >
                  <div className="font-medium">{r.display_name}</div>
                  {r.distKm != null && (
                    <span className="text-xs text-ink/40">
                      {r.distKm < 1 ? `${Math.round(r.distKm * 1000)} m` : `${r.distKm.toFixed(1)} km`} away
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            if (!search.trim()) return;
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            runSearch(search);
          }}
          disabled={loading}
          className="shrink-0 h-11 px-5 rounded-xl bg-ember text-xs font-bold text-paper disabled:opacity-60"
        >
          {loading ? "…" : "Find"}
        </button>
        <button
          onClick={handleUseMyLocation}
          disabled={geolocating}
          className="shrink-0 h-11 px-5 rounded-xl border border-ink/15 bg-paper text-xs font-semibold text-ink transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:border-ink/40 sm:whitespace-nowrap"
        >
          {geolocating ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-ink/40 border-t-paper animate-spin" />
              <span className="text-ink/60">Locating…</span>
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
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
          <p className="mt-1 text-xs text-ember">{geoError}</p>
        )}
      </div>

      <div className="rounded-2xl border border-ink/10 bg-paper shadow-sm">
        <div ref={mapRef} className="w-full h-[360px]" />
      </div>
      <p className="mt-2 text-xs text-ink/50 text-center">
        Powered by OpenStreetMap · Drag the pin to refine your spot
      </p>
    </section>
  );
}
