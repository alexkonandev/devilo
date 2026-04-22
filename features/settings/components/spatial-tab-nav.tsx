"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  UserIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  GearIcon,
  BankIcon,
} from "@phosphor-icons/react";

export type SettingsTab =
  | "identity"
  | "banking"
  | "contact"
  | "finance"
  | "logistics";

interface SpatialTabNavProps {
  activeTab: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

const TABS = [
  { id: "identity", label: "Identité", icon: UserIcon },
  { id: "banking", label: "Bancaire", icon: BankIcon },
  { id: "contact", label: "Contact", icon: MapPinIcon },
  { id: "finance", label: "Finance", icon: CurrencyDollarIcon },
  { id: "logistics", label: "Logistique", icon: GearIcon },
] as const;

export function SpatialTabNav({ activeTab, onChange }: SpatialTabNavProps) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-[240px]">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-2">
        Sections
      </h3>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id as SettingsTab)}
            className="group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 w-full text-left outline-none"
          >
            {/* Background Active Layer */}
            {isActive && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-white border border-slate-200/60 rounded-xl shadow-sm"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            {/* Hover Layer */}
            <div className="absolute inset-0 bg-transparent group-hover:bg-slate-50 rounded-xl transition-colors duration-300" />

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                isActive
                  ? "bg-indigo-50 text-indigo-500"
                  : "bg-slate-100 text-slate-400 group-hover:text-slate-600",
              )}
            >
              <Icon size={18} weight={isActive ? "bold" : "duotone"} />
            </div>

            {/* Label */}
            <span
              className={cn(
                "relative z-10 text-[11px] font-bold uppercase tracking-widest transition-colors duration-300",
                isActive
                  ? "text-slate-900"
                  : "text-slate-400 group-hover:text-slate-600",
              )}
            >
              {tab.label}
            </span>

            {/* Active Dot */}
            {isActive && (
              <motion.div
                layoutId="activeTabDot"
                className="absolute right-4 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
