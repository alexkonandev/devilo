"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CatalogService } from "@/types/catalog";
import { DS_MONO, DS_LABEL } from "@/lib/design-system";
import { ServiceCard } from "./service-card";

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE GRID — Grille responsive de cartes (Phase 2.3)
// ═══════════════════════════════════════════════════════════════════════════════

interface CatalogServiceWithMargin extends CatalogService {
  margin: number;
  revenue: number;
}

interface ServiceGridProps {
  services: CatalogServiceWithMargin[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onInject: (service: CatalogService) => void;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  /** Custom empty state message */
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export function ServiceGrid({
  services,
  selectedId,
  onSelect,
  onInject,
  onEdit,
  onDuplicate,
  onDelete,
  emptyMessage,
  emptyAction,
}: ServiceGridProps) {
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-slate-200 rounded-md">
        <p className={cn(DS_MONO, "text-slate-400")}>{emptyMessage || "Aucun service"}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {services.map((service, index) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.2 }}
        >
          <ServiceCard
            service={service}
            isSelected={selectedId === service.id}
            onSelect={onSelect}
            onInject={onInject}
            onEdit={onEdit ? () => onEdit(service.id) : undefined}
            onDuplicate={onDuplicate ? () => onDuplicate(service.id) : undefined}
            onDelete={onDelete ? () => onDelete(service.id) : undefined}
          />
        </motion.div>
      ))}
    </div>
  );
}