"use client";

import React, { ReactNode } from "react";
import { AnimatedBackground } from "@/features/dashboard/components/animated-background";
import { useSpatialMouse } from "@/features/dashboard/hooks/use-spatial-mouse";

interface EditorLayoutProps {
  children: ReactNode;
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  const { x: mouseX, y: mouseY } = useSpatialMouse();

  return (
    // On verrouille la racine à h-screen w-screen
    <div className="relative h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* BACKGROUND (Z=0) */}
      <AnimatedBackground mouseX={mouseX} mouseY={mouseY} />

      {/* CANVAS DE CRÉATION (Z=10) 
          'flex-1' force le main à prendre TOUT l'espace restant.
          'min-h-0' est crucial pour permettre le scroll interne sans pousser le layout.
      */}
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
    </div>
  );
}