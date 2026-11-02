/** Play a short, pleasant "pluck" sound when an item is added to the cart. */
export function playCartSound() {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") {
    return;
  }
  try {
    const AudioContext = window.AudioContext;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Primary pluck note.
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(1500, now + 0.08);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);

    // Harmony sweetener.
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1400, now + 0.03);
    osc2.frequency.exponentialRampToValueAtTime(1900, now + 0.11);
    gain2.gain.setValueAtTime(0.09, now + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.03);
    osc2.stop(now + 0.18);

    setTimeout(() => ctx.close().catch(() => {}), 250);
  } catch {
    // Audio unavailable or blocked — silently skip.
  }
}
