"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, ShoppingCart, Search } from "lucide-react";

import { useCartStore } from "./cart/cart-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/core/services/firebase";
import { doc, getDoc } from "firebase/firestore";

const menus = [
  { href: "/", label: "Home" },
  { href: "/history", label: "History" },
  // { href: "/admin/orders", label: "Admin page" },
  // { href: "/login", label: "Login" },
  // { href: "/register", label: "Register" },
];

export default function Header() {
  const pathname = usePathname();
  const { openCart, cartCount } = useCartStore();

  const [query, setQuery] = useState("");
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setRole(null);
        return;
      }

      const snap = await getDoc(doc(db, "users", currentUser.uid));
      setRole(snap.data()?.role ?? "user");
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);

    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 gap-3">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          {/* MOBILE MENU */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-72">
              <div className="mt-12 flex flex-col gap-2">
                {menus.map((m) => {
                  const active = pathname === m.href;

                  return (
                    <SheetClose asChild key={m.href}>
                      <Link
                        key={m.href}
                        href={m.href}
                        className={`rounded-lg px-3 py-2 text-sm transition ${active
                          ? "bg-black text-white"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        {m.label}
                      </Link>
                    </SheetClose>
                  );
                })}
                {user ? (
                  <>
                    {role === "admin" && (
                      <SheetClose asChild>
                        <Link
                          href="/admin/orders"
                          className="rounded-full px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100"
                        >
                          go to Admin Page
                        </Link>
                      </SheetClose>

                    )}
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="rounded-full cursor-pointer"
                      >
                        Logout
                      </Button>
                    </SheetClose>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className={`rounded-full px-3 py-2 text-sm transition ${pathname === "/login"
                          ? "bg-black text-white"
                          : "text-zinc-600 hover:bg-zinc-100"
                          }`}
                      >
                        Login
                      </Link>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="text-xl font-semibold tracking-tight">
            My Store
          </Link>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center gap-2 ml-6">
            {menus.map((m) => {
              const active = pathname === m.href;

              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className={`rounded-full px-3 py-2 text-sm transition ${active
                    ? "bg-black text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                >
                  {m.label}
                </Link>
              );
            })}

            {user ? (
              <>
                {role === "admin" && (
                  <Link
                    href="/admin/orders"
                    className="rounded-full px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100"
                  >
                    go to Admin Page
                  </Link>
                )}
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="rounded-full cursor-pointer"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100"
                >
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* CENTER (DESKTOP SEARCH) */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="h-9 pl-9 rounded-full bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-black/10"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">

          {/* MOBILE SEARCH */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="w-5 h-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="top"
              className="pt-10 pb-6 px-4"
              onOpenAutoFocus={(e) => {
                e.preventDefault();

                setTimeout(() => {
                  mobileSearchRef.current?.focus();
                  mobileSearchRef.current?.select?.();
                }, 50);
              }}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />

                <Input
                  ref={mobileSearchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="h-11 pl-9 rounded-full bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-black/10"
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* CART */}
          <Button
            onClick={openCart}
            variant="outline"
            className="relative gap-2 rounded-full cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>

            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 min-w-5 text-[10px]">
                {cartCount}
              </Badge>
            )}
          </Button>

        </div>
      </div>
    </header>
  );
}