"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
    { href: "/", label: "Store" },
    { href: "/history", label: "History" },
    { href: "/login", label: "Login" },
    { href: "/register", label: "Register" },
    { href: "/admin/orders", label: "Admin Page" },
];

export default function Menu() {
    const pathname = usePathname();

    return (
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {menus.map(menu => {
                const active = pathname === menu.href;

                return (
                    <Link
                        key={menu.href}
                        href={menu.href}
                        className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
                            active
                                ? "bg-black text-white shadow-sm"
                                : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
                        }`}
                    >
                        {menu.label}
                    </Link>
                );
            })}
        </nav>
    );
}