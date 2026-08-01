"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RocketLaunch } from "@phosphor-icons/react";
import {
  DS_LP_FOOTER,
  DS_LP_FOOTER_GRID,
  DS_LP_FOOTER_BRAND,
  DS_LP_FOOTER_LOGO,
  DS_LP_FOOTER_NAME,
  DS_LP_FOOTER_DESC,
  DS_LP_FOOTER_TITRE,
  DS_LP_FOOTER_LIEN,
  DS_LP_FOOTER_BASE,
  DS_LP_FOOTER_COPY,
  DS_LP_FOOTER_STATUS,
  DS_LP_FOOTER_STATUS_DOT,
  DS_LP_FOOTER_STATUS_TXT,
} from "@/lib/design-system";

export default function LandingFooter() {
  return (
    <footer className={DS_LP_FOOTER}>
      <div className="max-w-6xl mx-auto">
        <div className={DS_LP_FOOTER_GRID}>
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className={DS_LP_FOOTER_BRAND}>
              <div className={DS_LP_FOOTER_LOGO}>
                <RocketLaunch size={14} weight="fill" className="text-white" />
              </div>
              <span className={DS_LP_FOOTER_NAME}>Factouro</span>
            </div>
            <p className={DS_LP_FOOTER_DESC}>
              La facturation &eacute;l&eacute;gante pour les freelances modernes.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h4 className={DS_LP_FOOTER_TITRE}>Produit</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/quotes/new" className={DS_LP_FOOTER_LIEN}>
                  Mod&egrave;les
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className={DS_LP_FOOTER_LIEN}>
                  S&#39;inscrire
                </Link>
              </li>
            </ul>
          </div>

          {/* L&eacute;gal */}
          <div>
            <h4 className={DS_LP_FOOTER_TITRE}>L&eacute;gal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className={DS_LP_FOOTER_LIEN}>
                  Confidentialit&eacute;
                </Link>
              </li>
              <li>
                <Link href="/terms" className={DS_LP_FOOTER_LIEN}>
                  Conditions d&#39;utilisation
                </Link>
              </li>
              <li>
                <Link href="/legal" className={DS_LP_FOOTER_LIEN}>
                  Mentions l&eacute;gales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={DS_LP_FOOTER_BASE}>
          <span className={DS_LP_FOOTER_COPY}>
            &copy; 2026 Factouro. Tous droits r&eacute;serv&eacute;s.
          </span>
          
        </div>
      </div>
    </footer>
  );
}