import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
      <div className="flex w-full max-w-md flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur">
        <div className="mb-8 space-y-3 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome Back
          </h1>

          <p className="text-sm text-zinc-400">
            Build modern authentication with Next.js
          </p>
        </div>

        <div className="flex w-full flex-col gap-4">
          <Link
            href="/register"
            className="flex h-12 items-center justify-center rounded-xl bg-white font-medium text-black transition hover:opacity-90"
          >
            Create Account
          </Link>

          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-medium transition hover:bg-white/10"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
