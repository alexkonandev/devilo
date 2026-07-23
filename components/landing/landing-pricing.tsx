"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";
import {
  DS_LP_SECTION_ALT,
  DS_LP_MAX_W,
  DS_LP_HEADER,
  DS_LP_TITLE,
  DS_LP_ACCENT,
  DS_LP_TAG,
  DS_LP_GRID_2,
  DS_LP_PRICE_CARD,
  DS_LP_PRICE_POP,
  DS_LP_PRICE_BADGE,
  DS_LP_PRICE_NAME,
  DS_LP_PRICE_AMT,
  DS_LP_PRICE_PER,
  DS_LP_PRICE_DESC,
  DS_LP_PRICE_FEAT,
  DS_LP_PRICE_FEAT_ITEM,
  DS_LP_PRICE_CHECK,
  DS_LP_PRICE_CTA,
  DS_LP_PRICE_CTA_PRI,
  DS_LP_PRICE_CTA_SEC,
} from "@/lib/design-system";

const plans = [
  {
    name: "Gratuit",
    amount: "0",
    per: "/mois",
    desc: "Pour commencer",
    popular: false,
    features: ["Devis limités", "Modèle de base", "Export PDF"],
    cta: "Commencer",
    href: "/sign-up",
    primary: false,
  },
  {
    name: "Pro",
    amount: "13 000",
    per: "/mois",
    desc: "Pour les freelances actifs",
    popular: true,
    features: [
      "Devis illimités",
      "10 modèles premium",
      "Personnalisation complète",
      "Suivi des paiements",
    ],
    cta: "Essayer gratuitement",
    href: "/sign-up",
    primary: true,
  },
];

interface LandingPricingProps {
  userId: string | null;
}

export default function LandingPricing({ userId }: LandingPricingProps) {
  // Masquer la section tarifs pour les utilisateurs déjà connectés
  if (userId) return null;

  return (
    <section id="pricing" className={DS_LP_SECTION_ALT}>
      <div className={DS_LP_MAX_W}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={DS_LP_HEADER}
        >
          <span className={DS_LP_TAG}>Tarifs</span>
          <h2 className={DS_LP_TITLE}>Simple & transparent</h2>
          <div className={DS_LP_ACCENT} />
        </motion.div>

        <div className={DS_LP_GRID_2}>
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`${DS_LP_PRICE_CARD} ${plan.popular ? DS_LP_PRICE_POP : ""}`}
            >
              {plan.popular && <div className={DS_LP_PRICE_BADGE}>Populaire</div>}
              <h3 className={DS_LP_PRICE_NAME}>{plan.name}</h3>
              <div className={DS_LP_PRICE_AMT}>
                {plan.amount} <span className="text-sm text-zinc-500 font-normal">FCFA</span><span className={DS_LP_PRICE_PER}>{plan.per}</span>
              </div>
              <p className={DS_LP_PRICE_DESC}>{plan.desc}</p>
              <ul className={DS_LP_PRICE_FEAT}>
                {plan.features.map((feat) => (
                  <li key={feat} className={DS_LP_PRICE_FEAT_ITEM}>
                    <CheckCircle size={14} className={DS_LP_PRICE_CHECK} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`${DS_LP_PRICE_CTA} ${plan.primary ? DS_LP_PRICE_CTA_PRI : DS_LP_PRICE_CTA_SEC}`}
              >
                {plan.cta}
              </Link>
              {plan.popular && (
                <p className="mt-2 text-center text-xs text-zinc-500">
                  14 jours gratuits, sans carte bancaire
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}