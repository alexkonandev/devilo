import { cn } from "@/lib/utils";
import { DS_PAGE_SHELL, DS_PAGE_CONTAINER, DS_PAGE_PADDING, DS_BENTO_CARD } from "@/lib/design-system";

export default function DashboardLoading() {
  return (
    <div className={cn(DS_PAGE_SHELL, "flex items-center justify-center min-h-screen")}>
      <div className={cn(DS_PAGE_CONTAINER, DS_PAGE_PADDING, "max-w-md")}>
        <div className={cn(DS_BENTO_CARD, "p-8 text-center")}>
          <div className="w-5 h-5 mx-auto mb-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-mono text-slate-400">Chargement...</p>
        </div>
      </div>
    </div>
  );
}