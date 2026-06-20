'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/core/services/firebase';

function money(amount: number) {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

export default function CheckoutSuccess() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        if (!orderId) return;

        getDoc(doc(db, 'orders', orderId))
            .then((snap) => {
                if (snap.exists()) {
                    setOrder(snap.data());
                }
            });
    }, [orderId]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
            <div className="w-full max-w-sm text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl text-green-600">
                    ✓
                </div>

                <h1 className="mt-5 text-3xl font-bold">
                    Thanh toán thành công
                </h1>

                <p className="mt-3 text-4xl font-bold text-green-600">
                    {order?.amountReceived
                        ? money(order.amountReceived)
                        : '..'}
                </p>

                <div className="mt-8 space-y-3 text-left">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        Mã đơn: {orderId}
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        Mã giao dịch:{' '}
                        {order?.transactionId ?? '..'}
                    </div>
                </div>

                <button
                    onClick={() => location.replace('/')}
                    className="cursor-pointermt-8 w-full rounded-2xl bg-black py-4 text-white"
                >
                    Về trang chủ
                </button>
            </div>
        </main>
    );
}