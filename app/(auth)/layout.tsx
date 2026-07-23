"use client";

import React from "react";
import Link from "next/link";
import { RocketLaunch } from "@phosphor-icons/react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--lp-bg)] text-[var(--lp-text)] font-sans antialiased">
      {/* Colonne gauche : formulaire */}
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--lp-accent)] flex items-center justify-center">
              <RocketLaunch size={14} weight="fill" className="text-white" />
            </div>
            <span className="text-sm font-semibold text-[var(--lp-text)]">Devilo</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          {children}
        </div>
      </div>

      {/* Colonne droite : branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#111113] relative flex-col justify-center p-16 overflow-hidden border-l border-[var(--lp-border)]">
        {/* Grille de fond subtile */}
        <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative z-10 space-y-12">
          <div className="space-y-4">
            <div className="w-12 h-1 bg-[var(--lp-accent)] rounded-full" />
            <h2 className="text-4xl font-bold tracking-tight leading-tight text-[var(--lp-text)]">
              La facturation,
              <br />
              <span className="text-[var(--lp-accent)]">enfin devenue belle</span>
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed max-w-md">
              Créez des devis élégants en quelques secondes. Suivez vos
              paiements. Concentrez-vous sur votre vrai métier.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { label: "Devis élégants", desc: "Générez des documents professionnels au design soigné" },
              { label: "Création express", desc: "Remplissez, personnalisez et exportez en moins de 2 minutes" },
              { label: "Paiements trackés", desc: "Suivez le statut de vos devis en temps réel" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[var(--lp-card)] border border-[var(--lp-border)] rounded-xl p-5 flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[var(--lp-accent)]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--lp-text)]">{item.label}</div>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-16 right-16 flex items-center gap-4 opacity-20">
          <div className="h-px flex-1 bg-[var(--lp-border)]" />
          <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">
            Infrastructure_Abidjan_2026
          </span>
        </div>
      </div>
    </div>
  );
}
