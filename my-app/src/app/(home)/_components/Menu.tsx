"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Menu() {
  const pathname = usePathname();

  const menus = [
    { href: "/", label: "Store" },
    { href: "/history", label: "History" },
    { href: "/checkout/create", label: "Checkout QR" },
    { href: "/login", label: "Login" },
    { href: "/register", label: "Register" },
    { href: "/admin/orders", label: "Admin Page" },
  ];

  return (
    <nav className="flex items-center gap-1">
      {menus.map((menu) => {
        const active = pathname === menu.href;

        return (
          <Link
            key={menu.href}
            href={menu.href}
            className={`
              px-4 py-2
              rounded-full
              text-sm
              font-medium
              transition
              ${active
                ? "bg-black text-white"
                : "text-zinc-600 hover:bg-zinc-100"
              }
            `}
          >
            {menu.label}
          </Link>
        );
      })}
    </nav>
  );
}