"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    // { name: "Khách hàng (User)", href: "/admin/users", icon: "👥" },
    { name: "Sản phẩm (Product)", href: "/admin/products", icon: "📦" },
    { name: "Đơn hàng (Order)", href: "/admin/orders", icon: "🛒" },
    { name: "Lịch sử Webhook", href: "/admin/webhooks", icon: "⚡" },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-slate-900 text-white shadow-xl select-none">
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <h1 className="text-md font-bold tracking-wider text-blue-400">
          STORE MANAGEMENT
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 font-medium text-white shadow-lg"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <Link href="/" className="block">
          <button className="w-full cursor-pointer rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-red-600 hover:text-white">
            Đăng xuất Admin
          </button>
        </Link>
      </div>
    </aside>
  );
}