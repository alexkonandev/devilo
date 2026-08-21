"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import {
  DS_LP_HERO,
  DS_LP_HERO_TITLE,
  DS_LP_HERO_DESC,
  DS_LP_HERO_CTA,
  DS_LP_HERO_PREVIEW,
  DS_LP_SHOWCASE,
  DS_LP_SHOWCASE_HEADER,
  DS_LP_SHOWCASE_DOT,
  DS_LP_SHOWCASE_BADGE,
} from "@/lib/design-system";

interface LandingHeroProps {
  userId: string | null;
}

export default function LandingHero({ userId }: LandingHeroProps) {
  return (
    <section className={DS_LP_HERO}>
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="max-w-8xl mx-auto">
          <h1 className={DS_LP_HERO_TITLE}>
            La facturation, enfin devenue belle avec <br className="hidden sm:block" />
            <span className="font-artistic italic tracking-wide text-[var(--lp-accent)]">
                Factouro
              </span>
          </h1>
          <p className={DS_LP_HERO_DESC}>
            Créez des devis élégants en quelques secondes et concentrez-vous sur votre vrai métier.
          </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={DS_LP_HERO_CTA}
        >
          {userId ? (
            <Link
              href="/quotes/new"
              className="inline-flex items-center gap-2 px-8 py-2 rounded-xl bg-[var(--lp-accent)] text-white font-medium hover:opacity-90 transition-all shadow-[0_0_20px_var(--lp-accent-glow)]"
            >
              Créer un devis
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[var(--lp-accent)] text-white font-medium hover:opacity-90 transition-all shadow-[0_0_20px_var(--lp-accent-glow)]"
              >
                Commencer gratuitement
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 px-8 py-2 rounded-xl font-medium text-zinc-600 border border-zinc-200 hover:text-zinc-900 hover:border-zinc-300 transition-all"
              >
                Connexion
              </Link>
            </>
          )}
        </motion.div>
      </div>

      {/* ─── Aperçu produit style Notion, pleine largeur de la section ─── */}
      <div className={DS_LP_HERO_PREVIEW}>
        <div className={DS_LP_SHOWCASE}>
          <div className={DS_LP_SHOWCASE_HEADER}>
            <div className={DS_LP_SHOWCASE_DOT} />
            <div className={DS_LP_SHOWCASE_DOT} />
            <div className={DS_LP_SHOWCASE_DOT} />
            <span className={DS_LP_SHOWCASE_BADGE}>Studio Preview</span>
          </div>
          <div className="relative bg-zinc-100">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto block"
            >
              <source src="/demo-editor.mp4" type="video/mp4" />
              Ton navigateur ne supporte pas la lecture vidéo.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}