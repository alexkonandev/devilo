"use client";

import React, { useState } from "react";
import { EditorClient } from "@/types/client";
import { upsertClient } from "@/actions/client-action";
import { cn } from "@/lib/utils";
import {
  DS_MICRO,
  DS_MONO,
  DS_INPUT,
  DS_BUTTON,
  DS_BUTTON_SECONDARY,
  DS_BENTO_CARD,
} from "@/lib/design-system";
import {
  User,
  EnvelopeSimple,
  Phone,
  MapPin,
  Buildings,
  FileText,
  Tag,
  X,
  Check,
} from "@phosphor-icons/react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientEditFormProps {
  client?: Partial<EditorClient>;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ClientEditForm({
  client,
  onClose,
  onSuccess,
}: ClientEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "contact" | "address" | "legal" | "notes"
  >("contact");
  const [formData, setFormData] = useState<EditorClient>({
    id: client?.id,
    name: client?.name || "",
    email: client?.email || null,
    phone: client?.phone || null,
    taxId: client?.taxId || null,
    tvaNumber: client?.tvaNumber || null,
    address: client?.address || null,
    addressLine2: client?.addressLine2 || null,
    city: client?.city || null,
    postalCode: client?.postalCode || null,
    country: client?.country || "CI",
    notes: client?.notes || null,
    tags: client?.tags || null,
  });
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Le nom du client est obligatoire");
      return;
    }

    setIsSubmitting(true);
    const result = await upsertClient(formData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(client?.id ? "Client mis à jour" : "Client créé");
      onSuccess();
    } else {
      toast.error(result.error || "Erreur lors de la sauvegarde");
    }
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const newTags = [...(formData.tags || []), tagInput.trim()];
    setFormData({ ...formData, tags: newTags });
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = (formData.tags || []).filter((t) => t !== tagToRemove);
    setFormData({ ...formData, tags: newTags.length ? newTags : null });
  };

  const tabs = [
    { id: "contact", label: "Contact", icon: User },
    { id: "address", label: "Adresse", icon: MapPin },
    { id: "legal", label: "Légal", icon: Buildings },
    { id: "notes", label: "Notes", icon: FileText },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className={cn(
          DS_BENTO_CARD,
          "w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 bg-slate-50/50">
          <div>
            <h2 className={cn(DS_MICRO, "text-slate-600 font-bold")}>
              {client?.id ? "MODIFIER CLIENT" : "NOUVEAU CLIENT"}
            </h2>
            <p className={cn(DS_MONO, "text-slate-400 mt-0.5")}>
              {client?.id
                ? `ID: ${client.id.slice(0, 8)}...`
                : "Création d'une nouvelle fiche"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200/60">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                activeTab === tab.id
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50",
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Tab: Contact */}
          {activeTab === "contact" && (
            <div className="space-y-4">
              <div>
                <label className={cn(DS_MICRO, "text-slate-500 block mb-1.5")}>
                  Nom du client *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nom de l'entreprise ou du contact"
                  className={cn(DS_INPUT, "w-full")}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={cn(DS_MICRO, "text-slate-500 block mb-1.5")}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <EnvelopeSimple
                      size={16}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value || null,
                        })
                      }
                      placeholder="contact@example.com"
                      className={cn(DS_INPUT, "w-full pl-9")}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={cn(DS_MICRO, "text-slate-500 block mb-1.5")}
                  >
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value || null,
                        })
                      }
                      placeholder="+225 07 XX XX XX XX"
                      className={cn(DS_INPUT, "w-full pl-9")}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Address */}
          {activeTab === "address" && (
            <div className="space-y-4">
              <div>
                <label className={cn(DS_MICRO, "text-slate-500 block mb-1.5")}>
                  Adresse ligne 1
                </label>
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: e.target.value || null,
                    })
                  }
                  placeholder="Rue, avenue, lotissement..."
                  className={cn(DS_INPUT, "w-full")}
                />
              </div>
              <div>
                <label className={cn(DS_MICRO, "text-slate-500 block mb-1.5")}>
                  Adresse ligne 2
                </label>
                <input
                  type="text"
                  value={formData.addressLine2 || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      addressLine2: e.target.value || null,
                    })
                  }
                  placeholder="Bâtiment, étage, appartement..."
                  className={cn(DS_INPUT, "w-full")}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label
                    className={cn(DS_MICRO, "text-slate-500 block mb-1.5")}
                  >
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        postalCode: e.target.value || null,
                      })
                    }
                    placeholder="00225"
                    className={cn(DS_INPUT, "w-full")}
                  />
                </div>
                <div className="col-span-2">
                  <label
                    className={cn(DS_MICRO, "text-slate-500 block mb-1.5")}
                  >
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value || null })
                    }
                    placeholder="Abidjan"
                    className={cn(DS_INPUT, "w-full")}
                  />
                </div>
              </div>
              <div>
                <label className={cn(DS_MICRO, "text-slate-500 block mb-1.5")}>
                  Pays
                </label>
                <select
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className={cn(DS_INPUT, "w-full")}
                >
                  <option value="CI">Côte d&apos;Ivoire</option>
                  <option value="SN">Sénégal</option>
                  <option value="FR">France</option>
                  <option value="BE">Belgique</option>
                  <option value="CA">Canada</option>
                  <option value="US">États-Unis</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab: Legal */}
          {activeTab === "legal" && (
            <div className="space-y-4">
              <div>
                <label className={cn(DS_MICRO, "text-slate-500 block mb-1.5")}>
                  Identifiant fiscal (RCCM, SIRET, NCC...)
                </label>
                <input
                  type="text"
                  value={formData.taxId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, taxId: e.target.value || null })
                  }
                  placeholder="CI-ABC-2024-A-12345"
                  className={cn(DS_INPUT, "w-full")}
                />
                <p className={cn(DS_MICRO, "text-slate-400 mt-1")}>
                  Numéro d&apos;immatriculation de l&apos;entreprise
                </p>
              </div>
              <div>
                <label className={cn(DS_MICRO, "text-slate-500 block mb-1.5")}>
                  Numéro TVA intracommunautaire
                </label>
                <input
                  type="text"
                  value={formData.tvaNumber || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tvaNumber: e.target.value || null,
                    })
                  }
                  placeholder="FR12345678901"
                  className={cn(DS_INPUT, "w-full")}
                />
                <p className={cn(DS_MICRO, "text-slate-400 mt-1")}>
                  Obligatoire pour la facturation intra-UE
                </p>
              </div>
            </div>
          )}

          {/* Tab: Notes */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <div>
                <label
                  className={cn(
                    DS_MICRO,
                    "text-slate-500 block mb-1.5 flex items-center gap-1.5",
                  )}
                >
                  <Tag size={14} />
                  Tags / Labels
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    placeholder="VIP, Prospect, Retard..."
                    className={cn(DS_INPUT, "flex-1")}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className={cn(DS_BUTTON_SECONDARY, "px-3")}
                  >
                    Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(formData.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-[10px] font-semibold"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-indigo-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className={cn(
                    DS_MICRO,
                    "text-slate-500 block mb-1.5 flex items-center gap-1.5",
                  )}
                >
                  <FileText size={14} />
                  Notes internes
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value || null })
                  }
                  placeholder="Appelé le 05/05 — relancer en juin&#10;Préfère être contacté par email&#10;..."
                  rows={6}
                  className={cn(DS_INPUT, "w-full resize-none")}
                />
                <p className={cn(DS_MICRO, "text-slate-400 mt-1")}>
                  Ces notes sont privées et ne figurent pas sur les
                  devis/factures
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200/60 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className={cn(DS_BUTTON_SECONDARY)}
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            className={cn(DS_BUTTON, "min-w-[120px] justify-center")}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enregistrement...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Check size={16} />
                {client?.id ? "Mettre à jour" : "Créer"}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ClientEditForm;
