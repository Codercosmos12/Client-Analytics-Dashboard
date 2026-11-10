"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { activities, downloadActivityCsv, type Activity, type Status } from "@/lib/data";
import { cn, formatCurrency, formatDateUTC } from "@/lib/utils";

const PAGE_SIZES = [6, 8, 12];

function badgeClass(status: Status) {
  if (status === "Completed") return "badge badge-completed";
  if (status === "Pending") return "badge badge-pending";
  return "badge badge-review";
}

function matches(row: Activity, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    row.client.toLowerCase().includes(needle) ||
    row.company.toLowerCase().includes(needle) ||
    row.status.toLowerCase().includes(needle) ||
    row.id.toLowerCase().includes(needle)
  );
}

export function ActivityTable({ pageSize, onPageSize }: { pageSize: number; onPageSize: (size: number) => void }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [query, pageSize]);

  const filtered = useMemo(() => activities.filter((row) => matches(row, query)), [query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  const from = filtered.length === 0 ? 0 : start + 1;
  const to = Math.min(filtered.length, start + pageSize);

  return (
    <section className="glass-card p-5 sm:p-6" aria-label="Client activity">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Client activity</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Search by client, company, id, or status.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block min-w-[240px] flex-1">
            <span className="sr-only">Search clients or status</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search clients or status"
              className="field py-2.5 pl-9 pr-10"
              aria-controls="activity-table"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--text)]"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={() => downloadActivityCsv(filtered)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--stroke)] bg-[var(--chip)] px-3 text-sm font-medium hover:border-[var(--accent)]"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table id="activity-table" className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
          <caption className="sr-only">Client activity log</caption>
          <thead>
            <tr className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              <th className="px-3 py-3 font-medium">Client</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Channel</th>
              <th className="px-3 py-3 text-right font-medium">Amount</th>
              <th className="px-3 py-3 text-right font-medium">Updated</th>
            </tr>
          </thead>
          <motion.tbody
            key={`${query}-${safePage}-${pageSize}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-[var(--muted)]">
                  No clients match that search.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-3.5">
                    <p className="font-medium">{row.client}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {row.id} · {row.company}
                    </p>
                  </td>
                  <td className="px-3 py-3.5">
                    <button
                      type="button"
                      className={badgeClass(row.status)}
                      onClick={() => setQuery(row.status)}
                      aria-label={`Filter by ${row.status}`}
                    >
                      {row.status}
                    </button>
                  </td>
                  <td className="px-3 py-3.5 text-[var(--muted)]">{row.channel}</td>
                  <td className="tabular px-3 py-3.5 text-right font-medium">{formatCurrency(row.amount)}</td>
                  <td className="tabular px-3 py-3.5 text-right text-[var(--muted)]">{formatDateUTC(row.updated)}</td>
                </tr>
              ))
            )}
          </motion.tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--muted)]">
          Showing <span className="tabular text-[var(--text)]">{from}</span>–<span className="tabular text-[var(--text)]">{to}</span> of{" "}
          <span className="tabular text-[var(--text)]">{filtered.length}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            Rows
            <select
              value={pageSize}
              onChange={(event) => onPageSize(Number(event.target.value))}
              className="field w-auto px-2 py-2"
              aria-label="Rows per page"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--stroke)] disabled:opacity-40"
            onClick={() => setPage(Math.max(0, safePage - 1))}
            disabled={safePage === 0}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              aria-current={index === safePage ? "page" : undefined}
              onClick={() => setPage(index)}
              className={cn(
                "grid h-10 min-w-10 place-items-center rounded-xl border px-2 text-sm",
                index === safePage
                  ? "border-transparent bg-[var(--accent)] text-white"
                  : "border-[var(--stroke)] text-[var(--muted)] hover:text-[var(--text)]",
              )}
            >
              {index + 1}
            </button>
          ))}
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--stroke)] disabled:opacity-40"
            onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
            disabled={safePage >= pageCount - 1}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
