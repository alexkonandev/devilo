"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Lightning, ShieldCheck, Clock } from "@phosphor-icons/react";
import {
  DS_LP_SECTION,
  DS_LP_MAX_W,
  DS_LP_HEADER,
  DS_LP_TITLE,
  DS_LP_ACCENT,
  DS_LP_TAG,
  DS_LP_GRID_2,
  DS_LP_CARD,
  DS_LP_CARD_ICON,
  DS_LP_CARD_TITLE,
  DS_LP_CARD_DESC,
  DS_LP_CARD_TAG,
} from "@/lib/design-system";

const features = [
  {
    icon: FileText,
    tag: "PDF",
    title: "Devis élégants",
    desc: "Générez des documents professionnels au design soigné, prêts à impressionner vos clients.",
  },
  {
    icon: Lightning,
    tag: "RAPIDE",
    title: "Création express",
    desc: "Remplissez, personnalisez et exportez en moins de 2 minutes. Vos modèles sont sauvegardés.",
  },
  {
    icon: ShieldCheck,
    tag: "SÉCURISÉ",
    title: "Données protégées",
    desc: "Chiffrement de bout en bout. Vos données clients et financières sont en sécurité.",
  },
  {
    icon: Clock,
    tag: "SUIVI",
    title: "Paiements trackés",
    desc: "Suivez le statut de vos devis en temps réel. Recevez des notifications à chaque étape.",
  },
];

export default function LandingFeatures() {
  return (
    <section id="features" className={DS_LP_SECTION}>
      <div className={DS_LP_MAX_W}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={DS_LP_HEADER}
        >
          <span className={DS_LP_TAG}>Fonctionnalités</span>
          <h2 className={DS_LP_TITLE}>Tout ce qu'il vous faut</h2>
          <div className={DS_LP_ACCENT} />
        </motion.div>

        <div className={DS_LP_GRID_2}>
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={DS_LP_CARD}
            >
              <div className={DS_LP_CARD_ICON}>
                <feat.icon size={20} className="text-[var(--lp-accent)]" />
              </div>
              <span className={DS_LP_CARD_TAG}>{feat.tag}</span>
              <h3 className={DS_LP_CARD_TITLE}>{feat.title}</h3>
              <p className={DS_LP_CARD_DESC}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}