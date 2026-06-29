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
  // ❌ KHÔNG đọc localStorage ở đây nữa
  const [customer, setCustomer] = useState<Customer>(EMPTY_CUSTOMER);
  const [orders, setOrders] = useState<Order[]>([]);
  const [verified, setVerified] = useState(false);

  const [loading, setLoading] = useState({
    otp: false,
    verify: false,
    fetch: false,
  });

  const [hydrated, setHydrated] = useState(false);

  const set = (k: keyof Customer, v: string) =>
    setCustomer(p => ({ ...p, [k]: v }));

  // ================= HYDRATE FROM LOCALSTORAGE =================
  useEffect(() => {
    const savedCustomer = localStorage.getItem(CUSTOMER_KEY);
    const savedOrders = localStorage.getItem(STORAGE_KEY);

    if (savedCustomer) setCustomer(JSON.parse(savedCustomer));
    if (savedOrders) {
      const parsed = JSON.parse(savedOrders);
      setOrders(parsed);
      setVerified(parsed.length > 0);
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

    setLoading(p => ({ ...p, otp: true }));

    try {
      await post("/api/history", {
        type: "send",
        email: customer.email,
      });

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

    setLoading(p => ({ ...p, verify: true }));

    try {
      const res = await post("/api/history", {
        type: "verify",
        email: customer.email,
        otp: customer.otp,
      });

      if (!res.success) {
        toast.error("OTP sai hoặc hết hạn");
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
      setLoading(p => ({ ...p, verify: false }));
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white px-4 py-8">
      <div className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-[360px_1fr]">

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
                className="flex-1 rounded-2xl border px-4 py-3"
              />

              <button
                onClick={sendOtp}
                className="rounded-2xl bg-black px-4 text-white"
              >
                OTP
              </button>
            </div>

            <button
              onClick={searchOrders}
              className="mt-3 w-full rounded-2xl bg-emerald-600 py-3 text-white"
            >
              Tìm đơn
            </button>
          </div>

          {/* SUMMARY */}

          <OrderSummary orders={orders} />
        </aside>

        {/* RIGHT */}
        <section>
          {!hydrated ? (
            <div className="text-center text-zinc-400">
              Loading...
            </div>
          ) : !verified ? (
            <div className="text-center text-zinc-400">
              Nhập email + OTP
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