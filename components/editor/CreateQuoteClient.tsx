"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useKernelStore } from "@/hooks/use-kernel-store";

// --- UI COMPONENTS ---
import { QuoteEditorLayout } from "@/components/editor/quote-editor-layout";
import { StudioSidebarLeft } from "@/components/editor/studio-sidebar-left";
import { StudioSidebarRight } from "@/components/editor/studio-sidebar-right";
import { FloatingToolbar } from "@/components/editor/floating-toolbar";
import { QuoteVisualizer } from "@/components/editor/QuoteVisualizer";

// --- TYPES ---
import {
  EditorActiveQuote,
  EditorTheme,
  EditorCatalogOffer,
  EditorClient,
} from "@/types/editor";
import { User } from "@/app/generated/prisma/client";

// --- ACTIONS ---
import {
  upsertQuoteAction,
  deleteQuoteAction,
} from "@/actions/quote-editor-action";

interface CreateQuoteClientProps {
  initialCatalog: EditorCatalogOffer[];
  platformCatalog: EditorCatalogOffer[];
  initialThemes: EditorTheme[];
  initialClients: EditorClient[];
  user: User;
  preSelectedTheme?: EditorTheme | null;
  preSelectedOffer?: EditorCatalogOffer | null;
  existingQuoteId?: string;
  initialQuoteData?: EditorActiveQuote;
}

