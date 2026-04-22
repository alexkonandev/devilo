"use client";

import React, { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useInView, animate } from "framer-motion";

type FormatMode = "currency" | "percent" | "count";

interface AnimatedCounterProps {
  /** Valeur cible */
  value: number;
  /** Mode de formatage */
  format: FormatMode;
  /** Suffixe devises (ex: "XOF") */
  currencySuffix?: string;
  /** Classes CSS pour le conteneur */
  className?: string;
  /** Classes CSS pour le suffixe devises */
  suffixClassName?: string;
  /** Durée de l'animation en secondes */
  duration?: number;
}

function formatValue(raw: number, format: FormatMode): string {
  switch (format) {
    case "currency":
      if (raw >= 1_000_000) return `${(raw / 1_000_000).toFixed(1)}M`;
      if (raw >= 1_000) return `${(raw / 1_000).toFixed(0)}k`;
      return raw.toFixed(0);
    case "percent":
      return `${raw.toFixed(0)}%`;
    case "count":
      return raw.toFixed(0);
  }
}

/**
 * Compteur animé avec spring physics.
 * Count-up de 0 à la valeur cible au mount (quand visible dans le viewport).
 */
export function AnimatedCounter({
  value,
  format,
  currencySuffix,
  className,
  suffixClassName,
  duration = 1.5,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    mass: 1,
  });

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });

    return () => controls.stop();
  }, [isInView, value, motionValue, duration]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatValue(latest, format);
      }
    });

    return unsubscribe;
  }, [springValue, format]);

  return (
    <span className="inline-flex items-baseline gap-3">
      <span ref={ref} className={className}>
        {formatValue(0, format)}
      </span>
      {currencySuffix && (
        <span className={suffixClassName}>{currencySuffix}</span>
      )}
    </span>
  );
}
