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
} from "@/lib/design-system";

interface LandingHeroProps {
  userId: string | null;
}

export default function LandingHero({ userId }: LandingHeroProps) {
  return (
    <section className={DS_LP_HERO}>
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className={DS_LP_HERO_TITLE}>
            La facturation, enfin devenue belle grâce à <br />
            <span className="font-artistic italic tracking-wide bg-gradient-to-r from-indigo-200 to-purple-300 bg-clip-text text-transparent">
              Devilo
            </span>
          </h1>
          <p className={DS_LP_HERO_DESC}>
            Créez des devis élégants en quelques secondes. Suivez vos paiements.
            Concentrez-vous sur votre vrai métier.
          </p>
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
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--lp-accent)] text-white font-medium hover:opacity-90 transition-all shadow-[0_0_20px_var(--lp-accent-glow)]"
            >
              Créer un devis
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--lp-accent)] text-white font-medium hover:opacity-90 transition-all shadow-[0_0_20px_var(--lp-accent-glow)]"
              >
                Démarrer gratuitement
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-zinc-400 border border-zinc-800 hover:text-white transition-all"
              >
                Connexion
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}