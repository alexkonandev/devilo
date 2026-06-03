// ═══════════════════════════════════════════════════════════════════════════════
// QUOTE CREATION SHEET — Sheet Shadcn réutilisant le pattern ClientCreationSheet
// Permet de créer un nouveau devis avec sélection rapide du client, puis
// redirige vers l'éditeur complet
// ═══════════════════════════════════════════════════════════════════════════════

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { notify } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/ui/constants";
import {
  DS_INPUT,
  DS_GAP_SECTIONS,
  DS_LABEL,
} from "@/lib/design-system";
import {
  FileText,
  MagnifyingGlassIcon,
  Spinner,
  ArrowRight,
} from "@phosphor-icons/react";

interface ClientOption {
  id: string;
  name: string;
  email: string;
}

interface QuoteCreationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuoteCreationSheet({
  open,
  onOpenChange,
}: QuoteCreationSheetProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [clientQuery, setClientQuery] = useState("");
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Charger les clients au montage
  useEffect(() => {
    if (open) {
      const fetchClients = async () => {
        try {
          const { getEditorClientsAction } = await import(
            "@/actions/client-editor-action"
          );
          const result = await getEditorClientsAction();
          if (result) {
            setClients(
              result.map((c: { id: string; name: string; email: string | null }) => ({
                id: c.id,
                name: c.name,
                email: c.email ?? "",
              })),
            );
          }
        } catch {
          // Silencieux — on peut créer un devis sans client pré-sélectionné
        }
      };
      fetchClients();
      // Reset state à l'ouverture
      setClientQuery("");
      setSelectedClientId(null);
    }
  }, [open]);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(clientQuery.toLowerCase()),
  );

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      // Rediriger vers l'éditeur avec le client pré-sélectionné si choisi
      const params = selectedClientId
        ? `?clientId=${selectedClientId}`
        : "";
      onOpenChange(false);
      router.push(`/quotes/new${params}`);
      notify.success("Nouveau devis", "Editeur pret - completez les lignes et envoyez.");
    } catch {
      notify.error("Erreur", "Impossible de créer le devis");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setClientQuery("");
      setSelectedClientId(null);
      setIsDropdownOpen(false);
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col">
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <SheetHeader className="px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-200/60">
              <FileText size={15} weight="duotone" />
            </div>
            <div>
              <SheetTitle className="text-sm font-black text-slate-900 tracking-tight">
                Nouveau Devis
              </SheetTitle>
              <SheetDescription className="text-[9px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                Création rapide
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ── CONTENT ────────────────────────────────────────────────────── */}
        <div className={cn("flex-1 flex flex-col overflow-y-auto px-5 py-4", DS_GAP_SECTIONS)}>
          {/* ── Sélection Client ─────────────────────────────────────────── */}
          <div>
            <p className={cn(DS_LABEL, "mb-3")}>Client</p>
            <div className="relative">
              <MagnifyingGlassIcon
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={clientQuery}
                onChange={(e) => {
                  setClientQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Rechercher un client..."
                className={cn(
                  DS_INPUT,
                  "w-full pl-9 pr-3 py-2 text-sm rounded-lg",
                )}
                autoFocus
              />

              {/* Dropdown clients */}
              {isDropdownOpen && clientQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-sm max-h-48 overflow-y-auto">
                  {filteredClients.length === 0 ? (
                    <div className="px-3 py-2 text-[11px] text-slate-400 font-mono">
                      Aucun client trouvé
                    </div>
                  ) : (
                    filteredClients.slice(0, 8).map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => {
                          setSelectedClientId(client.id);
                          setClientQuery(client.name);
                          setIsDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-[11px] font-medium transition-colors flex items-center justify-between",
                          selectedClientId === client.id
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-700 hover:bg-slate-50",
                        )}
                      >
                        <span>{client.name}</span>
                        {client.email && (
                          <span className="text-[9px] text-slate-400 font-mono">
                            {client.email}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {selectedClientId && (
              <p className="text-[9px] text-emerald-600 font-mono mt-1">
                Client sélectionné
              </p>
            )}
            <p className="text-[9px] text-slate-400 font-mono mt-2">
              Laissez vide pour créer un devis sans client pré-attribué
            </p>
          </div>

          {/* ── Info ─────────────────────────────────────────────────────── */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
            <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
              Vous serez redirige vers l editeur complet pour ajouter les
              prestations, définir les prix et personnaliser le document.
            </p>
          </div>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <SheetFooter className="px-5 py-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className={cn(
                BTN_SECONDARY,
                "text-[10px] px-4 py-2 rounded-lg",
              )}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isLoading}
              className={cn(
                BTN_PRIMARY,
                "min-w-[120px] justify-center text-[10px] rounded-lg",
              )}
            >
              {isLoading ? (
                <Spinner size={14} className="animate-spin" />
              ) : (
                <>
                  <ArrowRight size={12} weight="bold" />
                  Créer le devis
                </>
              )}
            </button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}