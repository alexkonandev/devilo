"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import {
  DS_LP_SECTION,
  DS_LP_MAX_W,
  DS_LP_HEADER,
  DS_LP_TITLE,
  DS_LP_ACCENT,
  DS_LP_TAG,
  DS_LP_FAQ_ITEM,
  DS_LP_FAQ_Q,
  DS_LP_FAQ_ARR,
  DS_LP_FAQ_A,
  DS_LP_FAQ_REF,
} from "@/lib/design-system";

const faqs = [
  {
    ref: "REF-001",
    q: "Comment fonctionne l'essai gratuit ?",
    a: "L'essai gratuit de 14 jours vous donne accès à toutes les fonctionnalités de l'offre Pro. Aucune carte bancaire requise.",
  },
  {
    ref: "REF-002",
    q: "Puis-je exporter mes données ?",
    a: "Oui, vous pouvez exporter tous vos devis et données clients au format PDF ou CSV à tout moment.",
  },
  {
    ref: "REF-003",
    q: "Y a-t-il un engagement ?",
    a: "Non, vous pouvez résilier votre abonnement à tout moment. Pas de frais cachés, pas de surprise.",
  },
  {
    ref: "REF-004",
    q: "Proposez-vous des tarifs pour les étudiants ?",
    a: "Oui, contactez-nous avec votre carte étudiante pour bénéficier de 50% de réduction la première année.",
  },
];

export default function LandingFaq() {
  return (
    <section className={DS_LP_SECTION}>
      <div className={DS_LP_MAX_W}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={DS_LP_HEADER}
        >
          <span className={DS_LP_TAG}>FAQ</span>
          <h2 className={DS_LP_TITLE}>Questions fréquentes</h2>
          <div className={DS_LP_ACCENT} />
        </motion.div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <motion.details
              key={faq.ref}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={DS_LP_FAQ_ITEM}
            >
              <summary className={DS_LP_FAQ_Q}>
                <div className="flex items-center gap-3">
                  <span className={DS_LP_FAQ_REF}>{faq.ref}</span>
                  <span>{faq.q}</span>
                </div>
                <ArrowRight className={DS_LP_FAQ_ARR} />
              </summary>
              <p className={DS_LP_FAQ_A}>{faq.a}</p>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}