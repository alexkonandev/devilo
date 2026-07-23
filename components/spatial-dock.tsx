"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HouseIcon,
  FileTextIcon,
  UsersThreeIcon,
  PlusIcon,
  CreditCardIcon,
  GearSixIcon,
  IconProps,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<IconProps>;
  variant?: "default" | "primary";
}

const TOP_NAV_ITEMS: NavItem[] = [
  { label: "Accueil", href: "/home", icon: HouseIcon },
  { label: "Nouveau Devis", href: "/quotes/new", icon: PlusIcon, variant: "primary" },
];

const MIDDLE_NAV_ITEMS: NavItem[] = [
  { label: "Devis", href: "/quotes", icon: FileTextIcon },
  { label: "Clients", href: "/clients", icon: UsersThreeIcon },
];

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: "Facturation", href: "/billing", icon: CreditCardIcon },
  { label: "Paramètres", href: "/settings", icon: GearSixIcon },
];

export function SpatialDock() {
  return (
    <aside className="fixed left-0 top-12 bottom-0 z-40 w-16 bg-white border-r border-slate-200 flex flex-col">
      {/* Niveau 1 — Accueil + Action primaire */}
      <nav className="flex flex-col items-center gap-1.5 pt-4">
        {TOP_NAV_ITEMS.map((item) => (
          <RailIcon key={item.href} {...item} />
        ))}
      </nav>

      {/* Séparateur décoratif — losanges */}
      <div className="flex items-center justify-center w-full my-2">
        <div className="flex items-center gap-[3px]">
          <span className="w-[3px] h-[3px] rounded-full bg-slate-300" />
          <span className="w-[3px] h-[3px] rounded-full bg-slate-300" />
          <span className="w-[3px] h-[3px] rounded-full bg-slate-300" />
        </div>
      </div>

      {/* Niveau 2 — Consultation */}
      <nav className="flex flex-col items-center gap-1.5">
        {MIDDLE_NAV_ITEMS.map((item) => (
          <RailIcon key={item.href} {...item} />
        ))}
      </nav>

      {/* Espace flexible pour pousser les actions tertiaires en bas */}
      <div className="flex-1" />

      {/* Séparateur subtil — points */}
      <div className="flex items-center justify-center w-full my-1">
        <div className="flex items-center gap-[2px]">
          <span className="w-[2px] h-[2px] rounded-full bg-slate-200" />
          <span className="w-[2px] h-[2px] rounded-full bg-slate-200" />
          <span className="w-[2px] h-[2px] rounded-full bg-slate-200" />
        </div>
      </div>

      {/* Niveau 3 — Configuration */}
      <nav className="flex flex-col items-center gap-1.5 pb-4">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <RailIcon key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  );
}

function RailIcon({
  label,
  href,
  icon: Icon,
  variant = "default",
}: NavItem) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "relative flex items-center justify-center w-12 h-12 rounded-xl transition-all",
              // Accent bar à gauche pour l'item actif
              isActive && "border-l-2 border-indigo-400 rounded-l-sm",
              // Variant primary (Nouveau Devis) — fond indigo subtil au repos
              variant === "primary" && !isActive && "text-indigo-500 hover:text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 border border-indigo-200/60",
              variant === "primary" && isActive && "bg-indigo-50 text-indigo-600 border border-indigo-300",
              // Variant default
              variant === "default" && isActive && "bg-indigo-50 text-indigo-600 border border-indigo-200",
              variant === "default" && !isActive && "text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent",
              // Ajuster le padding-left pour compenser la border-l-2 active
              isActive && "pl-0.5",
            )}
          >
            <Icon size={variant === "primary" ? 24 : 22} weight={isActive ? "fill" : "regular"} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2 bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-lg font-medium">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}