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
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white flex justify-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-6">

        {/* HEADER */}
        <div className="bg-white/80 backdrop-blur-xl border border-zinc-200 shadow-sm rounded-3xl p-6 space-y-4">

          <h1 className="text-xl font-semibold">Tra cứu đơn hàng</h1>

          {/* ROW 1 - EMAIL */}
          <input
            className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Nhập email"
            value={customer.email}
            onChange={e => set("email", e.target.value)}
          />

          {/* ROW 2 - OTP + BUTTON */}
          <div className="flex gap-2">
            <input
              className="flex-1 px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none focus:ring-2 focus:ring-black/10 tracking-widest"
              placeholder="Nhập OTP"
              value={customer.otp}
              onChange={e => set("otp", e.target.value)}
            />

            <button
              onClick={sendOtp}
              className="px-5 rounded-2xl bg-black text-white text-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition"
            >
              {loading.otp ? "..." : "Lấy OTP"}
            </button>
          </div>

          {/* ROW 3 - SEARCH */}
          <button
            onClick={searchOrders}
            className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-medium cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition"
          >
            {loading.verify ? "Đang tìm..." : "Tìm đơn hàng"}
          </button>
        </div>

        {/* SUMMARY */}
        {verified && (
          <div className="bg-white/80 backdrop-blur-xl border border-zinc-200 shadow-sm rounded-3xl p-5 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Tổng số đơn hàng
                </p>

                <p className="mt-1 text-3xl font-semibold tracking-tight">
                  {orders.length}
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-100 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Tổng chi tiêu
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {orders
                    .reduce((sum, order) => sum + (order.amount ?? 0), 0)
                    .toLocaleString()}
                  ₫
                </p>
              </div>
            </div>
          </div>
        )}

        {/* RESULT */}
        <div className="space-y-3">
          {!verified ? (
            <div className="text-center text-sm text-zinc-400">
              Nhập email + OTP để xem đơn hàng
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-sm text-zinc-400">
              Không có đơn hàng
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="bg-white/80 backdrop-blur-xl border border-zinc-200 shadow-sm rounded-3xl p-5 space-y-4"
              >
                {/* HEADER */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-base">
                      Đơn #{order.id.slice(-6)}
                    </div>
                    <div className="text-xs text-zinc-400">
                      ID: {order.id}
                    </div>
                  </div>

                  <span className="text-xs px-3 py-1 rounded-full bg-zinc-100 text-zinc-600">
                    {order.status}
                  </span>
                </div>

                {/* TIME */}
                <div className="text-sm text-zinc-500">
                  📅 Thời gian đặt:{" "}
                  {order.createdAt?.toDate?.()?.toLocaleString?.() || "N/A"}
                </div>

                {/* PRODUCTS */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-zinc-700">
                    🛒 Sản phẩm
                  </div>

                  <div className="space-y-2">
                    {order.items?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm bg-zinc-50 rounded-xl px-3 py-2"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-zinc-500">
                            SL: {item.quantity}
                          </span>
                        </div>

                        <div className="font-medium">
                          {(item.price * item.quantity)?.toLocaleString()}₫
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TOTAL */}
                <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                  <span className="text-sm text-zinc-500">Tổng đơn</span>
                  <span className="text-lg font-semibold">
                    {order.amount?.toLocaleString()}₫
                  </span>
                </div>

                {/* CUSTOMER INFO */}
                <div className="bg-zinc-50 rounded-2xl p-3 space-y-1 text-sm">
                  <div className="font-medium text-zinc-700">
                    📦 Thông tin nhận hàng
                  </div>

                  <div className="text-zinc-600">
                    👤 {order.customer?.name}
                  </div>
                  <div className="text-zinc-600">
                    📞 {order.customer?.phone}
                  </div>
                  <div className="text-zinc-600">
                    📍 {order.customer?.address}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}