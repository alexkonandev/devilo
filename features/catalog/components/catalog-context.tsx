"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useTransition,
  useMemo,
} from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
  rectIntersection,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { CatalogService, DragData } from "@/types/catalog";
import { importServiceAction } from "@/actions/catalog-action";
import { notify } from "@/lib/notifications";

interface CatalogContextType {
  activeId: string | null;
  isDragging: boolean;
  isLoading: boolean;
  userServices: CatalogService[]; // Version filtrée pour l'UI
  platformServices: CatalogService[]; // Version filtrée pour l'UI
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  updateLocalService: (id: string, data: Partial<CatalogService>) => void;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.5" } },
  }),
};

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeService, setActiveService] = useState<CatalogService | null>(
    null
  );

  // ÉTATS DE DONNÉES BRUTES
  const [rawUserServices, setRawUserServices] =
    useState<CatalogService[]>(initialUserServices);
  const [rawPlatformServices] = useState<CatalogService[]>(
    initialPlatformServices
  );

  // ÉTATS DE FILTRAGE
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // LOGIQUE DE FILTRAGE (Mémoïsée pour la performance)
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const updateLocalService = (id: string, data: Partial<CatalogService>) => {
    setRawUserServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as DragData;
    setActiveId(active.id as string);
    setActiveService(data.service);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeData = active.data.current as DragData;

    setActiveId(null);
    setActiveService(null);

    if (!over) return;

    if (activeData.source === "PLATFORM" && over.id === "user-inventory-zone") {
      const serviceToImport = activeData.service;

      if (rawUserServices.some((s) => s.title === serviceToImport.title)) {
        notify.error(
          "DÉJÀ_PRÉSENT",
          "Ce service est déjà dans votre catalogue."
        );
        return;
      }

      const tempId = `temp-${Date.now()}`;
      const newService = {
        ...serviceToImport,
        id: tempId,
        source: "PERSONAL" as const,
      };

      setRawUserServices((prev) => [newService, ...prev]);

      startTransition(async () => {
        const result = await importServiceAction(serviceToImport.id);
        if (result.success && result.data) {
          setRawUserServices((prev) =>
            prev.map((s) => (s.id === tempId ? result.data! : s))
          );
          notify.success("IMPORT_SUCCÈS", `${serviceToImport.title} importé.`);
        } else {
          notify.error("IMPORT_ERREUR", "Échec de l'importation.");
          setRawUserServices((prev) => prev.filter((s) => s.id !== tempId));
        }
      });
      return;
    }

    if (activeData.source === "PERSONAL" && active.id !== over.id) {
      setRawUserServices((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <CatalogContext.Provider
      value={{
        activeId,
        isDragging: !!activeId,
        isLoading: isPending,
        userServices: filteredUserServices,
        platformServices: filteredPlatformServices,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        updateLocalService,
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}

        <DragOverlay dropAnimation={dropAnimation}>
          {activeId && activeService ? (
            <div className="w-80 bg-white border-2 border-indigo-600 p-4 rotate-2 cursor-grabbing shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest px-1.5 py-0.5 bg-indigo-50 border border-indigo-100">
                  Transfert_Actif
                </span>
                <span className="text-[10px] font-mono font-black text-slate-950">
                  {new Intl.NumberFormat("fr-CI").format(
                    activeService.unitPrice
                  )}{" "}
                  CFA
                </span>
              </div>
              <p className="text-[12px] font-black text-slate-950 uppercase">
                {activeService.title}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </CatalogContext.Provider>
  );
}

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context)
    throw new Error("useCatalog must be used within a CatalogProvider");
  return context;
};
