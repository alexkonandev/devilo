"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretRightIcon, HouseIcon } from "@phosphor-icons/react";

/**
 * PATH_MAP : Traduction française avec sémantique "Système"
 */
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

export function AppBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 select-none"
    >
      <Link
        href="/dashboard"
        className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-all"
      >
        <HouseIcon size={14} weight="bold" />
      </Link>

      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;

        const label =
          PATH_MAP[segment] ||
          (segment.length > 10
            ? `REF:${segment.slice(-6).toUpperCase()}`
            : segment);

        return (
          <div key={href} className="flex items-center gap-2">
            <CaretRightIcon
              size={10}
              weight="bold"
              className="text-slate-300"
            />

            {isLast ? (
              /* LE DERNIER SEGMENT : Pilule Spatial Intelligence */
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full shadow-sm shadow-indigo-500/5">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 hover:text-slate-950 transition-colors px-1"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
