"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  XIcon,
  UserPlusIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { upsertClient } from "@/actions/client-action";
import {
  DS_MONO,
  DS_ICON_XS,
  DS_ICON_WRAPPER,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════
// TOKENS COMPACTS
// ═══════════════════════════════════════════════════════════════
const FORM_CARD = "bg-white border border-slate-200 rounded-md p-3";
const INPUT =
  "w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-mono text-[10px] text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all";
const LABEL = "text-[8px] font-mono uppercase tracking-wider text-slate-600 mb-1 block";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface CreateClientDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (client: { id: string; name: string; email: string | null; address: string | null }) => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

// ═══════════════════════════════════════════════════════════════
// FIELD COMPONENTS
// ═══════════════════════════════════════════════════════════════
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={INPUT}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className={cn(INPUT, "resize-none")}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// CREATE CLIENT DIALOG
// ═══════════════════════════════════════════════════════════════
export function CreateClientDialog({
  open,
  onClose,
  onSuccess,
}: CreateClientDialogProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Le nom ou société est obligatoire");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await upsertClient({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
      });

      if (!result.success || !result.data) {
        setError(result.error || "Erreur lors de la création");
        setSubmitting(false);
        return;
      }

      onSuccess({
        id: result.data.id,
        name: result.data.name,
        email: result.data.email,
        address: result.data.address,
      });

      setForm(INITIAL_FORM);
      setSubmitting(false);
      onClose();
    } catch {
      setError("Erreur technique lors de la sauvegarde");
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[380px] p-0 gap-0 border-slate-200 rounded-md bg-white"
      >
        {/* ── HEADER ── */}
        <div className={cn(FORM_CARD, "border-b-0 rounded-b-none flex items-center justify-between")}>
          <div className="flex items-center gap-2">
            <div className={cn(DS_ICON_WRAPPER, "bg-indigo-100 text-indigo-600")}>
              <UserPlusIcon size={DS_ICON_XS} weight="bold" />
            </div>
            <div>
              <DialogTitle className={cn(DS_MONO, "text-[11px] font-bold text-slate-900 m-0")}>
                Nouveau Client
              </DialogTitle>
              <DialogDescription className="text-[8px] font-mono text-slate-500 mt-0.5">
                Remplissez les informations essentielles
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <XIcon size={10} />
          </button>
        </div>

        {/* ── FORMULAIRE ── */}
        <div className="px-3 py-0 max-h-[60vh] overflow-y-auto scrollbar-none">
          <div className={FORM_CARD}>
            <Field label="Nom ou Société *">
              <TextInput value={form.name} onChange={update("name")} placeholder="Ex: Studio Créatif" />
            </Field>
            <div className="mt-1.5">
              <Field label="Email">
                <TextInput value={form.email} onChange={update("email")} placeholder="contact@client.com" type="email" />
              </Field>
            </div>
            <div className="mt-1.5">
              <Field label="Téléphone">
                <TextInput value={form.phone} onChange={update("phone")} placeholder="+225 01 02 03 04 05" type="tel" />
              </Field>
            </div>
            <div className="mt-1.5">
              <Field label="Adresse">
                <TextArea value={form.address} onChange={update("address")} placeholder="Rue, quartier, bâtiment..." />
              </Field>
            </div>
            <div className="mt-1.5">
              <Field label="Notes internes">
                <TextArea value={form.notes} onChange={update("notes")} placeholder="Optionnel" />
              </Field>
            </div>
          </div>
        </div>

        {/* ── ERREUR ── */}
        {error && (
          <div className="mx-3 mb-2">
            <div className="p-2 rounded-md bg-rose-50 border border-rose-200">
              <p className="text-[8px] font-mono font-bold text-rose-700">{error}</p>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div className={cn(FORM_CARD, "border-t-0 rounded-t-none flex items-center gap-2")}>
          <button
            onClick={handleClose}
            className="flex-1 py-1.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-[8px] font-mono font-bold uppercase tracking-wider"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.name.trim()}
            className="flex-1 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[8px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            {submitting ? (
              <>
                <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Création...
              </>
            ) : (
              <>
                <CheckCircleIcon size={10} weight="bold" />
                Créer & Sélectionner
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}