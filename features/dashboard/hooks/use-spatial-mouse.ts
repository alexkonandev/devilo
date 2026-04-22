"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  useMotionValue,
  useSpring,
  type MotionValue,
  type SpringOptions,
} from "framer-motion";

interface SpatialMouseResult {
  /** Normalized X position (-1 to 1), smoothed with spring physics */
  x: MotionValue<number>;
  /** Normalized Y position (-1 to 1), smoothed with spring physics */
  y: MotionValue<number>;
  /** Raw X position (0 to 1) */
  rawX: MotionValue<number>;
  /** Raw Y position (0 to 1) */
  rawY: MotionValue<number>;
}

const SPRING_CONFIG: SpringOptions = {
  stiffness: 150,
  damping: 20,
  mass: 0.5,
};

/**
 * Hook de tracking souris pour le système Spatial Intelligence.
 * Retourne des MotionValues normalisées (-1 à 1) avec spring physics.
 * Throttled à requestAnimationFrame pour performance GPU.
 */
export function useSpatialMouse(): SpatialMouseResult {
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);

  const normalizedX = useMotionValue(0);
  const normalizedY = useMotionValue(0);

  const x = useSpring(normalizedX, SPRING_CONFIG);
  const y = useSpring(normalizedY, SPRING_CONFIG);

  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        const rx = e.clientX / window.innerWidth;
        const ry = e.clientY / window.innerHeight;

        rawX.set(rx);
        rawY.set(ry);

        // Normalize to -1..1
        normalizedX.set((rx - 0.5) * 2);
        normalizedY.set((ry - 0.5) * 2);

        rafRef.current = 0;
      });
    },
    [rawX, rawY, normalizedX, normalizedY]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  return { x, y, rawX, rawY };
}
