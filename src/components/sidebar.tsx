"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  LineChart,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  Settings,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { VIEW_COPY, type ViewId } from "@/lib/data";
import { cn } from "@/lib/utils";

export const SIDEBAR_EXPANDED = 268;
export const SIDEBAR_COMPACT = 84;

const NAV: Array<{ id: ViewId; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: LineChart },
  { id: "clients", label: "Clients", icon: Users },
  { id: "revenue", label: "Revenue", icon: Wallet },
  { id: "reports", label: "Reports", icon: ScrollText },
  { id: "settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  view: ViewId;
  compact: boolean;
  mobileOpen: boolean;
  isDesktop: boolean;
  onSelect: (view: ViewId) => void;
  onToggleCollapse: () => void;
  onClose: () => void;
};

export function Sidebar({
  view,
  compact,
  mobileOpen,
  isDesktop,
  onSelect,
  onToggleCollapse,
  onClose,
}: SidebarProps) {
  const reduce = useReducedMotion();

  return (
    <motion.aside
      id="sidebar"
      aria-label="Primary"
      className="glass-panel fixed inset-y-3 left-3 z-40 flex max-lg:!w-[260px] flex-col overflow-hidden rounded-[20px] max-lg:inset-y-0 max-lg:left-0 max-lg:rounded-none"
      initial={false}
      animate={{
        width: compact ? SIDEBAR_COMPACT : SIDEBAR_EXPANDED,
        x: isDesktop || mobileOpen ? 0 : -300,
      }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 36 }}
    >
      <div className={cn("flex items-center gap-3 px-4 py-5", compact && "lg:justify-center lg:px-2")}>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--accent)] text-sm font-bold text-white shadow-[0_0_18px_rgba(138,43,226,0.65)]">
          CA
        </div>
        {!compact && (
          <div className="min-w-0">
            <p className="text-brand truncate text-sm font-semibold">Client Analytics</p>
            <p className="truncate text-xs text-[var(--muted)]">Cozy Purple</p>
          </div>
        )}
        <button
          type="button"
          className="ml-auto grid h-10 w-10 place-items-center rounded-xl text-[var(--muted)] hover:bg-[var(--chip)] hover:text-[var(--text)] lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        <p className={cn("px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]", compact && "lg:sr-only")}>
          Workspace
        </p>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              title={compact ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              onClick={() => onSelect(item.id)}
              className={cn(
                "relative flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                compact && "lg:justify-center lg:px-0",
                active ? "text-white" : "text-[var(--muted)] hover:bg-[var(--chip)] hover:text-[var(--text)]",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl bg-[var(--accent)] shadow-[0_8px_24px_rgba(138,43,226,0.35)]"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon size={20} strokeWidth={1.75} className="relative z-10 shrink-0" />
              <span className={cn("relative z-10 whitespace-nowrap", compact && "lg:sr-only")}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[var(--stroke)] p-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-pressed={compact}
          aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "hidden min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-[var(--muted)] hover:bg-[var(--chip)] hover:text-[var(--text)] lg:flex",
            compact && "justify-center px-0",
          )}
        >
          {compact ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          {!compact && <span>Collapse</span>}
        </button>
        <p className={cn("px-3 pt-3 text-xs text-[var(--muted)] lg:pt-3", compact && "lg:hidden")}>
          {VIEW_COPY[view].title} is open
        </p>
      </div>
    </motion.aside>
  );
}
