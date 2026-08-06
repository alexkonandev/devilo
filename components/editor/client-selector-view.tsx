"use client";

import React, { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  UserIcon,
  MagnifyingGlassIcon,
  XIcon,
  CaretRightIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  SparkleIcon,
  StarIcon,
  IdentificationBadgeIcon,
} from "@phosphor-icons/react";
import type { EditorClient } from "@/types/editor";
import { useKernelStore } from "@/hooks/use-kernel-store";
import { useDebounce } from "@/hooks/use-debounce";
import { notify } from "@/lib/notifications";
import { listDraftQuotesAction } from "@/actions/quote-editor-action";
import { CreateClientDialog } from "@/components/editor/create-client-dialog";

const CLIENTS_PER_PAGE = 8;

interface ClientSelectorViewProps {
  initialClients: EditorClient[];
  userId: string;
}

export const ClientSelectorView = ({
  initialClients,
  userId,
}: ClientSelectorViewProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isDemo = pathname.startsWith("/demo");
  const { activeQuote, updateField, editorOnboardingDone, setEditorOnboardingDone } = useKernelStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loadingClient, setLoadingClient] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 150);

  const sortedClients = useMemo(() => {
    return [...initialClients].sort((a, b) => a.name.localeCompare(b.name));
  }, [initialClients]);

  const filteredClients = useMemo(() => {
    if (!debouncedSearch.trim()) return sortedClients;
    const q = debouncedSearch.toLowerCase();
    return sortedClients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q),
    );
  }, [sortedClients, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / CLIENTS_PER_PAGE));
  const paginatedClients = filteredClients.slice(
    page * CLIENTS_PER_PAGE,
    (page + 1) * CLIENTS_PER_PAGE,
  );

  const handleSelectClient = async (client: EditorClient) => {
    setLoadingClient(client.id);
    try {
      // Marquer l'onboarding comme terminé (une seule fois)
      if (!editorOnboardingDone) {
        setEditorOnboardingDone(true);
      }

      // Mettre à jour le client dans le store
      updateField("client", "name", client.name);
      updateField("client", "email", client.email || "");
      updateField("client", "address", client.address || "");
      updateField("client", "taxId", client.taxId || "");

      // Chercher le dernier devis de ce client
      const result = await listDraftQuotesAction(1, client.name);
      if (result.success && result.data.length > 0) {
        const latestQuote = result.data[0];
        router.push(isDemo ? `/demo/quotes/${latestQuote.id}` : `/quotes/${latestQuote.id}`);
      } else {
        // Pas de devis existant → on reste sur l'éditeur avec le client pré-rempli
        // Le store a déjà été mis à jour, le composant CreateQuoteClient détectera
        // que le client est sélectionné et affichera l'éditeur normal
        router.refresh();
      }
    } catch (error) {
      console.error("Erreur sélection client:", error);
      notify.error("Erreur lors de la sélection du client");
    } finally {
      setLoadingClient(null);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30 min-h-screen">
      {/* CreateClientDialog */}
      <CreateClientDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={(client) => {
          // Le client créé est un EditorClient complet
          handleSelectClient(client as EditorClient);
          setShowCreateDialog(false);
        }}
      />

      <div className="w-full max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 mb-4 shadow-sm">
            <IdentificationBadgeIcon size={28} className="text-indigo-600" />
          </div>
          <h1 className="text-xl font-mono font-black text-slate-900 tracking-tight mb-2">
            Commencer un devis
          </h1>
          <p className="text-[11px] font-mono text-slate-500 max-w-md mx-auto leading-relaxed">
            Sélectionnez un client pour démarrer. Si ce client a déjà un devis en cours,
            vous serez redirigé automatiquement vers celui-ci.
          </p>
        </div>

        {/* Search + Create */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Rechercher un client..."
              className="w-full h-10 pl-9 pr-8 bg-white border border-slate-200 rounded-xl text-[11px] font-mono text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(0);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <XIcon size={12} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="h-10 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-[9px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0"
          >
            <StarIcon size={12} weight="fill" />
            Nouveau
          </button>
        </div>

        {/* Liste des clients */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {paginatedClients.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 mb-3">
                <UserIcon size={20} className="text-slate-400" />
              </div>
              <p className="text-[12px] font-mono font-bold text-slate-700 mb-1">
                Aucun client trouvé
              </p>
              <p className="text-[9px] font-mono text-slate-500 mb-4">
                Créez un nouveau client pour commencer
              </p>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-[9px] font-mono font-bold uppercase tracking-wider transition-all"
              >
                Créer un client
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paginatedClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  disabled={loadingClient === client.id}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-indigo-50/50 group",
                    loadingClient === client.id && "opacity-60 pointer-events-none",
                  )}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                    <UserIcon size={16} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
                  </div>

                  {/* Info client */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono font-bold text-slate-900 truncate">
                      {client.name}
                    </p>
                    <p className="text-[8px] font-mono text-slate-500 truncate mt-0.5">
                      {client.email || "Aucun email"}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    {loadingClient === client.id ? (
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all text-slate-400">
                        <ArrowRightIcon size={12} weight="bold" />
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredClients.length > CLIENTS_PER_PAGE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className={cn(
                    "px-2 py-1 rounded-lg text-[8px] font-mono uppercase tracking-wider transition-all",
                    page === 0
                      ? "text-slate-300 cursor-default"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  ← Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={cn(
                      "w-6 h-6 flex items-center justify-center rounded-lg text-[8px] font-mono transition-all",
                      page === i
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-500 hover:bg-slate-100",
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className={cn(
                    "px-2 py-1 rounded-lg text-[8px] font-mono uppercase tracking-wider transition-all",
                    page >= totalPages - 1
                      ? "text-slate-300 cursor-default"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  Suivant →
                </button>
              </div>
              <span className="text-[7px] font-mono text-slate-400">
                {filteredClients.length} client{filteredClients.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Gamification subtile */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[8px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <SparkleIcon size={10} className="text-indigo-400" />
            {initialClients.length} client{initialClients.length > 1 ? "s" : ""} enregistré{initialClients.length > 1 ? "s" : ""}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="flex items-center gap-1">
            <FileTextIcon size={10} className="text-emerald-400" />
            Dernier devis chargé automatiquement
          </span>
        </div>
      </div>
    </div>
  );
};