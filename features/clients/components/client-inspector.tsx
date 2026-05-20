"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ClientListItem } from "@/types/client";
import {
  User,
  EnvelopeSimple,
  Phone,
  Buildings,
  FileText,
  PencilSimple,
  ArrowUpRight,
  ArrowLeft,
  ChatCircleText,
  Plus,
  Note,
  Tag,
  IdentificationBadge,
  MapPinLine,
  Globe,
  Sparkle,
} from "@phosphor-icons/react";
import {
  DS_BENTO_CARD,
  DS_BUTTON,
  DS_INPUT,
  DS_MICRO,
  DS_MONO,
  DS_LABEL,
  DS_ICON_WRAPPER,
  DS_ICON_SM,
  DS_PAGE_GRID,
  DS_PROGRESS_TRACK,
  DS_PROGRESS_BAR,
  DS_TEL_BLOCK,
} from "@/lib/design-system";
import {
  addClientNoteAction,
  getClientActivitiesAction,
  type ClientActivityItem,
} from "@/actions/client-activity-action";

interface Props {
  client?: ClientListItem;
  onBack?: () => void;
  onEdit?: (client: ClientListItem) => void;
}

const ACTIVITY_META: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  NOTE: {
    icon: Note,
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Note",
  },
  EMAIL: {
    icon: EnvelopeSimple,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    label: "Email",
  },
  CALL: {
    icon: Phone,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Appel",
  },
  STATUS_CHANGE: {
    icon: ArrowUpRight,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Statut",
  },
};

