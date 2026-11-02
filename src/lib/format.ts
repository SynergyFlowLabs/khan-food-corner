export function formatPKR(n: number) {
  return `Rs ${n.toLocaleString("en-PK")}`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return `${Math.floor(months / 12)} yr ago`;
}

export function deliveryFeeFor(subtotal: number, threshold: number, fee: number) {
  return subtotal === 0 || subtotal >= threshold ? 0 : fee;
}
