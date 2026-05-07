"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DS_MICRO } from "@/lib/design-system";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  back?: { label: string; onClick: () => void };
}

export function PageHeader({ title, subtitle, actions, back }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-2">
        {back && (
          <button
            onClick={back.onClick}
            className={cn(
              DS_MICRO,
              "flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors px-2 py-1 rounded hover:bg-slate-100",
            )}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path
                d="M8 2L4 6L8 10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {back.label}
          </button>
        )}
        {title && (
          <span className="text-xs font-bold text-slate-900">{title}</span>
        )}
        {subtitle && (
          <p
            className={cn(
              DS_MICRO,
              "text-slate-400",
              (back || title) && "pl-2 border-l border-slate-200",
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
