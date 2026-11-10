"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RANGE_LABEL, RANGES, rangeSummary, series, type MetricPoint, type RangeKey } from "@/lib/data";
import { cn, formatCompact, formatCurrency, formatDelta, formatPercent } from "@/lib/utils";

type TipPayload = {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: MetricPoint;
};

function ChartTooltip({
  active,
  payload,
  coordinate,
}: {
  active?: boolean;
  payload?: TipPayload[];
  coordinate?: { x?: number; y?: number };
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  return (
    <div className="glass-tip min-w-[210px] px-3.5 py-3 text-sm">
      <p className="font-medium">{point?.fullLabel}</p>
      <p className="mt-0.5 text-xs text-[var(--muted)]">{point?.date}</p>
      <dl className="mt-3 space-y-1.5">
        {payload.map((item) => {
          const numeric = Number(item.value);
          const text = item.dataKey === "conversion" ? formatPercent(numeric) : formatCurrency(numeric);
          return (
            <div key={String(item.dataKey)} className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-2 text-[var(--muted)]">
                <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                {item.name}
              </dt>
              <dd className="tabular font-semibold">{text}</dd>
            </div>
          );
        })}
      </dl>
      {coordinate?.x != null && coordinate.y != null && (
        <p className="tabular mt-3 text-[11px] text-[var(--muted)]">
          Cursor {Math.round(coordinate.x)}, {Math.round(coordinate.y)}
        </p>
      )}
    </div>
  );
}

type MetricsChartProps = {
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
};

export function MetricsChart({ range, onRangeChange }: MetricsChartProps) {
  const [mounted, setMounted] = useState(false);
  const [showRevenue, setShowRevenue] = useState(true);
  const [showConversion, setShowConversion] = useState(true);
  const reduce = useReducedMotion();
  const data = series[range];
  const summary = rangeSummary(data);

  useEffect(() => setMounted(true), []);

  return (
    <section className="glass-card p-5 sm:p-6" aria-label="Revenue and conversion">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Performance</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Revenue and conversion, {RANGE_LABEL[range]}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SeriesToggle
            label="Revenue"
            color="var(--accent)"
            pressed={showRevenue}
            onClick={() => setShowRevenue((value) => !value)}
          />
          <SeriesToggle
            label="Conversion"
            color="var(--orchid)"
            pressed={showConversion}
            onClick={() => setShowConversion((value) => !value)}
          />
          <div className="flex rounded-full border border-[var(--stroke)] bg-[var(--chip)] p-1" role="group" aria-label="Chart range">
            {RANGES.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={range === key}
                onClick={() => onRangeChange(key)}
                className={cn(
                  "min-h-9 rounded-full px-3.5 text-sm font-semibold",
                  range === key ? "bg-[var(--accent)] text-white shadow-[0_0_18px_rgba(138,43,226,0.45)]" : "text-[var(--muted)] hover:text-[var(--text)]",
                )}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-[var(--muted)]">
        Range revenue <span className="tabular font-semibold text-[var(--text)]">{formatCurrency(summary.revenue)}</span>
        <span className="px-2">·</span>
        Avg conversion <span className="tabular font-semibold text-[var(--text)]">{formatPercent(summary.conversion)}</span>
        <span className="px-2">·</span>
        End vs start <span className="tabular font-semibold text-[var(--text)]">{formatDelta(summary.revenueDelta, "percent")}</span>
      </p>
      <p className="sr-only">
        Showing {RANGE_LABEL[range]}. Range revenue {formatCurrency(summary.revenue)}. Average conversion {formatPercent(summary.conversion)}.
      </p>

      <div className="mt-4 h-[320px] w-full sm:h-[380px]">
        {mounted && (showRevenue || showConversion) ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--grid)" strokeDasharray="4 8" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                interval={range === "30D" ? 4 : 0}
                minTickGap={16}
                dy={8}
              />
              <YAxis
                yAxisId="revenue"
                axisLine={false}
                tickLine={false}
                width={58}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                tickFormatter={(value: number) => formatCompact(value)}
                domain={[(value: number) => Math.max(0, value * 0.82), (value: number) => value * 1.08]}
              />
              <YAxis
                yAxisId="conversion"
                orientation="right"
                axisLine={false}
                tickLine={false}
                width={46}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                tickFormatter={(value: number) => `${Math.round(value)}%`}
                domain={[(value: number) => Math.max(0, value - 0.8), (value: number) => value + 0.8]}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "var(--orchid)", strokeDasharray: "4 4" }}
                wrapperStyle={{ outline: "none", zIndex: 30 }}
                allowEscapeViewBox={{ x: true, y: true }}
              />
              {showRevenue && (
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="var(--accent)"
                  strokeWidth={2.75}
                  dot={false}
                  activeDot={{ r: 5, fill: "var(--accent)", stroke: "#fff", strokeWidth: 1.5 }}
                  animationDuration={reduce ? 0 : 900}
                  animationEasing="ease-in-out"
                />
              )}
              {showConversion && (
                <Line
                  yAxisId="conversion"
                  type="monotone"
                  dataKey="conversion"
                  name="Conversion"
                  stroke="var(--orchid)"
                  strokeWidth={2.75}
                  dot={false}
                  activeDot={{ r: 5, fill: "var(--orchid)", stroke: "#fff", strokeWidth: 1.5 }}
                  animationDuration={reduce ? 0 : 900}
                  animationEasing="ease-in-out"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center text-sm text-[var(--muted)]">
            {mounted ? "Turn a series back on to plot this range." : "Preparing chart"}
          </div>
        )}
      </div>
    </section>
  );
}

function SeriesToggle({
  label,
  color,
  pressed,
  onClick,
}: {
  label: string;
  color: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--stroke)] px-3 text-sm font-medium",
        pressed ? "text-[var(--text)]" : "text-[var(--muted)] opacity-70",
      )}
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
      {label}
    </button>
  );
}
