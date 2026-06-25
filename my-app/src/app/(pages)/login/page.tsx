'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/core/services/firebase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch {
            setError('Email hoặc mật khẩu không chính xác!');
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-zinc-900">Đăng nhập</h1>
                    <p className="mt-2 text-sm text-zinc-500">Tiếp tục sử dụng hệ thống</p>
                </div>

                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-2xl bg-white px-5 py-4 outline-none shadow-sm" />

                <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-2xl bg-white px-5 py-4 outline-none shadow-sm" />

                <p className="min-h-5 text-sm text-red-500">{error ? error : ""}</p>

                <button type="submit" className="cursor-pointer w-full rounded-2xl bg-black py-4 font-medium text-white transition hover:opacity-90">
                    Đăng nhập
                </button>
            </form>
        </main>
    );
}