"use client";

import { ArrowDownRight, ArrowUpRight, Percent, Users, Wallet } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { kpis, series, type MetricPoint } from "@/lib/data";
import { useCountUp } from "@/lib/use-count-up";
import { cn, formatCurrency, formatDelta, formatNumber, formatPercent } from "@/lib/utils";

const ICONS = {
  revenue: Wallet,
  users: Users,
  conversion: Percent,
} as const;

function formatValue(kind: "currency" | "number" | "percent", value: number) {
  if (kind === "currency") return formatCurrency(value);
  if (kind === "number") return formatNumber(value);
  return formatPercent(value);
}

function SparkTip({
  active,
  payload,
  kind,
}: {
  active?: boolean;
  payload?: Array<{ payload?: MetricPoint }>;
  kind: "currency" | "number" | "percent";
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const point = payload[0].payload;
  const value =
    kind === "currency" ? point.revenue : kind === "number" ? point.users : point.conversion;
  return (
    <div className="glass-tip px-2.5 py-1.5 text-xs">
      <p className="text-[var(--muted)]">{point.fullLabel}</p>
      <p className="tabular font-semibold">{formatValue(kind, value)}</p>
    </div>
  );
}

function Sparkline({
  dataKey,
  kind,
  active,
}: {
  dataKey: "revenue" | "users" | "conversion";
  kind: "currency" | "number" | "percent";
  active: boolean;
}) {
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series["30D"]} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
          <Tooltip
            cursor={{ stroke: "var(--orchid)", strokeWidth: 1 }}
            content={<SparkTip kind={kind} />}
            wrapperStyle={{ zIndex: 20, outline: "none" }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={active ? "var(--orchid)" : "var(--accent)"}
            strokeWidth={active ? 2.5 : 1.75}
            fill={active ? "rgba(218, 112, 214, 0.22)" : "rgba(138, 43, 226, 0.16)"}
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 3.5, fill: "var(--orchid)", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiCard({ kpi }: { kpi: (typeof kpis)[number] }) {
  const animated = useCountUp(kpi.value, 1500);
  const [hovered, setHovered] = useState(false);
  const Icon = ICONS[kpi.id];
  const positive = kpi.delta >= 0;
  const finalLabel = formatValue(kpi.kind, kpi.value);

  return (
    <article
      className="glass-card flex flex-col gap-3 p-5"
      aria-label={`${kpi.label} ${finalLabel}, ${formatDelta(kpi.delta, kpi.deltaKind)} ${kpi.deltaCaption}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--muted)]">{kpi.label}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{kpi.footnote}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--accent)]/20 text-[var(--orchid)] shadow-[0_0_16px_rgba(138,43,226,0.35)]">
          <Icon size={18} />
        </span>
      </div>
      <p className="tabular text-3xl font-semibold tracking-tight" aria-hidden>
        {formatValue(kpi.kind, animated)}
      </p>
      <p className={cn("flex items-center gap-1.5 text-sm", positive ? "text-[#9af7d0]" : "text-[#f5c16c]")}>
        {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        <span className="tabular font-medium">{formatDelta(kpi.delta, kpi.deltaKind)}</span>
        <span className="text-[var(--muted)]">{kpi.deltaCaption}</span>
      </p>
      <Sparkline dataKey={kpi.id} kind={kpi.kind} active={hovered} />
      <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">30-day trend</p>
    </article>
  );
}

export function KpiCards() {
  return (
    <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </section>
  );
}
