"use client";

import React, { useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface SpatialCardProps {
  children: React.ReactNode;
  /** Profondeur spatiale : 1=subtil, 2=moyen, 3=agressif */
  depth?: 1 | 2 | 3;
  /** Variante visuelle */
  variant?: "glass" | "dark" | "glow";
  /** Classes CSS additionnelles */
  className?: string;
  /** Mouse global pour parallax (optionnel) */
  globalMouseX?: MotionValue<number>;
  globalMouseY?: MotionValue<number>;
  /** Délai d'animation au mount */
  mountDelay?: number;
  /** onClick handler */
  onClick?: () => void;
}

const DEPTH_CONFIG = {
  1: { tiltMax: 4, shadowShift: 8, scale: 1.01 },
  2: { tiltMax: 8, shadowShift: 15, scale: 1.02 },
  3: { tiltMax: 12, shadowShift: 25, scale: 1.03 },
} as const;

const SPRING_CONFIG = {
  stiffness: 300,
  damping: 25,
  mass: 0.5,
};

/**
 * Carte Spatial Intelligence avec tilt 3D, ombres dynamiques — Light Mode Luxe.
 * Utilise CSS perspective transforms (GPU-accelerated).
 */
export function SpatialCard({
  children,
  depth = 2,
  variant = "glass",
  className,
  mountDelay = 0,
  onClick,
}: SpatialCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const config = DEPTH_CONFIG[depth];

  // Local mouse tracking (relative to card)
  const localX = useMotionValue(0);
  const localY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(localY, [-0.5, 0.5], [config.tiltMax, -config.tiltMax]),
    SPRING_CONFIG
  );
  const rotateY = useSpring(
    useTransform(localX, [-0.5, 0.5], [-config.tiltMax, config.tiltMax]),
    SPRING_CONFIG
  );

  // Shadow shift (opposite direction for realism)
  const shadowX = useTransform(
    localX,
    [-0.5, 0.5],
    [config.shadowShift, -config.shadowShift]
  );
  const shadowY = useTransform(
    localY,
    [-0.5, 0.5],
    [config.shadowShift, -config.shadowShift]
  );

  // Glow effect position
  const glowX = useTransform(localX, [-0.5, 0.5], [20, 80]);
  const glowY = useTransform(localY, [-0.5, 0.5], [20, 80]);

  const handleMouseLeave = useCallback(() => {
    localX.set(0);
    localY.set(0);
  }, [localX, localY]);

  const variantClasses = {
    glass:
      "bg-white shadow-xl shadow-slate-200/50 border border-slate-200/60 hover:border-slate-300/80",
    dark:
      "bg-slate-50 shadow-lg shadow-slate-200/40 border border-slate-200/60 hover:border-indigo-300",
    glow:
      "bg-white shadow-xl shadow-indigo-100/50 border border-indigo-200/60 hover:border-indigo-400/60",
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={cn(
        "relative rounded-2xl transition-colors duration-300 overflow-hidden",
        variantClasses[variant],
        onClick && "cursor-pointer",
        className
      )}
      style={{
        perspective: "1200px",
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: mountDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
    >
      {/* Halo lumineux dynamique */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useTransform(
            [glowX, glowY] as MotionValue[],
            ([gx, gy]: number[]) =>
              `radial-gradient(circle at ${gx}% ${gy}%, rgba(99,102,241,0.04) 0%, transparent 60%)`
          ),
        }}
      />

      {/* Shadow layer dynamique (subtile en light mode) */}
      <motion.div
        className="absolute -inset-1 rounded-3xl -z-10 pointer-events-none"
        style={{
          x: shadowX,
          y: shadowY,
          filter: `blur(${config.shadowShift * 2}px)`,
          background: "rgba(0,0,0,0.04)",
          opacity: 0.5,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
