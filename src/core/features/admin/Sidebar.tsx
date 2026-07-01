"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Sản phẩm (Product)", href: "/admin/products", icon: "📦" },
    { name: "Đơn hàng (Order)", href: "/admin/orders", icon: "🛒" },
    { name: "Lịch sử Webhook", href: "/admin/webhooks", icon: "⚡" },
  ];

  return (
    <>
      {/* Overlay mobile */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`
          fixed z-50 top-0 left-0 h-screen w-64 bg-slate-900 text-white shadow-xl
          transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          <h1 className="text-sm font-bold tracking-wider text-blue-400">
            STORE ADMIN
          </h1>

          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-slate-300 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4">
          <Link href="/">
            <button className="w-full cursor-pointer rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-400 hover:bg-red-600 hover:text-white transition">
              Đăng xuất
            </button>
          </Link>
        </div>
      </aside>
    </>
  );
}