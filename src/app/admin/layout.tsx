"use client";

import { useState } from "react";
import Sidebar from "@/core/features/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-slate-50 text-slate-800 antialiased">
      {/* Sidebar (mobile drawer + desktop fixed) */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* MAIN */}
      <div className="min-h-screen flex flex-col lg:pl-64">
        {/* HEADER */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 shadow-sm">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden rounded-md bg-slate-100 px-3 py-2 text-sm cursor-pointer"
          >
            ☰
          </button>

          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
            Hệ thống Quản trị
          </h2>

          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs font-medium text-slate-600">
              Quyền Admin
            </span>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}