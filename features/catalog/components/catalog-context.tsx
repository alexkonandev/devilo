"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useTransition,
  useMemo,
  useEffect,
} from "react";
import { CatalogService } from "@/types/catalog";
import {
  importServiceAction,
  deleteServiceAction,
} from "@/actions/catalog-action";
import { notify } from "@/lib/notifications";
import { useKernelStore } from "@/hooks/use-kernel-store";

// Canal de communication pour le router.refresh() multi-onglet
const catalogSync =
  typeof window !== "undefined" ? new BroadcastChannel("catalog_sync") : null;

interface CatalogContextType {
  isLoading: boolean;
  userServices: CatalogService[];
  platformServices: CatalogService[];
  selectedServiceId: string | null;
  selectService: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  importService: (id: string) => Promise<void>;
  updateLocalService: (id: string, data: Partial<CatalogService>) => void;
  deleteLocalService: (id: string) => Promise<void>;
  injectIntoActiveQuote: (service: CatalogService) => void;
  addService: (service: CatalogService) => void;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({
  children,
  initialUserServices,
  initialPlatformServices,
}: {
  children: ReactNode;
  initialUserServices: CatalogService[];
  initialPlatformServices: CatalogService[];
}) {
  const [isPending, startTransition] = useTransition();

  const addItem = useKernelStore((state) => state.addItem);
  const activeQuote = useKernelStore((state) => state.activeQuote);

  const [rawUserServices, setRawUserServices] =
    useState<CatalogService[]>(initialUserServices);
  const [rawPlatformServices] = useState<CatalogService[]>(
    initialPlatformServices
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Fonction pour notifier les autres onglets
  const emitSignal = () => catalogSync?.postMessage({ type: "DATA_CHANGED" });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kernel-store-update") {
        // Sync Zustand déjà gérée par le persist
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const injectIntoActiveQuote = (service: CatalogService) => {
    if (!activeQuote) {
      notify.error("ÉDITEUR_INACTIF", "Ouvrez un devis dans l'éditeur.");
      return;
    }

    addItem({
      title: service.title,
      subtitle: service.subtitle || "",
      unitPrice: service.unitPrice,
      quantity: 1,
    });

    notify.success("INJECTION_OK", `${service.title} ajouté au devis.`);
    localStorage.setItem("kernel-store-update", Date.now().toString());
    emitSignal(); // On signale pour mettre à jour la vue de l'éditeur
  };

  const updateLocalService = (id: string, data: Partial<CatalogService>) => {
    setRawUserServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
    // On émet le signal car une modification locale impacte le rendu du devis
    emitSignal();
  };

  const importService = async (serviceId: string) => {
    const serviceToImport = rawPlatformServices.find((s) => s.id === serviceId);
    if (!serviceToImport) return;

    if (rawUserServices.some((s) => s.title === serviceToImport.title)) {
      notify.error("CONFLIT", "Module déjà présent.");
      return;
    }

    startTransition(async () => {
      const result = await importServiceAction(serviceId);
      if (result.success && result.data) {
        setRawUserServices((prev) => [result.data!, ...prev]);
        setActiveId(result.data!.id);
        notify.success("SYNC_OK", "Module importé.");
        emitSignal(); // On signale l'ajout
      }
    });
  };

  const deleteLocalService = async (id: string) => {
    const previousServices = [...rawUserServices];
    setRawUserServices((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) setActiveId(null);

    startTransition(async () => {
      const result = await deleteServiceAction(id);
      if (result.success) {
        emitSignal(); // On signale la suppression
      } else {
        setRawUserServices(previousServices);
        notify.error("ERREUR_SYNC", "Échec serveur.");
      }
    });
  };

  // --- FILTRAGE MÉMOÏSÉ ---
  const filteredUserServices = useMemo(() => {
    return rawUserServices.filter((s) => {
      const matchSearch = s.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchCat =
        selectedCategory === "ALL" || s.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [rawUserServices, searchQuery, selectedCategory]);

  const filteredPlatformServices = useMemo(() => {
    return rawPlatformServices.filter((s) => {
      const matchSearch = s.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchCat =
        selectedCategory === "ALL" || s.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [rawPlatformServices, searchQuery, selectedCategory]);

  const selectService = (id: string | null) => setActiveId(id);

  const selectedServiceId = useMemo(() => {
    return activeId;
  }, [activeId]);

  return (
    <CatalogContext.Provider
      value={{
        isLoading: isPending,
        userServices: filteredUserServices,
        platformServices: filteredPlatformServices,
        selectedServiceId,
        selectService,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        importService,
        updateLocalService,
        deleteLocalService,
        injectIntoActiveQuote,
        addService: (service: CatalogService) => {
            setRawUserServices((prev) => [service, ...prev]);
            emitSignal();
        }
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context)
    throw new Error("useCatalog must be used within a CatalogProvider");
  return context;
};