export default function CreateQuoteClient({
  initialCatalog,
  platformCatalog,
  initialThemes,
  initialClients,
  user,
  preSelectedTheme,
  existingQuoteId,
  initialQuoteData,
}: CreateQuoteClientProps) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const {
    _hasHydrated,
    activeQuote,
    setActiveQuote,
    setSettings,
    isSaving,
    setIsSaving,
    isDirty,
    setIsDirty,
    viewMode,
    zoom,
    activeThemeId,
    setActiveThemeId,
  } = useKernelStore();

  const [mounted, setMounted] = useState(false);

  // 1. Montage initial
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Sync Multi-onglet
  useEffect(() => {
    const bc = new BroadcastChannel("catalog_sync");
    bc.onmessage = (event) => {
      if (event.data.type === "DATA_CHANGED") router.refresh();
    };
    return () => bc.close();
  }, [router]);

  // 3. Hydratation et Initialisation de la donnée
  useEffect(() => {
    if (!_hasHydrated || !mounted) return;

    setSettings(user);

    if (!activeQuote) {
      // ✅ MODIFICATION : Formatage dynamique du numéro basé sur l'objet user
      const prefix = user.quotePrefix || "INV-";
      const nextNum = user.nextQuoteNumber || 1;
      const formattedNumber = `${prefix}${String(nextNum).padStart(3, "0")}`;

      const defaultQuote: EditorActiveQuote = initialQuoteData || {
        title: "PROJET_INSTANCE",
        company: {
          name: user.companyName ?? "",
          email: user.companyEmail ?? "",
          address: `${user.companyCity || ""} ${
            user.companyDistrict || ""
          }`.trim(),
          taxId: user.taxId ?? "",
          taxIdLabel: user.taxIdLabel ?? "NCC",
          website: user.companyWebsite ?? "",
        },
        client: { name: "", email: "", address: "", taxId: "" },
        quote: {
          // ✅ Utilisation du numéro formaté ici
          number: formattedNumber,
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: undefined, // Sera calculé automatiquement
          terms: user.defaultTerms ?? "",
          status: "DRAFT",
        },
        // ─── NOUVEAUX CHAMPS LÉGAUX (Phase 3 - Bloqueurs Critiques) ───
        currency: user.currency ?? "XOF",
        validityDays: 30,
        financials: {
          vatRatePercent: user.defaultVatRate ?? 18,
          discountAmount: 0,
        },
        items: [],
      };
      setActiveQuote(defaultQuote);
    }

    if (preSelectedTheme && !activeThemeId) {
      setActiveThemeId(preSelectedTheme.id);
    }
  }, [
    _hasHydrated,
    mounted,
    user,
    initialQuoteData,
    setSettings,
    setActiveQuote,
    setActiveThemeId,
    preSelectedTheme,
  ]);

  // --- LOGIQUE DE SAUVEGARDE ---

  const handleSave = async (showToast = false) => {
    if (!activeQuote?.client.name || isSaving) return false;

    setIsSaving(true);
    try {
      const result = await upsertQuoteAction(
        activeQuote,
        activeQuote.id || existingQuoteId,
      );

      if (result.success && result.data) {
        setIsDirty(false);

        // On met juste à jour l'ID dans le store pour savoir que
        // ce document existe maintenant en DB
        if (!activeQuote.id && result.data.id) {
          setActiveQuote({ ...activeQuote, id: result.data.id });
        }

        // ✅ SUPPRESSION DE LA REDIRECTION window.history.replaceState
        // On se contente de rafraîchir les données en arrière-plan
        router.refresh();

        if (showToast) toast.success("Devis enregistré en base de données");
        return true;
      } else {
        toast.error("Erreur de sauvegarde", { description: result.error });
        return false;
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Erreur réseau");
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  // ═══════════════════════════════════════════════════════════════
  // NOUVELLES ACTIONS : TOP BAR (CENTRE)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crée un nouveau devis :
   * Sauvegarde le travail actuel si nécessaire, vide le store et rafraîchit.
   */
  const handleNewQuote = async () => {
    if (isDirty && activeQuote?.client.name) {
      const saved = await handleSave(false);
      if (!saved) {
        const confirmSkip = window.confirm(
          "La sauvegarde a échoué. Créer un nouveau document sans sauvegarder ?",
        );
        if (!confirmSkip) return;
      }
    }

    // On réinitialise le store local
    setActiveQuote(null);
    setIsDirty(false);

    // On redirige vers la page de création pure pour avoir un document vide
    router.push("/quotes/new");
    toast.info("Nouveau devis initialisé");
  };

  /**
   * Supprime le devis :
   * Supprime en base de données si l'ID existe, sinon vide juste le store.
   */
  const handleDeleteQuote = async () => {
    const quoteId = activeQuote?.id || existingQuoteId;

    if (!quoteId) {
      setActiveQuote(null);
      setIsDirty(false);
      router.push("/quotes");
      return;
    }

    try {
      setIsSaving(true);
      const res = await deleteQuoteAction(quoteId);

      if (res.success) {
        toast.success("Devis supprimé avec succès");
        setActiveQuote(null);
        setIsDirty(false);
        router.push("/quotes");
      } else {
        toast.error("Erreur", { description: res.error });
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Sauvegarde automatique (Debounced)
  useEffect(() => {
    if (!isDirty || isSaving || !activeQuote?.client.name) return;

    const delayDebounceFn = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [activeQuote, isDirty, isSaving]);

  // 6. Calculs des totaux
  const totals = useMemo(() => {
    if (!activeQuote?.financials || !activeQuote?.items) {
      return { subTotal: 0, totalTTC: 0 };
    }
    const subTotal = activeQuote.items.reduce(
      (acc, item) =>
        acc + (Number(item.quantity) * Number(item.unitPrice) || 0),
      0,
    );
    const discount = Number(activeQuote.financials.discountAmount) || 0;
    const taxable = Math.max(0, subTotal - discount);
    const vat = taxable * ((activeQuote.financials.vatRatePercent || 0) / 100);
    return { subTotal, totalTTC: taxable + vat };
  }, [activeQuote?.items, activeQuote?.financials]);

  const activeThemeObject = useMemo(() => {
    return (
      initialThemes.find((t) => t.id === activeThemeId) || initialThemes[0]
    );
  }, [activeThemeId, initialThemes]);

  const handlePrint = async () => {
    const toastId = toast.loading("Génération du PDF...");
    try {
      const response = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...activeQuote, theme: activeThemeObject }),
      });
      if (!response.ok) throw new Error("Erreur");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      toast.success("PDF prêt", { id: toastId });
    } catch (error) {
      toast.error("Échec génération", { id: toastId });
    }
  };

  if (!mounted || !_hasHydrated)
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 animate-pulse">
          Initialisation...
        </span>
      </div>
    );

  if (!activeQuote) return null;

  return (
    <QuoteEditorLayout
      zoom={zoom}
      onNewQuote={handleNewQuote}
      onDeleteQuote={handleDeleteQuote}
      leftSidebar={
        viewMode === "studio" && (
          <StudioSidebarLeft
            catalogItems={initialCatalog}
            platformCatalog={platformCatalog}
            initialClients={initialClients}
            userId={user.id}
            onBack={() => router.back()}
          />
        )
      }
      rightSidebar={
        viewMode === "studio" && (
          <StudioSidebarRight availableThemes={initialThemes} totals={totals} />
        )
      }
      bottomToolbar={
        <FloatingToolbar
          onPrint={handlePrint}
          onSave={() => handleSave(true)}
          themes={initialThemes}
        />
      }
    >
      <QuoteVisualizer
        data={activeQuote}
        theme={activeThemeObject}
        printRef={printRef as React.RefObject<HTMLDivElement>}
      />
    </QuoteEditorLayout>
  );
}
