"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { ActivityTable } from "@/components/activity-table";
import { ChannelMix } from "@/components/channel-mix";
import { KpiCards } from "@/components/kpi-cards";
import { MetricsChart } from "@/components/metrics-chart";
import { SIDEBAR_COMPACT, SIDEBAR_EXPANDED, Sidebar } from "@/components/sidebar";
import { ThemeSwitch, useTheme } from "@/components/theme";
import {
  AS_OF_LABEL,
  VIEW_COPY,
  activities,
  downloadActivityCsv,
  series,
  type RangeKey,
  type ViewId,
} from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/utils";

const EASE = [0.4, 0, 0.2, 1] as const;

function useGreeting() {
  const [greeting, setGreeting] = useState("Welcome back");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);
  return greeting;
}

export function Dashboard() {
  const [view, setView] = useState<ViewId>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [pageSize, setPageSize] = useState(6);
  const [range, setRange] = useState<RangeKey>("30D");
  const greeting = useGreeting();
  const { theme, setTheme } = useTheme();
  const reduce = useReducedMotion();
  const copy = VIEW_COPY[view];
  const compact = isDesktop && collapsed;
  const sidebarWidth = compact ? SIDEBAR_COMPACT : SIDEBAR_EXPANDED;

  useLayoutEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    document.title = `${copy.title} · Client Analytics`;
  }, [copy.title]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  const showKpis = view === "overview" || view === "revenue" || view === "reports";
  const showChart = view === "overview" || view === "analytics" || view === "revenue";
  const showMix = view === "overview" || view === "analytics";
  const showTable = view === "overview" || view === "clients";

  return (
    <div className="relative z-[1] min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-[var(--accent)] focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      {!isDesktop && mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-[#120B24]/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <Sidebar
        view={view}
        compact={compact}
        mobileOpen={mobileOpen}
        isDesktop={isDesktop}
        onSelect={(next) => {
          setView(next);
          setMobileOpen(false);
        }}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        onClose={() => setMobileOpen(false)}
      />
      <motion.div
        className="min-w-0"
        initial={false}
        animate={{ paddingLeft: isDesktop ? sidebarWidth + 24 : 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 36 }}
      >
        <header className="sticky top-0 z-20 px-4 pt-4 sm:px-6 lg:px-8">
          <div className="glass-panel flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--stroke)] lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="sidebar"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
              <span className="sr-only">Open menu</span>
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[var(--muted)]">{greeting}</p>
              <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{copy.title}</h1>
            </div>
            <p className="hidden text-sm text-[var(--muted)] md:block">Sample · {AS_OF_LABEL}</p>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-[var(--muted)] sm:inline">{theme === "light" ? "Light" : "Dark"}</span>
              <ThemeSwitch />
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-[1600px] space-y-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <p className="max-w-2xl text-sm text-[var(--muted)] sm:text-base">{copy.lede}</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="space-y-4"
            >
              {showKpis && <KpiCards />}
              {(showChart || showMix) && (
                <div className={showChart && showMix ? "grid grid-cols-1 gap-4 xl:grid-cols-5" : "grid grid-cols-1"}>
                  {showChart && (
                    <div className={showMix ? "xl:col-span-3" : undefined}>
                      <MetricsChart range={range} onRangeChange={setRange} />
                    </div>
                  )}
                  {showMix && (
                    <div className={showChart ? "xl:col-span-2" : undefined}>
                      <ChannelMix />
                    </div>
                  )}
                </div>
              )}
              {showTable && <ActivityTable pageSize={pageSize} onPageSize={setPageSize} />}
              {view === "reports" && <Reports onExport={() => downloadActivityCsv(activities)} />}
              {view === "settings" && (
                <SettingsPanel
                  collapsed={collapsed}
                  onCollapsed={setCollapsed}
                  theme={theme}
                  onTheme={setTheme}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}

function Reports({ onExport }: { onExport: () => void }) {
  const months = series["12M"];
  const total = months.reduce((sum, point) => sum + point.revenue, 0);
  return (
    <section className="glass-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Trailing year</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Total {formatCurrency(total)} across {months.length} months.
          </p>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-[0_0_18px_rgba(138,43,226,0.4)]"
        >
          Export activity log
        </button>
      </div>
      <ol className="mt-5 divide-y divide-[var(--stroke)]">
        {months.map((point) => (
          <li key={point.date} className="flex items-center justify-between gap-4 py-3 text-sm">
            <span>{point.fullLabel}</span>
            <span className="tabular text-[var(--muted)]">
              {formatCurrency(point.revenue)} · {formatPercent(point.conversion)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SettingsPanel({
  collapsed,
  onCollapsed,
  theme,
  onTheme,
}: {
  collapsed: boolean;
  onCollapsed: (collapsed: boolean) => void;
  theme: "dark" | "light";
  onTheme: (theme: "dark" | "light") => void;
}) {
  return (
    <section className="glass-card grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
      <div>
        <h2 className="text-lg font-semibold">Appearance</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">The switch morphs colors across the portal.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["dark", "light"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={theme === option}
              onClick={() => onTheme(option)}
              className={
                theme === option
                  ? "min-h-11 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white"
                  : "min-h-11 rounded-xl border border-[var(--stroke)] px-4 text-sm text-[var(--muted)]"
              }
            >
              {option === "dark" ? "Dark" : "Light"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold">Sidebar</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">On a wide screen, the rail can shrink to icons.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={!collapsed}
            onClick={() => onCollapsed(false)}
            className={
              !collapsed
                ? "min-h-11 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white"
                : "min-h-11 rounded-xl border border-[var(--stroke)] px-4 text-sm text-[var(--muted)]"
            }
          >
            Expanded
          </button>
          <button
            type="button"
            aria-pressed={collapsed}
            onClick={() => onCollapsed(true)}
            className={
              collapsed
                ? "min-h-11 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white"
                : "min-h-11 rounded-xl border border-[var(--stroke)] px-4 text-sm text-[var(--muted)]"
            }
          >
            Icons only
          </button>
        </div>
      </div>
      <p className="text-sm text-[var(--muted)] lg:col-span-2">
        Figures on this portal are a local sample anchored to {AS_OF_LABEL}. Search, paging, export, and theme stay in the browser.
      </p>
    </section>
  );
}
