import Link from "next/link";

export default function Menu() {
  const menus = [
    { href: "/register", label: "Register" },
    { href: "/login", label: "Login" },
    { href: "/checkout/create", label: "Checkout QR" },
    { href: "/history", label: "History" },
    { href: "/admin/orders", label: "Admin Orders" },
  ];

  return (
    <main className="bg-zinc-50 text-black">
      <header className="sticky top-0 border-b border-zinc-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <h1 className="text-xl font-bold text-zinc-900">
            Users Management
          </h1>

          <nav className="flex items-center gap-2">
            {menus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-black"
              >
                {menu.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-3xl font-bold text-zinc-900">
          Welcome Back 👋
        </h2>

        <p className="mt-2 text-zinc-500">
          Build modern authentication with Next.js
        </p>
      </section>
    </main>
  );
}