"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* eslint-disable @next/next/no-img-element */

export function Img({
  src,
  alt,
  className = "",
  priority = false,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  style?: CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#2a211b] to-[#14110f] text-4xl ${className}`}
        role="img"
        aria-label={alt}
      >
        🍔
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
      style={style}
    />
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <svg viewBox="0 0 20 20" width={size} height={size} className="absolute inset-0 text-ink/15" fill="currentColor">
              <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 15l-5.4 3 1.2-6L1.3 7.8l6.1-.7L10 1.5z" />
            </svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg viewBox="0 0 20 20" width={size} height={size} className="text-saffron" fill="currentColor">
                <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 15l-5.4 3 1.2-6L1.3 7.8l6.1-.7L10 1.5z" />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${shown ? "reveal-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export function SpiceMeter({ level, showLabel = false }: { level: number; showLabel?: boolean }) {
  const labels = ["Mild", "Medium", "Hot", "Extra hot"];
  if (level === 0 && !showLabel) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ember" title={labels[level]}>
      <span className="inline-flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <svg key={i} viewBox="0 0 16 16" width="12" height="12" className={i <= level ? "text-ember" : "text-ink/15"} fill="currentColor">
            <path d="M8 .8c.5 2.6 3.6 3.9 3.6 7.2A3.6 3.6 0 0 1 8 11.6 3.6 3.6 0 0 1 4.4 8c0-1.4.6-2.2 1.3-3 .1.9.5 1.4 1 1.7C6.6 4 7 2.4 8 .8zM8 15.2c-2 0-3.4-1-3.4-2.3 0-.4.3-.8.6-1a5.5 5.5 0 0 0 2.8.7 5.5 5.5 0 0 0 2.8-.7c.3.2.6.6.6 1 0 1.3-1.4 2.3-3.4 2.3z" />
          </svg>
        ))}
      </span>
      {showLabel && <span>{labels[level]}</span>}
    </span>
  );
}
