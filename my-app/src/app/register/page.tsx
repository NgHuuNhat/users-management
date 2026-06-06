import Link from "next/link";
import { FormSection } from "@/core/features/register/components/form-section/page";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        
        {/* Back Button */}
        <Link
          href="/"
          className="absolute left-6 top-6 text-sm text-zinc-400 transition hover:text-white"
        >
          ← Back
        </Link>

        <div className="mb-8 mt-6 space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Create Account
          </h1>

          <p className="text-sm text-zinc-400">
            Register to continue your journey
          </p>
        </div>

        {/* Client Form */}
        <FormSection />
      </div>
    </main>
  );
}