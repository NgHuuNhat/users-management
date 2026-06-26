"use client";

import { useState } from "react";

export default function HistoryPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  const handleSendOtp = async () => {
    if (!email) return alert("Nhập email");

    setLoading(true);
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "send",
          email,
        }),
      });

      if (!res.ok) throw new Error("Send OTP failed");

      setStep(2);
    } catch (err) {
      alert("Gửi OTP thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return alert("Nhập OTP");

    setLoading(true);
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "verify",
          email,
          otp,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("OTP sai hoặc hết hạn");
        return;
      }

      // giả lập fetch order sau verify
      const mockDatabase = [
        { id: "ORD001", email, product: "MacBook Air M2", status: "Đã giao" },
        { id: "ORD002", email, product: "Chuột Magic Mouse", status: "Đang giao" },
      ];

      setOrders(mockDatabase.filter((o) => o.email === email));
      setStep(3);
    } catch (err) {
      alert("Verify thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">

        <h1 className="text-xl font-semibold text-center mb-6">
          Tra cứu đơn hàng
        </h1>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <input
              className="w-full border rounded-lg p-3"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg cursor-pointer"
            >
              {loading ? "Đang gửi..." : "Nhận mã OTP"}
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              OTP đã gửi tới <b>{email}</b>
            </p>

            <input
              className="w-full border rounded-lg p-3 text-center tracking-widest"
              placeholder="Nhập OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg cursor-pointer"
            >
              {loading ? "Đang xác minh..." : "Xác minh"}
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Đơn hàng của bạn <br /> email: {email}</h2>

            {orders.length === 0 ? (
              <p className="text-gray-500">Không có đơn hàng</p>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="border p-3 rounded-lg">
                  <div className="font-medium">{o.product}</div>
                  <div className="text-sm text-gray-500">
                    Trạng thái: {o.status}
                  </div>
                </div>
              ))
            )}

            <button
              onClick={() => {
                setStep(1);
                setOtp("");
                setEmail("");
                setOrders([]);
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg cursor-pointer"
            >
              Tra cứu lại
            </button>

          </div>
        )}
      </div>
    </div>
  );
}