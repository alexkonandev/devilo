"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClientListItem } from "@/types/client";
import { SpatialClientCard } from "./components/spatial-client-card";
import { SpatialClientInspector } from "./components/spatial-client-inspector";
import { CreateClientDialog } from "./create-client-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { SpatialCard } from "@/features/dashboard/components/spatial-card";
import {
  MagnifyingGlassIcon,
  UsersIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

interface SpatialClientsViewProps {
  initialData: ClientListItem[];
}

export default function SpatialClientsView({
  initialData,
}: SpatialClientsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  // Active client from URL
  const activeId = searchParams.get("id");
  const activeClient = useMemo(
    () => initialData.find((c) => c.id === activeId),
    [initialData, activeId]
  );

  // Filtering
  const filteredClients = useMemo(() => {
    return initialData.filter(
      (client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialData, searchQuery]);

  const handleSelectClient = (client: ClientListItem) => {
    if (client.id === activeId) {
      router.push("/clients");
    } else {
      router.push(`/clients?id=${client.id}`);
    }
  };

  return (
    <div className="relative min-h-[80vh] font-sans">
      <main className="relative z-10 max-w-[1600px] mx-auto py-8 space-y-8">
        {/* ─── HEADER ─── */}
        <motion.header
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
                Carnet d&apos;Adresses
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic">
              Clients<span className="text-indigo-500">.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <CreateClientDialog />
          </div>
        </motion.header>

        {/* ─── SEARCH ─── */}
        <div className="flex justify-end">
          <div className="relative w-full md:w-80">
            <MagnifyingGlassIcon
              size={16}
              weight="bold"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un client..."
              className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* ─── CARD GRID ─── */}
        {filteredClients.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredClients.map((client) => (
              <motion.div key={client.id} variants={itemVariants}>
                <SpatialClientCard
                  client={client}
                  isActive={activeId === client.id}
                  onClick={() => handleSelectClient(client)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <SpatialCard depth={1} variant="glass" className="p-16">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center mb-6">
                <UsersIcon
                  size={40}
                  weight="duotone"
                  className="text-indigo-500"
                />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Aucun client trouvé
              </h3>
              <p className="text-sm text-slate-400 max-w-md">
                Ajoutez votre premier client pour créer votre carnet
                d&apos;adresses professionnel.
              </p>
            </div>
          </SpatialCard>
        )}

        {/* ─── INSPECTOR DRAWER ─── */}
        <AnimatePresence mode="wait">
          {activeClient && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => router.push("/clients")}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 cursor-pointer"
              />
              {/* Drawer */}
              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed inset-y-0 right-0 w-full md:w-[500px] z-50 shadow-2xl"
              >
                <SpatialClientInspector
                  client={activeClient}
                  onClose={() => router.push("/clients")}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
