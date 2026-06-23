"use client";

import React, { useEffect, useId } from "react";
import { CheckCircleIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  DS_MONO,
  DS_LABEL,
  DS_ICON_XS,
  DS_ICON_WRAPPER,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
type FeedbackVariant = "success" | "error" | "info";

interface SuccessFeedbackProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: FeedbackVariant;
  autoClose?: number;
}

// ═══════════════════════════════════════════════════════════════
// CONFETTIS — particules stylisées (une seule génération)
// ═══════════════════════════════════════════════════════════════
function ConfettiParticles() {
  const id = useId();
  const list = Array.from({ length: 8 }, (_, i) => {
    const colors = ["bg-emerald-400", "bg-emerald-500", "bg-teal-400", "bg-green-400"];
    return {
      id: `${id}-${i}`,
      delay: (i * 0.04) % 0.32,
      x: (i * 8.3) % 100,
      color: colors[i % 4],
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {list.map((p) => (
        <span
          key={p.id}
          className={cn("absolute w-1 h-1 rounded-full opacity-0 animate-ping", p.color)}
          style={{
            left: `${p.x}%`,
            top: "40%",
            animationDelay: `${p.delay}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ICON — compact, DS tokens
// ═══════════════════════════════════════════════════════════════
function FeedbackIcon({ variant }: { variant: FeedbackVariant }) {
  switch (variant) {
    case "success":
      return (
        <div className={cn(DS_ICON_WRAPPER, "bg-emerald-100 text-emerald-600")}>
          <CheckCircleIcon size={DS_ICON_XS} weight="fill" />
        </div>
      );
    case "error":
      return (
        <div className={cn(DS_ICON_WRAPPER, "bg-rose-100 text-rose-600")}>
          <XIcon size={DS_ICON_XS} weight="bold" />
        </div>
      );
    case "info":
    default:
      return (
        <div className={cn(DS_ICON_WRAPPER, "bg-indigo-100 text-indigo-600")}>
          <CheckCircleIcon size={DS_ICON_XS} weight="fill" />
        </div>
      );
  }
}

// ═══════════════════════════════════════════════════════════════
// SUCCESS FEEDBACK — Compact, DS tokens
// ═══════════════════════════════════════════════════════════════
export function SuccessFeedback({
  open,
  onClose,
  title,
  description,
  variant = "success",
  autoClose = 2500,
}: SuccessFeedbackProps) {
  const borderColor =
    variant === "success"
      ? "border-emerald-500"
      : variant === "error"
        ? "border-rose-500"
        : "border-indigo-500";

  // Auto-close timer
  useEffect(() => {
    if (!open || autoClose <= 0) return;
    const timer = setTimeout(onClose, autoClose);
    return () => clearTimeout(timer);
  }, [open, autoClose, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200]">
      <div
        className={cn(
          "relative min-w-[200px] max-w-[280px] border border-slate-200 bg-white rounded-md border-l-4 p-2.5 pr-3 overflow-hidden",
          borderColor,
          "animate-[slide-up_0.3s_ease-out]",
        )}
      >
        {variant === "success" && <ConfettiParticles />}

        <div className="flex items-start gap-1.5 relative z-10">
          <div className="shrink-0 animate-[pop-in_0.25s_ease-out]">
            <FeedbackIcon variant={variant} />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h4 className={cn(DS_MONO, "text-[10px] font-bold text-slate-900")}>
              {title}
            </h4>
            {description && (
              <p className={cn(DS_LABEL, "text-[8px] mt-0.5 leading-relaxed")}>
                {description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="shrink-0 w-4 h-4 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <XIcon size={8} />
          </button>
        </div>

        {autoClose > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100">
            <div
              className={cn(
                "h-full",
                variant === "success"
                  ? "bg-emerald-500"
                  : variant === "error"
                    ? "bg-rose-500"
                    : "bg-indigo-500",
              )}
              style={{ animation: `shrink ${autoClose}ms linear` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
