"use client";

import React from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { RocketLaunch, SignOut } from "@phosphor-icons/react";
import {
  DS_LP_NAV,
  DS_LP_NAV_INNER,
  DS_LP_NAV_LINK,
  DS_LP_NAV_CTA,
} from "@/lib/design-system";

interface LandingNavProps {
  userId: string | null;
}

export default function LandingNav({ userId }: LandingNavProps) {
  const { signOut } = useClerk();

  return (
    <nav className={DS_LP_NAV}>
      <div className={DS_LP_NAV_INNER}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-(--lp-accent) flex items-center justify-center">
            <RocketLaunch size={14} weight="fill" className="text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Factouro</span>
        </Link>
        <div className="hidden sm:flex items-center gap-6">
          <Link href="#features" className={DS_LP_NAV_LINK}>
            Fonctionnalités
          </Link>
          {!userId && (
            <Link href="#pricing" className={DS_LP_NAV_LINK}>
              Tarifs
            </Link>
          )}
          <Link href="/contact" className={DS_LP_NAV_LINK}>
            Contact
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {userId ? (
            <>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 hover:text-white transition-all"
              >
                Mon espace
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center justify-center w-7 h-7 rounded-lg border border-red-500/40 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:border-red-500/60 transition-colors cursor-pointer"
                title="Déconnexion"
              >
                <SignOut size={14} />
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className={DS_LP_NAV_LINK}>
                Connexion
              </Link>
              <Link href="/sign-up" className={DS_LP_NAV_CTA}>
                Démarrer
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
