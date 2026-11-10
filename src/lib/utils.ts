export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatCurrency(value: number) {
  return currency.format(value);
}

export function formatCompact(value: number) {
  return compact.format(value);
}

export function formatNumber(value: number) {
  return integer.format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

export function formatDelta(value: number, kind: "percent" | "points") {
  const sign = value > 0 ? "+" : "";
  if (kind === "points") return `${sign}${value.toFixed(2)} pp`;
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDateUTC(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
