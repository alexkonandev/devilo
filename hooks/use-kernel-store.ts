"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/app/generated/prisma/client";
import { EditorActiveQuote, EditorQuoteItem } from "@/types/editor";
import { MAX_QUOTE_LINES } from "@/lib/constants";

type FieldValue = string | number | boolean | null | Date;

interface BillingState {
  plan: "FREE" | "PRO" | "ENTERPRISE";
  quotaUsed: number;
  quotaLimit: number;
}

interface KernelState {
  userSettings: Partial<User> | null;
  setSettings: (settings: Partial<User>) => void;
  billing: BillingState;
  setBilling: (billing: BillingState) => void;
  _hasHydrated: boolean;

  activeQuote: EditorActiveQuote | null;
  setActiveQuote: (quote: EditorActiveQuote | null) => void;
  updateField: (
    group: keyof EditorActiveQuote | null,
    field: string,
    value: FieldValue,
  ) => void;
  addItem: (item: Partial<EditorQuoteItem>) => void;
  updateItem: (
    index: number,
    field: keyof EditorQuoteItem,
    value: string | number,
  ) => void;
  duplicateItem: (index: number) => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
  removeItem: (index: number) => void;
  isDirty: boolean;
  setIsDirty: (status: boolean) => void;
  isSaving: boolean;
  setIsSaving: (status: boolean) => void;
  viewMode: "studio" | "preview";
  setViewMode: (mode: "studio" | "preview") => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  activeThemeId: string;
  setActiveThemeId: (id: string) => void;
  activeTemplateId: string;
  setActiveTemplateId: (id: string) => void;
  // ─── VERSIONING POUR SYNC ONBOARDING ───
  lastUserSync: string | null; // Hash des données utilisateur pour détecter les changements
  setLastUserSync: (hash: string) => void;

  // ─── FLAG D'ONBOARDING ÉDITEUR ───
  // true après la première sélection d'un client dans l'éditeur
  editorOnboardingDone: boolean;
  setEditorOnboardingDone: (done: boolean) => void;

  // ─── CACHE DES MÉTRIQUES CLIENT ───
  // Persisté pour éviter les refetches à chaque montage
  clientMetricsCache: {
    clientName: string;
    outstanding: number;
    health: string;
  } | null;
  setClientMetricsCache: (cache: { clientName: string; outstanding: number; health: string } | null) => void;
}

