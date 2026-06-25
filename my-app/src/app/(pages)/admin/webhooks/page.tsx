"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { Webhook } from "@/core/services/types/data-base";
import { db } from "@/core/services/firebase";
// import { db } from "@/lib/firebase";
// import { Webhook } from "@/types";

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<(Webhook & { firestoreDocId: string })[]>([]);
  const [filter, setFilter] = useState<"all" | "matched" | "unmatched">("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 1. Lắng nghe dữ liệu webhook real-time từ Firestore
  useEffect(() => {
    const q = query(collection(db, "webhook"), orderBy("transactionDate", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: (Webhook & { firestoreDocId: string })[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Webhook;
        list.push({ 
          ...data, 
          firestoreDocId: docSnap.id // Lấy ID Document của Firestore để dùng khi updateDoc
        });
      });
      setWebhooks(list);
    }, (err) => {
      console.error("Lỗi lắng nghe bộ dữ liệu Webhook: ", err);
    });

    return () => unsubscribe();
  }, []);

  // 2. Xử lý khớp đơn thủ công khi khách ghi sai nội dung chuyển khoản
  const handleManualMatch = async (firestoreDocId: string, webhookData: Webhook) => {
    const inputOrderId = prompt("Nhập chính xác Mã đơn hàng (Document ID của Order) để khớp thủ công:");
    
    if (!inputOrderId) return; // Khách hủy hoặc không nhập gì
    
    const trimmedOrderId = inputOrderId.trim();
    setProcessingId(firestoreDocId);

    try {
      // BƯỚC A: Cập nhật thông tin thanh toán vào đúng Đơn hàng trong bảng 'order'
      const orderRef = doc(db, "orders", trimmedOrderId);
      await updateDoc(orderRef, {
        paymentStatus: "paid",
        status: "processing", // Chuyển trạng thái đơn sang Đang xử lý
        bank: {
          transferAmount: webhookData.transferAmount,
          transactionId: webhookData.transactionId,
          bankTime: webhookData.transactionDate,
          content: webhookData.content,
        }
      });

      // BƯỚC B: Gắn ngược orderId vào bản ghi Webhook này để đánh dấu đã xử lý khớp đơn thành công
      const webhookRef = doc(db, "webhook", firestoreDocId);
      await updateDoc(webhookRef, {
        orderId: trimmedOrderId
      });

      alert(`🎉 Khớp thủ công thành công giao dịch cho đơn hàng: ${trimmedOrderId}`);
    } catch (error: any) {
      console.error("Lỗi khớp đơn thủ công: ", error);
      alert(`❌ Lỗi: Không thể cập nhật đơn hàng. Vui lòng kiểm tra lại chính xác mã ID đơn hàng.\nChi tiết: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // 3. Tính toán nhanh các chỉ số tổng quan ở hàng trên cùng
  const totalRevenue = webhooks.reduce((sum, wh) => sum + wh.transferAmount, 0);
  const matchedCount = webhooks.filter(wh => wh.orderId).length;
  const unmatchedCount = webhooks.length - matchedCount;

  // 4. Lọc danh sách hiển thị theo Tab điều hướng
  const filteredWebhooks = webhooks.filter((wh) => {
    if (filter === "matched") return !!wh.orderId;
    if (filter === "unmatched") return !wh.orderId;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* CỘT THỐNG KÊ NHANH THU NHẬP THỰC TẾ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng doanh thu SePay</p>
            <h4 className="text-xl font-bold text-slate-800 mt-1">{totalRevenue.toLocaleString("vi-VN")} đ</h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 text-xl font-bold">💰</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hệ thống tự động khớp</p>
            <h4 className="text-xl font-bold text-emerald-600 mt-1">{matchedCount} <span className="text-xs text-slate-400 font-normal">giao dịch</span></h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-lg">✅</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Giao dịch treo (Sai nội dung)</p>
            <h4 className="text-xl font-bold text-amber-600 mt-1">{unmatchedCount} <span className="text-xs text-slate-400 font-normal">giao dịch</span></h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 text-lg">⚠️</div>
        </div>
      </div>

      {/* DANH SÁCH CHI TIẾT LOG BIẾN ĐỘNG SỐ DƯ */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Bộ lọc Tabs */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">Nhật ký tài khoản SePay</h3>
            <p className="text-xs text-slate-400 mt-0.5">Lịch sử nhận tiền thời gian thực từ API Webhook ngân hàng</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit select-none">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filter === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tất cả ({webhooks.length})
            </button>
            <button
              onClick={() => setFilter("matched")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filter === "matched" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-emerald-600"
              }`}
            >
              Đã khớp đơn ({matchedCount})
            </button>
            <button
              onClick={() => setFilter("unmatched")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filter === "unmatched" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-amber-600"
              }`}
            >
              Chưa khớp ({unmatchedCount})
            </button>
          </div>
        </div>

        {/* Bảng render dữ liệu */}
        {filteredWebhooks.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            Không có dữ liệu giao dịch nào khớp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-medium bg-slate-50/50 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Thời gian / Cổng</th>
                  <th className="py-3 px-4">Tài khoản nhận</th>
                  <th className="py-3 px-4 text-right">Số tiền nhận</th>
                  <th className="py-3 px-4">Nội dung tin nhắn</th>
                  <th className="py-3 px-4">Trạng thái xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredWebhooks.map((wh) => (
                  <tr key={wh.firestoreDocId} className="hover:bg-slate-50/40 transition-colors">
                    
                    {/* Cột 1: Ngày giờ giao dịch & Cổng Ngân hàng */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-medium text-slate-800 text-xs sm:text-sm">{wh.transactionDate}</div>
                      <div className="mt-1.5 w-fit px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-blue-50 text-blue-600 border border-blue-100">
                        {wh.gateway}
                      </div>
                    </td>

                    {/* Cột 2: Số tài khoản thụ hưởng */}
                    <td className="py-4 px-4 align-top text-xs sm:text-sm font-mono text-slate-500 select-all pt-4.5">
                      {wh.accountNumber}
                    </td>

                    {/* Cột 3: Số tiền cộng vào tài khoản */}
                    <td className="py-4 px-4 text-right align-top font-bold text-emerald-600 text-xs sm:text-sm">
                      +{wh.transferAmount.toLocaleString("vi-VN")} đ
                    </td>

                    {/* Cột 4: Nội dung tin nhắn chuyển khoản của khách hàng */}
                    <td className="py-4 px-4 align-top max-w-xs break-words">
                      <div className="text-slate-700 font-medium bg-slate-50 p-2 border border-slate-200 rounded-lg text-xs leading-relaxed font-mono select-all">
                        {wh.content}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Mã GD SePay: {wh.transactionId}
                      </div>
                    </td>

                    {/* Cột 5: Trạng thái và nút xử lý đối soát */}
                    <td className="py-4 px-4 align-top">
                      {wh.orderId ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Đã liên kết đơn
                          </span>
                          <div className="text-[10px] font-mono text-slate-400 select-all block max-w-[200px] truncate">
                            Mã đơn: {wh.orderId}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Chưa khớp / Treo
                          </span>
                          <button 
                            disabled={processingId === wh.firestoreDocId}
                            onClick={() => handleManualMatch(wh.firestoreDocId, wh)}
                            className={`block text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-all ${
                              processingId === wh.firestoreDocId ? "opacity-40 cursor-wait" : ""
                            }`}
                          >
                            {processingId === wh.firestoreDocId ? "⌛ Đang liên kết..." : "🛠️ Khớp đơn thủ công"}
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}