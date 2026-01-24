"use client";

import React, { useRef, useState, MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface QuoteEditorLayoutProps {
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  bottomToolbar: React.ReactNode;
  children: React.ReactNode;
  viewMode: "studio" | "preview";
  zoom: number;
}

export const QuoteEditorLayout = ({
  leftSidebar,
  rightSidebar,
  bottomToolbar,
  children,
  viewMode,
  zoom,
}: QuoteEditorLayoutProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    setIsDragging(true);
    setStartPos({ x: e.pageX, y: e.pageY });
    setScrollPos({
      left: scrollContainerRef.current?.scrollLeft || 0,
      top: scrollContainerRef.current?.scrollTop || 0,
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - startPos.x;
    const y = e.pageY - startPos.y;
    scrollContainerRef.current.scrollLeft = scrollPos.left - x;
    scrollContainerRef.current.scrollTop = scrollPos.top - y;
  };

  return (
    <div className="flex h-full w-full bg-white overflow-hidden font-sans text-[13px] antialiased select-none rounded-none">
      {/* SIDEBAR GAUCHE : 320px (PRODUCTION INPUTS) */}
      <aside
        className={cn(
          "bg-white border-r border-slate-200 z-20 transition-all duration-150 overflow-hidden shrink-0",
          leftSidebar ? "w-[320px]" : "w-0"
        )}
      >
        <div className="h-full w-[320px] overflow-y-auto scrollbar-none">
          {leftSidebar}
        </div>
      </aside>

      <main className="flex-1 relative flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        {/* LE CONTENEUR DE SCROLL : On utilise overflow-auto mais on cache la barre visuelle */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          className={cn(
            "flex-1 overflow-auto scrollbar-none flex flex-col items-center pt-8 pb-40 transition-colors",
            isDragging ? "cursor-grabbing" : "cursor-grab",
            viewMode === "preview" ? "bg-slate-200" : "bg-slate-100/50"
          )}
        >
          {/* WRAPPER DE TRANSFORMATION : 
            Crucial pour que le zoom ne casse pas le layout parent.
            Le scale s'applique ici pour éviter que la div fixe "printable-content" 
            ne pousse les murs du layout flex.
          */}
          <div
            className="transition-transform duration-200 origin-top shrink-0 shadow-2xl"
            style={{ transform: `scale(${zoom})` }}
          >
            <div
              id="printable-content"
              className={cn(
                "bg-white border border-slate-200 rounded-none",
                "print:border-0 print:shadow-none print:m-0"
              )}
              style={{
                width: "210mm",
                minHeight: "297mm",
              }}
            >
              {children}
            </div>
          </div>
        </div>

        {/* 03. TOOLBAR FLOTTANTE (FIXED POSITIONING) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className=" pointer-events-auto">
            {bottomToolbar}
          </div>
        </div>
      </main>

      {/* SIDEBAR DROITE : 280px (CALCUL ENGINE) */}
      <aside
        className={cn(
          "bg-white border-l border-slate-200 z-20 transition-all duration-150 overflow-hidden shrink-0",
          rightSidebar ? "w-[300px]" : "w-0"
        )}
      >
        <div className="h-full w-[300px] overflow-y-auto scrollbar-none">
          {rightSidebar}
        </div>
      </aside>
    </div>
  );
};
