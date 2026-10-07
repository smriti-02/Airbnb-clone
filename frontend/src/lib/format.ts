export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateKey(date: Date): string {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatSearchDates(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn || !checkOut) return "";
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const m1 = d1.toLocaleString('en-US', { month: 'short' });
  const m2 = d2.toLocaleString('en-US', { month: 'short' });
  if (m1 === m2) {
    return `${d1.getDate()}-${d2.getDate()} ${m1}`;
  }
  return `${d1.getDate()} ${m1}-${d2.getDate()} ${m2}`;
}
