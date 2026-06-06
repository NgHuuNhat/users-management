import Link from "next/link";
import { FormSection } from "@/core/features/register/components/form-section/page";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 text-black">
      <div className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl">
        
        {/* Back Button */}
        <Link
          href="/"
          className="absolute left-6 top-6 text-sm text-zinc-500 transition hover:text-black"
        >
          ← Back
        </Link>

        <div className="mb-8 mt-6 space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Create Account
          </h1>

          <p className="text-sm text-zinc-500">
            Register to continue your journey
          </p>
        </div>

        {/* Client Form */}
        <FormSection />
      </div>
    </main>
  );
}