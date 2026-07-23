"use client";

import dynamic from "next/dynamic";

const TemplateExportPage = dynamic(
  () =>
    import("@/components/editor/export/template-export-page").then(
      (mod) => mod.TemplateExportPage,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 animate-pulse">
          Chargement...
        </span>
      </div>
    ),
  },
);

export default function ExportPage() {
  return <TemplateExportPage />;
}