"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClientListItem } from "@/types/client";
import { ClientMasterList } from "./client-master-list";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  CurrencyCircleDollarIcon,
  FileTextIcon,
  CheckCircleIcon,
  TrendUpIcon,
  ClockIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import type { UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { upsertClient } from "@/actions/client-action";
import { toast } from "sonner";
import { QuoteStatus } from "@/app/generated/prisma/enums";

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM - Source de Vérité (Dashboard/Quotes)
// ═══════════════════════════════════════════════════════════════════════════════

const DS = {
  micro: "text-[9px] font-bold uppercase tracking-wider",
  mono: "font-mono text-[11px] tabular-nums",
  card: "bg-white border border-slate-200/60",
};

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMA & TYPES
// ═══════════════════════════════════════════════════════════════════════════════

const clientSchema = z.object({
  name: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface SpatialClientsViewProps {
  initialData: ClientListItem[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const formatCFA = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompact = (amount: number) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k`;
  return amount.toString();
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT - Grid 3 Columns Strict
// ═══════════════════════════════════════════════════════════════════════════════

export default function SpatialClientsView({
  initialData,
}: SpatialClientsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [searchQuery] = useState("");

  const activeId = searchParams.get("id");

  const filteredClients = useMemo(() => {
    return initialData.filter(
      (client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [initialData, searchQuery]);

  const activeClient = useMemo(() => {
    return filteredClients.find((c) => c.id === activeId);
  }, [filteredClients, activeId]);

  const activeIndex = useMemo(() => {
    return filteredClients.findIndex((c) => c.id === activeId);
  }, [filteredClients, activeId]);

  const handleSelectClient = useCallback(
    (client: ClientListItem | null) => {
      startTransition(() => {
        if (!client || client.id === activeId) {
          router.push("/clients");
        } else {
          router.push(`/clients?id=${client.id}`, { scroll: false });
        }
      });
    },
    [router, activeId],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex =
          activeIndex < filteredClients.length - 1 ? activeIndex + 1 : 0;
        if (filteredClients[nextIndex]) {
          handleSelectClient(filteredClients[nextIndex]);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex =
          activeIndex > 0 ? activeIndex - 1 : filteredClients.length - 1;
        if (filteredClients[prevIndex]) {
          handleSelectClient(filteredClients[prevIndex]);
        }
      } else if (e.key === "Escape" && activeId) {
        handleSelectClient(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, filteredClients, handleSelectClient, activeId]);

  // Stats calculation
  const clientStats = useMemo(() => {
    if (!activeClient) {
      return {
        totalRevenue: 0,
        activeQuotes: 0,
        conversionRate: 0,
        totalQuotes: 0,
      };
    }

    const quotes = activeClient.quotes || [];
    const paidQuotes = quotes.filter((q) => q.status === "PAID");
    const draftOrSent = quotes.filter(
      (q) => q.status === "DRAFT" || q.status === "SENT",
    );
    const acceptedOrPaid = quotes.filter(
      (q) => q.status === "ACCEPTED" || q.status === "PAID",
    );

    const totalRevenue = paidQuotes.reduce((sum, q) => sum + q.totalAmount, 0);
    const conversionRate =
      quotes.length > 0 ? (acceptedOrPaid.length / quotes.length) * 100 : 0;

    return {
      totalRevenue,
      activeQuotes: draftOrSent.length,
      conversionRate,
      totalQuotes: quotes.length,
    };
  }, [activeClient]);

  return (
    // ═══════════════════════════════════════════════════════════════════════════
    // GRID 3 COLUMNS - Edge to Edge, Zero Waste
    // ═══════════════════════════════════════════════════════════════════════════
    <div className="h-full grid grid-cols-[300px_1fr] overflow-hidden">
      {/* ═══ COLONNE 1: MASTER-LIST (Grid CSS Strict) ═══ */}
      <ClientMasterList
        clients={filteredClients}
        selectedId={activeId}
        onSelect={handleSelectClient}
        onCreate={() => {}}
      />

      {/* ═══ COLONNE 2: DETAIL-STAGE (1fr) ═══ */}
      <div className="flex flex-col bg-slate-50 overflow-hidden">
        {/* ═══ LIGNE 1: TÉLÉMÉTRIE (KPIs) - Toujours visible ═══ */}
        <TelemetryHUD
          client={activeClient}
          stats={clientStats}
          hasClient={!!activeClient}
        />

        {/* ═══ LIGNE 2: CONTENT-AREA (Scrollable) ═══ */}
        <div className="flex-1 overflow-hidden">
          {activeClient ? (
            <ClientDetail client={activeClient} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TELEMETRY HUD - KPIs (Style Quotes Page)
// ═══════════════════════════════════════════════════════════════════════════════

interface ClientStats {
  totalRevenue: number;
  activeQuotes: number;
  conversionRate: number;
  totalQuotes: number;
}

interface TelemetryHUDProps {
  client: ClientListItem | undefined;
  stats: ClientStats;
  hasClient: boolean;
}

function TelemetryHUD({ stats, hasClient }: TelemetryHUDProps) {
  const hudItems = [
    {
      icon: CurrencyCircleDollarIcon,
      label: "CA Total",
      value: hasClient ? formatCompact(stats.totalRevenue) : "—",
      subtext: hasClient
        ? `${stats.totalQuotes} devis facturés`
        : "Aucun client",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      dimmed: !hasClient,
    },
    {
      icon: ClockIcon,
      label: "En Cours",
      value: hasClient ? String(stats.activeQuotes) : "—",
      subtext: "Brouillon / Envoyé",
      color: "text-blue-600",
      bg: "bg-blue-50",
      dimmed: !hasClient || stats.activeQuotes === 0,
    },
    {
      icon: TrendUpIcon,
      label: "Conversion",
      value: hasClient ? `${stats.conversionRate.toFixed(1)}%` : "—",
      subtext: "Acceptés / Payés",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      dimmed: !hasClient || stats.conversionRate === 0,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 px-3 py-2 border-b border-slate-200/60 bg-white shrink-0">
      {hudItems.map((item) => (
        <div
          key={item.label}
          className={cn(
            "flex items-center gap-2 p-2 rounded border border-slate-200/60",
            item.dimmed ? "bg-slate-50/50" : "bg-slate-50",
          )}
        >
          <div
            className={cn(
              "w-7 h-7 rounded flex items-center justify-center shrink-0",
              item.bg,
            )}
          >
            <item.icon size={14} className={item.color} weight="bold" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-[13px] font-bold tabular-nums truncate",
                  item.dimmed ? "text-slate-400" : "text-slate-900",
                )}
              >
                {item.value}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  DS.micro,
                  item.dimmed ? "text-slate-300" : "text-slate-500",
                )}
              >
                {item.label}
              </span>
              <span className="text-[8px] text-slate-300">·</span>
              <span className="text-[9px] text-slate-400 truncate">
                {item.subtext}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT DETAIL - Bento Grid Compact
// ═══════════════════════════════════════════════════════════════════════════════

interface ClientDetailProps {
  client: ClientListItem;
}

function ClientDetail({ client }: ClientDetailProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
    watch,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client.name,
      email: client.email || "",
      address: client.address || "",
      taxId: client.taxId || "",
    },
  });

  useEffect(() => {
    reset({
      name: client.name,
      email: client.email || "",
      address: client.address || "",
      taxId: client.taxId || "",
    });
    setSaveStatus("idle");
  }, [client.id, reset, client]);

  const onSubmit = async (data: ClientFormData) => {
    setIsSaving(true);
    setSaveStatus("saving");

    try {
      const res = await upsertClient({ id: client.id, ...data });
      if (res.success) {
        setSaveStatus("saved");
        reset(data);
        toast.success("Modifications enregistrées");
        setTimeout(() => setSaveStatus("idle"), 1500);
      } else {
        toast.error("Erreur", { description: res.error });
        setSaveStatus("idle");
      }
    } catch {
      toast.error("Erreur de sauvegarde");
      setSaveStatus("idle");
    } finally {
      setIsSaving(false);
    }
  };

  const isVIP = client.totalSpent > 1_000_000;
  const watchedName = watch("name");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: EASE_OUT_EXPO }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200/60 bg-slate-50/30 shrink-0">
        <div className="flex items-center gap-1.5">
          <FileTextIcon size={13} className="text-indigo-500" />
          <span className={cn(DS.micro, "text-slate-600")}>Fiche Client</span>
          {isVIP && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200/60">
              <CheckCircleIcon size={8} weight="bold" />
              VIP
            </span>
          )}
        </div>
        <SaveIndicator status={saveStatus} />
      </div>

      {/* Scrollable Content */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 overflow-y-auto p-3 space-y-3"
      >
        {/* Identity Card - Compact Bento */}
        <div className={cn(DS.card, "rounded-lg p-3")}>
          {/* Avatar + Name */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center font-black text-base shrink-0 border-2",
                isVIP
                  ? "bg-amber-50 text-amber-500 border-amber-200"
                  : "bg-indigo-50 text-indigo-500 border-indigo-200",
              )}
            >
              {(watchedName || client.name).slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <GhostInput
                label="Nom / Raison sociale"
                register={register}
                name="name"
                className="text-base font-bold text-slate-900"
                onBlur={handleSubmit(onSubmit)}
              />
            </div>
          </div>

          {/* Data Grid - 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            <GhostInput
              label="Email"
              register={register}
              name="email"
              placeholder="—"
              className="text-xs text-slate-700"
              onBlur={handleSubmit(onSubmit)}
            />
            <GhostInput
              label="ID Fiscal"
              register={register}
              name="taxId"
              placeholder="—"
              className={cn(DS.mono, "text-xs")}
              onBlur={handleSubmit(onSubmit)}
            />
          </div>

          {/* Address */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <span className={cn(DS.micro, "text-slate-400 block mb-1")}>
              Adresse
            </span>
            <textarea
              {...register("address")}
              rows={2}
              placeholder="—"
              onBlur={handleSubmit(onSubmit)}
              className="w-full bg-transparent text-xs text-slate-700 resize-none outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* History Table - Dense (Style Dashboard) */}
        <div>
          {/* Table Header */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200/60 bg-slate-50/50">
            <div className="flex items-center gap-1.5">
              <FileTextIcon size={12} className="text-slate-400" />
              <span className={cn(DS.micro, "text-slate-500")}>
                Transactions
              </span>
            </div>
            <span className={cn(DS.mono, "text-slate-400")}>
              {client.quotes?.length || 0}
            </span>
          </div>

          {/* Table */}
          {client.quotes?.length > 0 ? (
            <div
              className={cn(
                DS.card,
                "rounded-lg overflow-hidden border-t-0 rounded-t-none",
              )}
            >
              <table className="w-full">
                <thead className="bg-slate-50/70">
                  <tr className="border-b border-slate-200/60">
                    <th className="text-left py-1 px-3 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Référence
                    </th>
                    <th className="text-right py-1 px-3 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Montant
                    </th>
                    <th className="text-center py-1 px-3 text-[9px] font-bold uppercase tracking-wider text-slate-500 w-16">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {client.quotes.map((quote, index) => (
                    <motion.tr
                      key={quote.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50/50 cursor-pointer group"
                    >
                      <td className="py-1.5 px-3">
                        <span
                          className={cn(
                            DS.mono,
                            "font-semibold text-slate-700 group-hover:text-indigo-600",
                          )}
                        >
                          {quote.number}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-right">
                        <span
                          className={cn(DS.mono, "font-bold text-slate-900")}
                        >
                          {formatCFA(quote.totalAmount)}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <MiniStatusBadge status={quote.status as QuoteStatus} />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyHistoryState />
          )}
        </div>
      </form>

      {/* Floating Save Button */}
      {isDirty && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
        >
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-indigo-600/20"
          >
            {isSaving ? (
              <span className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Enregistrer</span>
            )}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GHOST INPUT - Minimal Style
// ═══════════════════════════════════════════════════════════════════════════════

function GhostInput({
  label,
  register,
  name,
  className,
  placeholder,
  onBlur,
}: {
  label?: string;
  register: UseFormRegister<ClientFormData>;
  name: keyof ClientFormData;
  className?: string;
  placeholder?: string;
  onBlur?: () => void;
}) {
  return (
    <div className="group focus-within:bg-slate-50/50 rounded transition-colors -mx-1 px-1">
      {label && (
        <span className={cn(DS.micro, "text-slate-400 block mb-0.5")}>
          {label}
        </span>
      )}
      <input
        {...register(name)}
        placeholder={placeholder}
        onBlur={onBlur}
        className={cn(
          "w-full bg-transparent outline-none border-b border-transparent focus:border-indigo-400/50 transition-all placeholder:text-slate-300",
          className,
        )}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINI STATUS BADGE - Dense
// ═══════════════════════════════════════════════════════════════════════════════

function MiniStatusBadge({ status }: { status: QuoteStatus }) {
  const config = {
    PAID: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      label: "Payé",
    },
    SENT: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      dot: "bg-blue-500",
      label: "Envoyé",
    },
    ACCEPTED: {
      bg: "bg-indigo-100",
      text: "text-indigo-700",
      dot: "bg-indigo-500",
      label: "Signé",
    },
    DRAFT: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      dot: "bg-amber-500",
      label: "Draft",
    },
    REJECTED: {
      bg: "bg-rose-100",
      text: "text-rose-700",
      dot: "bg-rose-500",
      label: "Refusé",
    },
  };

  const style = config[status] || config.DRAFT;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
        style.bg,
        style.text,
      )}
    >
      <span className={cn("w-1 h-1 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAVE INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════

function SaveIndicator({ status }: { status: "idle" | "saving" | "saved" }) {
  if (status === "idle") return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold",
        status === "saving"
          ? "bg-slate-100 text-slate-500"
          : "bg-emerald-50 text-emerald-600",
      )}
    >
      {status === "saving" ? (
        <>
          <span className="w-2 h-2 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
          Sauvegarde...
        </>
      ) : (
        <>
          <CheckCircleIcon size={10} weight="bold" />
          Enregistré
        </>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY STATES
// ═══════════════════════════════════════════════════════════════════════════════

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center mb-3">
        <UsersIcon size={20} className="text-slate-400" />
      </div>
      <h3 className="text-sm font-bold text-slate-600 mb-1">
        Sélectionnez un client
      </h3>
      <p className="text-xs text-slate-400 max-w-[180px]">
        Cliquez sur une ligne pour voir l&apos;activité et les détails
      </p>
    </div>
  );
}

function EmptyHistoryState() {
  return (
    <div
      className={cn(
        DS.card,
        "rounded-lg p-4 flex flex-col items-center justify-center text-center",
      )}
    >
      <FileTextIcon size={16} className="text-slate-300 mb-1" />
      <p className="text-xs text-slate-500">Aucune transaction</p>
      <p className="text-[10px] text-slate-400 mt-0.5">
        Les devis apparaîtront ici
      </p>
    </div>
  );
}
