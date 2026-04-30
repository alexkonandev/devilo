"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ClientListItem } from "@/types/client";
import { cn } from "@/lib/utils";
import { upsertClient } from "@/actions/client-action";
import { toast } from "sonner";
import {
  XIcon,
  FileTextIcon,
  CurrencyCircleDollarIcon,
  ClockCounterClockwiseIcon,
  CheckIcon,
  HashIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  UserIcon,
} from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════
// SCHEMA ZOD
// ═══════════════════════════════════════════════════════════════

const clientSchema = z.object({
  name: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
});

type ClientFormData = z.infer<typeof clientSchema>;

// ═══════════════════════════════════════════════════════════════
// GHOST INPUT COMPONENT
// ═══════════════════════════════════════════════════════════════

interface GhostInputProps {
  name: keyof ClientFormData;
  register: ReturnType<typeof useForm<ClientFormData>>["register"];
  errors: ReturnType<typeof useForm<ClientFormData>>["formState"]["errors"];
  placeholder?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  multiline?: boolean;
  onBlur?: () => void;
}

function GhostInput({
  name,
  register,
  errors,
  placeholder,
  icon,
  size = "md",
  multiline = false,
  onBlur,
}: GhostInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = errors?.[name];

  const sizeClasses = {
    sm: "text-xs py-1",
    md: "text-sm py-1.5",
    lg: "text-2xl font-bold py-2",
  };

  const InputTag = multiline ? "textarea" : "input";

  return (
    <div className="relative group">
      {/* Icon */}
      {icon && (
        <div
          className={cn(
            "absolute left-0 transition-all duration-200",
            isFocused ? "text-indigo-500" : "text-slate-400",
            size === "lg" ? "top-3" : "top-1/2 -translate-y-1/2",
          )}
        >
          {icon}
        </div>
      )}

      {/* Input */}
      <InputTag
        {...register(name)}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        className={cn(
          "w-full bg-transparent outline-none transition-all duration-200",
          "border-b-2 border-transparent",
          "hover:border-slate-200",
          isFocused && "border-indigo-400 bg-indigo-50/30 rounded px-2",
          hasError && "border-rose-400 bg-rose-50/30",
          icon && (size === "lg" ? "pl-7" : "pl-5"),
          sizeClasses[size],
          multiline && "resize-none min-h-[60px]",
        )}
      />

      {/* Error indicator */}
      <AnimatePresence>
        {hasError && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-rose-400"
          >
            <span className="text-[9px]">!</span>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATUS LABELS
// ═══════════════════════════════════════════════════════════════

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: {
    label: "Brouillon",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  SENT: { label: "Envoyé", color: "text-blue-600 bg-blue-50 border-blue-200" },
  ACCEPTED: {
    label: "Accepté",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  REJECTED: {
    label: "Refusé",
    color: "text-rose-600 bg-rose-50 border-rose-200",
  },
  PAID: {
    label: "Payé",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
};

function formatCFA(amount: number): string {
  return new Intl.NumberFormat("fr-CI", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

interface ClientEditorPanelProps {
  client: ClientListItem;
  onClose: () => void;
}

export function ClientEditorPanel({ client, onClose }: ClientEditorPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client.name,
      email: client.email || "",
      address: client.address || "",
      taxId: client.taxId || "",
    },
  });

  // Reset form when client changes
  useEffect(() => {
    reset({
      name: client.name,
      email: client.email || "",
      address: client.address || "",
      taxId: client.taxId || "",
    });
  }, [client.id, reset, client]);

  const onSubmit = async (data: ClientFormData) => {
    setIsSaving(true);
    try {
      const res = await upsertClient({
        id: client.id,
        ...data,
      });

      if (res.success) {
        setShowSaveIndicator(true);
        setTimeout(() => setShowSaveIndicator(false), 2000);
        reset(data); // Reset dirty state
      } else {
        toast.error("Erreur de sauvegarde", { description: res.error });
      }
    } catch {
      toast.error("Erreur de sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const isVIP = client.totalSpent > 1_000_000;

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200/60 overflow-hidden">
      {/* ─── HEADER ─── */}
      <div className="px-5 py-3.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-indigo-500">
              Édition Directe
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Save indicator */}
            <AnimatePresence mode="wait">
              {showSaveIndicator && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-[9px] font-bold"
                >
                  <CheckIcon size={10} weight="bold" />
                  Sauvegardé
                </motion.div>
              )}
              {isSaving && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"
                />
              )}
            </AnimatePresence>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200/60 hover:border-rose-200 text-slate-400 hover:text-rose-500 transition-all"
            >
              <XIcon size={13} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── SCROLLABLE FORM ─── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 overflow-y-auto"
      >
        {/* ─── IDENTITY SECTION ─── */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border transition-colors",
                isVIP
                  ? "bg-amber-50 text-amber-600 border-amber-200"
                  : "bg-indigo-50 text-indigo-600 border-indigo-200/60",
              )}
            >
              {client.name.slice(0, 2).toUpperCase()}
            </div>

            {/* Editable Name */}
            <div className="flex-1 pt-1">
              <GhostInput
                name="name"
                register={register}
                errors={errors}
                placeholder="Nom du client..."
                icon={<UserIcon />}
                size="lg"
                onBlur={handleSubmit(onSubmit)}
              />
              {errors.name && (
                <p className="text-[10px] text-rose-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="mt-3 ml-14">
            <GhostInput
              name="email"
              register={register}
              errors={errors}
              placeholder="Adresse email..."
              icon={<EnvelopeSimpleIcon />}
              size="md"
              onBlur={handleSubmit(onSubmit)}
            />
          </div>
        </div>

        {/* ─── TAX & ADDRESS SECTION ─── */}
        <div className="px-5 py-3 border-b border-slate-100">
          {/* Tax ID */}
          <div className="flex items-center gap-3">
            <div className="w-5 flex justify-center">
              <HashIcon size={12} className="text-slate-400" />
            </div>
            <div className="flex-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Identifiant Fiscal
              </span>
              <GhostInput
                name="taxId"
                register={register}
                errors={errors}
                placeholder="RCCM / IFU / SIRET..."
                size="sm"
                onBlur={handleSubmit(onSubmit)}
              />
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3 mt-3">
            <div className="w-5 flex justify-center mt-1.5">
              <MapPinIcon size={12} className="text-slate-400" />
            </div>
            <div className="flex-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Adresse
              </span>
              <GhostInput
                name="address"
                register={register}
                errors={errors}
                placeholder="Adresse complète..."
                size="sm"
                multiline
                onBlur={handleSubmit(onSubmit)}
              />
            </div>
          </div>
        </div>

        {/* ─── KPI STRIP ─── */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
          <div className="px-5 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <CurrencyCircleDollarIcon
                size={10}
                weight="bold"
                className="text-slate-400"
              />
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
                CA Total
              </span>
            </div>
            <p
              className={cn(
                "text-base font-mono font-black tracking-tight",
                isVIP ? "text-amber-500" : "text-slate-900",
              )}
            >
              {formatCFA(client.totalSpent)}
            </p>
          </div>
          <div className="px-5 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <FileTextIcon
                size={10}
                weight="bold"
                className="text-slate-400"
              />
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Devis
              </span>
            </div>
            <p className="text-base font-mono font-black text-slate-900">
              {client.quoteCount}
            </p>
          </div>
        </div>

        {/* ─── ACTIVITY FEED ─── */}
        <div className="flex-1">
          <div className="px-5 py-2.5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
            <div className="flex items-center gap-1.5">
              <ClockCounterClockwiseIcon
                size={11}
                weight="bold"
                className="text-slate-400"
              />
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Historique des transactions
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100/60">
            {client.quotes && client.quotes.length > 0 ? (
              client.quotes.map((quote) => {
                const status =
                  STATUS_LABELS[quote.status] || STATUS_LABELS.DRAFT;
                return (
                  <div
                    key={quote.id}
                    className="group px-5 py-2.5 hover:bg-slate-50 transition-colors flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {quote.number}
                        </span>
                        <span
                          className={cn(
                            "text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border",
                            status.color,
                          )}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-mono">
                        {new Date(quote.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-800">
                      {formatCFA(quote.totalAmount)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center">
                <p className="text-[10px] text-slate-400">
                  Aucune activité récente.
                </p>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* ─── FLOATING SAVE BUTTON ─── */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
          >
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full shadow-lg shadow-indigo-600/20",
                "bg-indigo-600 hover:bg-indigo-500 text-white",
                "text-[10px] font-bold uppercase tracking-widest",
                "transition-all active:scale-95",
                isSaving && "opacity-80 cursor-wait",
              )}
            >
              {isSaving ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <CheckIcon size={12} weight="bold" />
                  Enregistrer
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
