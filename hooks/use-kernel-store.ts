"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/app/generated/prisma/client";
import { EditorActiveQuote, EditorQuoteItem } from "@/types/editor";

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
      _hasHydrated: false,

      // --- ACTIONS CONFIG ---
      setSettings: (settings) => set({ userSettings: settings }),
      setBilling: (billing) => set({ billing }),

      // --- ACTIONS MÉTIER ---
      setActiveQuote: (quote) => set({ activeQuote: quote, isDirty: false }),

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
          if (!state.activeQuote) return state;
          const newItem: EditorQuoteItem = {
            title: item.title || "Nouvelle Ligne",
            subtitle: item.subtitle || "",
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            baseCost: item.baseCost || 0, // ─── Phase 3: Sauvegarde de la marge
          };
          return {
            activeQuote: {
              ...state.activeQuote,
              items: [...state.activeQuote.items, newItem],
            },
            isDirty: true,
          };
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
    }),
    {
      name: "kernel-operating-system",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => {
        const { isSaving, _hasHydrated, ...persistedState } = state;
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
