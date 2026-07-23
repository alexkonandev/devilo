"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkle, FileText, CheckCircle } from "@phosphor-icons/react";
import {
  DS_LP_SECTION_ALT,
  DS_LP_MAX_W,
  DS_LP_HEADER,
  DS_LP_TITLE,
  DS_LP_ACCENT,
  DS_LP_TAG,
  DS_LP_PIPELINE,
  DS_LP_PIPELINE_STEP,
  DS_LP_PIPELINE_NUM,
  DS_LP_PIPELINE_ICON,
  DS_LP_PIPELINE_TITLE,
  DS_LP_PIPELINE_DESC,
} from "@/lib/design-system";

const steps = [
  {
    num: "01",
    icon: Sparkle,
    title: "Créez",
    desc: "Saisissez vos informations en un clin d'œil",
  },
  {
    num: "02",
    icon: FileText,
    title: "Envoyez",
    desc: "Export PDF instantané, prêt à signer",
  },
  {
    num: "03",
    icon: CheckCircle,
    title: "Encaissez",
    desc: "Suivez les paiements en temps réel",
  },
];

export default function LandingWorkflow() {
  return (
    <section className={DS_LP_SECTION_ALT}>
      <div className={DS_LP_MAX_W}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={DS_LP_HEADER}
        >
          <span className={DS_LP_TAG}>Workflow</span>
          <h2 className={DS_LP_TITLE}>Épuration totale</h2>
          <div className={DS_LP_ACCENT} />
        </motion.div>

        <div className={DS_LP_PIPELINE}>
          {steps.map((step, i) => (
            <React.Fragment key={step.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className={DS_LP_PIPELINE_STEP}
              >
                <div className={DS_LP_PIPELINE_NUM}>{step.num}</div>
                <div className={DS_LP_PIPELINE_ICON}>
                  <step.icon size={24} weight="light" className="text-[var(--lp-accent)]" />
                </div>
                <span className={DS_LP_PIPELINE_TITLE}>{step.title}</span>
                <span className={DS_LP_PIPELINE_DESC}>{step.desc}</span>
              </motion.div>
              {i < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.2 + 0.3 }}
                  className="hidden md:block w-16 h-px bg-gradient-to-r from-[var(--lp-accent)] to-transparent shrink-0"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}