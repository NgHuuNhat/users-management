"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/core/services/firebase";

export default function WaitingPayment() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("orderId");

    if (!id) return;

    setOrderId(id);

    const unsub = onSnapshot(doc(db, "orders", id), (snap) => {
      const order = snap.data();

      if (order?.status === "paid") {
        router.push(`/checkout/success?orderId=${id}`);
      }
    });

    return () => unsub();
  }, []);

  return (
    <div>
      <div className="mt-8 rounded-2xl border p-4">
        <p className="text-sm text-gray-500">Mã đơn hàng</p>

        <p className="mt-1 break-all font-mono text-sm text-black">
          {orderId}
        </p>
        <p className="mt-1 text-sm text-black">
          Đang chờ thanh toán...
        </p>
      </div>
    </div>
  );
}