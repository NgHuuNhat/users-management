"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/core/services/firebase";
import { Order } from "@/core/services/data-base";
import OrderHistoryItem from "./OrderHistoryItem";
import OrderSummary from "./OrderSummary";
import { useOtpCountdown } from "@/core/shared/useOtpCountdown";

const STORAGE_KEY = "history_orders";
const CUSTOMER_KEY = "history_customer";

const post = (url: string, body: any) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(r => r.json());

type Customer = {
  email: string;
  otp: string;
};

const EMPTY_CUSTOMER: Customer = { email: "", otp: "" };

export default function HistoryPage() {
  const [customer, setCustomer] = useState<Customer>(EMPTY_CUSTOMER);
  const [orders, setOrders] = useState<Order[]>([]);
  const [verified, setVerified] = useState(false);

  const [loading, setLoading] = useState({
    otp: false,
    search: false,
  });

  const [hydrated, setHydrated] = useState(false);

  const set = (k: keyof Customer, v: string) =>
    setCustomer(p => ({ ...p, [k]: v }));

  // Đếm ngược OTP
  const [expiresAt, setExpiresAt] = useState(0);
  const { countdown, isExpired } = useOtpCountdown(expiresAt);

  // ================= HYDRATE =================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedCustomer = localStorage.getItem(CUSTOMER_KEY);
    const savedOrders = localStorage.getItem(STORAGE_KEY);

    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch { }
    }

    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders);
        setOrders(parsed);
        setVerified(parsed.length > 0);
      } catch { }
    }

    setHydrated(true);
  }, []);

  // ================= PERSIST =================
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
  }, [customer, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  // ================= VALIDATE =================
  const validateEmail = () => {
    if (!customer.email.trim()) {
      toast.error("Vui lòng nhập email");
      return false;
    }
    return true;
  };

  const validateOtp = () => {
    if (!customer.otp.trim()) {
      toast.error("Vui lòng nhập OTP");
      return false;
    }
    return true;
  };

  // ================= OTP =================
  const sendOtp = async () => {
    if (!validateEmail()) return;
    if (loading.otp) return;

    setLoading(p => ({ ...p, otp: true }));

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
      setLoading(p => ({ ...p, otp: false }));
    }
  };

  // ================= SEARCH =================
  const searchOrders = async () => {
    if (!validateEmail()) return;
    if (!validateOtp()) return;
    if (loading.search) return;

    setLoading(p => ({ ...p, search: true }));

    try {
      const res = await post("/api/history", {
        type: "verify",
        email: customer.email,
        otp: customer.otp,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      const q = query(
        collection(db, "orders"),
        where("customer.email", "==", customer.email)
      );

      const snap = await getDocs(q);

      const data: Order[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      }));

      setOrders(data);
      setVerified(true);

      toast.success(`Tìm thấy ${data.length} đơn`);
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(p => ({ ...p, search: false }));
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_1fr]">

        {/* ================= LEFT ================= */}
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
                disabled={loading.otp || !isExpired}
                className={`shrink-0 min-w-[90px] rounded-2xl px-4 py-3 text-white whitespace-nowrap flex items-center justify-center transition ${loading.otp ? "bg-zinc-400" : "bg-black"
                  }`}
              >
                {loading.otp ? "Đang gửi..." : isExpired ? "Lấy OTP" : `${countdown}s`}
              </button>
            </div>

            <button
              onClick={searchOrders}
              disabled={loading.search}
              className={`mt-3 w-full rounded-2xl py-3 text-white transition
                ${loading.search ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:opacity-90"}
              `}
            >
              {loading.search ? "Đang tìm..." : "Tìm đơn"}
            </button>
          </div>

          {/* SUMMARY */}
          <OrderSummary orders={orders} />
        </aside>

        {/* ================= RIGHT ================= */}
        <section>
          {!hydrated ? (
            <div className="text-center text-zinc-400">Loading...</div>
          ) : !verified ? (
            <div className="text-center text-zinc-400">
              Nhập email + OTP để xem đơn hàng
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-zinc-400">
              Không có đơn hàng
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(o => (
                <OrderHistoryItem key={o.id} order={o} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}