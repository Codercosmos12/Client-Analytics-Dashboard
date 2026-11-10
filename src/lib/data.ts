export type RangeKey = "7D" | "30D" | "12M";

export type MetricPoint = {
  date: string;
  label: string;
  fullLabel: string;
  revenue: number;
  conversion: number;
  users: number;
};

export type Status = "Completed" | "Pending" | "In review";

export type Activity = {
  id: string;
  client: string;
  company: string;
  status: Status;
  amount: number;
  channel: string;
  updated: string;
};

export type ViewId = "overview" | "analytics" | "clients" | "revenue" | "reports" | "settings";

export const AS_OF_LABEL = "Nov 10, 2026";

export const RANGES: RangeKey[] = ["7D", "30D", "12M"];

export const RANGE_LABEL: Record<RangeKey, string> = {
  "7D": "7 days",
  "30D": "30 days",
  "12M": "12 months",
};

export const VIEW_COPY: Record<ViewId, { title: string; lede: string }> = {
  overview: {
    title: "Overview",
    lede: "Revenue, conversion, and client activity in one calm view.",
  },
  analytics: {
    title: "Analytics",
    lede: "Follow revenue and conversion across the range you select.",
  },
  clients: {
    title: "Clients",
    lede: "Search the activity log by client or status, then export the match.",
  },
  revenue: {
    title: "Revenue",
    lede: "Trailing totals beside the same series shown on the overview.",
  },
  reports: {
    title: "Reports",
    lede: "A snapshot of the trailing year, ready to export.",
  },
  settings: {
    title: "Settings",
    lede: "Theme and sidebar preferences saved in this browser.",
  },
};

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makePoints(
  count: number,
  step: "day" | "month",
  seed: number,
  revenueBase: number,
  userBase: number,
): MetricPoint[] {
  const rand = mulberry32(seed);
  const points: MetricPoint[] = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    const date =
      step === "day"
        ? new Date(Date.UTC(2026, 10, 10) - index * 86400000)
        : new Date(Date.UTC(2026, 10 - index, 1));
    const t = count - index;
    const revenue = Math.round(revenueBase * (0.8 + rand() * 0.4 + Math.sin(t / 2.5) * 0.1));
    const users = Math.round(userBase * (0.88 + rand() * 0.24 + Math.cos(t / 3) * 0.04));
    const conversion =
      Math.round(
        Math.min(7.2, Math.max(2.2, 3.5 + rand() * 2.1 + Math.sin(t / 2) * 0.45)) * 100,
      ) / 100;
    const fullLabel = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
      ...(step === "day" ? { day: "numeric" } : {}),
    }).format(date);
    const label = new Intl.DateTimeFormat("en-US", {
      month: "short",
      timeZone: "UTC",
      ...(step === "day" ? { day: "numeric" } : {}),
    }).format(date);

    points.push({
      date: date.toISOString().slice(0, 10),
      label,
      fullLabel,
      revenue,
      conversion,
      users,
    });
  }

  return points;
}

export const series: Record<RangeKey, MetricPoint[]> = {
  "7D": makePoints(7, "day", 11, 14200, 8600),
  "30D": makePoints(30, "day", 29, 14200, 8600),
  "12M": makePoints(12, "month", 48, 265000, 9400),
};

