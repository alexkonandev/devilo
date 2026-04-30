"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// ═══════════════════════════════════════════════════════════════
// COMPACT CARD - Design System Dense (Type Centre de Commande)
// ═══════════════════════════════════════════════════════════════

interface CompactCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "active" | "ghost" | "critical";
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
  onClick?: () => void;
  mountDelay?: number;
}

const variants = {
  default: "bg-white/80 backdrop-blur-sm border-slate-200/60",
  active: "bg-indigo-50/80 border-indigo-200/60 shadow-sm",
  ghost: "bg-transparent border-transparent",
  critical: "bg-rose-50/80 border-rose-200/60",
};

const sizes = {
  sm: "p-2 rounded-lg",
  md: "p-3 rounded-xl",
  lg: "p-4 rounded-2xl",
};

export function CompactCard({
  children,
  className,
  variant = "default",
  size = "md",
  clickable = false,
  onClick,
  mountDelay = 0,
}: CompactCardProps) {
  const baseClasses = cn(
    "border shadow-sm transition-all duration-200",
    variants[variant],
    sizes[size],
    clickable &&
      "cursor-pointer hover:shadow-md hover:border-slate-300/80 active:scale-[0.995]",
    className,
  );

  if (mountDelay > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: mountDelay,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={baseClasses}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TOKENS DS - Exportés pour réutilisation
// ═══════════════════════════════════════════════════════════════

export const DS = {
  // Typography
  micro: "text-[7px] font-bold uppercase tracking-[0.25em] text-slate-400",
  label: "text-[9px] font-semibold text-slate-500",
  value: "text-xs font-bold text-slate-900",
  title: "text-sm font-bold text-slate-900 tracking-tight",
  header: "text-lg font-black text-slate-900 italic tracking-tighter",

  // Spacing (gap)
  gapTight: "gap-1",
  gapCompact: "gap-2",
  gapNormal: "gap-3",

  // Padding
  padMicro: "p-1.5",
  padTight: "p-2",
  padCompact: "p-3",

  // Layout
  island:
    "bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm rounded-xl",
  islandActive: "bg-indigo-50/80 border-indigo-200/60 shadow-sm rounded-xl",
  islandGhost: "bg-transparent border-transparent rounded-xl",

  // Interactive
  button:
    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95",
  buttonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm",
  buttonSecondary:
    "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/60",

  // Status
  badge:
    "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider",
} as const;

// ═══════════════════════════════════════════════════════════════
// COMPACT KPI - Mini widget pour métriques
// ═══════════════════════════════════════════════════════════════

interface CompactKPIProps {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function CompactKPI({
  label,
  value,
  prefix,
  suffix,
  trend,
  icon,
  className,
}: CompactKPIProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {icon && (
        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-500">
          {icon}
        </div>
      )}
      <div>
        <p className={DS.micro}>{label}</p>
        <div className="flex items-baseline gap-1">
          {prefix && (
            <span className="text-[10px] text-slate-400">{prefix}</span>
          )}
          <span className="text-base font-black text-slate-900 tracking-tight">
            {value}
          </span>
          {suffix && (
            <span className="text-[10px] text-slate-400">{suffix}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPACT LIST ITEM - Ligne dense
// ═══════════════════════════════════════════════════════════════

interface CompactListItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function CompactListItem({
  children,
  className,
  onClick,
  active = false,
}: CompactListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-lg transition-all",
        "hover:bg-slate-50 cursor-pointer",
        active && "bg-indigo-50/50 hover:bg-indigo-50",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPACT SECTION HEADER - En-tête minimal
// ═══════════════════════════════════════════════════════════════

interface CompactSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CompactSectionHeader({
  title,
  subtitle,
  action,
  className,
}: CompactSectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div>
        <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[9px] text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
