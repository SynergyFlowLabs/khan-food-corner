import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-6xl">🍟</p>
      <h1 className="font-display mt-6 text-5xl font-medium">Oops — nothing here.</h1>
      <p className="mt-3 text-ink/60">That page seems to have been eaten. Let&apos;s get you back to the good stuff.</p>
      <Link href="/shop" className="mt-8 rounded-full bg-ember px-8 py-4 text-sm font-bold text-paper hover:bg-ember-dark">
        Back to the menu
      </Link>
    </div>
  );
}
