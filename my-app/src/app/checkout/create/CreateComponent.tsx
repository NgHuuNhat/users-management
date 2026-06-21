'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/core/services/firebase';
import { getPusher } from '@/core/libs/pusher-client';
// import { pusherFe } from '@/core/libs/pusher-client';

export default function CreateComponent() {
    const [qr, setQr] = useState('');
    const router = useRouter();
    const called = useRef(false);
    const [error, setError] = useState<string>();

    useEffect(() => {
        if (called.current) return;
        called.current = true;

        let unsubscribe: (() => void) | undefined;

        (async () => {
            const res = await fetch('/api/checkout/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                        router.replace(`/checkout/success?orderId=${data.orderId}`);
                    }
                }
            );
        })();

        return () => unsubscribe?.();
    }, [router]);


    useEffect(() => {
        const pusherFe = getPusher();
        const channel = pusherFe.subscribe('checkout-errors');

        channel.bind('error-event', (data: { message: string }) => {
            setError(data.message);
            // setTimeout(() => setError(''), 5000);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, []);

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
            <div className="w-full max-w-sm text-center">
                <h1 className="text-3xl font-bold">
                    Thanh toán
                </h1>

                <p className="mt-2 text-zinc-500">
                    Quét mã QR để thanh toán
                </p>

                {/* ERROR WEBHOOK REALTIME */}
                <div className="min-h-5 mt-6 text-red-500">
                    {error ? error : ''}
                </div>

                <div className="mt-10 mx-auto w-96 h-96 flex items-center justify-center rounded-3xl bg-white shadow-md border border-zinc-100">
                    {qr ? (
                        <img
                            src={qr}
                            alt="QR"
                            className="w-full h-full object-contain rounded-3xl p-4"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-4 text-zinc-500">
                            <div className="w-56 h-56 bg-zinc-200 rounded-2xl animate-pulse" />
                            <p className="text-base font-medium">
                                Đang tạo mã QR...
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}