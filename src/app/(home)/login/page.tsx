'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/core/services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner'; // Import toast
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // Thêm state loading
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, "users", user.uid));
            const role = userDoc.data()?.role;

            await fetch('/api/auth/set-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ role })
            });

            // Toast thành công
            toast.success("Đăng nhập thành công!");
            router.replace(role === "admin" ? "/admin/orders" : "/");
        } catch {
            // Toast lỗi
            toast.error("Email hoặc mật khẩu không chính xác!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-zinc-900">Đăng nhập</h1>
                </div>

                <input type="email" placeholder="admin@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-2xl bg-white px-5 py-4 outline-none shadow-sm" />
                <input type="password" placeholder="123456" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-2xl bg-white px-5 py-4 outline-none shadow-sm" />

                <button
                    type="submit"
                    disabled={loading} // Vô hiệu hóa khi đang xử lý
                    className="cursor-pointer w-full rounded-2xl bg-black py-4 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>

                <Link href='/register'>
                    <button
                        type="submit"
                        // disabled={loading} // Vô hiệu hóa khi đang xử lý
                        className="cursor-pointer w-full rounded-2xl bg-gray-400 py-4 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                        {/* {loading ? "Đang xử lý..." : "Đăng nhập"} */} Đến trang đăng ký
                    </button>
                </Link>
            </form>
        </main>
    );
}