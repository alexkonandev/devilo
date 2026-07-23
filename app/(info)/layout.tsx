"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { RocketLaunch, ArrowLeft } from "@phosphor-icons/react";

export default function InfoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans antialiased selection:bg-indigo-500/30">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6">
        <div className="flex items-center justify-between px-3 py-3 w-[calc(100%-4rem)] max-w-6xl rounded-xl bg-black/80 backdrop-blur-md border border-zinc-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <RocketLaunch size={14} weight="fill" className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Devilo</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 hover:text-white transition-all"
          >
            <ArrowLeft size={14} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Retour</span>
          </Link>
        </div>
      </nav>

      {/* CONTENU */}
      <main className="pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 bg-[#0a0a0b]">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <RocketLaunch size={14} weight="fill" className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Devilo</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-zinc-800">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
              Status: Verified
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}