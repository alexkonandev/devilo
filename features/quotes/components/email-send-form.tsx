"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PaperPlaneTilt, XIcon } from "@phosphor-icons/react";
import { sendQuoteEmailAction } from "@/actions/send-quote-email";
import { notify } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { DS_MONO } from "@/lib/design-system";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/ui/constants";

interface EmailSendFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  defaultEmail: string;
  defaultSubject: string;
  quoteNumber: string;
}

export function EmailSendForm({
  open,
  onOpenChange,
  quoteId,
  defaultEmail,
  defaultSubject,
  quoteNumber,
}: EmailSendFormProps) {
  const [recipient, setRecipient] = useState(defaultEmail);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!recipient.trim()) {
      notify.error("EMAIL_INVALIDE", "L'adresse email du destinataire est requise.");
      return;
    }

    setIsSending(true);
    try {
      const res = await sendQuoteEmailAction({
        quoteId,
        message: message.trim() || undefined,
      });

      if (!res.success) {
        notify.error("ERREUR_ENVOI", res.error ?? "Impossible d'envoyer l'email.");
        return;
      }

      notify.success(
        "EMAIL_ENVOYÉ",
        `Le devis ${quoteNumber} a été envoyé à ${recipient}.`,
      );
      onOpenChange(false);
      // Reset form
      setMessage("");
    } catch {
      notify.error("ERREUR_SYSTÈME", "Une erreur inattendue est survenue lors de l'envoi.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PaperPlaneTilt size={18} weight="duotone" className="text-indigo-500" />
            Envoyer le devis
          </DialogTitle>
          <DialogDescription>
            Le devis <span className={cn(DS_MONO, "font-semibold")}>{quoteNumber}</span> sera
            envoyé avec le PDF généré automatiquement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Destinataire */}
          <div className="space-y-1.5">
            <Label htmlFor="recipient" className="text-xs text-slate-500">
              Destinataire
            </Label>
            <Input
              id="recipient"
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="email@client.com"
              disabled={isSending}
              className="text-sm"
            />
          </div>

          {/* Objet */}
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-xs text-slate-500">
              Objet
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled
              className="text-sm text-slate-400 bg-slate-50 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400">
              L'objet est prédéfini par le modèle d'email.
            </p>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs text-slate-500">
              Message (optionnel)
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ajoutez un message personnalisé..."
              rows={4}
              disabled={isSending}
              className="text-sm resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isSending}
            className={BTN_SECONDARY}
          >
            <XIcon size={14} weight="bold" />
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !recipient.trim()}
            className={BTN_PRIMARY}
          >
            {isSending ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <PaperPlaneTilt size={14} weight="bold" />
            )}
            {isSending ? "Envoi en cours..." : "Envoyer"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EmailSendForm;