"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, Trash, Envelope } from "@phosphor-icons/react";
import {
  DS_LP_TAG,
  DS_LP_TITLE,
  DS_LP_ACCENT,
  DS_LP_CARD,
} from "@/lib/design-system";

const sections = [
  {
    icon: Eye,
    title: "Donn\u00e9es collect\u00e9es",
    content:
      "Nous collectons uniquement les informations n\u00e9cessaires au fonctionnement du service : nom, adresse email, informations de facturation et documents que vous cr\u00e9ez. Aucune donn\u00e9e sensible n\u2019est stock\u00e9e sans votre consentement explicite.",
  },
  {
    icon: Lock,
    title: "Utilisation des donn\u00e9es",
    content:
      "Vos donn\u00e9es sont utilis\u00e9es exclusivement pour vous fournir le service, am\u00e9liorer votre exp\u00e9rience et vous assister en cas de besoin. Nous ne revendons aucune information \u00e0 des tiers. La publicit\u00e9 n\u2019est pas notre mod\u00e8le.",
  },
  {
    icon: ShieldCheck,
    title: "S\u00e9curit\u00e9",
    content:
      "Toutes les donn\u00e9es sont chiffr\u00e9es en transit (TLS 1.3) et au repos (AES-256). L\u2019acc\u00e8s \u00e0 votre compte est prot\u00e9g\u00e9 par une authentification s\u00e9curis\u00e9e. Nous effectuons des audits r\u00e9guliers pour garantir l\u2019int\u00e9grit\u00e9 de notre infrastructure.",
  },
  {
    icon: Trash,
    title: "Vos droits",
    content:
      "Vous pouvez \u00e0 tout moment acc\u00e9der, modifier ou supprimer vos donn\u00e9es personnelles depuis votre tableau de bord. Pour une demande de suppression compl\u00e8te, contactez-nous : nous traitons toute requ\u00eate sous 48 heures ouvr\u00e9es.",
  },
  {
    icon: Envelope,
    title: "Contact",
    content:
      "Pour toute question relative \u00e0 vos donn\u00e9es personnelles, \u00e9crivez-nous \u00e0 privacy@devilo.com. Nous nous engageons \u00e0 vous r\u00e9pondre personnellement sous 24 heures.",
  },
];

const TAG = "Confidentialit\u00e9";
const TITLE = "Vos donn\u00e9es vous appartiennent";
const DESC = "Nous croyons en une transparence radicale. Voici comment nous traitons vos informations.";
const FOOTER = "Derni\u00e8re mise \u00e0 jour : juillet 2026. En cas de modification importante de cette politique, vous serez notifi\u00e9 par email.";

export default function PrivacyPage() {
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