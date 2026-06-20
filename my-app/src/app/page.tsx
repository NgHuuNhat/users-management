import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 text-black">
      <div className="flex w-full max-w-md flex-col items-center rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
        <div className="mb-8 space-y-3 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            Welcome Back
          </h1>

          <p className="text-sm text-zinc-500">
            Build modern authentication with Next.js
          </p>
        </div>

        <div className="flex w-full flex-col gap-4">
          <Link
            href="/register"
            className="flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white font-medium text-black transition hover:bg-zinc-50"
          >
            Create Account
          </Link>

          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white font-medium text-black transition hover:bg-zinc-50"
          >
            Login
          </Link>

          <Link
            href="/checkout/create"
            className="flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white font-medium text-black transition hover:bg-zinc-50"
          >
            Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}