"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  SquaresFourIcon,
  FileTextIcon,
  UsersThreeIcon,
  PackageIcon,
  PlusIcon,
  CreditCardIcon,
  GearSixIcon,
  SignOutIcon,
  IconProps,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useUser, useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuotes } from "@/features/quotes/components/quote-context";
import { QuoteRegistryStats } from "@/types/quote-registry";

// Hook sécurisé pour fonctionner hors contexte QuoteProvider
function useSafeQuotes() {
  try {
    return useQuotes();
  } catch {
    return {
      stats: {
        countByStatus: {
          DRAFT: 0,
          SENT: 0,
          ACCEPTED: 0,
          PAID: 0,
          REJECTED: 0,
          ALL: 0,
        },
        totalPipelineValue: 0,
        totalOutstandingValue: 0,
        totalCashCollected: 0,
        conversionRate: 0,
      } as QuoteRegistryStats,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RAIL DOCK CONFIGURATION - 64px High-Density Sidebar
// ═══════════════════════════════════════════════════════════════════════════════

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<IconProps>;
  badge?: "drafts" | "notifications";
}

const TOP_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: SquaresFourIcon },
  { label: "Devis", href: "/quotes", icon: FileTextIcon, badge: "drafts" },
  { label: "Clients", href: "/clients", icon: UsersThreeIcon },
  { label: "Catalogue", href: "/catalog", icon: PackageIcon },
];

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: "Nouveau Devis", href: "/quotes/new", icon: PlusIcon },
  { label: "Facturation", href: "/billing", icon: CreditCardIcon },
  { label: "Paramètres", href: "/settings", icon: GearSixIcon },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SPATIAL RAIL - Fixed 64px Sidebar with High-Density Navigation
// ═══════════════════════════════════════════════════════════════════════════════

export function SpatialDock() {
  const { stats } = useSafeQuotes();

  // Get draft count for badge
  const draftCount = stats.countByStatus?.DRAFT || 0;

  return (
    <motion.aside
      className="fixed left-0 top-10 bottom-0 z-40 w-16 bg-white/90 backdrop-blur-md border-r border-slate-200 flex flex-col"
      initial={{ x: -64, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ═══ SECTION HAUTE : Navigation Principale ═══ */}
      <nav className="flex-1 flex flex-col gap-0.5 pt-2">
        {TOP_NAV_ITEMS.map((item) => (
          <RailIcon
            key={item.href}
            {...item}
            badgeValue={item.badge === "drafts" ? draftCount : undefined}
          />
        ))}
      </nav>

      {/* ═══ SÉPARATEUR ═══ */}
      <div className="mx-3 my-2 h-px bg-slate-200" />

      {/* ═══ SECTION BASSE : Actions Secondaires ═══ */}
      <nav className="flex flex-col gap-0.5 pb-2">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <RailIcon key={item.href} {...item} />
        ))}

        {/* Séparateur fin avant profil */}
        <div className="mx-3 my-2 h-px bg-slate-200" />

        {/* Profil / Déconnexion */}
        <UserProfileRail />
      </nav>
    </motion.aside>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RAIL ICON - Dense 64px Navigation Item with Selection State & Badges
// ═══════════════════════════════════════════════════════════════════════════════

function RailIcon({
  label,
  href,
  icon: Icon,
  badgeValue,
}: {
  label: string;
  href: string;
  icon: React.ComponentType<IconProps>;
  badgeValue?: number;
}) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  const showBadge = badgeValue && badgeValue > 0;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href} className="relative block">
            {/* ═══ ÉTAT DE SÉLECTION : Rectangle plein largeur ═══ */}
            {isActive && (
              <motion.div
                layoutId="rail-selection"
                className="absolute inset-y-1 left-0 right-0 bg-indigo-50 border-l-2 border-indigo-500 rounded-r-md"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            <div
              className={cn(
                "relative z-10 flex items-center justify-center w-16 h-11 transition-colors",
                isActive
                  ? "text-indigo-600"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50",
              )}
            >
              <div className="relative">
                <Icon
                  size={20}
                  weight={isActive ? "fill" : "regular"}
                  className="transition-transform duration-150"
                />

                {/* ═══ BADGE NUMÉRIQUE ═══ */}
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {badgeValue > 99 ? "99+" : badgeValue}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="ml-2 bg-slate-900 text-white font-medium text-[11px] px-2 py-1 rounded shadow-lg"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER PROFILE RAIL - Compact Avatar with Sign Out
// ═══════════════════════════════════════════════════════════════════════════════

function UserProfileRail() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => signOut()}
            className="relative flex items-center justify-center w-16 h-11 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors group"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 group-hover:border-rose-200 transition-colors">
              <Avatar className="w-full h-full">
                <AvatarImage src={user?.imageUrl} className="object-cover" />
                <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px] font-bold">
                  {user?.firstName?.charAt(0) ||
                    user?.emailAddresses[0]?.emailAddress?.charAt(0) ||
                    "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="ml-2 bg-rose-50 text-rose-600 font-medium text-[11px] px-2 py-1 rounded flex items-center gap-1.5"
        >
          <SignOutIcon size={12} />
          Déconnexion
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
