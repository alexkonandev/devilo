"use client";

import React from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

interface AnimatedBackgroundProps {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}

interface OrbConfig {
  id: string;
  color: string;
  size: string;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  parallaxIntensity: number;
  animationDuration: number;
  animationDelay: number;
}

const ORBS: OrbConfig[] = [
  {
    id: "orb-indigo",
    color: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
    size: "40rem",
    position: { top: "5%", left: "15%" },
    parallaxIntensity: 20,
    animationDuration: 25,
    animationDelay: 0,
  },
  {
    id: "orb-violet",
    color: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
    size: "35rem",
    position: { bottom: "10%", right: "10%" },
    parallaxIntensity: 30,
    animationDuration: 30,
    animationDelay: 5,
  },
  {
    id: "orb-cyan",
    color: "radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)",
    size: "30rem",
    position: { top: "40%", right: "25%" },
    parallaxIntensity: 15,
    animationDuration: 35,
    animationDelay: 10,
  },
  {
    id: "orb-amber",
    color: "radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)",
    size: "25rem",
    position: { bottom: "25%", left: "30%" },
    parallaxIntensity: 25,
    animationDuration: 28,
    animationDelay: 8,
  },
];

function Orb({
  config,
  mouseX,
  mouseY,
}: {
  config: OrbConfig;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}) {
  const translateX = useTransform(
    mouseX,
    [-1, 1],
    [-config.parallaxIntensity, config.parallaxIntensity]
  );
  const translateY = useTransform(
    mouseY,
    [-1, 1],
    [-config.parallaxIntensity, config.parallaxIntensity]
  );

  return (
    <motion.div
      style={{
        ...config.position,
        width: config.size,
        height: config.size,
        background: config.color,
        x: translateX,
        y: translateY,
      }}
      className="absolute rounded-full pointer-events-none"
      animate={{
        scale: [1, 1.15, 0.95, 1.05, 1],
        rotate: [0, 45, -20, 30, 0],
      }}
      transition={{
        duration: config.animationDuration,
        repeat: Infinity,
        ease: "linear",
        delay: config.animationDelay,
      }}
    />
  );
}

/**
 * Couche Z=0 : Fond light avec orbes de gradient subtils animés.
 * Les orbes réagissent au mouvement de la souris via parallax.
 */
export function AnimatedBackground({ mouseX, mouseY }: AnimatedBackgroundProps) {
  return (
    <div className="fixed inset-0 bg-slate-50 overflow-hidden pointer-events-none -z-10">
      {/* Subtle gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />

      {/* Orbes animés (très subtils en light mode) */}
      {ORBS.map((orb) => (
        <Orb key={orb.id} config={orb} mouseX={mouseX} mouseY={mouseY} />
      ))}
    </div>
  );
}
