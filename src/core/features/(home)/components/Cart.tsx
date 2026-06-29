"use client";

import { db } from "@/core/services/firebase";
import { OrderItem } from "@/core/services/data-base";
import { getPusherClient } from "@/core/features/checkout/pusher-client";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { formatDate } from "@/core/features/lib/format-date";

interface Props {
  open: boolean;
  items: OrderItem[];
  onClose: () => void;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
}

type CheckoutStep = "none" | "form" | "qr" | "success";

export default function Cart({ open, items, onClose, onIncrease, onDecrease }: Props) {
  const total = items.reduce((s, x) => s + (x.price ?? 0) * x.quantity, 0);

  const [step, setStep] = useState<CheckoutStep>("none");
  const [qrUrl, setQrUrl] = useState("");
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  const [sendingOtp, setSendingOtp] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    otp: "",
  });

  useEffect(() => {
    if (!orderId) return;

    return onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setOrder(data);
      if (data.paymentStatus === "paid") setStep("success");
    });
  }, [orderId]);

  useEffect(() => {
    if (step !== "qr") return setError("");

    const pusher = getPusherClient();
    const channel = pusher.subscribe("checkout-errors");

    channel.bind("error-event", (data: { message: string }) => setError(data.message));

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [step]);

  const handleSendOtp = async () => {
    if (!customer.email) return alert("Vui lòng nhập email");

    try {
      setSendingOtp(true);

      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "send", email: customer.email }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      alert("OTP đã gửi");
    } catch (e) {
      alert("Gửi OTP thất bại");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAndGetQR = async () => {
    const { name, phone, address, otp, email } = customer;

    if (!name || !phone || !address || !otp) {
      return alert("Thiếu thông tin");
    }

    try {
      setLoadingVerify(true);

      const resOtp = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "verify", email, otp }),
      });

      const otpData = await resOtp.json();
      if (!otpData.success) return alert("OTP sai");

      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, items, customer }),
      });

      const data = await res.json();

      setQrUrl(data.qrUrl);
      setOrderId(data.orderId);
      setStep("qr");
    } catch (e: any) {
      alert(e.message || "Lỗi tạo đơn");
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleConfirmPaid = async () => {
    setLoadingOrder(true);
    await new Promise((r) => setTimeout(r, 500));
    setStep("success");
    setLoadingOrder(false);
  };

  return (
    <div className={`fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-white shadow-2xl z-50 transition ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="p-6 flex flex-col h-full">

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Giỏ hàng</h2>
          <button onClick={onClose} className="cursor-pointer w-10 h-10 rounded-full bg-black text-white">✕</button>
        </div>

        <div className="flex-1 mt-6 overflow-auto space-y-4">
          {items.map((i) => (
            <div key={i.productId} className="flex gap-3">
              <img src={i.image} className="w-20 h-20 rounded-2xl object-cover" />
              <div className="flex-1">
                <p>{i.name}</p>
                <p className="font-semibold">{(i.price ?? 0).toLocaleString()}₫</p>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => onDecrease(i.productId)}>-</button>
                  <span>{i.quantity}</span>
                  <button onClick={() => onIncrease(i.productId)}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between font-semibold">
            <span>Tổng</span>
            <span>{total.toLocaleString()}₫</span>
          </div>

          <button onClick={() => setStep("form")} className="w-full mt-4 py-3 rounded-full bg-black text-white cursor-pointer">
            Đặt hàng
          </button>
        </div>
      </div>

      {step !== "none" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[60]">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6">

            {step === "form" && (
              <div className="space-y-3">
                <input className="w-full border rounded-xl p-3" placeholder="Tên" onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
                <input className="w-full border rounded-xl p-3" placeholder="Phone" onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
                <input className="w-full border rounded-xl p-3" placeholder="Address" onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
                <input className="w-full border rounded-xl p-3" placeholder="Email" onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />

                {/* FIX: OTP luôn 1 dòng */}
                <div className="flex flex-nowrap gap-2">
                  <input
                    className="flex-1 min-w-0 border rounded-xl p-3"
                    placeholder="OTP"
                    value={customer.otp}
                    onChange={(e) => setCustomer({ ...customer, otp: e.target.value })}
                  />

                  <button
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="shrink-0 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 cursor-pointer whitespace-nowrap"
                  >
                    {sendingOtp ? "..." : "Gửi OTP"}
                  </button>
                </div>

                <button onClick={handleVerifyAndGetQR} className="w-full py-3 bg-black text-white rounded-full cursor-pointer">
                  Xác nhận
                </button>
              </div>
            )}

            {step === "qr" && (
              <div className="text-center space-y-4">
                {error && <div className="text-red-500">{error}</div>}
                <img src={qrUrl} className="w-64 mx-auto" />

                <button
                  onClick={handleConfirmPaid}
                  disabled={loadingOrder}
                  className="w-full py-3 bg-emerald-600 text-white rounded-full cursor-pointer"
                >
                  {loadingOrder ? "..." : "Thanh toán khi nhận hàng"}
                </button>
              </div>
            )}

            {step === "success" && (
              <div className="text-center space-y-4">
                <div className="text-3xl">✓</div>
                <h3 className="text-xl font-bold">Thành công</h3>

                <p className="text-sm text-gray-500">
                  {order?.createdAt ? formatDate(order.createdAt) : ""}
                </p>

                <button
                  onClick={() => {
                    setStep("none");
                    onClose();
                  }}
                  className="w-full py-3 bg-black text-white rounded-full cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}