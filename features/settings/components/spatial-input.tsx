"use client";

import React, { InputHTMLAttributes, forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpatialInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const SpatialInput = forwardRef<HTMLInputElement, SpatialInputProps>(
  ({ className, label, error, icon, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value !== "" && props.value !== undefined;

    return (
      <div className="relative group">
        <div
          className={cn(
            "relative flex items-center bg-white rounded-xl border transition-all duration-300 overflow-hidden",
            isFocused
              ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
              : error
              ? "border-rose-300 bg-rose-50/30"
              : "border-slate-200 hover:border-slate-300",
            className
          )}
        >
          {icon && (
            <div
              className={cn(
                "pl-4 transition-colors",
                isFocused ? "text-indigo-500" : "text-slate-400"
              )}
            >
              {icon}
            </div>
          )}

          <div className="flex-1 relative pt-5 pb-2 px-4 h-14">
            <motion.label
              initial={false}
              animate={{
                y: isFocused || hasValue ? 0 : 4,
                scale: isFocused || hasValue ? 0.85 : 1,
                opacity: isFocused || hasValue ? 0.7 : 0.5,
              }}
              className={cn(
                "absolute top-1.5 left-4 text-xs font-bold uppercase tracking-widest pointer-events-none origin-left transition-colors",
                isFocused
                  ? "text-blue-500"
                  : error
                  ? "text-rose-500"
                  : "text-slate-400"
              )}
            >
              {label}
            </motion.label>

            <input
              ref={ref}
              {...props}
              onFocus={(e) => {
                setIsFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                onBlur?.(e);
              }}
              className="w-full h-full bg-transparent border-none outline-none text-sm font-bold text-slate-900 placeholder-transparent focus:ring-0 p-0"
              placeholder=" "
            />
          </div>

          {/* Status Indicator Line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent">
            <motion.div
              initial={{ width: "0%" }}
              animate={{
                width: isFocused ? "100%" : "0%",
                backgroundColor: error ? "#f43f5e" : "#6366f1", // rose-500 or indigo-500
              }}
              className="h-full mx-auto"
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute -bottom-5 left-1 text-[10px] font-bold text-rose-500 uppercase tracking-wide"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

SpatialInput.displayName = "SpatialInput";
