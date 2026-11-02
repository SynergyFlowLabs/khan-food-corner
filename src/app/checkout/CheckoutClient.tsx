"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Stepper } from "@/components/CartDrawer";
import { Img } from "@/components/ui";
import dynamic from "next/dynamic";
import { cartActions, useCart } from "@/lib/cart-store";
import { deliveryFeeFor, formatPKR } from "@/lib/format";
import { AREAS, SHOP } from "@/lib/shop";
import { type MapLocation } from "@/components/GoogleMapsMapPicker";

const MapPicker = dynamic(
  () =>
    import("@/components/GoogleMapsMapPicker").then(
      (mod) => mod.GoogleMapsMapPicker
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-ink/40 text-sm text-center mt-10">Loading map…</p>
    ),
  }
);

const PAYMENTS = [
  { key: "cod", label: "Cash on delivery", hint: "Pay the rider when your food arrives" },
  { key: "easypaisa", label: "Easypaisa on delivery", hint: "Pay by Easypaisa QR with the rider" },
  { key: "jazzcash", label: "JazzCash on delivery", hint: "Pay by JazzCash QR with the rider" },
];

type Fields = "name" | "phone" | "email" | "area" | "address" | "notes" | "paymentMethod";

export function CheckoutClient() {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [form, setForm] = useState<Record<Fields, string>>({
    name: "",
    phone: "",
    email: "",
    area: "",
    address: "",
    notes: "",
    paymentMethod: "cod",
  });
  const [location, setLocation] = useState<MapLocation | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Fields | "items", string>>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  const fee = deliveryFeeFor(subtotal, SHOP.freeDeliveryAbove, SHOP.deliveryFee);
  const total = subtotal + fee;

  const set = (k: Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const handleLocationSelect = (loc: MapLocation) => {
    setLocation(loc);
    setForm((f) => ({ ...f, address: loc.shortAddress }));
    // Auto-match the delivery area from the reverse-geocoded address.
    const matched = AREAS.find((a) => loc.address.toLowerCase().includes(a.toLowerCase()));
    if (matched) {
      setForm((f) => ({ ...f, area: matched }));
    }
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFormError("");

    const local: typeof errors = {};
    if (form.name.trim().length < 2) local.name = "Please enter your full name";
    if (!/^(?:\+92|0092|92|0)?3\d{9}$/.test(form.phone.replace(/[\s\-()]/g, ""))) local.phone = "Enter a valid mobile number (e.g. 0312 3456789)";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) local.email = "Enter a valid email or leave blank";
    if (!form.area) local.area = "Select your delivery area";
    if (form.address.trim().length < 8) local.address = "Enter a complete delivery address";
    if (Object.keys(local).length) {
      setErrors(local);
      document.querySelector<HTMLElement>(`[name="${Object.keys(local)[0]}"]`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ productId: i.productId, variant: i.variant, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setFormError(data.error || "We couldn't place your order. Please try again.");
        setSubmitting(false);
        return;
      }
      setPlaced(true);
      cartActions.clear();
      router.push(`/order/${data.orderNumber}`);
    } catch {
      setFormError("Network error — please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (!mounted || placed) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-7xl place-items-center px-4">
        <p className="animate-pulse text-sm font-semibold text-ink/50">{placed ? "Placing your order…" : "Loading…"}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-paper text-5xl ring-1 ring-ink/5">🛒</div>
        <h1 className="font-display mt-6 text-4xl font-medium">Your cart is empty</h1>
        <p className="mt-3 text-ink/60">Add something delicious from the menu to get started.</p>
        <Link href="/shop" className="mt-7 rounded-full bg-ember px-8 py-4 text-sm font-bold text-paper hover:bg-ember-dark">
          Browse the menu
        </Link>
      </div>
    );
  }

  const input = (k: Fields) =>
    `h-13 w-full rounded-2xl border bg-paper px-4 py-3.5 text-[0.95rem] outline-none transition focus:ring-4 ${
      errors[k] ? "border-ember focus:ring-ember/15" : "border-ink/15 focus:border-ember focus:ring-ember/10"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10">
        <ol className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em]">
          <li className="text-ink/40">Cart</li>
          <li className="h-px w-8 bg-ink/20" />
          <li className="text-ember">Details</li>
          <li className="h-px w-8 bg-ink/20" />
          <li className="text-ink/40">Confirmed</li>
        </ol>
        <h1 className="font-display mt-4 text-[clamp(2.4rem,5vw,3.8rem)] font-medium leading-none tracking-tight">Checkout</h1>
      </div>

      <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-2xl font-semibold">1. Contact</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}>
                <input name="name" autoComplete="name" value={form.name} onChange={set("name")} className={input("name")} placeholder="Ahmed Khan" />
              </Field>
              <Field label="Mobile number" error={errors.phone}>
                <input name="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} className={input("phone")} placeholder="0312 3456789" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Email (optional)" error={errors.email}>
                  <input name="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} className={input("email")} placeholder="you@example.com" />
                </Field>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">2. Delivery in Rawalpindi</h2>
            <MapPicker onSelect={handleLocationSelect} value={location} className="mb-6" />
            <div className="mt-5 grid gap-4">
              <Field label="Area" error={errors.area}>
                <select name="area" value={form.area} onChange={set("area")} className={input("area")}>
                  <option value="">Select your area…</option>
                  {AREAS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
                {location && <p className="mt-1 text-xs text-ink/40">Pin: {location.address}</p>}
              </Field>
              <Field label="Full address" error={errors.address}>
                <textarea name="address" rows={3} autoComplete="street-address" value={form.address} onChange={set("address")} className={input("address")} placeholder="House / street / nearest landmark" />
              </Field>
              <Field label="Order notes (optional)" error={errors.notes}>
                <input name="notes" value={form.notes} onChange={set("notes")} className={input("notes")} placeholder="Extra spicy, no onions, ring the bell…" />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">3. Payment</h2>
            <div className="mt-5 grid gap-3">
              {PAYMENTS.map((p) => {
                const on = form.paymentMethod === p.key;
                return (
                  <label
                    key={p.key}
                    className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition ${
                      on ? "border-ember bg-ember/5" : "border-ink/10 bg-paper hover:border-ink/30"
                    }`}
                  >
                    <input type="radio" name="paymentMethod" className="sr-only" checked={on} onChange={() => setForm((f) => ({ ...f, paymentMethod: p.key }))} />
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-ember" : "border-ink/30"}`}>
                      {on && <span className="h-2.5 w-2.5 rounded-full bg-ember" />}
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{p.label}</span>
                      <span className="block text-xs text-ink/55">{p.hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside>
          <div className="rounded-3xl bg-paper p-6 ring-1 ring-ink/5 sm:p-8 lg:sticky lg:top-28">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Your order</h2>
              <button type="button" onClick={cartActions.openDrawer} className="text-sm font-bold text-ember hover:underline">
                Edit
              </button>
            </div>
            <ul className="mt-5 max-h-[22rem] divide-y divide-ink/10 overflow-y-auto pr-1">
              {items.map((it) => (
                <li key={it.key} className="flex gap-3.5 py-4">
                  <div className="relative">
                    <Img src={it.image} alt={it.name} className="h-16 w-16 rounded-xl object-cover" />
                    <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.68rem] font-bold text-paper">{it.qty}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display line-clamp-1 font-semibold">{it.name}</p>
                    {it.variant && <p className="text-xs text-ink/50">{it.variant}</p>}
                    <div className="mt-1.5">
                      <Stepper value={it.qty} onChange={(q) => cartActions.setQty(it.key, q)} />
                    </div>
                  </div>
                  <p className="text-sm font-bold">{formatPKR(it.price * it.qty)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-ink/10 pt-5 text-sm">
              <div className="flex justify-between text-ink/70">
                <dt>Subtotal</dt>
                <dd>{formatPKR(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-ink/70">
                <dt>Delivery</dt>
                <dd>{fee === 0 ? <b className="text-emerald-700">Free</b> : formatPKR(fee)}</dd>
              </div>
              {fee > 0 && (
                <p className="text-xs text-ink/50">Add {formatPKR(SHOP.freeDeliveryAbove - subtotal)} more for free delivery.</p>
              )}
              <div className="flex justify-between border-t border-ink/10 pt-4 text-xl font-extrabold">
                <dt>Total</dt>
                <dd>{formatPKR(total)}</dd>
              </div>
            </dl>

            {formError && (
              <p role="alert" className="mt-5 rounded-2xl bg-ember/10 px-4 py-3 text-sm font-semibold text-ember">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ember text-base font-bold text-paper shadow-lg shadow-ember/25 transition hover:bg-ember-dark active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/40 border-t-paper" /> Placing order…
                </>
              ) : (
                `Place order · ${formatPKR(total)}`
              )}
            </button>
            <p className="mt-4 text-center text-xs text-ink/50">Estimated delivery 35–50 minutes · Open {SHOP.hours.toLowerCase()}</p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-ink/55">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-sm font-semibold text-ember">{error}</span>}
    </label>
  );
}
