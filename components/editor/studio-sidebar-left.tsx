"use client";

import React, { useState, useEffect } from "react";
import {
  UserIcon,
  PlusIcon,
  ListBulletsIcon,
  MagnifyingGlassIcon,
  CaretLeftIcon,
  PackageIcon,
  TrashIcon,
  BuildingOfficeIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  IdentificationCardIcon,
  UserPlusIcon,
  XIcon,
  GlobeIcon,
  TrendUpIcon,
  ShieldCheckIcon,
  WarningCircleIcon,
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
} from "@phosphor-icons/react";
import { useKernelStore } from "@/hooks/use-kernel-store";
import { useDebounce } from "@/hooks/use-debounce";
import { EditorCatalogOffer, EditorClient } from "@/types/editor";
import { cn } from "@/lib/utils";
import {
  searchClients,
  getClientMetrics,
  getClientHistory,
} from "@/app/actions/studio";

// ═══════════════════════════════════════════════════════════════
// DS TOKENS - Design System Unifié
// ═══════════════════════════════════════════════════════════════
const ISLAND = cn(
  "bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden transition-all duration-300",
);

const MICRO_LABEL =
  "text-[7px] font-bold uppercase tracking-[0.25em] text-slate-400";
const COMPACT_LABEL = "text-[9px] font-semibold text-slate-500 block mb-1";

const SECTION_LABEL =
  "text-[7px] font-bold uppercase tracking-[0.25em] text-slate-400 flex items-center gap-1.5 mb-2 px-1";

const FIELD_LABEL = "text-[9px] font-semibold text-slate-500 block mb-1 ml-1";

type ActiveTab = "client" | "lignes" | "catalogue";
type CatalogTab = "perso" | "platform";

interface StudioSidebarLeftProps {
  onBack?: () => void;
  catalogItems: EditorCatalogOffer[];
  platformCatalog: EditorCatalogOffer[];
  initialClients: EditorClient[];
  userId: string;
}

