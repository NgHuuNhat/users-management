"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/core/services/firebase";
import { getPusherClient } from "@/core/features/checkout/pusher-client";
import { useCartStore } from "./cart-store";
import { formatDate } from "@/core/shared/format-date";
import { OrderItem } from "@/core/services/data-base";

import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { shortOrderId } from "@/core/shared/format-order";
import { useOtpCountdown } from "@/core/shared/useOtpCountdown";

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
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const { items, isOpen, closeCart, increase, decrease, cartCount, clear } = useCartStore();

  const [step, setStep] = useState<Step | null>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState({ otp: false, submit: false });

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

  // Đếm ngược OTP
  const [expiresAt, setExpiresAt] = useState(0);
  const { countdown, isExpired } = useOtpCountdown(expiresAt);

  /* ================= SAFE VALIDATION ================= */
  const validateAll = () => {
    const fields: Record<keyof Customer, string> = {
      name: "Vui lòng nhập tên",
      phone: "Vui lòng nhập số điện thoại",
      address: "Vui lòng nhập địa chỉ",
      email: "Vui lòng nhập email",
      otp: "Vui lòng nhập OTP",
    };

    for (const key in fields) {
      const k = key as keyof Customer;
      if (!customer[k] || !customer[k].trim()) {
        toast.error(fields[k]);
        return false;
      }
    }

    return true;
  };

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

    const channel = getPusherClient().subscribe("checkout-errors");

    channel.bind("error-event", (d: any) => {
      setError(d.message);
      toast.error(d.message);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [step]);

  /* ================= OTP ================= */
  const sendOtp = async () => {
    if (!customer.email.trim()) {
      toast.error("Vui lòng nhập email trước");
      return;
    }

    if (loading.otp) return; // chống spam

    setLoading(p => ({ ...p, otp: true }));

    try {
      const res = await post("/api/history", {
        type: "send",
        email: customer.email,
      });

      setExpiresAt(res.expiresAt);

      toast.success("OTP đã gửi");
    } catch {
      toast.error("Không gửi được OTP");
    } finally {
      setLoading(p => ({ ...p, otp: false }));
    }
  };

  /* ================= CREATE ORDER (SAFE) ================= */
  const createOrder = async () => {
    if (loading.submit) return; // chống spam click

    if (!validateAll()) return;

    setLoading(p => ({ ...p, submit: true }));

    try {
      const otpRes = await post("/api/history", {
        type: "verify",
        email: customer.email,
        otp: customer.otp,
      });

      if (!otpRes.success) {
        toast.error(otpRes.message);
        return;
      }

      const res = await post("/api/checkout/create", {
        amount: total,
        items,
        customer,
      });

      setQrUrl(res.qrUrl);
      setOrderId(res.orderId);
      setStep("qr");

      toast.success("Tạo đơn thành công");
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(p => ({ ...p, submit: false }));
    }
  };

  const confirmPaid = async () => {
    await new Promise(r => setTimeout(r, 500));
    setStep("success");
    toast.success("Thanh toán thành công");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && closeCart()}>
      <SheetContent side="right" className="w-full sm:w-[420px] flex flex-col p-0 [&>button]:cursor-pointer [&>button]:bg-gray-100">

        {/* HEADER */}
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Giỏ hàng của bạn ({cartCount})</SheetTitle>
        </SheetHeader>

        {/* BODY */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {items.map(i => (
            <div key={i.productId} className="flex gap-3">
              <img src={i.image} className="w-20 h-20 rounded-xl object-cover" />

              <div className="flex-1">
                <p className="font-medium">{i.name}</p>
                <p>{i.price?.toLocaleString()}₫</p>

                <div className="flex gap-3 mt-2 items-center">
                  <button onClick={() => decrease(i.productId)} className="bg-gray-100 px-2 rounded cursor-pointer">-</button>
                  <span>{i.quantity}</span>
                  <button onClick={() => increase(i.productId)} className="bg-gray-100 px-2 rounded cursor-pointer">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="border-t p-4 space-y-3">
          <div className="flex justify-between font-semibold">
            <span>Total ({cartCount})</span>
            <span>{total.toLocaleString()}₫</span>
          </div>

          <button
            onClick={() => {
              if (items.length === 0) {
                toast.error("Giỏ hàng đang trống");
                return;
              }
              setStep("form");
            }}
            className="w-full py-3 bg-black text-white rounded-full cursor-pointer"
          >
            Đặt hàng
          </button>
        </div>

        {/* CHECKOUT */}
        {step && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[60]">
            <div className="w-full max-w-lg bg-white rounded-2xl p-5">

              <div className="flex justify-between mb-3">
                <h3 className="font-semibold text-xl">Thông tin nhận hàng</h3>
                <button onClick={() => setStep(null)} className="cursor-pointer bg-gray-100 px-2 rounded">✕</button>
              </div>

              {step === "form" && (
                <div className="space-y-3">

                  {(["name", "phone", "address", "email"] as const).map(k => (
                    <input
                      key={k}
                      required
                      className="w-full border rounded-xl p-3"
                      placeholder={k}
                      value={customer[k]}
                      onChange={e => set(k, e.target.value)}
                    />
                  ))}

                  <div className="flex gap-2">
                    <input
                      required
                      className="flex-1 border rounded-xl p-3"
                      placeholder="OTP"
                      value={customer.otp}
                      onChange={e => set("otp", e.target.value)}
                    />

                    <button
                      onClick={sendOtp}
                      disabled={loading.otp || !isExpired}
                      className="px-4 bg-black text-white rounded-xl cursor-pointer"
                    >
                      {loading.otp ? "Đang gửi..." : isExpired ? "Lấy OTP" : `${countdown}s`}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setPaymentMethod("online");
                      createOrder();
                    }}
                    className="w-full py-3 bg-black text-white rounded-full cursor-pointer"
                  >
                    Xác nhận đặt hàng
                  </button>

                </div>
              )}

              {step === "qr" && (
                <div className="text-center space-y-4">
                  {error && <p className="text-red-500">{error}</p>}

                  <img src={qrUrl} className="w-60 mx-auto" />

                  {/* ORDER ID */}
                  <div className="text-sm text-gray-500">
                    Mã đơn hàng:{" "}
                    <span className="font-semibold text-black">
                      ****{shortOrderId(orderId)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setPaymentMethod("cod");
                      confirmPaid()
                    }}
                    className="w-full py-3 bg-green-600 text-white rounded-full cursor-pointer"
                  >
                    Thanh toán khi nhận hàng
                  </button>
                </div>
              )}

              {step === "success" && (
                <div className="text-center space-y-3">
                  <div className="text-3xl">✓</div>

                  {/* STATUS MESSAGE */}
                  <div className="text-sm font-medium text-black">
                    {paymentMethod === "online" ? (
                      <span>Thanh toán thành công, đơn hàng đang được chuẩn bị</span>
                    ) : (
                      <span>Đặt hàng thành công</span>
                    )}
                  </div>

                  {/* ORDER ID */}
                  <div className="text-sm text-gray-500">
                    Mã đơn hàng:{" "}
                    <span className="font-semibold text-black">
                      ****{shortOrderId(orderId)}
                    </span>
                  </div>

                  {/* TIME */}
                  <p className="text-sm text-gray-500">
                    {order?.createdAt ? formatDate(order.createdAt) : ""}
                  </p>

                  <button
                    onClick={() => {
                      setStep(null)
                      closeCart()
                      clear()
                    }}
                    className="w-full py-3 bg-black text-white rounded-full cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </SheetContent>
    </Sheet>
  );
}