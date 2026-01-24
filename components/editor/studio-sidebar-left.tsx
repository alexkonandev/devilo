"use client";

import React, { useState, useMemo } from "react";
import {
  CaretLeftIcon,
  UserIcon,
  PlusIcon,
  ListBulletsIcon,
  XIcon,
  MagnifyingGlassIcon,
  Icon,
} from "@phosphor-icons/react";
import { ClientFormDialog } from "@/components/editor/client-form-dialog";
import {
  EditorActiveQuote,
  EditorQuoteItem,
  EditorCatalogOffer,
  EditorClient,
} from "@/types/editor";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";


interface StudioSidebarLeftProps {
  activeQuote: EditorActiveQuote;
  updateField: (
    group: keyof EditorActiveQuote | null,
    field: string,
    value: string | number
  ) => void;
  onBack?: () => void;
  initialClients: EditorClient[];
  catalogItems: EditorCatalogOffer[];
  addItem: (item?: Partial<EditorQuoteItem>) => void;
  updateItem: (
    index: number,
    field: keyof EditorQuoteItem,
    value: string | number
  ) => void;
  removeItem: (index: number) => void;
}

const SectionHeader = ({
  title,
  icon: Icon,
  right,
}: {
  title: string;
  icon: Icon;
  right?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between px-3 mb-2 shrink-0">
    <div className="flex items-center gap-2">
      <Icon size={14} weight="bold" className="text-indigo-600" />
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-900">
        {title}
      </span>
    </div>
    {right}
  </div>
);

export const StudioSidebarLeft = ({
  activeQuote,
  updateField,
  onBack,
  catalogItems,
  addItem,
  updateItem,
  removeItem,
}: StudioSidebarLeftProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);

  const filteredCatalog = useMemo(
    () =>
      catalogItems.filter(
        (i) =>
          i.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          i.category.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [catalogItems, debouncedSearch]
  );

  return (
    <>
      <ClientFormDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async () => true}
        clientToEdit={null}
      />

      <div className="flex flex-col h-full bg-white border-r border-slate-200 w-[320px] overflow-hidden rounded-none shadow-none">
        {/* 00. HEADER : SYNC H-16 */}
        <header className="h-15 shrink-0 flex items-center px-3 gap-3 border-b border-slate-200 bg-white z-10">
          <button
            onClick={onBack}
            className="h-7 w-7 flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors text-slate-900"
          >
            <CaretLeftIcon size={16} />
          </button>
          <div className="flex flex-col min-w-0 ">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
              Instance Projet
            </span>
            <input
              value={activeQuote.title}
              onChange={(e) => updateField(null, "title", e.target.value)}
              className="bg-transparent text-[14px] font-bold text-indigo-600 tracking-tight outline-none truncate"
              placeholder="Nom du projet..."
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col min-h-0 bg-white">
          {/* MODULE 01 : CONFIGURATION CLIENT & FISCALE */}
          <section className="py-4 border-b border-slate-100 bg-slate-50/30">
            <SectionHeader title="Saisie Client" icon={UserIcon} />
            <div className="px-3 space-y-2">
              <div className="flex w-full items-center border border-slate-200 bg-white focus-within:border-indigo-600 transition-colors">
                <input
                  value={activeQuote.client.name}
                  onChange={(e) =>
                    updateField("client", "name", e.target.value)
                  }
                  className="w-full bg-transparent px-3 h-8 text-[12px] font-bold text-slate-900 uppercase outline-none placeholder:text-slate-300"
                  placeholder="Sélectionner client..."
                />
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="h-8 w-10 flex items-center justify-center border-l border-slate-100 hover:bg-slate-50"
                >
                  <PlusIcon size={14} />
                </button>
              </div>

              {/* GRILLE FISCALE RÉDUITE */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white border border-slate-200 p-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Remise (€)
                  </span>
                  <input
                    type="number"
                    value={activeQuote.financials.discountAmountEuros}
                    onChange={(e) =>
                      updateField(
                        "financials",
                        "discountAmountEuros",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full bg-transparent font-mono text-[14px] font-bold text-indigo-600 outline-none"
                  />
                </div>
                <div className="bg-white border border-slate-200 p-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    TVA (%)
                  </span>
                  <input
                    type="number"
                    value={activeQuote.financials.vatRatePercent}
                    onChange={(e) =>
                      updateField(
                        "financials",
                        "vatRatePercent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full bg-transparent font-mono text-[14px] font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* MODULE 02 : ÉDITEUR DE PRODUCTION */}
          <section className="py-4 border-b border-slate-100">
            <SectionHeader
              title="Lignes de Production"
              icon={ListBulletsIcon}
              right={
                <span className="font-mono text-[10px] font-bold text-slate-400">
                  Total: {activeQuote.items.length.toString().padStart(2, "0")}
                </span>
              }
            />

            <div className="px-3 space-y-4">
              {activeQuote.items.map((item, idx) => (
                <div
                  key={idx}
                  className="group border border-slate-200 bg-white transition-all relative"
                >
                  {/* BOUTON SUPPRIMER (Top Right Flush) */}
                  <button
                    onClick={() => removeItem(idx)}
                    className="absolute right-0 top-0 h-6 w-6 opacity-0 group-hover:opacity-100 bg-red-600 text-white flex items-center justify-center transition-all z-10"
                  >
                    <XIcon size={10} weight="bold" />
                  </button>

                  <div className="p-2 space-y-2">
                    {/* 1. TITRE (Impact maximum) */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                        Désignation
                      </label>
                      <input
                        value={item.title}
                        onChange={(e) =>
                          updateItem(idx, "title", e.target.value)
                        }
                        className="w-full bg-transparent text-[11px] font-bold text-slate-900 uppercase outline-none focus:text-indigo-600 placeholder:text-slate-200"
                        placeholder="NOM DU SERVICE..."
                      />
                    </div>

                    {/* 2. SOUS-TITRE (Libéré dans son propre bloc) */}
                    <div className="flex flex-col gap-1 bg-slate-50/80 p-2 border-l-2 border-slate-200">
                      <textarea
                        value={item.subtitle || ""}
                        onChange={(e) =>
                          updateItem(idx, "subtitle", e.target.value)
                        }
                        className="w-full bg-transparent text-[10px] font-medium text-slate-800 uppercase outline-none focus:text-black resize-none h-auto min-h-[14px] leading-tight"
                        placeholder="DÉTAILS..."
                        rows={1}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = "auto";
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                      />
                    </div>
                  </div>

                  {/* 3. BARRE DE CALCUL (Base de la card) */}
                  <div className="flex divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/30">
                    <div className="flex-1 p-2">
                      <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">
                        P.U HT
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-400">
                          €
                        </span>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(
                              idx,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full bg-transparent font-mono text-[12px] font-black text-slate-900 outline-none"
                        />
                      </div>
                    </div>
                    <div className="w-20 p-2">
                      <label className="block text-[8px] font-black text-slate-400 uppercase mb-1 text-right">
                        Quantité
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            idx,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full bg-transparent font-mono text-[12px] font-black text-slate-900 text-right outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addItem()}
                className={cn(
                  "w-full h-8", // Hauteur réduite au minimum (32px)
                  "border border-dashed border-slate-300", // Traits découpés discrets
                  "bg-slate-50/50 text-slate-400", // Couleurs neutres pour ne pas polluer l'oeil
                  "flex items-center justify-center gap-2",
                  "transition-all duration-200",
                  "hover:border-indigo-600 hover:bg-indigo-50/30 hover:text-indigo-600", // Feedback chirurgical
                  "group mt-4"
                )}
              >
                <PlusIcon size={12} weight="bold" />
                <span className="text-[9px] font-black uppercase tracking-[0.15em]">
                  Ajouter une ligne
                </span>
              </button>
            </div>
          </section>

          {/* MODULE 03 : BIBLIOTHÈQUE DE RESSOURCES */}
          <section className="py-4 bg-slate-50/50 flex-1">
            <SectionHeader
              title="Catalogue Services"
              icon={MagnifyingGlassIcon}
            />
            <div className="px-3 space-y-4">
              <div className="relative">
                <MagnifyingGlassIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  placeholder="RECHERCHE RAPIDE..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 pl-9 pr-3 h-8 text-[11px] font-bold outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-none">
                {filteredCatalog.map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      addItem({
                        title: item.title,
                        unitPrice: item.unitPrice,
                        quantity: 1,
                      })
                    }
                    className="w-full flex items-center justify-between p-3 bg-white border border-slate-100 hover:border-indigo-600 group transition-colors"
                  >
                    <span className="text-[11px] font-bold text-slate-900 truncate flex-1 text-left">
                      {item.title}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-slate-400 group-hover:text-indigo-600 ml-2">
                      {item.unitPrice}€
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* FOOTER : AUDIT & STATUT */}
          <footer className="mt-auto border-t border-slate-900 bg-white p-6 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Document ID
              </span>
              <span className="text-[11px] font-mono font-bold text-indigo-600">
                {activeQuote.quote.number || "Attente"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                État Système
              </span>
              <div className="flex items-center gap-2 text-emerald-600">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase">
                  Optimal
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};
