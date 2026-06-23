"use client";

import React, { ReactNode } from "react";

interface EditorLayoutProps {
  children: ReactNode;
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  return (
    <div className="h-full w-screen overflow-hidden bg-slate-50 font-sans text-slate-800 flex flex-col">
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}