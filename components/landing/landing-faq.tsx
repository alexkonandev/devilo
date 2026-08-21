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
    q: "Factouro est-il vraiment gratuit ?",
    a: "Oui, Factouro est 100% gratuit. Toutes les fonctionnalités sont accessibles sans abonnement, sans carte bancaire et sans limite cachée.",
  },
  {
    ref: "REF-002",
    q: "Y a-t-il des limites d'utilisation ?",
    a: "Non. Devis, factures, export PDF et gestion des clients sont illimités pour tous les utilisateurs.",
  },
  {
    ref: "REF-003",
    q: "Puis-je exporter mes données ?",
    a: "Oui, vous pouvez exporter tous vos devis, factures et données clients au format PDF à tout moment.",
  },
  {
    ref: "REF-004",
    q: "Y a-t-il un engagement ou des frais cachés ?",
    a: "Aucun. Pas d'abonnement, pas de frais cachés, pas de surprise. Factouro reste gratuit, aujourd'hui comme demain.",
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