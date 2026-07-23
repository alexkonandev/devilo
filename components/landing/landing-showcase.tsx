"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  DS_LP_SECTION,
  DS_LP_MAX_W,
  DS_LP_HEADER,
  DS_LP_TITLE,
  DS_LP_ACCENT,
  DS_LP_TAG,
  DS_LP_SHOWCASE,
  DS_LP_SHOWCASE_HEADER,
  DS_LP_SHOWCASE_DOT,
  DS_LP_SHOWCASE_BADGE,
} from "@/lib/design-system";

export default function LandingShowcase() {
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
          <span className={DS_LP_TAG}>Démo</span>
          <h2 className={DS_LP_TITLE}>Voyez par vous-même</h2>
          <div className={DS_LP_ACCENT} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={DS_LP_SHOWCASE}
        >
          <div className={DS_LP_SHOWCASE_HEADER}>
            <div className={DS_LP_SHOWCASE_DOT} />
            <div className={DS_LP_SHOWCASE_DOT} />
            <div className={DS_LP_SHOWCASE_DOT} />
            <span className={DS_LP_SHOWCASE_BADGE}>Studio Preview</span>
          </div>

          {/* ─── Lecteur vidéo de la démo ─── */}
          <div className="relative bg-[#121214]">
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
        </motion.div>
      </div>
    </section>
  );
}