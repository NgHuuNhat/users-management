"use client";

import { useState } from "react";
import WaitingPayment from "./waitingpayment/page";

export default function CheckoutPage() {
    const [qr, setQr] = useState("");

    const handleCheckout = async () => {
        const res = await fetch("/api/orders", {
            method: "POST",
            body: JSON.stringify({
                amount: 2000,
                items: [],
            }),
        });

        const data = await res.json();

        setQr(data.qrUrl);

        localStorage.setItem(
            "orderId",
            data.orderId
        );
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-white p-6">
            <div className="w-full max-w-md text-center">
                <h1 className="text-3xl font-semibold">
                    Thanh toán đơn hàng
                </h1>

                <p className="mt-3 text-gray-500">
                    Quét mã QR để hoàn tất thanh toán.
                </p>

                {!qr ? (
                    <button
                        onClick={handleCheckout}
                        className="cursor-pointer mt-8 w-full rounded-2xl bg-black py-3 font-medium text-white transition-opacity hover:opacity-80"
                    >
                        Click để nhận mã QR thanh toán!
                    </button>
                ) : (
                    <div className="mt-8 space-y-6">
                        <img
                            src={qr}
                            alt="QR"
                            className="mx-auto w-72 rounded-2xl border"
                        />

                        <WaitingPayment />
                    </div>
                )}
            </div>
        </div>
    );
}