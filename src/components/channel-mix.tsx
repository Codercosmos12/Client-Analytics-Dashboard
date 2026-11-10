"use client";

import { motion, useReducedMotion } from "framer-motion";
import { activities, channelMix } from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/utils";

const COLORS = ["#8A2BE2", "#DA70D6", "#C4B5FD", "#9AF7D0", "#F5C16C"];

export function ChannelMix() {
  const rows = channelMix(activities);
  const reduce = useReducedMotion();

  return (
    <section className="glass-card flex h-full flex-col p-5 sm:p-6" aria-label="Channel mix">
      <h2 className="text-lg font-semibold">Channel mix</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">Booked amount in the activity log, grouped by source.</p>
      <ul className="mt-6 space-y-4">
        {rows.map((row, index) => (
          <li key={row.channel}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{row.channel}</span>
              <span className="tabular text-[var(--muted)]">
                {formatCurrency(row.amount)} · {formatPercent(row.share)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--chip)]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: COLORS[index % COLORS.length], boxShadow: `0 0 12px ${COLORS[index % COLORS.length]}` }}
                initial={{ width: 0 }}
                animate={{ width: `${row.share}%` }}
                transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
