'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/core/services/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: 'user',
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      router.push('/login');
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('Email đã tồn tại!');
          break;

        case 'auth/invalid-email':
          setError('Email không hợp lệ!');
          break;

        case 'auth/weak-password':
          setError('Mật khẩu phải có ít nhất 6 ký tự!');
          break;

        default:
          setError('Không thể tạo tài khoản!');
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-900">Đăng ký</h1>
          <p className="mt-2 text-sm text-zinc-500">Tạo tài khoản để tiếp tục</p>
        </div>

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-2xl bg-white px-5 py-4 outline-none shadow-sm" />

        <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-2xl bg-white px-5 py-4 outline-none shadow-sm" />

        <input type="password" placeholder="Xác nhận mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full rounded-2xl bg-white px-5 py-4 outline-none shadow-sm" />

        <p className="min-h-5 text-sm text-red-500">{error ? error : ""}</p>

        <button type="submit" className="cursor-pointer w-full rounded-2xl bg-black py-4 font-medium text-white transition hover:opacity-90">
          Đăng ký
        </button>
      </form>
    </main>
  );
}