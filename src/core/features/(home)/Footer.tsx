"use client";

import Link from "next/link";

const links = [
    { href: "/", label: "Home" },
    { href: "/history", label: "History" },
    { href: "/login", label: "Login" },
    { href: "/register", label: "Register" },
    { href: "/admin/orders", label: "Admin" },
];

export default function Footer() {
    return (
        <footer className="border-t border-zinc-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

                {/* TOP */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                    {/* Brand */}
                    <div className="space-y-1">
                        <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                            Shopping
                        </h2>
                        <p className="text-sm text-zinc-500">
                            Simple commerce experience built with Next.js
                        </p>
                    </div>

                    {/* Links */}
                    <nav className="flex flex-wrap gap-2 sm:justify-end">
                        {links.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="rounded-full px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-black"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* BOTTOM */}
                <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-zinc-100 pt-6">
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