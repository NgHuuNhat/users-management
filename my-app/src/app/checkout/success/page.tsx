"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/core/services/firebase";

function formatPaidAt(timestamp: number | Date) {
  const date = new Date(timestamp);

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `Đã thanh toán lúc ${hours}:${minutes} - ${day}/${month}/${year}`;
}

export default function Success() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [paidAt, setPaidAt] = useState<number | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      const ref = doc(db, "orders", orderId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setPaidAt(data.paidAt || null);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border text-3xl">
          ✓
        </div>

        <h1 className="text-3xl font-semibold text-black">
          Thanh toán thành công
        </h1>

        <p className="mt-3 text-gray-500">
          Cảm ơn bạn! Đơn hàng của bạn đang được chuẩn bị.....
        </p>

        {paidAt && (
          <p className="mt-4 text-sm font-medium text-green-600">
            {formatPaidAt(paidAt)}
          </p>
        )}

        <div className="mt-8 rounded-2xl border p-4">
          <p className="text-sm text-gray-500">Mã đơn hàng</p>

          <p className="mt-1 break-all font-mono text-sm text-black">
            {orderId}
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/")}
          className="cursor-pointer mt-6 w-full rounded-2xl bg-black py-3 font-medium text-white transition-opacity hover:opacity-80"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}