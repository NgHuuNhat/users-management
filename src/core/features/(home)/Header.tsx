"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "./cart/cart-store";

const menus = [
  { href: "/", label: "Home" },
  { href: "/history", label: "History" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
  { href: "/admin/orders", label: "AdminPage" },
];

export default function Header() {
  const pathname = usePathname();
  const { items, openCart, cartCount } = useCartStore();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="text-xl font-semibold">
          Store
        </Link>

        {/* Menu */}
        <nav className="flex gap-2 overflow-x-auto">
          {menus.map((m) => {
            const active = pathname === m.href;

            return (
              <Link
                key={m.href}
                href={m.href}
                className={`whitespace-nowrap rounded-full px-3 py-2 text-sm ${active
                  ? "bg-black text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
                  }`}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>

        {/* Cart */}
        <button
          onClick={openCart}
          className="relative flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-zinc-50 active:scale-95 transition"
        >
          🛒 <span className="hidden sm:inline">Giỏ hàng</span>

          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {cartCount}
            </span>
          )}
        </button>

      </div>
    </header>
  );
}