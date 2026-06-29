"use client";

import { useState } from "react";
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

export default function HistoryPage() {
  const [customer, setCustomer] = useState<Customer>({
    email: "",
    otp: "",
  });

  const [loading, setLoading] = useState({
    otp: false,
    verify: false,
    fetch: false,
  });

  const [verified, setVerified] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const set = (k: keyof Customer, v: string) =>
    setCustomer(p => ({ ...p, [k]: v }));

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white px-4 py-8">
      <div className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-[360px_1fr]">

        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="lg:sticky lg:top-6 lg:self-start space-y-5">

          {/* Search */}
          <div className="rounded-3xl border border-zinc-200 bg-white/80 backdrop-blur-xl shadow-sm p-6">

            <h1 className="text-2xl font-semibold tracking-tight">
              Tra cứu đơn hàng
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Nhập email và mã OTP để xem lịch sử mua hàng.
            </p>

            <div className="mt-6 space-y-3">

              <input
                value={customer.email}
                onChange={e => set("email", e.target.value)}
                placeholder="Email"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-black"
              />

              <div className="flex items-center gap-2">
                <input
                  className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-black"
                  placeholder="OTP"
                  value={customer.otp}
                  onChange={e => set("otp", e.target.value)}
                />

                <button
                  type="button"
                  onClick={sendOtp}
                  className="shrink-0 whitespace-nowrap rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white cursor-pointer transition hover:opacity-90"
                >
                  {loading.otp ? "Đang gửi..." : "Lấy OTP"}
                </button>
              </div>

              <button
                onClick={searchOrders}
                className="w-full rounded-2xl bg-emerald-600 py-3 font-medium text-white cursor-pointer transition hover:opacity-90"
              >
                {loading.verify ? "Đang tìm..." : "Tìm đơn hàng"}
              </button>

            </div>
          </div>

          {/* Statistics */}
          {verified && (
            <div className="rounded-3xl border border-zinc-200 bg-white/80 backdrop-blur-xl shadow-sm p-6 space-y-5">

              <div>
                <p className="text-sm text-zinc-500">
                  Tổng đơn hàng
                </p>

                <p className="mt-1 text-4xl font-semibold">
                  {orders.length}
                </p>
              </div>

              <div className="border-t pt-5">
                <p className="text-sm text-zinc-500">
                  Tổng chi tiêu
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {orders
                    .reduce((sum, o) => sum + (o.amount ?? 0), 0)
                    .toLocaleString()}
                  ₫
                </p>
              </div>

            </div>
          )}

        </aside>

        {/* ================= RIGHT CONTENT ================= */}
        <section className="min-w-0">

          {!verified ? (
            <div className="flex h-80 items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white text-zinc-400">
              Nhập email và OTP để xem đơn hàng
            </div>
          ) : orders.length === 0 ? (
            <div className="flex h-80 items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white text-zinc-400">
              Không tìm thấy đơn hàng
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map(order => (
                <OrderHistoryItem
                  key={order.id}
                  order={order}
                />
              ))}
            </div>
          )}

        </section>

      </div>
    </div>
  );
}