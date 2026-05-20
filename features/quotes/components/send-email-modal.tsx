"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { sendQuoteEmailAction } from "@/actions/send-quote-email";
import { notify } from "@/lib/notifications";
import {
  DS_BENTO_CARD,
  DS_BUTTON,
  DS_INPUT,
  DS_MICRO,
  DS_MONO,
} from "@/lib/design-system";
import {
  PaperPlaneTilt,
  X,
  Spinner,
  CheckCircle,
  EnvelopeSimple,
} from "@phosphor-icons/react";

interface SendEmailModalProps {
  quoteId: string;
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SendEmailModal({
  quoteId,
  quoteNumber,
  clientName,
  clientEmail,
  isOpen,
  onClose,
  onSuccess,
}: SendEmailModalProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = useCallback(async () => {
    setIsSending(true);
    try {
      const result = await sendQuoteEmailAction({
        quoteId,
        message: message.trim() || undefined,
      });

      if (result.success) {
        setSent(true);
        notify.success("DEVIS_ENVOYÉ", `Devis ${quoteNumber} envoyé à ${clientEmail}`);
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1500);
      } else {
        notify.error("ERREUR_ENVOI", result.error || "Échec de l'envoi");
      }
    } catch {
      notify.error("ERREUR_SYSTÈME", "Une erreur technique est survenue");
    } finally {
      setIsSending(false);
    }
  }, [quoteId, message, quoteNumber, clientEmail, onClose, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className={cn(DS_BENTO_CARD, "w-[420px] p-0 overflow-hidden shadow-2xl")}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <EnvelopeSimple size={16} className="text-indigo-600" weight="bold" />
            </div>
            <div>
              <h2 className={cn(DS_MONO, "text-[13px] font-bold text-slate-900")}>
                Envoyer le devis
              </h2>
              <p className={cn(DS_MICRO, "text-slate-400")}>
                {quoteNumber} — {clientName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="p-1.5 rounded hover:bg-slate-100 transition-colors"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-4">
          {/* Destinataire */}
          <div>
            <label className={cn(DS_MICRO, "text-slate-500 font-bold block mb-1")}>
              Destinataire
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-600">
                {clientName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className={cn(DS_MONO, "text-[12px] font-bold text-slate-900")}>
                  {clientName}
                </p>
                <p className={cn(DS_MICRO, "text-slate-500")}>{clientEmail}</p>
              </div>
            </div>
          </div>

          {/* Message optionnel */}
          <div>
            <label className={cn(DS_MICRO, "text-slate-500 font-bold block mb-1")}>
              Message optionnel
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Veuillez trouver ci-joint notre devis pour le projet..."
              rows={3}
              disabled={isSending || sent}
              className={cn(
                "w-full resize-none px-3 py-2 rounded-lg border border-slate-200",
                "text-[12px] text-slate-700 placeholder:text-slate-300",
                "focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400",
                "transition-all",
              )}
            />
          </div>

          {/* Attachment info */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <CheckCircle size={14} className="text-emerald-500" weight="fill" />
            <span className={cn(DS_MICRO, "text-slate-600")}>
              PDF joint : <strong>Devis-{quoteNumber}.pdf</strong>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 bg-slate-50/50">
          <button
            onClick={onClose}
            disabled={isSending}
            className={cn(
              DS_BUTTON,
              "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
              (isSending) && "opacity-50 cursor-not-allowed",
            )}
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || sent}
            className={cn(
              DS_BUTTON,
              "bg-indigo-600 text-white hover:bg-indigo-700 min-w-[140px]",
              (isSending || sent) && "opacity-70 cursor-not-allowed",
            )}
          >
            {isSending ? (
              <span className="flex items-center gap-2">
                <Spinner size={14} className="animate-spin" />
                Envoi en cours...
              </span>
            ) : sent ? (
              <span className="flex items-center gap-2">
                <CheckCircle size={14} weight="fill" />
                Envoyé !
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <PaperPlaneTilt size={14} weight="bold" />
                Envoyer
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}