export const useKernelStore = create<KernelState>()(
  persist(
    (set) => ({
      // --- ÉTATS ---
      userSettings: null,
      billing: { plan: "FREE", quotaUsed: 0, quotaLimit: 5 },
      activeQuote: null,
      isDirty: false,
      isSaving: false,
      viewMode: "studio",
      zoom: 0.85,
      activeThemeId: "",
      activeTemplateId: "minimal-invoice",
      _hasHydrated: false,

      // ─── VERSIONING ───
      lastUserSync: null,
      setLastUserSync: (hash) => set({ lastUserSync: hash }),

      // ─── ONBOARDING ───
      editorOnboardingDone: false,
      setEditorOnboardingDone: (done) => set({ editorOnboardingDone: done }),

      // ─── CACHE MÉTRIQUES ───
      clientMetricsCache: null,
      setClientMetricsCache: (cache) => set({ clientMetricsCache: cache }),

      // --- ACTIONS CONFIG ---
      setSettings: (settings) => set({ userSettings: settings }),
      setBilling: (billing) => set({ billing }),

      // --- ACTIONS MÉTIER ---
      setActiveQuote: (quote) => {
        console.log("[SET_ACTIVE_QUOTE] quote reçu:", {
          id: quote?.id,
          itemsCount: quote?.items?.length,
          items: quote?.items?.map(i => ({ title: i.title, qty: i.quantity, price: i.unitPrice })),
          hasClient: !!quote?.client?.name,
        });
        console.log("[SET_ACTIVE_QUOTE] isDirty mis à false");
        set({ activeQuote: quote, isDirty: false });
      },

      updateField: (group, field, value) =>
        set((state) => {
          if (!state.activeQuote) return state;

          const updatedQuote = { ...state.activeQuote };

          if (group === null) {
            // @ts-expect-error - Dynamique
            updatedQuote[field] = value;
          } else {
            const groupData = updatedQuote[group];
            if (
              groupData &&
              typeof groupData === "object" &&
              !Array.isArray(groupData)
            ) {
              // @ts-expect-error - Clone
              updatedQuote[group] = { ...groupData, [field]: value };
            }
          }

          // CRUCIAL : Ne pas marquer Dirty si on met à jour l'ID (opération technique)
          const shouldBeDirty = field !== "id";

          return {
            activeQuote: updatedQuote,
            isDirty: shouldBeDirty ? true : state.isDirty,
          };
        }),

      addItem: (item) =>
        set((state) => {
          console.log("[ADD_ITEM] Appel addItem avec item:", item);
          console.log("[ADD_ITEM] activeQuote.items.length AVANT:", state.activeQuote?.items?.length);
          console.log("[ADD_ITEM] activeQuote?.id (existant):", state.activeQuote?.id);
          if (!state.activeQuote) {
            console.warn("[ADD_ITEM] ERREUR: activeQuote est null, impossible d'ajouter un item");
            return state;
          }
          if (state.activeQuote.items.length >= MAX_QUOTE_LINES) {
            console.warn(`[ADD_ITEM] LIMITE ATTEINTE: ${MAX_QUOTE_LINES} lignes max, ajout bloqué`);
            return state;
          }
          const newItem: EditorQuoteItem = {
            title: item.title || "Nouvelle Ligne",
            subtitle: item.subtitle || "",
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            baseCost: item.baseCost || 0,
          };
          const newState = {
            activeQuote: {
              ...state.activeQuote,
              items: [...state.activeQuote.items, newItem],
            },
            isDirty: true,
          };
          console.log("[ADD_ITEM] activeQuote.items.length APRÈS:", newState.activeQuote.items.length);
          console.log("[ADD_ITEM] isDirty mis à true");
          console.log("[ADD_ITEM] Dernier item ajouté:", newItem);
          return newState;
        }),

      updateItem: (index, field, value) =>
        set((state) => {
          if (!state.activeQuote) return state;
          const newItems = state.activeQuote.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item,
          );
          return {
            activeQuote: { ...state.activeQuote, items: newItems },
            isDirty: true,
          };
        }),

      duplicateItem: (index) =>
        set((state) => {
          if (!state.activeQuote || index < 0 || index >= state.activeQuote.items.length) return state;
          if (state.activeQuote.items.length >= MAX_QUOTE_LINES) {
            console.warn(`[DUPLICATE_ITEM] LIMITE ATTEINTE: ${MAX_QUOTE_LINES} lignes max, duplication bloquée`);
            return state;
          }
          const itemToDuplicate = { ...state.activeQuote.items[index] };
          const newItems = [...state.activeQuote.items];
          newItems.splice(index + 1, 0, { ...itemToDuplicate });
          return {
            activeQuote: { ...state.activeQuote, items: newItems },
            isDirty: true,
          };
        }),

      moveItem: (fromIndex, toIndex) =>
        set((state) => {
          if (!state.activeQuote || fromIndex < 0 || fromIndex >= state.activeQuote.items.length) return state;
          if (toIndex < 0 || toIndex >= state.activeQuote.items.length) return state;
          if (fromIndex === toIndex) return state;
          const newItems = [...state.activeQuote.items];
          const [movedItem] = newItems.splice(fromIndex, 1);
          newItems.splice(toIndex, 0, movedItem);
          return {
            activeQuote: { ...state.activeQuote, items: newItems },
            isDirty: true,
          };
        }),

      removeItem: (index) =>
        set((state) => {
          if (!state.activeQuote) return state;
          return {
            activeQuote: {
              ...state.activeQuote,
              items: state.activeQuote.items.filter((_, i) => i !== index),
            },
            isDirty: true,
          };
        }),

      // --- ACTIONS UI ---
      setIsDirty: (status) => set({ isDirty: status }),
      setIsSaving: (status) => set({ isSaving: status }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setZoom: (zoom) => set({ zoom }),
      setActiveThemeId: (id) => set({ activeThemeId: id }),
      setActiveTemplateId: (id) => set({ activeTemplateId: id }),
    }),
    {
      name: "kernel-operating-system",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => {
        // Ne pas persister les données volatiles de l'éditeur actif :
        // activeQuote et isDirty doivent être frais à chaque chargement.
        const { isSaving, _hasHydrated, activeQuote, isDirty, ...persistedState } = state;
        return persistedState;
      },

      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    },
  ),
);
