"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CaretRightIcon, HouseIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

const PATH_MAP: Record<string, string> = {
  dashboard: "Console / Accueil",
  clients: "Base / Clients",
  catalog: "Stock / Catalogue",
  quotes: "Flux / Devis",
  new: "Action / Créer",
  settings: "Sys / Configuration",
  editor: "Interface / Éditeur",
  billing: "Compte / Facturation",
};

export function SpatialStatusBar() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <motion.header
      className="fixed top-6 left-0 right-0 z-40 flex justify-center pointer-events-none"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
    >
      <div className="pointer-events-auto h-12 flex items-center gap-6 px-6 bg-white/80 backdrop-blur-md border border-white shadow-xl shadow-slate-200/30 rounded-full">
        {/* LOGO */}
        <Link href="/dashboard" className="flex items-center gap-3 group opacity-80 hover:opacity-100 transition-opacity">
          <Logo variant="icon" className="h-5 w-5" />
          <div className="w-px h-4 bg-slate-200" />
        </Link>

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-3 select-none">
          {segments.length === 0 ? (
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Accueil
            </span>
          ) : (
            segments.map((segment, index) => {
              const href = `/${segments.slice(0, index + 1).join("/")}`;
              const isLast = index === segments.length - 1;
              const label = PATH_MAP[segment] || (segment.length > 20 ? "..." : segment);

              return (
                <div key={href} className="flex items-center gap-3">
                  {index > 0 && (
                    <CaretRightIcon size={10} weight="bold" className="text-slate-300" />
                  )}
                  
                  {isLast ? (
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60">
                      {label}
                    </span>
                  ) : (
                    <Link
                      href={href}
                      className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      {label}
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </nav>

        {/* SEARCH TRIGGER */}
        <div className="w-px h-4 bg-slate-200" />
        <button className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group">
          <MagnifyingGlassIcon size={16} weight="bold" />
        </button>
      </div>
    </motion.header>
  );
}