export const StudioSidebarLeft = ({
  onBack,
  catalogItems,
  platformCatalog,
  initialClients,
  userId,
}: StudioSidebarLeftProps) => {
  const { activeQuote, updateField, addItem, updateItem, removeItem } =
    useKernelStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>("client");
  const [catalogTab, setCatalogTab] = useState<CatalogTab>("perso");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const debouncedSearch = useDebounce(clientSearch, 150);

  // États pour les données dynamiques
  const [searchResults, setSearchResults] =
    useState<EditorClient[]>(initialClients);
  const [isSearching, setIsSearching] = useState(false);
  const [clientMetrics, setClientMetrics] = useState<{
    outstanding: number;
    health: string;
  } | null>(null);
  const [clientHistory, setClientHistory] = useState<
    Array<{
      id: string;
      title: string;
      subtitle: string;
      unitPrice: number;
      quantity: number;
    }>
  >([]);

  // Recherche de clients via Server Action
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchClients(debouncedSearch, userId);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching clients:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    performSearch();
  }, [debouncedSearch, userId]);

  // Charger les métriques et l'historique quand un client est sélectionné
  useEffect(() => {
    const loadClientData = async () => {
      if (!activeQuote?.client.name) {
        setClientMetrics(null);
        setClientHistory([]);
        return;
      }

      try {
        // Trouver le client par son nom (pour obtenir l'ID)
        const clients = await searchClients(activeQuote.client.name, userId);
        const selectedClient = clients.find(
          (c) => c.name === activeQuote.client.name,
        );

        if (selectedClient) {
          // Charger les métriques
          const metrics = await getClientMetrics(selectedClient.id, userId);
          setClientMetrics(metrics);

          // Charger l'historique
          const history = await getClientHistory(selectedClient.id, userId);
          setClientHistory(history);
        }
      } catch (error) {
        console.error("Error loading client data:", error);
      }
    };

    loadClientData();
  }, [activeQuote?.client.name, userId]);

  if (!activeQuote) return null;

  const hasActiveClient = activeQuote.client.name.length > 0;

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] border-r border-slate-200 w-full">
      {/* ━━━ HEADER ━━━ */}
      <div className="p-3 shrink-0">
        <div
          className={cn(
            ISLAND,
            "px-3 py-4 flex items-center gap-3 border-slate-200/60 shadow-md shadow-slate-200/30",
          )}
        >
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
          >
            <CaretLeftIcon size={20} weight="regular" />
          </button>
          <div className="flex flex-col min-w-0">
            <span className="text-[7px] font-black uppercase tracking-[0.25em] text-indigo-500">
              Workspace
            </span>
            <input
              value={activeQuote.title}
              onChange={(e) => updateField(null, "title", e.target.value)}
              className="bg-transparent border-none p-0 text-[13px] font-black text-slate-900 italic outline-none truncate"
              placeholder="Nom du projet..."
            />
          </div>
        </div>
      </div>

      {/* ━━━ NAV PRINCIPALE ━━━ */}
      <div className="px-3 mb-3 flex gap-1">
        {[
          { id: "client", label: "Client", icon: UserIcon },
          { id: "lignes", label: "Devis", icon: ListBulletsIcon },
          { id: "catalogue", label: "Offres", icon: PackageIcon },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all border text-[8px] font-black uppercase tracking-widest",
                isSelected
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200"
                  : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300",
              )}
            >
              <tab.icon size={20} weight={isSelected ? "fill" : "regular"} />
              {tab.label}
            </button>
          );
        })}
      </div>
      {/* TRAIT SOLIDE ET VISIBLE */}
      <div className=" mb-4">
        <div className="h-[1.5px] w-full bg-slate-200 rounded-full" />
      </div>

      {/* ━━━ CONTENT ━━━ */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-3 pb-6 flex flex-col gap-4">
        {/* SECTION CLIENT : CRM Intégré */}
        {activeTab === "client" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {!showCreateForm ? (
              <>
                {/* RECHERCHE */}
                <div className={cn(ISLAND, "p-4")}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={SECTION_LABEL}>Trouver un client</span>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <UserPlusIcon size={20} weight="regular" /> CRÉER
                    </button>
                  </div>
                  <div className="relative">
                    <MagnifyingGlassIcon
                      size={20}
                      weight="regular"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    />
                    <input
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Nom, Email, Société..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 h-11 text-[12px] font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                    />
                  </div>

                  {/* LISTE RÉSULTATS AVEC SCORING */}
                  {clientSearch && (
                    <div className="mt-2 space-y-1">
                      {isSearching ? (
                        <div className="text-center py-4">
                          <span className="text-[9px] font-bold text-slate-400">
                            Recherche en cours...
                          </span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              // SNAPSHOT LOGIC: Copier les informations du client dans les champs du quote
                              updateField("client", "name", c.name);
                              updateField("client", "email", c.email || "");
                              updateField("client", "address", c.address || "");
                              updateField("client", "taxId", c.taxId || "");
                              setClientSearch("");
                            }}
                            className="w-full text-left p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 flex items-center justify-between group transition-all"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-[11px] font-black text-slate-800 truncate">
                                  {c.name}
                                </p>
                                {/* TODO: Charger les métriques réelles via getClientMetrics */}
                              </div>
                              <p className="text-[9px] text-slate-400 truncate mt-0.5">
                                {c.email}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <span className="text-[9px] font-bold text-slate-400">
                            Aucun client trouvé
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ALERTE: Client requis - Design élégant et contextualisé */}
                {!hasActiveClient && (
                  <div className="mt-4 mx-2">
                    <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-amber-50/80 to-orange-50/60 border border-amber-200/60 p-3.5">
                      {/* Subtle pattern overlay */}
                      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,amber-900_1px,transparent_0)] bg-size-[16px_16px]" />

                      <div className="relative flex items-start gap-3">
                        <div className="shrink-0 w-7 h-7 rounded-lg bg-amber-100/80 flex items-center justify-center">
                          <WarningCircleIcon
                            className="text-amber-600"
                            size={20}
                            weight="regular"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-amber-900 leading-tight">
                            Client requis
                          </p>
                          <p className="text-[9px] text-amber-700/70 mt-1 leading-relaxed">
                            Sélectionnez un client pour la conformité fiscale
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FICHE CLIENT ACTIVE (Si un client est sélectionné) */}
                {hasActiveClient && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                    {/* EN-TÊTE & SCORING */}
                    <div
                      className={cn(
                        ISLAND,
                        "p-4 bg-linear-to-br from-indigo-900 to-slate-900 text-white",
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-300/80 mb-1 block">
                            Client Actif
                          </span>
                          <h3 className="text-[14px] font-black truncate pr-4">
                            {activeQuote.client.name}
                          </h3>
                          <p className="text-[10px] text-indigo-200/60 mt-0.5">
                            {activeQuote.client.email || "Aucun email défini"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                            Encours
                          </span>
                          <span className="text-[12px] font-mono font-black text-emerald-400">
                            {clientMetrics?.outstanding
                              ? clientMetrics.outstanding.toLocaleString() +
                                " XOF"
                              : "0 XOF"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/10 flex gap-2">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-md text-[8px] font-bold text-white flex items-center gap-1",
                            clientMetrics?.health === "À JOUR"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/20 text-rose-300",
                          )}
                        >
                          {clientMetrics?.health === "À JOUR" ? (
                            <CheckCircleIcon size={20} weight="regular" />
                          ) : (
                            <WarningCircleIcon size={20} weight="regular" />
                          )}
                          {clientMetrics?.health || "---"}
                        </span>
                      </div>
                    </div>

                    {/* INFORMATIONS LÉGALES & FACTURATION */}
                    <div className={cn(ISLAND, "p-4 space-y-4")}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={SECTION_LABEL}>
                          Informations de facturation
                        </span>
                        <span className="text-[8px] font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                          Requis pour facture
                        </span>
                      </div>

                      <SidebarInput
                        label="Société / Nom complet"
                        value={activeQuote.client.name}
                        onChange={(v) => updateField("client", "name", v)}
                        icon={<BuildingOfficeIcon />}
                      />
                      <SidebarInput
                        label="Adresse Postale Complète"
                        value={activeQuote.client.address}
                        onChange={(v) => updateField("client", "address", v)}
                        icon={<MapPinIcon />}
                        isTextArea
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <SidebarInput
                          label="N° TVA / SIRET"
                          placeholder="Optionnel"
                          icon={<IdentificationCardIcon />}
                        />
                        <div className="w-full">
                          <label className={FIELD_LABEL}>Devise</label>
                          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-[11px] font-bold text-slate-900 outline-none focus:border-indigo-400">
                            <option>XOF (FCFA)</option>
                            <option>EUR (€)</option>
                            <option>USD ($)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* HISTORIQUE EXPRESS (Context-Aware) */}
                    <div className={cn(ISLAND, "p-4")}>
                      <span className={SECTION_LABEL}>Historique Express</span>
                      <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                        Dernières prestations facturées à ce client. Cliquez
                        pour ajouter au devis actuel.
                      </p>
                      <div className="space-y-2">
                        {clientHistory.length > 0 ? (
                          clientHistory.map((histItem) => (
                            <button
                              key={histItem.id}
                              onClick={() =>
                                addItem({
                                  title: histItem.title,
                                  unitPrice: histItem.unitPrice,
                                  quantity: 1,
                                  baseCost: 0,
                                })
                              }
                              className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors shrink-0">
                                  <ClockCounterClockwiseIcon
                                    size={20}
                                    weight="regular"
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 truncate group-hover:text-indigo-900">
                                  {histItem.title}
                                </span>
                              </div>
                              <PlusIcon
                                size={20}
                                className="text-slate-300 group-hover:text-indigo-600 shrink-0"
                                weight="regular"
                              />
                            </button>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <span className="text-[9px] font-bold text-slate-400">
                              Aucun historique disponible
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* FORMULAIRE DE CRÉATION ENRICHI */
              <div
                className={cn(ISLAND, "p-4 border-indigo-200 bg-indigo-50/20")}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                    <UserPlusIcon size={20} weight="regular" /> Nouveau Client
                  </span>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="p-1 hover:bg-white rounded-md text-slate-400"
                  >
                    <XIcon size={20} weight="regular" />
                  </button>
                </div>
                <div className="space-y-4">
                  <SidebarInput
                    label="Nom ou Société"
                    icon={<BuildingOfficeIcon />}
                    placeholder="Ex: Studio Design"
                  />
                  <SidebarInput
                    label="Email de Facturation"
                    icon={<EnvelopeSimpleIcon />}
                    placeholder="compta@client.com"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <SidebarInput
                      label="N° Fiscal (SIRET/VAT)"
                      icon={<IdentificationCardIcon />}
                      placeholder="Optionnel"
                    />
                    <div className="w-full group">
                      <label className={FIELD_LABEL}>Délai Défaut</label>
                      <select className="w-full bg-white border border-slate-200 rounded-xl px-3 h-11 text-[11px] font-bold text-slate-900 outline-none focus:border-indigo-400 shadow-sm">
                        <option>Réception</option>
                        <option>30 Jours</option>
                        <option>45 Jours FDM</option>
                      </select>
                    </div>
                  </div>

                  <button className="w-full py-3 mt-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95">
                    Créer & Sélectionner
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION ITEMS : Gestion Financière Complète */}
        {activeTab === "lignes" && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {activeQuote.items.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  ISLAND,
                  "p-4 relative group border-l-4 border-l-slate-100 hover:border-l-indigo-500",
                )}
              >
                <button
                  onClick={() => removeItem(idx)}
                  className="absolute top-3 right-3 text-slate-200 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <TrashIcon size={20} weight="regular" />
                </button>

                <div className="space-y-4 pr-6">
                  <div>
                    <input
                      value={item.title}
                      onChange={(e) => updateItem(idx, "title", e.target.value)}
                      className="w-full bg-transparent text-[13px] font-black text-slate-900 outline-none placeholder:text-slate-200 focus:text-indigo-600"
                      placeholder="Prestation..."
                    />
                    <textarea
                      value={item.subtitle || ""}
                      onChange={(e) =>
                        updateItem(idx, "subtitle", e.target.value)
                      }
                      className="w-full bg-transparent text-[10px] font-bold text-slate-400 outline-none resize-none mt-1.5 leading-relaxed"
                      rows={2}
                      placeholder="Description détaillée..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                    <div>
                      <label className={FIELD_LABEL}>Prix Vente</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(
                              idx,
                              "unitPrice",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 h-9 text-[11px] font-mono font-black text-slate-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={cn(FIELD_LABEL, "text-indigo-500")}>
                        Coût Base
                      </label>
                      <input
                        type="number"
                        value={item.baseCost || 0}
                        onChange={(e) =>
                          updateItem(
                            idx,
                            "baseCost",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full bg-indigo-50/30 border border-indigo-100 rounded-lg px-2 h-9 text-[11px] font-mono font-black text-indigo-600"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase">
                      Marge Brut
                    </span>
                    <span className="text-[10px] font-mono font-black text-emerald-600">
                      {(
                        (item.unitPrice - (item.baseCost || 0)) *
                        item.quantity
                      ).toLocaleString()}{" "}
                      XOF
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {/* EMPTY STATE: Aucune ligne - Design illustré */}
            {activeQuote.items.length === 0 && (
              <div className="mx-4 my-6">
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-50 to-white border border-slate-200/60 p-6">
                  {/* Decorative circles */}
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-100/50 rounded-full blur-2xl" />
                  <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-emerald-100/50 rounded-full blur-2xl" />

                  <div className="relative text-center">
                    {/* Icône avec halo */}
                    <div className="relative inline-flex mb-4">
                      <div className="absolute inset-0 bg-indigo-200/30 rounded-full blur-md scale-150" />
                      <div className="relative w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-50 to-white border border-indigo-100 flex items-center justify-center shadow-sm">
                        <ListBulletsIcon
                          size={20}
                          weight="regular"
                          className="text-indigo-400"
                        />
                      </div>
                    </div>

                    <p className="text-[12px] font-semibold text-slate-700 mb-1.5">
                      Commencez votre devis
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed max-w-[200px] mx-auto">
                      Ajoutez votre première ligne de prestation ou choisissez
                      dans le catalogue
                    </p>

                    {/* Mini hint */}
                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80">
                      <PlusIcon
                        size={20}
                        weight="regular"
                        className="text-slate-400"
                      />
                      <span className="text-[9px] text-slate-500">
                        Cliquez ci-dessous
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() =>
                addItem({
                  title: "Nouveau service",
                  unitPrice: 0,
                  quantity: 1,
                  baseCost: 0,
                })
              }
              className="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-300 flex flex-col items-center gap-2 hover:border-indigo-300 hover:text-indigo-500 transition-all group"
            >
              <PlusIcon size={20} weight="regular" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Ajouter un item
              </span>
            </button>
          </div>
        )}

        {/* SECTION CATALOGUE */}
        {activeTab === "catalogue" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex p-1 bg-slate-200/50 rounded-xl">
              <button
                onClick={() => setCatalogTab("perso")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase transition-all",
                  catalogTab === "perso"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400",
                )}
              >
                <UserIcon size={20} weight="regular" /> Inventaire
              </button>
              <button
                onClick={() => setCatalogTab("platform")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase transition-all",
                  catalogTab === "platform"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-400",
                )}
              >
                <GlobeIcon size={20} weight="regular" /> Offres Cloud
              </button>
            </div>

            <div className="space-y-2">
              {(catalogTab === "perso" ? catalogItems : platformCatalog).map(
                (offer) => (
                  <div
                    key={offer.id}
                    className={cn(
                      ISLAND,
                      "p-4 group hover:border-indigo-500 transition-all",
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] font-black text-slate-900 truncate">
                            {offer.title}
                          </p>
                          {offer.isPremium && (
                            <ShieldCheckIcon
                              size={20}
                              weight="regular"
                              className="text-amber-500 shrink-0"
                            />
                          )}
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5 line-clamp-1 italic">
                          {offer.subtitle}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          addItem({
                            title: offer.title,
                            unitPrice: offer.unitPrice,
                            quantity: 1,
                            baseCost: 0,
                          })
                        }
                        className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 active:scale-90 transition-all"
                      >
                        <PlusIcon size={20} weight="regular" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-slate-300 uppercase">
                          Tarif Public
                        </span>
                        <span className="text-[11px] font-mono font-black text-slate-900">
                          {offer.unitPrice.toLocaleString()}{" "}
                          <span className="text-[8px] opacity-40">XOF</span>
                        </span>
                      </div>
                      {catalogTab === "platform" && (
                        <div className="flex flex-col text-right">
                          <span className="text-[7px] font-black text-indigo-400 uppercase">
                            Rentabilité Est.
                          </span>
                          <div className="flex items-center gap-1 text-indigo-600 font-mono font-black text-[11px]">
                            <TrendUpIcon size={20} weight="regular" /> 85%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* ━━━ FOOTER ━━━ */}
      <div className="mt-auto px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Synchronisé Cloud
          </span>
        </div>
        <div className="px-2 py-0.5 rounded-md bg-slate-100 text-[8px] font-mono font-black text-slate-400 border border-slate-200">
          V1.3.0
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANTS INTERNES
// ═══════════════════════════════════════════════════════════════

interface IconProps {
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}

function SidebarInput({
  label,
  value,
  onChange,
  icon,
  placeholder,
  isTextArea,
}: {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  icon: React.ReactElement<IconProps>;
  placeholder?: string;
  isTextArea?: boolean;
}) {
  return (
    <div className="w-full group">
      <label className={FIELD_LABEL}>{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
          {React.cloneElement(icon, {
            size: 14,
            weight: "bold",
          })}
        </div>
        {isTextArea ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[11px] font-bold text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm resize-none"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 h-11 text-[11px] font-bold text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
          />
        )}
      </div>
    </div>
  );
}
