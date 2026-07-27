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
  variant?: "default" | "primary" | "home";
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  primary: [
    { label: "Accueil", href: "/home", icon: HouseIcon, variant: "home" },
  ],
  business: [
    { label: "Devis", href: "/quotes", icon: FileTextIcon },
    { label: "Clients", href: "/clients", icon: UsersThreeIcon },
    { label: "Facturation", href: "/billing", icon: CreditCardIcon },
  ],
  action: [
    { label: "Nouveau Devis", href: "/quotes/new", icon: PlusIcon, variant: "primary" },
  ],
  config: [
    { label: "Paramètres", href: "/settings", icon: GearSixIcon },
  ],
};

function Separator({ className }: { className?: string }) {
  return <div className={cn("w-5 border-t border-slate-100", className)} />;
}

export function SpatialDock() {
  return (
    <aside className="fixed left-0 top-10 bottom-0 z-40 w-16 bg-white border-r border-slate-200 flex flex-col items-center pt-6 pb-3">
      <TooltipProvider delayDuration={0}>
        {/* Niveau 1 — Accueil */}
        {NAV_ITEMS.primary.map((item) => (
          <RailIcon key={item.href} {...item} />
        ))}

        {/* Espaceur flexible : pousse les modules métier vers le centre */}
        <div className="flex-1" />

        <Separator />

        {/* Niveau 2 — Modules métier */}
        <div className="flex flex-col items-center gap-1">
          {NAV_ITEMS.business.map((item) => (
            <RailIcon key={item.href} {...item} />
          ))}
        </div>

        {/* Espaceur flexible : pousse CTA + Config vers le bas */}
        <div className="flex-1" />

        <Separator />

        {/* Niveau 3 — Action primaire (CTA) */}
        {NAV_ITEMS.action.map((item) => (
          <RailIcon key={item.href} {...item} />
        ))}

        <Separator className="my-2" />

        {/* Niveau 4 — Configuration */}
        {NAV_ITEMS.config.map((item) => (
          <RailIcon key={item.href} {...item} />
        ))}
      </TooltipProvider>
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
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ease-out",
            // ── Variant home (rond foncé distinctif) ──
            variant === "home" &&
              "rounded-full bg-slate-900 text-white hover:bg-slate-800 hover:scale-110 ring-0",
            // ── Variant default ──
            variant === "default" && isActive &&
              "bg-gradient-to-br from-indigo-50 to-indigo-100/80 text-indigo-600 ring-1 ring-indigo-200/50",
            variant === "default" && !isActive &&
              "text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 hover:scale-110",
            // ── Variant primary (CTA bouton plein) ──
            variant === "primary" && !isActive &&
              "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105",
            variant === "primary" && isActive &&
              "bg-indigo-700 text-white ring-2 ring-indigo-300",
          )}
        >
          {/* Rail gauche — item actif (default only, pas sur home) */}
          {isActive && variant === "default" && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-5 rounded-full bg-indigo-500" />
          )}
          <Icon
            size={variant === "primary" ? 20 : 18}
            weight={isActive ? "fill" : "regular"}
          />
        </Link>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="ml-2 bg-slate-800 text-white text-[10px] font-mono font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}