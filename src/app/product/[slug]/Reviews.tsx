"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Stars } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import type { Review } from "@/lib/types";

export function Reviews({
  productId,
  productName,
  reviews,
  rating,
}: {
  productId: number;
  productName: string;
  reviews: Review[];
  rating: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [sort, setSort] = useState<"recent" | "high" | "low">("recent");
  const [visible, setVisible] = useState(4);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ author: "", area: "", rating: 5, title: "", body: "" });
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  const breakdown = useMemo(() => {
    const b = [0, 0, 0, 0, 0];
    reviews.forEach((r) => b[r.rating - 1]++);
    return b;
  }, [reviews]);

  const sorted = useMemo(() => {
    const list = [...reviews];
    if (sort === "high") list.sort((a, b) => b.rating - a.rating);
    if (sort === "low") list.sort((a, b) => a.rating - b.rating);
    return list;
  }, [reviews, sort]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit review");
      setStatus("done");
      setForm({ author: "", area: "", rating: 5, title: "", body: "" });
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("idle");
    }
  }

  const field =
    "w-full rounded-2xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition focus:border-ember focus:ring-4 focus:ring-ember/10";

  return (
    <section id="reviews" className="scroll-mt-28 pt-24">
      <h2 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] font-medium tracking-tight">Customer reviews</h2>

      <div className="mt-8 grid gap-10 lg:grid-cols-[20rem_1fr] lg:gap-16">
        <div>
          <div className="rounded-3xl bg-paper p-7 ring-1 ring-ink/5">
            <div className="flex items-end gap-4">
              <span className="font-display text-6xl font-semibold leading-none">{rating ? rating.toFixed(1) : "–"}</span>
              <div className="pb-1">
                <Stars value={rating} size={18} />
                <p className="mt-1 text-sm text-ink/55">{reviews.length} reviews</p>
              </div>
            </div>
            <ul className="mt-6 space-y-2.5">
              {[5, 4, 3, 2, 1].map((s) => {
                const n = breakdown[s - 1];
                const pct = reviews.length ? (n / reviews.length) * 100 : 0;
                return (
                  <li key={s} className="flex items-center gap-3 text-sm">
                    <span className="w-6 font-semibold">{s}★</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand">
                      <span className="block h-full rounded-full bg-saffron transition-all duration-700" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-6 text-right text-ink/50">{n}</span>
                  </li>
                );
              })}
            </ul>
            <button
              onClick={() => setFormOpen((o) => !o)}
              className="mt-7 h-12 w-full rounded-full bg-ink text-sm font-bold text-paper transition hover:bg-ember"
            >
              {formOpen ? "Close form" : "Write a review"}
            </button>
          </div>
        </div>

        <div>
          {formOpen && (
            <div className="mb-8 rounded-3xl bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
              {status === "done" ? (
                <div className="py-6 text-center">
                  <p className="text-4xl">🙏</p>
                  <h3 className="font-display mt-3 text-2xl font-semibold">Thank you!</h3>
                  <p className="mt-1 text-ink/60">Your review of {productName} is now live.</p>
                  <button onClick={() => { setStatus("idle"); setFormOpen(false); }} className="mt-5 text-sm font-bold text-ember underline">
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <h3 className="font-display text-2xl font-semibold">Rate {productName}</h3>
                  <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseEnter={() => setHover(s)}
                        onClick={() => setForm({ ...form, rating: s })}
                        aria-label={`${s} star${s > 1 ? "s" : ""}`}
                        className={`text-3xl transition-transform hover:scale-125 ${s <= (hover || form.rating) ? "text-saffron" : "text-ink/15"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className={field} placeholder="Your name *" required maxLength={60} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
                    <input className={field} placeholder="Area (e.g. Saddar)" maxLength={60} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
                  </div>
                  <input className={field} placeholder="Review title *" required maxLength={100} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  <textarea className={field} placeholder="Tell us about the taste, portion and delivery… *" required minLength={10} maxLength={1000} rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
                  {error && <p className="text-sm font-semibold text-ember">{error}</p>}
                  <button disabled={status === "sending"} className="h-12 rounded-full bg-ember px-8 text-sm font-bold text-paper transition hover:bg-ember-dark disabled:opacity-60">
                    {status === "sending" ? "Submitting…" : "Submit review"}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-ink/55">Showing {Math.min(visible, sorted.length)} of {sorted.length}</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="h-10 rounded-full border border-ink/15 bg-paper px-4 text-sm font-semibold outline-none"
              aria-label="Sort reviews"
            >
              <option value="recent">Most recent</option>
              <option value="high">Highest rated</option>
              <option value="low">Lowest rated</option>
            </select>
          </div>

          {reviews.length === 0 ? (
            <p className="py-10 text-ink/60">No reviews yet — be the first to share your thoughts.</p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {sorted.slice(0, visible).map((r) => (
                <li key={r.id} className="py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-ember to-saffron font-bold text-paper">
                        {r.author[0]?.toUpperCase()}
                      </span>
                      <div>
                        <p className="font-bold">{r.author}</p>
                        <p className="text-xs text-ink/50">
                          {r.area ? `${r.area} · ` : ""}
                          {timeAgo(r.createdAt)}
                        </p>
                      </div>
                    </div>
                    {r.verified && (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">✓ Verified buyer</span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Stars value={r.rating} size={15} />
                    <h4 className="font-bold">{r.title}</h4>
                  </div>
                  <p className="mt-2 leading-relaxed text-ink/70">{r.body}</p>
                </li>
              ))}
            </ul>
          )}

          {visible < sorted.length && (
            <button
              onClick={() => setVisible((v) => v + 4)}
              className="mt-4 h-12 rounded-full border-2 border-ink px-7 text-sm font-bold transition hover:bg-ink hover:text-paper"
            >
              Show more reviews
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
