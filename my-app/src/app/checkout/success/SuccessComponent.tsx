"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/core/services/firebase";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + "₫";
}

function formatTime(timestamp: number | Date | null) {
  if (!timestamp) return "..";

  const date = new Date(timestamp);

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${hours}:${minutes} - ${day}/${month}/${year}`;
}

export default function SuccessComponent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [amount, setAmount] = useState<number | null>(null);
  const [sender, setSender] = useState<string | null>(null);
  const [receiver, setReceiver] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paidAt, setPaidAt] = useState<number | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      const ref = doc(db, "orders", orderId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        setAmount(data.amountReceived || null);
        setSender(data.sender || data.senderName || null);
        setReceiver(data.receiver || "Cửa hàng của bạn");
        setTransactionId(data.transactionId || null);
        setPaidAt(data.paidAt || null);
      }
    };

    fetchOrder();
  }, [orderId]);

  const Item = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | null | undefined;
  }) => (
    <div className="rounded-xl border p-4 text-left">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="break-all font-mono text-sm text-black">
        {value ?? ".."}
      </p>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md text-center">

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border text-3xl">
          ✓
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-black">
          Thanh toán thành công
        </h1>

        <p className="mt-3 text-gray-500">
          Đơn hàng của bạn đã được ghi nhận
        </p>

        {/* CORE INFO */}
        <div className="mt-6 space-y-3 text-left">

          <Item
            label="Số tiền"
            value={amount ? formatMoney(amount) : ".."}
          />

          <Item label="Người gửi" value={sender} />

          <Item label="Người nhận" value={receiver} />

          <Item label="Mã giao dịch" value={transactionId} />

          <Item label="Mã đơn hàng" value={orderId} />

          <Item label="Thời gian" value={formatTime(paidAt)} />
        </div>

        {/* Button */}
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-6 w-full rounded-2xl bg-black py-3 font-medium text-white hover:opacity-80"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}