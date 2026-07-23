"use client";

import { motion } from "framer-motion";
import { FileText, CreditCard, Scales, Shield, Gavel } from "@phosphor-icons/react";
import {
  DS_LP_TAG,
  DS_LP_TITLE,
  DS_LP_ACCENT,
  DS_LP_CARD,
} from "@/lib/design-system";

const clauses = [
  {
    icon: FileText,
    title: "Acceptation des conditions",
    content:
      "En cr\u00e9ant un compte et en utilisant Devilo, vous acceptez les pr\u00e9sentes conditions g\u00e9n\u00e9rales. Si vous n\u2019acceptez pas ces conditions, veuillez ne pas utiliser le service.",
  },
  {
    icon: Shield,
    title: "Description du service",
    content:
      "Devilo est un outil SaaS de cr\u00e9ation et de gestion de devis professionnels. Nous nous engageons \u00e0 maintenir le service accessible et fonctionnel, sans garantie absolue de disponibilit\u00e9 continue.",
  },
  {
    icon: CreditCard,
    title: "Facturation et abonnement",
    content:
      "L\u2019abonnement est mensuel ou annuel, sans engagement. Le non-paiement entra\u00eene une suspension du compte apr\u00e8s 48 heures. Vous pouvez r\u00e9silier \u00e0 tout moment depuis votre tableau de bord.",
  },
  {
    icon: Scales,
    title: "Responsabilit\u00e9s",
    content:
      "Vous \u00eates seul responsable de la conformit\u00e9 l\u00e9gale et fiscale des documents que vous g\u00e9n\u00e9rez. Devilo agit comme un outil technique et ne saurait \u00eatre tenu responsable d\u2019une mauvaise utilisation.",
  },
  {
    icon: Gavel,
    title: "Propri\u00e9t\u00e9 intellectuelle",
    content:
      "Le code, le design et l\u2019infrastructure de Devilo sont notre propri\u00e9t\u00e9 exclusive. Vous conservez l\u2019int\u00e9gralit\u00e9 des droits sur les documents que vous cr\u00e9ez via la plateforme.",
  },
];

const TAG = "Conditions";
const TITLE = "Conditions g\u00e9n\u00e9rales d\u2019utilisation";
const DESC = "En utilisant Devilo, vous acceptez les pr\u00e9sentes conditions. Nous faisons de notre mieux pour les rendre claires et \u00e9quitables.";
const FOOTER = "Derni\u00e8re mise \u00e0 jour : juillet 2026. Ces conditions peuvent \u00e9voluer. Vous serez inform\u00e9 de tout changement majeur par email.";

export default function TermsPage() {
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
        {clauses.map((clause, i) => (
          <motion.div
            key={clause.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * i }}
            className={DS_LP_CARD}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <clause.icon size={20} className="text-[var(--lp-accent)]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">{clause.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{clause.content}</p>
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