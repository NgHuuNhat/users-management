"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/core/services/firebase";
import { Order } from "@/core/services/data-base";
import OrderSummary from "./OrderSummary";
import { useOtpCountdown } from "@/core/shared/useOtpCountdown";
import { useCartStore } from "@/core/features/(home)/cart/cart-store";
import OrderHistoryItem from "./OrderHistoryItem";

const STORAGE_KEY = "history_orders";
const CUSTOMER_KEY = "history_customer";

const post = (url: string, body: any) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(r => r.json());

type Customer = { email: string; otp: string };
const EMPTY_CUSTOMER: Customer = { email: "", otp: "" };

const load = (key: string, fallback: any) => {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || "") || fallback;
  } catch {
    return fallback;
  }
};

export default function HistoryPage() {
  const [customer, setCustomer] = useState<Customer>(EMPTY_CUSTOMER);
  const [orders, setOrders] = useState<Order[]>([]);
  const [verified, setVerified] = useState(false);
  const [expiresAt, setExpiresAt] = useState(0);

  const [loading, setLoading] = useState<"idle" | "otp" | "search">("idle");

  const { countdown, isExpired } = useOtpCountdown(expiresAt);
  const { clear } = useCartStore();

  const set = (k: keyof Customer, v: string) =>
    setCustomer(p => ({ ...p, [k]: v }));

  // ================= INIT =================
  useEffect(() => {
    setCustomer(load(CUSTOMER_KEY, EMPTY_CUSTOMER));
    const saved = load(STORAGE_KEY, []);
    setOrders(saved);
    setVerified(saved.length > 0);
  }, []);

  // ================= PERSIST =================
  useEffect(() => {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
  }, [customer]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  // ================= COMMON =================
  const validate = () => {
    if (!customer.email.trim()) return toast.error("Nhập email"), false;
    if (!customer.otp.trim()) return toast.error("Nhập OTP"), false;
    return true;
  };

  const reset = () => {
    setCustomer(EMPTY_CUSTOMER);
    setOrders([]);
    setVerified(false);
    setExpiresAt(0);
    clear();
  };

  // ================= OTP =================
  const sendOtp = async () => {
    if (!customer.email.trim()) return toast.error("Nhập email");
    if (loading !== "idle") return;

    setLoading("otp");

    try {
      const res = await post("/api/history", {
        type: "send",
        email: customer.email,
      });

      setExpiresAt(res.expiresAt);
      toast.success("OTP đã gửi");
    } catch {
      toast.error("Gửi OTP thất bại");
    } finally {
      setLoading("idle");
    }
  };

  // ================= SEARCH =================
  const searchOrders = async () => {
    if (!validate()) return;
    if (loading !== "idle") return;

    setLoading("search");

    try {
      const res = await post("/api/history", {
        type: "verify",
        email: customer.email,
        otp: customer.otp,
      });

      if (!res.success) return toast.error(res.message);

      const snap = await getDocs(
        query(collection(db, "orders"), where("customer.email", "==", customer.email))
      );

      const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

      setOrders(data);
      setVerified(true);

      toast.success(`Tìm thấy ${data.length} đơn`);
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading("idle");
    }
  };

  const isLoadingOtp = loading === "otp";
  const isLoadingSearch = loading === "search";

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_1fr]">

        {/* LEFT */}
        <aside className="space-y-5">
          <div className="rounded-3xl border bg-white p-6">
            <h1 className="text-2xl font-semibold">Tra cứu đơn</h1>

            <input
              value={customer.email}
              onChange={e => set("email", e.target.value)}
              placeholder="Email"
              className="mt-4 w-full rounded-2xl border px-4 py-3"
            />

            <div className="mt-3 flex gap-2">
              <input
                value={customer.otp}
                onChange={e => set("otp", e.target.value)}
                placeholder="OTP"
                className="flex-1 min-w-0 rounded-2xl border px-4 py-3"
              />

              <button
                onClick={sendOtp}
                disabled={isLoadingOtp || !isExpired}
                className="cursor-pointer shrink-0 rounded-2xl px-4 py-3 text-white bg-black"
              >
                {isLoadingOtp ? "..." : isExpired ? "Lấy OTP" : `${countdown}s`}
              </button>
            </div>

            <button
              onClick={searchOrders}
              disabled={isLoadingSearch}
              className="cursor-pointer mt-3 w-full rounded-2xl py-3 text-white bg-black"
            >
              {isLoadingSearch ? "Đang tìm..." : "Tìm đơn"}
            </button>

            <button
              onClick={reset}
              className="cursor-pointer mt-3 w-full rounded-2xl py-3 border"
            >
              Reset
            </button>
          </div>

          <OrderSummary orders={orders} />
        </aside>

        {/* RIGHT */}
        <section>
          {!verified ? (
            <div className="text-center text-zinc-400">
              Nhập email + OTP
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-zinc-400">Không có đơn</div>
          ) : (
            <div className="space-y-4">
              {orders.map((o, index) => (
                <OrderHistoryItem key={o.id} order={o} index={index} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}