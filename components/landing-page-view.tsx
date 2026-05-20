"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RocketLaunch,
  ArrowRight,
  FileText,
  UsersThree,
  Lightning,
  CheckCircle,
  Sparkle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  DS_LP_NAV,
  DS_LP_NAV_INNER,
  DS_LP_HERO,
  DS_LP_HERO_TITLE,
  DS_LP_HERO_DESC,
  DS_LP_HERO_CTA,
  DS_LP_HERO_STATS,
  DS_LP_STAT_VAL,
  DS_LP_STAT_LBL,
  DS_LP_SECTION,
  DS_LP_SECTION_ALT,
  DS_LP_HEADER,
  DS_LP_TITLE,
  DS_LP_ACCENT,
  DS_LP_BADGE,
  DS_LP_BADGE_TEXT,
  DS_LP_GRID_2,
  DS_LP_GRID_3,
  DS_LP_MAX_W,
  DS_LP_MAX_W_LG,
  DS_LP_CARD,
  DS_LP_CARD_ICON,
  DS_LP_CARD_TITLE,
  DS_LP_CARD_DESC,
  DS_LP_CTA,
  DS_LP_FINAL,
  DS_LP_FINAL_TITLE,
  DS_LP_FINAL_DESC,
  DS_LP_FINAL_BTNS,
  DS_LP_FINAL_BTN_PRI,
  DS_LP_FINAL_BTN_SEC,
  DS_LP_FOOTER,
  DS_LP_FOOTER_BASE,
  DS_LP_FOOTER_BRAND,
  DS_LP_FOOTER_LOGO,
  DS_LP_FOOTER_NAME,
  DS_LP_FOOTER_DESC,
  DS_LP_FOOTER_TITRE,
  DS_LP_FOOTER_LIEN,
  DS_LP_FOOTER_COPY,
  DS_LP_NAV_LIEN,
  DS_LP_NAV_CONN,
  DS_LP_PRICE_CARD,
  DS_LP_PRICE_POP,
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
  DS_LP_FAQ_ITEM,
  DS_LP_FAQ_Q,
  DS_LP_FAQ_ARR,
  DS_LP_FAQ_A,
} from "@/lib/design-system";

