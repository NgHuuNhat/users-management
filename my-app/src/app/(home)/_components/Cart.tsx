"use client";

import { db } from "@/core/services/firebase";
import { OrderItem } from "@/core/services/types/data-base";
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

// Định nghĩa các bước của Modal
type CheckoutStep = "none" | "form" | "qr" | "success";

export default function Cart({
  open,
  items,
  onClose,
  onIncrease,
  onDecrease,
}: Props) {
  const total = items.reduce(
    (s, x) => s + (x.price ?? 0) * x.quantity,
    0
  );

  const [step, setStep] = useState<CheckoutStep>("none");

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    otp: "",
  });

  const [sendingOtp, setSendingOtp] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [error, setError] = useState<string>(""); // State lưu lỗi realtime từ Pusher

  const [order, setOrder] = useState<any>(null);

  // 🔄 TỰ ĐỘNG LẮNG NGHE ĐƠN HÀNG THỜI GIAN THỰC (FIRESTORE)
  useEffect(() => {
    if (!orderId) return;

    // Thay getDoc bằng onSnapshot để lắng nghe trạng thái đổi từ 'pending' sang 'paid'
    const unsubscribe = onSnapshot(
      doc(db, 'orders', orderId),
      (snap) => {
        if (!snap.exists()) return;

        const orderData = snap.data();
        setOrder(orderData); // Cập nhật data để hiển thị ở giao diện success

        // Nếu cổng thanh toán/webhook đã xác nhận chuyển khoản thành công
        if (orderData.paymentStatus === 'paid') {
          setStep("success"); // Tự động nhảy sang bước Success 🎉
        }
      },
      (err) => {
        console.error("Firestore snapshot error:", err);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  // 📡 LẮNG NGHE LỖI REALTIME TỪ PUSHER (CHỈ CHẠY KHI ĐANG Ở BƯỚC QR)
  useEffect(() => {
    if (step !== "qr") {
      setError(""); // Reset lỗi khi rời màn hình QR
      return;
    }

    const pusherFe = getPusherClient();
    const channel = pusherFe.subscribe('checkout-errors');

    channel.bind('error-event', (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [step]);

  // 1. GỬI OTP
  const handleSendOtp = async () => {
    if (!customer.email) {
      alert("Vui lòng nhập email");
      return;
    }

    try {
      setSendingOtp(true);
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "send", email: customer.email }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      alert("OTP đã được gửi tới email.");
    } catch (error) {
      console.error(error);
      alert("Không gửi được OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  // 2. XÁC MINH OTP -> ĐÚNG THÌ GỌI API BACKEND -> LƯU DB & LẤY QR -> CHUYỂN BƯỚC 'QR'
  const handleVerifyAndGetQR = async () => {
    if (!customer.name || !customer.phone || !customer.address || !customer.otp) {
      alert("Vui lòng điền đầy đủ thông tin và mã OTP!");
      return;
    }

    try {
      setLoadingVerify(true);

      // Bước A: Verify OTP
      const resOtp = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "verify",
          email: customer.email,
          otp: customer.otp,
        }),
      });

      const dataOtp = await resOtp.json();

      if (!dataOtp.success) {
        alert("OTP không hợp lệ hoặc đã hết hạn.");
        return;
      }

      // Bước B: OTP chuẩn -> Gọi API tạo đơn hàng (Backend sẽ lưu Firebase và trả về QR)
      const resQr = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          items: items,
          customer: customer
        }),
      });

      const dataQr = await resQr.json();

      if (!dataQr.success || !dataQr.qrUrl) {
        throw new Error(dataQr.message || "Tạo đơn hàng không thành công.");
      }

      setQrUrl(dataQr.qrUrl);
      setOrderId(dataQr.orderId);
      setStep("qr");

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Có lỗi xảy ra khi xác minh và tạo đơn.");
    } finally {
      setLoadingVerify(false);
    }
  };

  // 3. USER BẤM "TÔI ĐÃ THANH TOÁN" (Hàm fallback dự phòng nếu hệ thống delay)
  const handleConfirmPaid = async () => {
    try {
      setLoadingOrder(true);

      // Giả lập kiểm tra thủ công nhanh hoặc hiển thị loading nhẹ trước khi nhảy bước
      await new Promise(resolve => setTimeout(resolve, 500));
      setStep("success");
    } catch (error) {
      console.error(error);
      alert("Lỗi khi xác nhận thanh toán.");
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-screen w-[420px] bg-white shadow-2xl transition-all z-50 ${open ? "translate-x-0" : "translate-x-full"
        }`}
    >
      {/* --- PHẦN DRAWER GIỎ HÀNG BÊN PHẢI --- */}
      <div className="p-8 flex flex-col h-full">

        <div className="flex justify-between">
          {/* <h2 className="text-3xl font-semibold">Giỏ hàng</h2> */}
          {/* <h2 className="text-3xl font-semibold flex items-center gap-2 text-yellow-500 drop-shadow-sm">
            <span className="text-2xl">🛒</span>
            <span>Giỏ hàng</span>
          </h2> */}
          {/* <button onClick={onClose} className="bg-black text-white">✕</button> */}

          {/* <h2 className="text-3xl font-semibold flex items-center gap-2 text-yellow-500">
            <span>🛒</span>
            <span>Giỏ hàng</span>
          </h2> */}

          <h2 className="text-2xl font-semibold flex items-center gap-1 text-black">
            <span>Giỏ hàng của bạn</span>
          </h2>

          <button
            onClick={onClose}
            className="
            cursor-pointer
            w-10 h-10
            rounded-full
            bg-black text-white
            flex items-center justify-center
            text-lg
            hover:bg-zinc-800
            active:scale-95
            transition
            shadow-sm
          "
          >
            ✕
          </button>
        </div>

        <div className="flex-1 mt-8 overflow-auto space-y-5">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4">
              <img src={item.image} className="w-24 h-24 rounded-3xl object-cover" />
              <div>
                <p>{item.name}</p>
                <p className="mt-2 font-semibold">
                  {(item.price ?? 0).toLocaleString()}₫
                </p>
                <div className="flex gap-4 mt-3">
                  <button onClick={() => onDecrease(item.productId)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onIncrease(item.productId)}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between text-xl font-semibold">
            <span>Tổng</span>
            <span>{total.toLocaleString()}₫</span>
          </div>

          <button
            onClick={() => setStep("form")}
            className="w-full mt-6 py-4 rounded-full bg-black text-white"
          >
            Đặt hàng
          </button>
        </div>
      </div>

      {/* --- MODAL MULTI-STEP --- */}
      {step !== "none" && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-[40px] bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">

            {/* Header Modal */}
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-semibold">
                {step === "form" && "1. Thông tin giao hàng"}
                {step === "qr" && "2. Quét mã thanh toán"}
                {step === "success" && "Hoàn tất"}
              </h2>
              <button onClick={() => setStep("none")} className="text-xl">✕</button>
            </div>

            {/* BƯỚC 1: NHẬP FORM & OTP */}
            {step === "form" && (
              <div className="mt-6 space-y-4">
                <input
                  placeholder="Họ và tên"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full rounded-2xl border px-5 py-4 outline-none focus:border-black"
                />
                <input
                  placeholder="Số điện thoại"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full rounded-2xl border px-5 py-4 outline-none focus:border-black"
                />
                <input
                  placeholder="Địa chỉ"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full rounded-2xl border px-5 py-4 outline-none focus:border-black"
                />
                <input
                  placeholder="Email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full rounded-2xl border px-5 py-4 outline-none focus:border-black"
                />

                <div className="flex gap-3">
                  <input
                    placeholder="Nhập mã OTP"
                    value={customer.otp}
                    onChange={(e) => setCustomer({ ...customer, otp: e.target.value })}
                    className="flex-1 rounded-2xl border px-5 py-4 outline-none focus:border-black"
                  />
                  <button
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="px-6 rounded-2xl bg-zinc-100 hover:bg-zinc-200 font-medium whitespace-nowrap"
                  >
                    {sendingOtp ? "Đang gửi..." : "Gửi OTP"}
                  </button>
                </div>

                <button
                  onClick={handleVerifyAndGetQR}
                  disabled={loadingVerify}
                  className="w-full mt-6 py-4 rounded-full bg-black text-white text-lg font-medium disabled:opacity-50"
                >
                  {loadingVerify ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                </button>
              </div>
            )}

            {/* BƯỚC 2: HIỂN THỊ QR CODE */}
            {step === "qr" && (
              <div className="mt-6 flex flex-col items-center text-center">
                <p className="text-gray-600 mb-4">
                  Quét mã bên dưới bằng App Ngân Hàng để thanh toán số tiền{" "}
                  <strong className="text-red-600 text-lg">{total.toLocaleString()}₫</strong>
                </p>

                {/* HIỂN THỊ LỖI REALTIME TỪ WEBHOOK PUSHER NẾU CÓ */}
                {error && (
                  <div className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm mb-4 border border-red-200 animate-pulse">
                    ⚠️ {error}
                  </div>
                )}

                <div className="p-3 border-2 border-dashed border-gray-300 rounded-3xl inline-block bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="QR Code Thanh Toán" className="w-64 h-64 object-contain mx-auto" />
                </div>

                <div className="mt-4 text-sm bg-zinc-50 p-4 rounded-2xl w-full text-left space-y-1.5 border">
                  <p>• Mã đơn hàng: <strong className="text-blue-600">{orderId.slice(-4).toUpperCase()}</strong></p>
                  <p className="text-xs text-amber-600 pt-1 italic">* Hệ thống tự động chuyển màn hình ngay sau khi nhận được tiền (thường mất 1-3 giây).</p>
                </div>

                {/* <button
                
                  onClick={handleConfirmPaid}
                  disabled={loadingOrder}
                  className="cursor-pointer w-full mt-6 py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-medium transition disabled:opacity-50"
                >
                  {loadingOrder ? "Đang xử lý..." : "Chọn thanh toán khi nhận hàng"}
                </button> */}

                <button
                  onClick={() => {
                    if (loadingOrder) return;

                    const ok = window.confirm("Bạn xác nhận thanh toán bằng tiền mặt khi nhận hàng?");
                    if (!ok) return;

                    handleConfirmPaid();
                  }}
                  disabled={loadingOrder}
                  className="cursor-pointer w-full mt-6 py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-medium transition disabled:opacity-50"
                >
                  {loadingOrder ? "Đang xử lý..." : "Chọn thanh toán khi nhận hàng"}
                </button>

              </div>
            )}

            {/* BƯỚC 3: ĐẶT HÀNG THÀNH CÔNG (TỰ ĐỘNG CHUYỂN KHI PAID) */}
            {step === "success" && (
              <div className="mt-8 py-4 text-center space-y-5">
                {/* Icon success */}
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl font-bold animate-bounce">
                  ✓
                </div>

                <h3 className="text-3xl font-bold text-gray-800">
                  Đặt hàng thành công!
                </h3>

                {/* Info box */}
                <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 max-w-md mx-auto text-sm border border-zinc-100">
                  <p>
                    • Mã đơn hàng:{" "}
                    <strong className="text-black">
                      {orderId.slice(-4).toUpperCase() ?? '..'}
                    </strong>
                  </p>

                  {order?.bank?.transactionId ? (
                    <div>
                      <div>thanh toan online thi hien</div>
                      <div>
                        <p>
                          • Mã giao dịch:{" "}
                          <strong className="text-black">
                            {order?.bank?.transactionId ?? '..'}
                          </strong>
                        </p>

                        <p>
                          • Số tiền thanh toán:{" "}
                          <strong className="text-emerald-600">
                            {order?.bank?.transferAmount?.toLocaleString("vi-VN") ?? '..'} ₫
                          </strong>
                        </p>

                        <p>
                          • Nội dung:{" "}
                          <strong className="text-emerald-600">
                            {order?.bank?.content ?? '..'}
                          </strong>
                        </p>

                        <p>
                          • Thời gian:{" "}
                          <strong className="text-black">
                            {order?.bank?.transactionDate ?? '..'}
                          </strong>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div>thanh toan tien mat thi hien</div>
                      <div>
                        <p>
                          • Thời gian:{" "}
                          <strong className="text-black">
                            {/* {new Date().toLocaleTimeString("vi-VN")} */}
                            {formatDate(order?.createdAt)}
                          </strong>
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                <p className="text-gray-500 max-w-md mx-auto text-sm">
                  Đơn hàng của bạn đã được thanh toán và ghi nhận thành công trên hệ thống.
                </p>

                <button
                  onClick={() => {
                    setStep("none");
                    onClose();
                  }}
                  className="w-full mt-6 py-4 rounded-full bg-black text-white font-medium hover:bg-zinc-800 transition"
                >
                  Đóng & Tiếp tục mua sắm
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}