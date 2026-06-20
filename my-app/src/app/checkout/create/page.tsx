'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/core/services/firebase';

export default function CheckoutCreate() {
    const [qr, setQr] = useState('');
    const router = useRouter();

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const createOrder = async () => {
            const res = await fetch('/api/checkout/create', {
                method: 'POST',
                body: JSON.stringify({
                    amount: 2000,
                    items: [],
                }),
            });

            const data = await res.json();
            setQr(data.qrUrl);

            unsubscribe = onSnapshot(
                doc(db, 'orders', data.orderId),
                (snap) => {
                    if (!snap.exists()) return;

                    const order = snap.data();

                    if (order.status === 'paid') {
                        router.replace(
                            `/checkout/success?orderId=${data.orderId}`
                        );
                    }
                }
            );
        };

        createOrder();

        return () => unsubscribe?.();
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
            <div className="w-full max-w-sm text-center">
                <h1 className="text-3xl font-bold">
                    Thanh toán
                </h1>

                <p className="mt-2 text-zinc-500">
                    Quét mã QR để thanh toán
                </p>

                {qr ? (
                    <img
                        src={qr}
                        alt="QR"
                        className="mx-auto mt-8 w-72 rounded-3xl shadow-sm"
                    />
                ) : (
                    <p className="mt-8 text-zinc-500">
                        Đang tạo mã QR...
                    </p>
                )}
            </div>
        </main>
    );
}