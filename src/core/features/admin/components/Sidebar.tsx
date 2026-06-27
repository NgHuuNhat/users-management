"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Khách hàng (User)", href: "/admin/users", icon: "👥" },
    { name: "Sản phẩm (Product)", href: "/admin/products", icon: "📦" },
    { name: "Đơn hàng (Order)", href: "/admin/orders", icon: "🛒" },
    { name: "Lịch sử Webhook", href: "/admin/webhooks", icon: "⚡" },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-xl select-none">
      <div className="h-16 flex items-center justify-center border-b border-slate-800">
        <h1 className="text-md font-bold tracking-wider text-blue-400">STORE MANAGEMENT</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                ? "bg-blue-600 text-white shadow-lg font-medium"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Link href='/'>
          <button className="w-full py-2 px-4 bg-slate-800 hover:bg-red-600 rounded-lg text-xs font-medium transition-colors text-slate-400 hover:text-white">
            Đăng xuất Admin
          </button>
        </Link>
      </div>
    </aside>
  );
}