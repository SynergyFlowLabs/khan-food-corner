"use client";

import { useState } from "react";
import { Img } from "@/components/ui";

export function Gallery({
  images,
  name,
  badges,
}: {
  images: string[];
  name: string;
  badges: { bestseller: boolean; isNew: boolean };
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const go = (d: number) => setActive((a) => (a + d + images.length) % images.length);

  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <div
        className="group relative aspect-[5/4] cursor-zoom-in overflow-hidden rounded-[2rem] bg-sand sm:aspect-[4/3.4] lg:aspect-[1/1]"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        {images.map((src, i) => (
          <Img
            key={src}
            src={src}
            alt={`${name} — photo ${i + 1}`}
            priority={i === 0}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
              i === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            style={
              i === active && zoom
                ? { transform: "scale(1.7)", transformOrigin: `${zoom.x}% ${zoom.y}%`, transitionDuration: "200ms" }
                : undefined
            }
          />
        ))}
        <div className="absolute left-4 top-4 flex gap-2">
          {badges.bestseller && <span className="rounded-full bg-saffron px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-wider">Bestseller</span>}
          {badges.isNew && <span className="rounded-full bg-emerald-600 px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-wider text-paper">New</span>}
        </div>
        {images.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper/90 opacity-0 shadow-lg transition hover:bg-paper group-hover:opacity-100 max-lg:opacity-100"
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper/90 opacity-0 shadow-lg transition hover:bg-paper group-hover:opacity-100 max-lg:opacity-100"
              aria-label="Next photo"
            >
              ›
            </button>
            <span className="absolute bottom-4 right-4 rounded-full bg-ink/70 px-3 py-1 text-xs font-bold text-paper backdrop-blur">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className={`aspect-square overflow-hidden rounded-2xl ring-2 ring-offset-2 ring-offset-cream transition ${
                i === active ? "ring-ember" : "opacity-70 ring-transparent hover:opacity-100"
              }`}
            >
              <Img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
