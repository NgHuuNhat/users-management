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
    { name: "Lịch sử giao dịch (CK)", href: "/admin/webhooks", icon: "⚡" },
  ];

  return (
    <>
      {/* Overlay mobile */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      <aside
        className={`
          fixed z-50 top-0 left-0 w-64 h-[100dvh]
          bg-slate-900 text-white shadow-xl flex flex-col
          transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <h1 className="text-sm font-bold tracking-wider text-blue-400 leading-none flex items-center">
            MY STORE ADMIN
          </h1>

          <button
            onClick={() => setOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 h-11 px-4 rounded-lg text-sm transition cursor-pointer ${isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
              >
                <span className="text-lg leading-none flex items-center justify-center w-6">
                  {item.icon}
                </span>
                <span className="whitespace-pre-line leading-none">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="mt-auto border-t border-slate-800 p-4 shrink-0">
          <Link href="/">
            <button className="w-full h-10 flex items-center justify-center cursor-pointer rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:bg-red-600 hover:text-white transition">
              Đăng xuất
            </button>
          </Link>
        </div>
      </aside>
    </>
  );
}