interface LandingPageViewProps {
  userId: string | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function LandingPageView({ userId }: LandingPageViewProps) {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* ═══════════════ NAVIGATION ═══════════════ */}
      <nav className={DS_LP_NAV}>
        <div className={DS_LP_NAV_INNER}>
          <Link href="/" className="flex items-center gap-2">
            <div className={DS_LP_FOOTER_LOGO}>
              <RocketLaunch size={12} weight="fill" className="text-white" />
            </div>
            <span className="font-mono text-xs uppercase tracking-tight text-slate-900">
              DevisExpress
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {userId ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md font-mono text-[10px] uppercase tracking-wide hover:bg-slate-800 transition-all"
              >
                Console
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={DS_LP_NAV_CONN}
                >
                  Connexion
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md font-mono text-[10px] uppercase tracking-wide hover:bg-slate-800 transition-all"
                >
                  D&eacute;marrer
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className={DS_LP_HERO}>
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="text-center py-16"
        >
         

          {/* H1 */}
          <motion.h1
            variants={fadeInUp}
            className={DS_LP_HERO_TITLE}
          >
            La facturation,<br />enfin devenue belle.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className={DS_LP_HERO_DESC}
          >
            Cr&eacute;ez des devis &eacute;l&eacute;gants en quelques secondes. L'art de facturer, r&eacute;invent&eacute;.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeInUp} className={DS_LP_HERO_CTA}>
            <Link
              href={userId ? "/dashboard" : "/sign-up"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-mono text-[10px] uppercase tracking-wide text-white bg-slate-900 hover:bg-slate-800 transition-all group"
            >
              D&eacute;marrer maintenant
              <ArrowRight
                size={14}
                weight="bold"
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeInUp}
            className={DS_LP_HERO_STATS}
          >
            <div className="text-center">
              <div className={DS_LP_STAT_VAL}>15s</div>
              <div className={DS_LP_STAT_LBL}>Temps moyen</div>
            </div>
            <div className="text-center">
              <div className={DS_LP_STAT_VAL}>+500</div>
              <div className={DS_LP_STAT_LBL}>Freelances</div>
            </div>
            <div className="text-center hidden md:block">
              <div className={DS_LP_STAT_VAL}>99%</div>
              <div className={DS_LP_STAT_LBL}>Satisfaction</div>
            </div>
          </motion.div>

          {/* Preview - Bento flottant */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-16"
          >
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-md p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-3">
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-10 bg-slate-50 rounded border border-slate-100" />
                    <div className="space-y-1.5">
                      <div className="h-2 bg-slate-100 rounded w-full" />
                      <div className="h-2 bg-slate-100 rounded w-5/6" />
                      <div className="h-2 bg-slate-100 rounded w-4/6" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-16 bg-slate-50 rounded border border-slate-100 flex items-center justify-center">
                      <FileText
                        size={24}
                        weight="light"
                        className="text-slate-300"
                      />
                    </div>
                    <div className="h-10 bg-slate-900 rounded flex items-center justify-center">
                      <span className="text-white text-[10px] font-mono uppercase tracking-wide">
                        Envoyer
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ FEATURES SECTION ═══════════════ */}
      <section className={DS_LP_SECTION_ALT}>
        <div className={DS_LP_MAX_W}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={DS_LP_HEADER}
          >
            <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
              Fonctionnalit&eacute;s
            </span>
            <h2 className={DS_LP_TITLE}>L'art de la fonction</h2>
            <div className={DS_LP_ACCENT} />
          </motion.div>

          <div className={DS_LP_GRID_2}>
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={cn(DS_LP_CARD, "bg-white border border-slate-200 rounded-md")}
            >
              <div className={DS_LP_CARD_ICON}>
                <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <FileText
                    size={20}
                    weight="light"
                    className="text-slate-500"
                  />
                </div>
              </div>
              <h3 className={DS_LP_CARD_TITLE}>Devis artistiques</h3>
              <p className={DS_LP_CARD_DESC}>
                Des factures qui ressemblent &agrave; des &oelig;uvres d'art. Vos clients n'en croiront pas leurs yeux.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className={cn(DS_LP_CARD, "bg-white border border-slate-200 rounded-md")}
            >
              <div className={DS_LP_CARD_ICON}>
                <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <UsersThree
                    size={20}
                    weight="light"
                    className="text-slate-500"
                  />
                </div>
              </div>
              <h3 className={DS_LP_CARD_TITLE}>Gestion clients</h3>
              <p className={DS_LP_CARD_DESC}>
                Centralisez toutes les informations de vos clients. Historique, contacts, documents, tout au m&ecirc;me endroit.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={cn(DS_LP_CARD, "bg-white border border-slate-200 rounded-md")}
            >
              <div className={DS_LP_CARD_ICON}>
                <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Lightning
                    size={20}
                    weight="light"
                    className="text-slate-500"
                  />
                </div>
              </div>
              <h3 className={DS_LP_CARD_TITLE}>Rapidit&eacute; fulgurante</h3>
              <p className={DS_LP_CARD_DESC}>
                Un devis g&eacute;n&eacute;r&eacute; en moins de 15 secondes. Le temps d'une inspiration.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className={cn(DS_LP_CARD, "bg-white border border-slate-200 rounded-md")}
            >
              <div className={DS_LP_CARD_ICON}>
                <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Sparkle
                    size={20}
                    weight="light"
                    className="text-slate-500"
                  />
                </div>
              </div>
              <h3 className={DS_LP_CARD_TITLE}>Design sur mesure</h3>
              <p className={DS_LP_CARD_DESC}>
                Personnalisez chaque aspect de vos documents. Couleurs, polices, logos &mdash; soyez unique.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ WORKFLOW SECTION ═══════════════ */}
      <section className={DS_LP_SECTION}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={DS_LP_HEADER}
          >
            <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
              Workflow
            </span>
            <h2 className={DS_LP_TITLE}>&Eacute;puration totale</h2>
            <div className={DS_LP_ACCENT} />
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            {[
              { icon: Sparkle, text: "Cr&eacute;ez", desc: "Saisissez vos infos" },
              { icon: FileText, text: "Envoyez", desc: "Export PDF instantan&eacute;" },
              { icon: CheckCircle, text: "Encaissez", desc: "Suivez les paiements" },
            ].map((step, i) => (
              <motion.div
                key={step.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div className="w-16 h-16 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <step.icon
                    size={24}
                    weight="light"
                    className="text-slate-600"
                  />
                </div>
                <span className="font-mono text-sm uppercase tracking-tight text-slate-900">
                  {step.text}
                </span>
                <span className="font-sans text-xs text-slate-400">
                  {step.desc}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PRICING SECTION ═══════════════ */}
      <section className={DS_LP_SECTION_ALT}>
        <div className={DS_LP_MAX_W}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={DS_LP_HEADER}
          >
            <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
              Tarifs
            </span>
            <h2 className={DS_LP_TITLE}>Simple & transparent</h2>
            <div className={DS_LP_ACCENT} />
          </motion.div>

          <div className={DS_LP_GRID_3}>
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={cn(DS_LP_PRICE_CARD, "bg-white border border-slate-200 rounded-md")}
            >
              <h3 className={DS_LP_PRICE_NAME}>Gratuit</h3>
              <div className={DS_LP_PRICE_AMT}>0&euro;<span className={DS_LP_PRICE_PER}>/mois</span></div>
              <p className={DS_LP_PRICE_DESC}>Pour commencer</p>
              <div className={DS_LP_PRICE_FEAT}>
                <div className={DS_LP_PRICE_FEAT_ITEM}>
                  <CheckCircle size={14} className={DS_LP_PRICE_CHECK} />
                  <span>3 devis / mois</span>
                </div>
                <div className={DS_LP_PRICE_FEAT_ITEM}>
                  <CheckCircle size={14} className={DS_LP_PRICE_CHECK} />
                  <span>1 mod&egrave;le de base</span>
                </div>
                <div className={DS_LP_PRICE_FEAT_ITEM}>
                  <CheckCircle size={14} className={DS_LP_PRICE_CHECK} />
                  <span>Export PDF</span>
                </div>
              </div>
              <Link
                href="/sign-up"
                className={cn(DS_LP_PRICE_CTA, DS_LP_PRICE_CTA_SEC)}
              >
                Commencer
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className={cn(DS_LP_PRICE_CARD, DS_LP_PRICE_POP, "border-slate-900 rounded-md")}
            >
              <div className="absolute top-0 right-0 px-3 py-1 rounded-md bg-slate-900 text-white font-mono text-[9px] uppercase tracking-wide">
                Populaire
              </div>
              <h3 className={DS_LP_PRICE_NAME}>Pro</h3>
              <div className={DS_LP_PRICE_AMT}>19&euro;<span className={DS_LP_PRICE_PER}>/mois</span></div>
              <p className={DS_LP_PRICE_DESC}>Pour les freelances actifs</p>
              <div className={DS_LP_PRICE_FEAT}>
                <div className={DS_LP_PRICE_FEAT_ITEM}>
                  <CheckCircle size={14} className={DS_LP_PRICE_CHECK} />
                  <span>Devis illimit&eacute;s</span>
                </div>
                <div className={DS_LP_PRICE_FEAT_ITEM}>
                  <CheckCircle size={14} className={DS_LP_PRICE_CHECK} />
                  <span>10 mod&egrave;les premium</span>
                </div>
                <div className={DS_LP_PRICE_FEAT_ITEM}>
                  <CheckCircle size={14} className={DS_LP_PRICE_CHECK} />
                  <span>Personnalisation compl&egrave;te</span>
                </div>
                <div className={DS_LP_PRICE_FEAT_ITEM}>
                  <CheckCircle size={14} className={DS_LP_PRICE_CHECK} />
                  <span>Suivi des paiements</span>
                </div>
              </div>
              <Link
                href="/sign-up"
                className={cn(DS_LP_PRICE_CTA, DS_LP_PRICE_CTA_PRI)}
              >
                Essayer gratuitement
              </Link>
            </motion.div>

            {/* Enterprise */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={cn(DS_LP_PRICE_CARD, "bg-white border border-slate-200 rounded-md")}
            >
              <h3 className={DS_LP_PRICE_NAME}>&Eacute;quipe</h3>
              <div className={DS_LP_PRICE_AMT}>49&euro;<span className={DS_LP_PRICE_PER}>/mois</span></div>
              <p className={DS_LP_PRICE_DESC}>Pour les agences</p>
              <div className={DS_LP_PRICE_FEAT}>
                <div className={DS_LP_PRICE_FEAT_ITEM}>
                  <CheckCircle size={14} className={DS_LP_PRICE_CHECK} />
                  <span>Utilisateurs multiples</span>
                </div>
                <div className={DS_LP_PRICE_FEAT_ITEM}>
                  <CheckCircle size={14} className={DS_LP_PRICE_CHECK} />
                  <span>Mod&egrave;les personnalis&eacute;s</span>
                </div>
                <div className={DS_LP_PRICE_FEAT_ITEM}>
                  <CheckCircle size={14} className={DS_LP_PRICE_CHECK} />
                  <span>API & int&eacute;grations</span>
                </div>
                <div className={DS_LP_PRICE_FEAT_ITEM}>
                  <CheckCircle size={14} className={DS_LP_PRICE_CHECK} />
                  <span>Support prioritaire</span>
                </div>
              </div>
              <Link
                href="/sign-up"
                className={cn(DS_LP_PRICE_CTA, DS_LP_PRICE_CTA_SEC)}
              >
                Contacter
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FAQ SECTION ═══════════════ */}
      <section className={DS_LP_SECTION}>
        <div className={DS_LP_MAX_W_LG}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={DS_LP_HEADER}
          >
            <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
              FAQ
            </span>
            <h2 className={DS_LP_TITLE}>Questions fr&eacute;quentes</h2>
            <div className={DS_LP_ACCENT} />
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "Comment fonctionne l'essai gratuit ?",
                a: "L'essai gratuit de 14 jours vous donne acc&egrave;s &agrave; toutes les fonctionnalit&eacute;s de l'offre Pro. Aucune carte bancaire requise."
              },
              {
                q: "Puis-je exporter mes donn&eacute;es ?",
                a: "Oui, vous pouvez exporter tous vos devis et donn&eacute;es clients au format PDF ou CSV &agrave; tout moment."
              },
              {
                q: "Y a-t-il un engagement ?",
                a: "Non, vous pouvez r&eacute;silier votre abonnement &agrave; tout moment. Pas de frais cach&eacute;s, pas de surprise."
              },
              {
                q: "Proposez-vous des tarifs pour les &eacute;tudiants ?",
                a: "Oui, contactez-nous avec votre carte &eacute;tudiante pour b&eacute;n&eacute;ficier de 50% de r&eacute;duction la premi&egrave;re ann&eacute;e."
              },
            ].map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={DS_LP_FAQ_ITEM}
              >
                <summary className={DS_LP_FAQ_Q}>
                  <span>{faq.q}</span>
                  <ArrowRight className={DS_LP_FAQ_ARR} />
                </summary>
                <p className={DS_LP_FAQ_A}>{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className={DS_LP_CTA}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={DS_LP_FINAL}
        >
          <h2 className={DS_LP_FINAL_TITLE}>Pr&ecirc;t &agrave; commencer ?</h2>
          <p className={DS_LP_FINAL_DESC}>
            Rejoignez des milliers de freelances qui ont d&eacute;j&agrave; adopt&eacute; la beaut&eacute; de la facturation.
          </p>
          <div className={DS_LP_FINAL_BTNS}>
            <Link
              href="/sign-up"
              className={DS_LP_FINAL_BTN_PRI}
            >
              D&eacute;marrer gratuitement
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className={DS_LP_FINAL_BTN_SEC}
            >
              Nous contacter
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className={DS_LP_FOOTER}>
        <div className={DS_LP_MAX_W}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className={DS_LP_FOOTER_BRAND}>
                <div className={DS_LP_FOOTER_LOGO}>
                  <RocketLaunch size={10} weight="fill" className="text-white" />
                </div>
                <span className={DS_LP_FOOTER_NAME}>DevisExpress</span>
              </div>
              <p className={DS_LP_FOOTER_DESC}>
                La facturation &eacute;l&eacute;gante pour les freelances modernes.
              </p>
            </div>

            {/* Links 1 */}
            <div>
              <h4 className={DS_LP_FOOTER_TITRE}>Produit</h4>
              <ul className="space-y-2">
                <li><Link href="#" className={DS_LP_FOOTER_LIEN}>Fonctionnalit&eacute;s</Link></li>
                <li><Link href="#" className={DS_LP_FOOTER_LIEN}>Tarifs</Link></li>
                <li><Link href="#" className={DS_LP_FOOTER_LIEN}>Mod&egrave;les</Link></li>
                <li><Link href="#" className={DS_LP_FOOTER_LIEN}>Int&eacute;grations</Link></li>
              </ul>
            </div>

            {/* Links 2 */}
            <div>
              <h4 className={DS_LP_FOOTER_TITRE}>Soci&eacute;t&eacute;</h4>
              <ul className="space-y-2">
                <li><Link href="#" className={DS_LP_FOOTER_LIEN}>&Agrave; propos</Link></li>
                <li><Link href="#" className={DS_LP_FOOTER_LIEN}>Blog</Link></li>
                <li><Link href="#" className={DS_LP_FOOTER_LIEN}>Carri&egrave;res</Link></li>
                <li><Link href="#" className={DS_LP_FOOTER_LIEN}>Contact</Link></li>
              </ul>
            </div>

            {/* Links 3 */}
            <div>
              <h4 className={DS_LP_FOOTER_TITRE}>L&eacute;gal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className={DS_LP_FOOTER_LIEN}>Confidentialit&eacute;</Link></li>
                <li><Link href="#" className={DS_LP_FOOTER_LIEN}>Conditions</Link></li>
                <li><Link href="#" className={DS_LP_FOOTER_LIEN}>Mentions l&eacute;gales</Link></li>
              </ul>
            </div>
          </div>

          <div className={DS_LP_FOOTER_BASE}>
            <span className={DS_LP_FOOTER_COPY}>
              &copy; 2026 DevisExpress. Tous droits r&eacute;serv&eacute;s.
            </span>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
                Con&ccedil;u pour les b&acirc;tisseurs.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}