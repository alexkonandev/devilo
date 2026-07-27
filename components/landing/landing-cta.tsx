"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import {
  DS_LP_CTA,
  DS_LP_FINAL,
  DS_LP_FINAL_TITLE,
  DS_LP_FINAL_DESC,
  DS_LP_FINAL_BTNS,
  DS_LP_FINAL_BTN_PRI,
  DS_LP_FINAL_BTN_SEC,
} from "@/lib/design-system";

interface LandingCtaProps {
  userId: string | null;
  hasQuote: boolean;
}

export default function LandingCta({ userId, hasQuote }: LandingCtaProps) {
  // Si l'utilisateur est connecté et a déjà créé au moins un devis, on masque ce bloc
  if (hasQuote) return null;

  return (
    <section className={DS_LP_CTA}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={DS_LP_FINAL}
      >
        <h2 className={DS_LP_FINAL_TITLE}>Prêt à commencer ?</h2>
        <p className={DS_LP_FINAL_DESC}>
          Simplifiez votre facturation et concentrez-vous sur lessentiel&nbsp;: votre activit&eacute;.
        </p>
        <div className={DS_LP_FINAL_BTNS}>
          {userId ? (
            <Link href="/quotes/new" className={DS_LP_FINAL_BTN_PRI}>
              Créer mon premier devis
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          ) : (
            <Link href="/sign-up" className={DS_LP_FINAL_BTN_PRI}>
              Démarrer gratuitement
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          )}
          <Link href="/contact" className={DS_LP_FINAL_BTN_SEC}>
            Nous contacter
          </Link>
        </div>
      
      </motion.div>
    </section>
  );
}