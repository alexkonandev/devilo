"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function ServiceCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 p-3 w-full">
      <div className="flex items-start gap-3">
        {/* DRAG_HANDLE_SKELETON */}
        <div className="mt-1 w-[18px] h-[18px] bg-slate-100 animate-pulse" />

        <div className="flex-1 min-w-0">
          {/* HEADER_SKELETON */}
          <div className="flex items-center justify-between mb-2">
            <div className="h-[8px] w-16 bg-indigo-50 animate-pulse" />
            <div className="h-3 w-3 rounded-full bg-slate-50 animate-pulse" />
          </div>

          {/* CONTENT_SKELETON */}
          <div className="h-[12px] w-3/4 bg-slate-100 animate-pulse mb-2" />
          <div className="h-[10px] w-full bg-slate-50 animate-pulse" />

          {/* FOOTER_SKELETON */}
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="h-[7px] w-8 bg-slate-100 animate-pulse" />
              <div className="h-[14px] w-20 bg-slate-200 animate-pulse" />
            </div>

            {/* ACTION_BUTTON_SKELETON */}
            <div className="w-8 h-8 bg-slate-50 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * LIST_SKELETON : Pour remplir une colonne entière pendant le fetching
 */
export function ServiceListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  );
}
