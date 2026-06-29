"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/core/services/firebase";
import { getPusherClient } from "@/core/features/checkout/pusher-client";
import { useCartStore } from "./cart-store";
import { formatDate } from "@/core/shared/format-date";
import { OrderItem } from "@/core/services/data-base";

type Step = "form" | "qr" | "success";

type Customer = {
  name: string;
  phone: string;
  address: string;
  email: string;
  otp: string;
};

const post = (url: string, body: any) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(r => r.json());

export default function Cart() {
  const { items, isOpen, closeCart, increase, decrease, cartCount } = useCartStore();

  const [step, setStep] = useState<Step | null>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState({
    otp: false,
    submit: false,
  });

  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    address: "",
    email: "",
    otp: "",
  });

  const total = items.reduce(
    (s: number, i: OrderItem) => s + (i.price ?? 0) * i.quantity,
    0
  );

  const set = (k: keyof Customer, v: string) =>
    setCustomer(p => ({ ...p, [k]: v }));

  /* ================= FIRESTORE ================= */
  useEffect(() => {
    if (!orderId) return;

    return onSnapshot(doc(db, "orders", orderId), snap => {
      if (!snap.exists()) return;

      const data = snap.data();
      setOrder(data);

      if (data.paymentStatus === "paid") setStep("success");
    });
  }, [orderId]);

  /* ================= PUSHER ================= */
  useEffect(() => {
    if (step !== "qr") return setError("");

    const channel = getPusherClient()
      .subscribe("checkout-errors");

    channel.bind("error-event", (d: any) => setError(d.message));

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [step]);

  /* ================= ACTIONS ================= */
  const sendOtp = async () => {
    if (!customer.email) return alert("Nhập email");

    setLoading(p => ({ ...p, otp: true }));

    await post("/api/history", {
      type: "send",
      email: customer.email,
    }).finally(() => setLoading(p => ({ ...p, otp: false })));
  };

  const createOrder = async () => {
    const { name, phone, address, otp, email } = customer;

    if (!name || !phone || !address || !otp)
      return alert("Thiếu thông tin");

    setLoading(p => ({ ...p, submit: true }));

    try {
      const otpRes = await post("/api/history", {
        type: "verify",
        email,
        otp,
      });

      if (!otpRes.success) return alert("OTP sai");

      const res = await post("/api/checkout/create", {
        amount: total,
        items,
        customer,
      });

      setQrUrl(res.qrUrl);
      setOrderId(res.orderId);
      setStep("qr");
    } finally {
      setLoading(p => ({ ...p, submit: false }));
    }
  };

  const confirmPaid = async () => {
    await new Promise(r => setTimeout(r, 500));
    setStep("success");
  };

  /* ================= UI ================= */
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col">

      {/* CART */}
      <div className="p-6 flex-1 overflow-auto">
        <div className="flex justify-between">
          <h2 className="font-semibold">Cart</h2>
          <button onClick={closeCart} className="w-10 h-10 bg-black text-white rounded-full">✕</button>
        </div>

        <div className="mt-6 space-y-4">
          {items.map(i => (
            <div key={i.productId} className="flex gap-3">
              <img src={i.image} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1">
                <p>{i.name}</p>
                <p className="font-semibold">{i.price?.toLocaleString()}₫</p>

                <div className="flex gap-3 mt-2">
                  <button onClick={() => decrease(i.productId)} className="px-4">-</button>
                  <span>{i.quantity}</span>
                  <button onClick={() => increase(i.productId)} className="px-4">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t p-4">
        <div className="flex justify-between font-semibold">
          <span>Total {cartCount}</span>
          <span>{total.toLocaleString()}₫</span>
        </div>

        <button
          onClick={() => setStep("form")}
          className="w-full mt-3 py-3 bg-black text-white rounded-full"
        >
          Checkout
        </button>
      </div>

      {/* MODAL */}
      {step && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[60]">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6">

            <div className="flex justify-between mb-3">
              <h3 className="font-semibold">Checkout</h3>
              <button onClick={() => setStep(null)} className="w-9 h-9 bg-black text-white rounded-full">✕</button>
            </div>

            {step === "form" && (
              <div className="space-y-3">
                {["name", "phone", "address", "email"].map(k => (
                  <input
                    key={k}
                    className="w-full border rounded-xl p-3"
                    placeholder={k}
                    value={(customer as any)[k]}
                    onChange={e => set(k as any, e.target.value)}
                  />
                ))}

                <div className="flex gap-2">
                  <input
                    className="flex-1 border rounded-xl p-3"
                    placeholder="OTP"
                    value={customer.otp}
                    onChange={e => set("otp", e.target.value)}
                  />

                  <button onClick={sendOtp} className="px-4 bg-zinc-100 rounded-xl">
                    {loading.otp ? "..." : "Lấy mã OTP"}
                  </button>
                </div>

                <button
                  onClick={createOrder}
                  className="w-full py-3 bg-black text-white rounded-full"
                >
                  Confirm
                </button>
              </div>
            )}

            {step === "qr" && (
              <div className="text-center space-y-4">
                {error && <div className="text-red-500">{error}</div>}
                <img src={qrUrl} className="w-64 mx-auto" />

                <button
                  onClick={confirmPaid}
                  className="w-full py-3 bg-emerald-600 text-white rounded-full"
                >
                  Cash on delivery
                </button>
              </div>
            )}

            {step === "success" && (
              <div className="text-center space-y-3">
                <div className="text-3xl">✓</div>
                <p className="text-sm text-gray-500">
                  {order?.createdAt ? formatDate(order.createdAt) : ""}
                </p>

                <button
                  onClick={closeCart}
                  className="w-full py-3 bg-black text-white rounded-full"
                >
                  Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}