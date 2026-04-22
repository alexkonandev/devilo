"use client";

import React, { useRef } from "react";
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

const DOCK_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: SquaresFourIcon },
  { label: "Devis", href: "/quotes", icon: FileTextIcon },
  { label: "Clients", href: "/clients", icon: UsersThreeIcon },
  { label: "Catalogue", href: "/catalog", icon: PackageIcon },
  { type: "divider" },
  { label: "Nouveau", href: "/quotes/new", icon: PlusIcon, isAction: true },
  { type: "divider" },
  { label: "Facturation", href: "/billing", icon: CreditCardIcon },
  { label: "Réglages", href: "/settings", icon: GearSixIcon },
] as const;

export function SpatialDock() {
  return (
    <motion.div
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3 p-3 rounded-[2rem] bg-white/80 backdrop-blur-md border border-white shadow-2xl shadow-slate-200/50"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      {DOCK_ITEMS.map((item, idx) =>
        "type" in item ? (
          <div
            key={`sep-${idx}`}
            className="w-8 h-[1px] bg-slate-200 rounded-full my-1"
          />
        ) : (
          <DockIcon
            key={item.href}
            {...item}
          />
        )
      )}
      
      <div className="w-8 h-[1px] bg-slate-200 rounded-full my-1" />
      
      <UserProfileIcon />
    </motion.div>
  );
}

function DockIcon({
  label,
  href,
  icon: Icon,
  isAction,
}: {
  label: string;
  href: string;
  icon: React.ComponentType<IconProps>;
  isAction?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href} ref={ref}>
            <motion.div
              className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center relative transition-colors aspect-square",
                isActive
                  ? "bg-indigo-50 text-indigo-600 border border-indigo-200/60"
                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-100",
                isAction && "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border border-indigo-200/60"
              )}
            >
              <Icon
                size={22}
                weight={isActive ? "fill" : "regular"}
                className="transition-transform duration-300"
              />
              
              {isActive && !isAction && (
                <motion.div
                  layoutId="active-dot"
                  className="absolute -right-1.5 w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]"
                />
              )}
            </motion.div>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="ml-4 bg-slate-900 backdrop-blur border border-slate-800 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function UserProfileIcon() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={() => signOut()} ref={ref}>
            <motion.div
              className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 grayscale hover:grayscale-0 transition-all aspect-square"
            >
              <Avatar className="w-full h-full">
                <AvatarImage src={user?.imageUrl} className="object-cover" />
                <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px]">
                  {user?.firstName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="ml-4 bg-rose-50 backdrop-blur border border-rose-200 text-rose-600 font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-2"
        >
          <SignOutIcon /> Déconnexion
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}