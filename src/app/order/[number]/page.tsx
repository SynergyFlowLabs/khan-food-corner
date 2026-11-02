import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Img } from "@/components/ui";
import { getOrderByNumber } from "@/lib/data";
import { formatPKR } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

const PAY: Record<string, string> = {
  cod: "Cash on delivery",
  easypaisa: "Easypaisa on delivery",
  jazzcash: "JazzCash on delivery",
};

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const data = await getOrderByNumber(number);
  if (!data) notFound();
  const { order, items } = data;

  const steps = [
    { label: "Order received", done: true },
    { label: "Being prepared", done: false },
    { label: "Out for delivery", done: false },
    { label: "Delivered", done: false },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="text-center">
        <div className="rise mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-600 text-paper shadow-xl shadow-emerald-600/30">
          <svg viewBox="0 0 24 24" width="38" height="38" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.25em] text-ember">Order confirmed</p>
        <h1 className="font-display mt-3 text-[clamp(2.4rem,6vw,4rem)] font-medium leading-none tracking-tight">Shukriya, {order.name.split(" ")[0]}!</h1>
        <p className="mt-4 text-ink/65">
          Your order <b className="text-ink">{order.orderNumber}</b> is in our kitchen. We&apos;ll call <b className="text-ink">{order.phone}</b> if we need anything.
        </p>
        <p className="mx-auto mt-5 inline-block rounded-full bg-saffron/25 px-5 py-2 text-sm font-bold">Estimated delivery: 35–50 minutes</p>
      </div>

      <ol className="mx-auto mt-12 grid grid-cols-4 gap-2">
        {steps.map((s, i) => (
          <li key={s.label} className="text-center">
            <div className={`h-1.5 rounded-full ${s.done ? "bg-emerald-600" : "bg-sand"}`} />
            <p className={`mt-2 text-[0.7rem] font-bold leading-tight sm:text-xs ${s.done ? "text-emerald-700" : "text-ink/40"}`}>{s.label}</p>
            <span className="sr-only">Step {i + 1}</span>
          </li>
        ))}
      </ol>

      <div className="mt-12 rounded-3xl bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
        <h2 className="font-display text-2xl font-semibold">Order summary</h2>
        <ul className="mt-5 divide-y divide-ink/10">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-4 py-4">
              {it.image && <Img src={it.image} alt={it.name} className="h-16 w-16 rounded-xl object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold">{it.name}</p>
                <p className="text-sm text-ink/55">
                  {it.variantName ? `${it.variantName} · ` : ""}Qty {it.quantity}
                </p>
              </div>
              <p className="font-bold">{formatPKR(it.unitPrice * it.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-2 border-t border-ink/10 pt-5 text-sm">
          <div className="flex justify-between text-ink/70"><dt>Subtotal</dt><dd>{formatPKR(order.subtotal)}</dd></div>
          <div className="flex justify-between text-ink/70"><dt>Delivery</dt><dd>{order.deliveryFee === 0 ? "Free" : formatPKR(order.deliveryFee)}</dd></div>
          <div className="flex justify-between pt-2 text-xl font-extrabold"><dt>Total</dt><dd>{formatPKR(order.total)}</dd></div>
        </dl>

        <div className="mt-8 grid gap-6 border-t border-ink/10 pt-6 text-sm sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] text-ink/50">Delivering to</h3>
            <p className="mt-2 leading-relaxed">{order.name}<br />{order.address}<br />{order.area}, Rawalpindi</p>
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] text-ink/50">Payment</h3>
            <p className="mt-2">{PAY[order.paymentMethod] ?? order.paymentMethod}</p>
            {order.notes && (<><h3 className="mt-4 text-xs font-extrabold uppercase tracking-[0.18em] text-ink/50">Notes</h3><p className="mt-2">{order.notes}</p></>)}
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="rounded-full bg-ember px-8 py-4 text-sm font-bold text-paper hover:bg-ember-dark">Order something else</Link>
        <Link href="/" className="rounded-full border-2 border-ink px-8 py-3.5 text-sm font-bold hover:bg-ink hover:text-paper">Back home</Link>
      </div>
    </div>
  );
}
