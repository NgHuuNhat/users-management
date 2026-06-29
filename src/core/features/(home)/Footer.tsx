"use client";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* TOP */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          {/* BRAND */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              Shopping
            </h2>
            <p className="text-sm text-zinc-500">
              Simple commerce experience built with Next.js
            </p>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="my-6 h-px bg-zinc-100" />

        {/* BOTTOM */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Shopping. All rights reserved.
          </p>

          <p className="text-xs text-zinc-400">
            Built with Next.js + Firebase
          </p>

        </div>
      </div>
    </footer>
  );
}