"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const CENTER = { lat: 33.57, lng: 73.06 }; // Rawalpindi / Islamabad
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export type MapLocation = {
  lat: number;
  lng: number;
  address: string; // human readable (formatted_address)
  shortAddress: string; // street-ish portion, good for the address textarea
};

interface GoogleMapsMapPickerProps {
  onSelect: (loc: MapLocation) => void;
  value?: MapLocation | null;
  className?: string;
}

export function GoogleMapsMapPicker({
  onSelect,
  value,
  className,
}: GoogleMapsMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapRefInst = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<
    Array<{
      placeId: string;
      description: string;
      lat: number;
      lng: number;
      distKm?: number;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<
    ReturnType<typeof setTimeout> | null
  >(null);

  // Load Google Maps JavaScript API
  useEffect(() => {
    if (!API_KEY) {
      setMapsError(
        "Google Maps API key not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY."
      );
      return;
    }
    const loader = new Loader({
      apiKey: API_KEY,
      version: "weekly",
      libraries: ["places", "geometry"],
    });
    (loader as any)
      .load()
      .then(() => {
        setMapsLoaded(true);
        setMapsError(null);
      })
      .catch((err: any) => {
        setMapsError("Failed to load Google Maps. Check your API key.");
        console.error(err);
      });
    return () => {
      // Loader doesn't expose an unload; safe to ignore.
    };
  }, [API_KEY]);

  // Initialize the map once Google Maps is loaded.
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapRefInst.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: value
        ? { lat: value.lat, lng: value.lng }
        : CENTER,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapRefInst.current = map;
    geocoderRef.current = new window.google.maps.Geocoder();

    const marker = new window.google.maps.Marker({
      position: value
        ? { lat: value.lat, lng: value.lng }
        : CENTER,
      map,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });
    markerRef.current = marker;

    const dragListener = marker.addListener("dragend", async () => {
      const pos = marker.getPosition();
      if (!pos) return;
      await reverseGeocode(pos.lat(), pos.lng());
    });
    const clickListener = map.addListener("click", async (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      marker.setPosition({ lat, lng });
      map.setCenter({ lat, lng });
      await reverseGeocode(lat, lng);
    });

    return () => {
      google.maps.event.removeListener(dragListener);
      google.maps.event.removeListener(clickListener);
      mapRefInst.current = null;
      markerRef.current = null;
      geocoderRef.current = null;
    };
  }, [mapsLoaded, value]);

  // Sync marker/map when external value changes.
  useEffect(() => {
    if (!mapRefInst.current || !value) return;
    mapRefInst.current.setCenter({ lat: value.lat, lng: value.lng });
    mapRefInst.current.setZoom(14);
    markerRef.current?.setPosition({ lat: value.lat, lng: value.lng });
  }, [value]);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!geocoderRef.current) return;
      try {
        const results = await geocoderRef.current
          .geocode({ location: { lat, lng } })
          .then((r: any) => r[0]);
        const res = results;
        if (!res?.formatted_address) {
          onSelect({
            lat,
            lng,
            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            shortAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          });
          return;
        }
        const full = res.formatted_address;
        const short = extractShortAddress(res);
        onSelect({ lat, lng, address: full, shortAddress: short });
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

  const extractShortAddress = (res: any): string => {
    const comps = res.address_components ?? [];
    const streetNumber = comps.find((c: any) =>
      c.types.includes("street_number")
    )?.long_name;
    const route = comps.find((c: any) => c.types.includes("route"))?.long_name;
    const sublocality = comps.find((c: any) =>
      c.types.includes("sublocality")
    )?.long_name;
    const locality = comps.find((c: any) => c.types.includes("locality"))?.long_name;
    const parts = [streetNumber, route, sublocality, locality].filter(Boolean);
    return parts.length ? parts.join(", ") : res.formatted_address;
  };

  // Real-time Places Autocomplete search, sorted nearest-first.
  const runSearch = useCallback(async (q: string) => {
    if (!q.trim() || !mapRefInst.current) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const service = new window.google.maps.places.AutocompleteService();
      const response: any = await service.getPlacePredictions({
        input: q,
        location: mapRefInst.current.getCenter(),
        radius: 50000, // 50 km around the map center
        componentRestrictions: { country: "pk" },
      });

      const withDist = (response.predictions ?? []).map((p: any) => {
        const latLng = p.location
          ? { lat: p.location.lat(), lng: p.location.lng() }
          : null;
        let distKm: number | undefined;
        if (latLng && mapRefInst.current) {
          const center = mapRefInst.current.getCenter();
          distKm =
            (window.google.maps.geometry.spherical.computeDistanceBetween(
              center,
              latLng
            ) as number) / 1000;
        }
        return {
          placeId: p.place_id,
          description: p.description,
          lat: latLng?.lat ?? 0,
          lng: latLng?.lng ?? 0,
          distKm,
        };
      });

      // Sort nearest first.
      withDist.sort((a: any, b: any) => (a.distKm ?? 0) - (b.distKm ?? 0));
      setResults(withDist);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (!search.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      runSearch(search);
    }, 300);
    setDebounceTimer(timer);
    return () => {
      clearTimeout(timer);
    };
  }, [search, runSearch]);

  const pickResult = useCallback(
    async (r: {
      placeId: string;
      description: string;
      lat: number;
      lng: number;
      distKm?: number;
    }) => {
      setResults([]);
      mapRefInst.current?.setCenter({ lat: r.lat, lng: r.lng });
      mapRefInst.current?.setZoom(16);
      markerRef.current?.setPosition({ lat: r.lat, lng: r.lng });

      // Get full formatted address via Geocoder for the selected place.
      if (geocoderRef.current) {
        try {
          const results = await geocoderRef.current
            .geocode({ placeId: r.placeId })
            .then((r: any) => r[0]);
          const res = results;
          if (res?.formatted_address) {
            const full = res.formatted_address;
            const short = extractShortAddress(res);
            onSelect({ lat: r.lat, lng: r.lng, address: full, shortAddress: short });
            return;
          }
        } catch {
          // fall through to description
        }
      }
      onSelect({
        lat: r.lat,
        lng: r.lng,
        address: r.description,
        shortAddress: r.description,
      });
    },
    [onSelect, extractShortAddress]
  );

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
        mapRefInst.current?.setCenter({ lat: latitude, lng: longitude });
        mapRefInst.current?.setZoom(16);
        markerRef.current?.setPosition({ lat: latitude, lng: longitude });
        setGeolocating(false);
        await reverseGeocode(latitude, longitude);
      },
      (err: any) => {
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
  }, [reverseGeocode]);

  // Maps not configured / error state.
  if (mapsError) {
    return (
      <section className={className}>
        <h2 className="font-display text-2xl font-semibold mb-2">
          2. Pick your delivery location
        </h2>
        <div className="rounded-2xl border border-ember/10 bg-ember/5 p-6 text-center">
          <p className="text-sm font-semibold text-ember">
            {mapsError}
          </p>
          <p className="mt-2 text-xs text-ink/50">
            Add your Google Maps API key to .env as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            and restart the dev server.
          </p>
        </div>
      </section>
    );
  }

  if (!mapsLoaded) {
    return (
      <section className={className}>
        <h2 className="font-display text-2xl font-semibold mb-2">
          2. Pick your delivery location
        </h2>
        <p className="text-sm text-ink/60 text-center mt-10">
          Loading map…
        </p>
      </section>
    );
  }

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
                  <div className="font-medium">{r.description}</div>
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
            if (debounceTimer) clearTimeout(debounceTimer);
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
        Powered by Google Maps · Drag the pin to refine your spot
      </p>
    </section>
  );
}
