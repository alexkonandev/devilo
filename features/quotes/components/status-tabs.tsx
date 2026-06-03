"use client";

import React from "react";
import { useQuotes } from "./quote-context";
import { cn } from "@/lib/utils";
import { DS_LABEL } from "@/lib/design-system";
import { STATUS_TABS, TAB_ACTIVE, TAB_INACTIVE } from "./constants";

// ═══════════════════════════════════════════════════════════════
// STATUS TABS
// ═══════════════════════════════════════════════════════════════

export function StatusTabs() {
  const { activeStatus, setActiveStatus } = useQuotes();

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STATUS_TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setActiveStatus(tab.value)}
          className={cn(
            DS_LABEL,
            activeStatus === tab.value ? TAB_ACTIVE : TAB_INACTIVE,
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}