function percentChange(current: number, previous: number) {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

const months = series["12M"];
const latest = months[months.length - 1];
const previous = months[months.length - 2];

export const kpis = [
  {
    id: "revenue" as const,
    label: "Total Revenue",
    footnote: "Trailing 12 months",
    value: months.reduce((sum, point) => sum + point.revenue, 0),
    kind: "currency" as const,
    delta: percentChange(latest.revenue, previous.revenue),
    deltaKind: "percent" as const,
    deltaCaption: "last month vs prior",
  },
  {
    id: "users" as const,
    label: "Active Users",
    footnote: "Latest month",
    value: latest.users,
    kind: "number" as const,
    delta: percentChange(latest.users, previous.users),
    deltaKind: "percent" as const,
    deltaCaption: "last month vs prior",
  },
  {
    id: "conversion" as const,
    label: "Net Conversion",
    footnote: "12-month average",
    value: months.reduce((sum, point) => sum + point.conversion, 0) / months.length,
    kind: "percent" as const,
    delta: latest.conversion - previous.conversion,
    deltaKind: "points" as const,
    deltaCaption: "last month vs prior",
  },
];

export function rangeSummary(points: MetricPoint[]) {
  const revenue = points.reduce((sum, point) => sum + point.revenue, 0);
  const conversion = points.reduce((sum, point) => sum + point.conversion, 0) / points.length;
  const first = points[0];
  const last = points[points.length - 1];
  const revenueDelta = percentChange(last.revenue, first.revenue);
  return { revenue, conversion, revenueDelta };
}

const FIRST = [
  "Helena",
  "Jonas",
  "Amira",
  "Theo",
  "Priya",
  "Mateo",
  "Naomi",
  "Leo",
  "Sofia",
  "Jonah",
  "Aisha",
  "Hugo",
  "Mina",
  "Ellis",
  "Carmen",
  "Noah",
  "Yara",
  "Felix",
  "Ines",
  "Omar",
  "Lila",
  "Soren",
  "Adele",
  "Kai",
];

const LAST = [
  "Voss",
  "Okada",
  "Rahman",
  "Ibarra",
  "Shah",
  "Alvarez",
  "Berg",
  "Costa",
  "Nwosu",
  "Petrov",
  "Diallo",
  "Moreau",
  "Cho",
  "Adler",
  "Silva",
  "Grant",
  "Haddad",
  "Meyer",
  "Duarte",
  "Farouk",
  "Nguyen",
  "Lind",
  "Marin",
  "Abe",
];

const COMPANIES = [
  "Northwind",
  "Lumen Field",
  "Paper & Pine",
  "Halcyon",
  "Kite Studio",
  "Brightloom",
  "Sable",
  "Marlow",
  "Kindred",
  "Atlas Row",
  "Velvet Pixel",
  "Harbor & Co",
];

const CHANNELS = ["Direct", "Referral", "Organic", "Paid", "Partner"];
const STATUS_PATTERN: Status[] = ["Completed", "Completed", "Pending", "Completed", "In review", "Pending"];

export const activities: Activity[] = Array.from({ length: 24 }, (_, index) => {
  const rand = mulberry32(1000 + index * 17);
  const updated = new Date(Date.UTC(2026, 10, 10, 15, 0, 0) - index * 36 * 3600 * 1000);
  return {
    id: `CL-${2400 + index}`,
    client: `${FIRST[index]} ${LAST[(index * 3) % LAST.length]}`,
    company: COMPANIES[index % COMPANIES.length],
    status: STATUS_PATTERN[index % STATUS_PATTERN.length],
    amount: Math.round(1800 + rand() * 42000),
    channel: CHANNELS[Math.floor(rand() * CHANNELS.length)],
    updated: updated.toISOString(),
  };
});

export function channelMix(rows: Activity[]) {
  const totals = new Map<string, number>();
  for (const row of rows) {
    totals.set(row.channel, (totals.get(row.channel) ?? 0) + row.amount);
  }
  const entries = [...totals.entries()].map(([channel, amount]) => ({ channel, amount }));
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  return entries
    .map((entry) => ({
      ...entry,
      share: total === 0 ? 0 : (entry.amount / total) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function downloadActivityCsv(rows: Activity[]) {
  const header = ["ID", "Client", "Company", "Status", "Amount", "Channel", "Updated"];
  const cell = (value: string | number) => {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  const lines = rows.map((row) =>
    [row.id, row.client, row.company, row.status, row.amount, row.channel, row.updated].map(cell).join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "client-activity.csv";
  link.click();
  URL.revokeObjectURL(url);
}
