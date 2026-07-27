"use client";

import React, {
  useRef,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import StudioLoader from "@/components/editor/studio-loader";
import { useKernelStore } from "@/hooks/use-kernel-store";

// --- UI COMPONENTS ---
import { QuoteEditorLayout } from "@/components/editor/quote-editor-layout";
import { StudioSidebarLeft } from "@/components/editor/studio-sidebar-left";
import { StudioSidebarRight } from "@/components/editor/studio-sidebar-right";
import { QuoteVisualizer } from "@/components/editor/QuoteVisualizer";
import { TemplateSelectorModal } from "@/components/editor/template-selector-modal";
import { ClientSelectorView } from "@/components/editor/client-selector-view";

// --- TYPES ---
import {
  EditorActiveQuote,
  EditorTheme,
  EditorCatalogOffer,
  EditorClient,
} from "@/types/editor";
import { User } from "@/app/generated/prisma/client";

// --- ACTIONS ---
import { upsertQuoteAction } from "@/actions/quote-editor-action";
import { deleteQuoteAction } from "@/actions/quote-registry-action";
import type { BillingProfile } from "@/actions/billing-action";

interface CreateQuoteClientProps {
  suggestions: EditorCatalogOffer[];
  initialThemes: EditorTheme[];
  initialClients: EditorClient[];
  user: User;
  preSelectedTheme?: EditorTheme | null;
  preSelectedOffer?: EditorCatalogOffer | null;
  existingQuoteId?: string;
  initialQuoteData?: EditorActiveQuote;
  billing?: BillingProfile | null;
}

export default function CreateQuoteClient({
  suggestions,
  initialThemes,
  initialClients,
  user,
  preSelectedTheme,
  existingQuoteId,
  initialQuoteData,
  billing,
}: CreateQuoteClientProps) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const {
    _hasHydrated,
    activeQuote,
    setActiveQuote,
    setSettings,
    setBilling,
    isSaving,
    setIsSaving,
    isDirty,
    setIsDirty,
    viewMode,
    zoom,
    activeThemeId,
    setActiveThemeId,
    lastUserSync,
    setLastUserSync,
  } = useKernelStore();

  const [mounted, setMounted] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

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

  // ─── Synchronisation des données billing dans le store ───
  useEffect(() => {
    if (!_hasHydrated || !mounted || !billing) return;
    setBilling({
      plan: billing.plan,
      quotaUsed: billing.quotaUsed,
      quotaLimit: billing.quotaLimit,
    });
  }, [_hasHydrated, mounted, billing, setBilling]);

  // ─── REF POUR TRACKER L'HYDRATATION UNIQUE ───
  // On ne doit réinitialiser activeQuote qu'une seule fois au montage,
  // pas à chaque fois que activeQuote change (ce qui créerait une boucle)
  const hydratedKeyRef = useRef<string | null>(null);

  // 3. Hydratation et Initialisation de la donnée (une seule fois)
  useEffect(() => {
    if (!_hasHydrated || !mounted) return;

    setSettings(user);

    // ─── CALCUL DU HASH DES DONNÉES UTILISATEUR POUR DÉTECTER LES CHANGEMENTS ───
    const userHash = JSON.stringify({
      name: user.companyName,
      email: user.companyEmail,
      address: user.companyAddressDetails,
      taxId: user.taxId,
      website: user.companyWebsite,
      currency: user.currency,
      quotePrefix: user.quotePrefix,
      nextQuoteNumber: user.nextQuoteNumber,
      defaultTerms: user.defaultTerms,
      defaultVatRate: user.defaultVatRate,
    });

    // ─── CLÉ D'HYDRATATION : combine userHash + initialQuoteData.id ───
    // Permet de détecter : changement utilisateur OU changement de devis (via sélecteur)
    const initialId = initialQuoteData?.id || "__new__";
    const hydraKey = `${userHash}::${initialId}`;

    console.log("[HYDRATION] Check:", {
      hydraKey,
      currentKey: hydratedKeyRef.current,
      keysMatch: hydratedKeyRef.current === hydraKey,
      initialQuoteDataId: initialQuoteData?.id,
      initialQuoteDataItemsCount: initialQuoteData?.items?.length,
      _hasHydrated,
      mounted,
    });

    // ─── NE RÉINITIALISER QUE SI LA CLÉ A CHANGÉ ───
    if (hydratedKeyRef.current !== hydraKey) {
      console.log("[HYDRATION] CLÉ CHANGÉE → Réinitialisation du store");
      hydratedKeyRef.current = hydraKey;

      // Numérotation purement numérique : 001, 002, 003...
      const formattedNumber = String(user.nextQuoteNumber || 1).padStart(3, "0");

      const defaultQuote: EditorActiveQuote = initialQuoteData || {
        title: "PROJET_INSTANCE",
        company: {
          name: user.companyName ?? "",
          email: user.companyEmail ?? "",
          // ✅ CORRECTION : utiliser companyAddressDetails au lieu de companyCity
          address: user.companyAddressDetails || user.companyCity || "",
          taxId: user.taxId ?? "",
          taxIdLabel: user.taxIdLabel ?? "NCC",
          website: user.companyWebsite ?? "",
        },
        client: { name: "", email: "", address: "", taxId: "", phone: "", notes: "" },
        quote: {
          number: formattedNumber,
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: undefined,
          terms: user.defaultTerms ?? "",
          status: "DRAFT",
        },
        currency: user.currency ?? "XOF",
        validityDays: 30,
        financials: {
          vatRatePercent: user.defaultVatRate ?? 18,
          discountAmount: 0,
        },
        items: [],
      };

      setActiveQuote(defaultQuote);
      // Mettre à jour le hash de sync
      setLastUserSync(userHash);
    }

    if (preSelectedTheme && !activeThemeId) {
      setActiveThemeId(preSelectedTheme.id);
    }
  }, [
    _hasHydrated,
    mounted,
    user,
    initialQuoteData?.id, // Seulement l'ID, pas tout l'objet
    preSelectedTheme,
    setSettings,
    setActiveQuote,
    setActiveThemeId,
    setLastUserSync,
  ]);

  // --- LOGIQUE DE SAUVEGARDE ---

  const handleSave = useCallback(
    async (showToast = false) => {
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
    },
    [
      activeQuote,
      isSaving,
      existingQuoteId,
      router,
      setActiveQuote,
      setIsDirty,
      setIsSaving,
    ],
  );
  // ─── SAUVEGARDE MANUELLE (avec toast de confirmation) ───
  const handleManualSave = useCallback(async () => {
    await handleSave(true);
  }, [handleSave]);

  // ═══════════════════════════════════════════════════════════════
  // NOUVELLES ACTIONS : TOP BAR (CENTRE)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crée un nouveau devis :
   * Sauvegarde le travail actuel si nécessaire, vide le store,
   * puis recharge la page pour obtenir les données fraîches du serveur.
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

    // On force un rechargement complet pour obtenir les données utilisateur à jour
    // (activeQuote n'étant plus persisté, le store sera vide au reload)
    window.location.href = "/quotes/new";
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
      console.error("Erreur suppression:", error);
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Sauvegarde automatique (Debounced)
  useEffect(() => {
    if (!isDirty || isSaving || !activeQuote?.client.name || (activeQuote.items?.length ?? 0) < 1) return;

    const delayDebounceFn = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [activeQuote, isDirty, isSaving, handleSave]);

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

  const handlePrint = async () => {
    // Ouvrir la modale de sélection de template au lieu d'exporter directement
    setTemplateModalOpen(true);
  };

  const handleExportWithTemplate = async (templateId: string) => {
    const toastId = toast.loading("Génération du PDF...");
    try {
      const response = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...activeQuote, templateId }),
      });
      if (!response.ok) throw new Error("Erreur");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      toast.success("PDF prêt", { id: toastId });
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      toast.error("Échec génération", { id: toastId });
    }
  };

  // ═══ EXTRAIRE LE FLAG ONBOARDING (avant tout early return) ═══
  const {
    editorOnboardingDone,
  } = useKernelStore();

  if (!mounted || !_hasHydrated)
    return <StudioLoader />;

  if (!activeQuote) return null;

  // ═══ SI AUCUN CLIENT SÉLECTIONNÉ → AFFICHER LE SÉLECTEUR DE CLIENT (une seule fois) ═══
  const hasActiveClient = activeQuote.client.name.length > 0;

  if (!hasActiveClient && !editorOnboardingDone) {
    return (
      <>
        <TemplateSelectorModal
          open={templateModalOpen}
          onClose={() => setTemplateModalOpen(false)}
          onExport={handleExportWithTemplate}
          billingPlan={billing?.plan || "FREE"}
        />
        <div className="h-screen w-full overflow-hidden bg-slate-50 flex flex-col">
          <ClientSelectorView
            initialClients={initialClients}
            userId={user.id}
          />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Modale de sélection de template */}
      <TemplateSelectorModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onExport={handleExportWithTemplate}
        billingPlan={billing?.plan || "FREE"}
      />

      <QuoteEditorLayout
      zoom={zoom}
      onNewQuote={handleNewQuote}
      onDeleteQuote={handleDeleteQuote}
      onSave={handleManualSave}
      isSaving={isSaving}
      leftSidebar={
        viewMode === "studio" && (
          <StudioSidebarLeft
            suggestions={suggestions}
            initialClients={initialClients}
            userId={user.id}
            onBack={() => router.push('/home')}
          />
        )
      }
      rightSidebar={
        viewMode === "studio" && (
          <StudioSidebarRight totals={totals} userId={user.id} />
        )
      }
      onPrint={handlePrint}
    >
      <QuoteVisualizer
        data={activeQuote}
        printRef={printRef as React.RefObject<HTMLDivElement>}
      />
    </QuoteEditorLayout>
    </>
  );
}