const CFA = (n: number) =>
  new Intl.NumberFormat("fr-CI", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(n);
const COMPACT = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${Math.round(n / 1_000)}K`
    : n.toString();

/* ═══════════════════════════════════════════════════════════════════════════════
   CLIENT INSPECTOR — Architecture Spatiale
   Structure :
     - HEADER BENTO (12 cols)
     - ROW 1 : KPIs (4×3 cols)
     - ROW 2 : Contact (8 cols) + Santé (4 cols)
     - ROW 3 : Adresse + Tags (6+6 cols)
     - ROW 4 : Devis (12 cols)
     - ROW 5 : Timeline activité (12 cols)
   ═══════════════════════════════════════════════════════════════════════════════ */

export function ClientInspector({ client, onBack, onEdit }: Props) {
  const [activities, setActivities] = useState<ClientActivityItem[]>([]);
  const [loadingActs, setLoadingActs] = useState(false);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const quotes = client?.quotes || [];
  const paid = quotes.filter((q) => q.status === "PAID");
  const revenue = paid.reduce((s, q) => s + (q.totalAmount || 0), 0);
  const conv = quotes.length
    ? Math.round((paid.length / quotes.length) * 100)
    : 0;

  const health = useMemo(() => {
    if (!quotes.length)
      return { s: 50, l: "Moyen", c: "text-amber-500", b: "bg-amber-50" };
    const score = Math.round(
      Math.min(100, revenue / 100_000) * 0.5 +
        (paid.length / quotes.length) * 50
    );
    if (score >= 75)
      return {
        s: score,
        l: "Excellent",
        c: "text-emerald-600",
        b: "bg-emerald-50",
      };
    if (score >= 50)
      return { s: score, l: "Bon", c: "text-indigo-600", b: "bg-indigo-50" };
    return { s: score, l: "À suivre", c: "text-amber-600", b: "bg-amber-50" };
  }, [quotes, paid, revenue]);

  const isVIP = client?.tags?.includes("VIP");

  const fetchActs = async () => {
    if (!client) return;
    setLoadingActs(true);
    try {
      setActivities(await getClientActivitiesAction(client.id));
    } catch {
      /* */
    } finally {
      setLoadingActs(false);
    }
  };
  useEffect(() => {
    if (client) fetchActs();
  }, [client?.id]);

  const addNote = async () => {
    if (!client || !note.trim()) return;
    setSavingNote(true);
    try {
      const r = await addClientNoteAction(client.id, note.trim());
      if (r.success) {
        setNote("");
        toast.success("Note ajoutée");
        await fetchActs();
      } else toast.error("Erreur", { description: r.error });
    } catch {
      toast.error("Erreur");
    } finally {
      setSavingNote(false);
    }
  };

  if (!client) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto mb-3 flex items-center justify-center">
            <User size={24} className="text-slate-300" />
          </div>
          <p className="text-[13px] font-medium text-slate-400">
            Sélectionnez un client
          </p>
          <p className="text-[10px] text-slate-300 mt-1">
            ou créez-en un nouveau
          </p>
        </div>
      </div>
    );
  }

  const fullAddr = [
    client.address,
    client.addressLine2,
    client.postalCode && client.city
      ? `${client.postalCode} ${client.city}`
      : client.city || client.postalCode,
    client.country !== "CI" ? client.country : null,
  ]
    .filter(Boolean)
    .join(", ");

  const tags = client.tags || [];
  const contactItems = [
    { icon: EnvelopeSimple, label: "Email", val: client.email || "—" },
    { icon: Phone, label: "Téléphone", val: client.phone || "—" },
    { icon: IdentificationBadge, label: "RCCM", val: client.taxId || "—" },
    { icon: Globe, label: "TVA", val: client.tvaNumber || "—" },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* ═══════════ SCROLLABLE CONTAINER ═══════════ */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn(DS_PAGE_GRID, "p-4 gap-3")}>
          {/* ────────── HEADER : Identité (12 cols) ────────── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(DS_BENTO_CARD, "col-span-12 p-0 overflow-hidden")}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {onBack && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft size={16} className="text-slate-400" />
                  </motion.button>
                )}
                <div
                  className={cn(
                    DS_ICON_WRAPPER,
                    "w-9 h-9 rounded-xl relative",
                    isVIP ? "bg-amber-100" : "bg-indigo-50"
                  )}
                >
                  <User
                    size={16}
                    className={isVIP ? "text-amber-600" : "text-indigo-600"}
                  />
                  {isVIP && (
                    <Sparkle
                      size={9}
                      weight="fill"
                      className="absolute -top-1 -right-1 text-amber-500"
                    />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-slate-900">
                      {client.name}
                    </span>
                    {isVIP && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-bold rounded leading-none">
                        VIP
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {client.email || "Aucun email"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onEdit(client)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors uppercase tracking-wider"
                  >
                    <PencilSimple size={12} /> Éditer
                  </motion.button>
                )}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    href={`/quotes/new?clientId=${client.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors uppercase tracking-wider"
                  >
                    <Plus size={12} /> Devis
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ────────── ROW 1 : Contact (8 cols) + Légal (4 cols) ────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17 }}
            className={cn(DS_BENTO_CARD, "col-span-8 p-0 overflow-hidden")}
          >
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              {contactItems.slice(0, 2).map((item, i) => (
                <div key={i} className="p-3 flex items-center gap-3">
                  <item.icon size={14} className="text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <span className={cn(DS_MICRO, "text-slate-400")}>
                      {item.label}
                    </span>
                    <p className="text-[12px] font-medium text-slate-900 truncate">
                      {item.val}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 grid grid-cols-2 divide-x divide-slate-100">
              {contactItems.slice(2).map((item, i) => (
                <div key={i} className="p-3 flex items-center gap-3">
                  <item.icon size={14} className="text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <span className={cn(DS_MICRO, "text-slate-400")}>
                      {item.label}
                    </span>
                    <p className="text-[12px] font-medium text-slate-900 truncate">
                      {item.val}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {client.legalForm && (
              <div className="border-t border-slate-100 p-3 flex items-center gap-3">
                <Buildings size={14} className="text-slate-400 shrink-0" />
                <div>
                  <span className={cn(DS_MICRO, "text-slate-400")}>
                    Forme juridique
                  </span>
                  <p className="text-[12px] font-medium text-slate-900">
                    {client.legalForm}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Représentant + Représentant position (4 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(DS_BENTO_CARD, "col-span-4 p-0 overflow-hidden")}
          >
            {client.representativeName ? (
              <div className="p-3">
                <div className={cn(DS_MICRO, "text-slate-400 mb-1")}>
                  Représentant légal
                </div>
                <p className="text-[12px] font-bold text-slate-900">
                  {client.representativeName}
                </p>
                {client.representativePosition && (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {client.representativePosition}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3">
                <div className={cn(DS_MICRO, "text-slate-400 mb-1")}>
                  Représentant légal
                </div>
                <p className="text-[12px] text-slate-400 italic">
                  Non renseigné
                </p>
              </div>
            )}
          </motion.div>

          {/* ────────── ROW 3 : Adresse (12 cols) ────────── */}
          {fullAddr && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.23 }}
              className={cn(DS_BENTO_CARD, "col-span-12")}
            >
              <div
                className={cn(
                  DS_MICRO,
                  "text-slate-400 flex items-center gap-1.5 mb-2"
                )}
              >
                <MapPinLine size={11} /> Adresse fiscale
              </div>
              <p className="text-[12px] text-slate-700 leading-relaxed">
                {fullAddr}
              </p>
            </motion.div>
          )}

          {/* ────────── ROW 4 : Devis (8 cols) + Tags & Notes (4 cols) ────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className={cn(DS_BENTO_CARD, "col-span-8 p-0 overflow-hidden")}
          >
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText size={12} className="text-slate-400" />
                <span className={cn(DS_MICRO, "text-slate-600")}>Devis</span>
                <span className={cn(DS_MONO, "text-slate-400 ml-1")}>
                  {quotes.length}
                </span>
              </div>
              <Link
                href={`/quotes/new?clientId=${client.id}`}
                className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <Plus size={10} weight="bold" /> Nouveau
              </Link>
            </div>
            {quotes.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {quotes.map((q, i) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.03 }}
                  >
                    <Link
                      href={`/quotes/new?id=${q.id}`}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-1 h-7 rounded-full",
                            q.status === "PAID"
                              ? "bg-emerald-500"
                              : q.status === "SENT"
                              ? "bg-indigo-400"
                              : q.status === "ACCEPTED"
                              ? "bg-emerald-400"
                              : q.status === "REJECTED"
                              ? "bg-rose-400"
                              : "bg-amber-400"
                          )}
                        />
                        <div>
                          <span className="text-[12px] font-semibold text-slate-900">
                            {q.number}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-slate-400">
                              {new Date(q.createdAt).toLocaleDateString(
                                "fr-FR",
                                { day: "2-digit", month: "short" }
                              )}
                            </span>
                            <span
                              className={cn(
                                "text-[8px] font-bold px-1 py-0.5 rounded",
                                q.status === "PAID"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : q.status === "SENT"
                                  ? "bg-indigo-50 text-indigo-600"
                                  : q.status === "DRAFT"
                                  ? "bg-amber-50 text-amber-600"
                                  : q.status === "ACCEPTED"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : q.status === "REJECTED"
                                  ? "bg-rose-50 text-rose-600"
                                  : "bg-slate-50 text-slate-500"
                              )}
                            >
                              {q.status === "PAID"
                                ? "Payé"
                                : q.status === "SENT"
                                ? "Envoyé"
                                : q.status === "ACCEPTED"
                                ? "Accepté"
                                : q.status === "DRAFT"
                                ? "Brouillon"
                                : q.status === "REJECTED"
                                ? "Refusé"
                                : q.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-slate-900 tabular-nums">
                          {CFA(q.totalAmount || 0)}
                        </span>
                        <ArrowUpRight
                          size={14}
                          className="text-slate-300 group-hover:text-indigo-500 transition-colors"
                        />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <FileText
                  size={24}
                  className="text-slate-200 mx-auto mb-3"
                  weight="duotone"
                />
                <p className="text-[12px] text-slate-400 mb-3">
                  Aucun devis pour ce client
                </p>
                <Link
                  href={`/quotes/new?clientId=${client.id}`}
                  className={cn(DS_BUTTON, "inline-flex")}
                >
                  <Plus size={12} weight="bold" /> Créer un devis
                </Link>
              </div>
            )}
          </motion.div>

          {/* ────────── ROW 4 suite : Tags + Activité (4 cols) ────────── */}
          <div className="col-span-4 flex flex-col gap-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className={cn(DS_BENTO_CARD)}
            >
              <div className={cn(DS_MICRO, "text-slate-400 flex items-center gap-1.5 mb-2")}>
                <Tag size={11} /> Tags
              </div>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className={cn("px-2 py-1 text-[9px] font-bold rounded-lg", t === "VIP" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600")}>{t}</span>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-slate-400 italic">Aucun tag</p>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className={cn(DS_BENTO_CARD, "p-0 overflow-hidden")}
            >
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100">
                <ChatCircleText size={12} className="text-slate-400" />
                <span className={cn(DS_MICRO, "text-slate-600")}>Activité</span>
                <span className={cn(DS_MONO, "text-slate-400 ml-auto")}>{activities.length}</span>
              </div>
              <div className="p-3 border-b border-slate-100">
                <div className="flex gap-2">
                  <input value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="Ajouter..." className={cn(DS_INPUT, "flex-1")}
                    disabled={savingNote}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNote(); } }} />
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
                    type="button" onClick={addNote} disabled={savingNote || !note.trim()}
                    className={cn(DS_BUTTON, (savingNote || !note.trim()) && "opacity-50 cursor-not-allowed")}>
                    <Plus size={12} weight="bold" />
                  </motion.button>
                </div>
              </div>
              <div className="p-3 space-y-2 max-h-[260px] overflow-y-auto">
                {loadingActs ? (
                  <div className="flex items-center gap-2 py-2">
                    <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className={cn(DS_MICRO, "text-slate-400")}>...</span>
                  </div>
                ) : activities.length === 0 ? (
                  <p className={cn(DS_MICRO, "text-slate-300 italic py-2 text-center")}>Aucune activité</p>
                ) : (
                  activities.slice(0, 5).map((a, i) => {
                    const cfg = ACTIVITY_META[a.type] || ACTIVITY_META.NOTE;
                    const Icon = cfg.icon;
                    return (
                      <motion.div key={a.id} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                        className="flex items-start gap-2 p-2 rounded-lg border border-slate-100 bg-white">
                        <div className={cn("w-5 h-5 rounded flex items-center justify-center shrink-0", cfg.bg)}>
                          <Icon size={9} className={cfg.color} weight="bold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={cn("text-[8px] font-bold uppercase", cfg.color)}>{cfg.label}</span>
                            <span className="text-[8px] text-slate-400 shrink-0">
                              {new Date(a.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "short" })}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed truncate">{a.content}</p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
