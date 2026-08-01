"use client";

import { motion } from "framer-motion";
import { Building, Globe, Envelope, FileText, Shield } from "@phosphor-icons/react";
import {
  DS_LP_TAG,
  DS_LP_TITLE,
  DS_LP_ACCENT,
  DS_LP_CARD,
} from "@/lib/design-system";

const sections = [
  {
    icon: Building,
    title: "Identité de l'éditeur",
    content:
      "Factouro est édité par la société Factouro SAS, au capital de 1 000 €, immatriculée au RCS d'Abidjan sous le numéro CI-ABJ-2026-B-00001.",
  },
  {
    icon: Envelope,
    title: "Coordonnées",
    content:
      "Siège social : Abidjan, Côte d'Ivoire. Email : contact@factouro.com. Directeur de la publication : Alexandre K.",
  },
  {
    icon: Globe,
    title: "Hébergement",
    content:
      "Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis, et utilise Cloudflare pour la distribution de contenu et la sécurité.",
  },
  {
    icon: FileText,
    title: "Propriété intellectuelle",
    content:
      "L'ensemble du contenu du site (design, code, textes, logos) est la propriété exclusive de Factouro SAS. Toute reproduction ou utilisation sans autorisation est interdite.",
  },
  {
    icon: Shield,
    title: "Données personnelles",
    content:
      "Factouro accorde une importance particulière à la protection de vos données. Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour en savoir plus, consultez notre page Confidentialité.",
  },
];

const TAG = "Mentions légales";
const TITLE = "Mentions légales";
const DESC = "Conformément à la loi, voici les informations relatives à l'édition et à l'hébergement du site Factouro.";
const FOOTER = "Dernière mise à jour : juillet 2026.";

export default function LegalPage() {
  return (
    <div className="space-y-16">
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center pt-12"
      >
        <span className={DS_LP_TAG}>{TAG}</span>
        <h1 className={DS_LP_TITLE}>{TITLE}</h1>
        <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">{DESC}</p>
        <div className={DS_LP_ACCENT} />
      </motion.div>

      {/* SECTIONS */}
      <div className="grid gap-6 max-w-3xl mx-auto">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * i }}
            className={DS_LP_CARD}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <section.icon size={20} className="text-[var(--lp-accent)]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{section.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FOOTER NOTE */}
      <p className="text-center text-xs text-zinc-600 max-w-md mx-auto">{FOOTER}</p>
    </div>
  );
}