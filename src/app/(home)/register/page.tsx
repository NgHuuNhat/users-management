"use client";

import { useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";

import { auth, db } from "@/core/services/firebase";

export default function Register() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "user",
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      toast.success("Đăng ký thành công!");

      router.push("/login");
    } catch (error: any) {
      switch (error.code) {
        case "auth/email-already-in-use":
          toast.error("Email đã tồn tại!");
          break;

        case "auth/invalid-email":
          toast.error("Email không hợp lệ!");
          break;

        case "auth/weak-password":
          toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
          break;

        default:
          toast.error("Không thể tạo tài khoản!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm space-y-4"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-900">
            Đăng ký
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Tạo tài khoản để tiếp tục
          </p>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="w-full rounded-2xl bg-white px-5 py-4 outline-none shadow-sm disabled:opacity-60"
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          className="w-full rounded-2xl bg-white px-5 py-4 outline-none shadow-sm disabled:opacity-60"
        />

        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
          className="w-full rounded-2xl bg-white px-5 py-4 outline-none shadow-sm disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full rounded-2xl bg-black py-4 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>

        <Link
          href="/login"
          className="block w-full rounded-2xl bg-gray-400 py-4 text-center font-medium text-white transition hover:opacity-90"
        >
          Đến trang đăng nhập
        </Link>
      </form>
    </main>
  );
}