"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { Webhook } from "@/core/services/data-base";
import { db } from "@/core/services/firebase";
import { formatDate } from "@/core/shared/format-date";
import { Wallet, CheckCircle2, AlertCircle, Link2, CreditCard } from "lucide-react";
import { formatShortId } from "@/core/shared/format-short-id";
// import { formatShortId } from "@/core/shared/format-short-id"; // Bỏ comment nếu muốn dùng

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
          firestoreDocId: docSnap.id
        });
      });
      setWebhooks(list);
    }, (err) => {
      console.error("Lỗi lắng nghe bộ dữ liệu Webhook: ", err);
    });

    return () => unsubscribe();
  }, []);

  // 2. Xử lý khớp đơn thủ công
  const handleManualMatch = async (firestoreDocId: string, webhookData: Webhook) => {
    const inputOrderId = prompt("Nhập chính xác Mã đơn hàng (Document ID của Order) để khớp thủ công:");

    if (!inputOrderId) return;

    const trimmedOrderId = inputOrderId.trim();
    setProcessingId(firestoreDocId);

    try {
      const orderRef = doc(db, "orders", trimmedOrderId);
      await updateDoc(orderRef, {
        paymentStatus: "paid",
        status: "processing",
        bank: {
          transferAmount: webhookData.transferAmount,
          transactionId: webhookData.transactionId,
          bankTime: webhookData.transactionDate,
          content: webhookData.content,
        }
      });

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

  // 3. Tính toán thống kê
  const totalRevenue = webhooks.reduce((sum, wh) => sum + wh.transferAmount, 0);
  const matchedCount = webhooks.filter(wh => wh.orderId).length;
  const unmatchedCount = webhooks.length - matchedCount;

  // 4. Dữ liệu cho Filter Component
  const filterLabels: Record<string, string> = {
    all: "Tất cả",
    matched: "Đã khớp",
    unmatched: "Giao dịch treo"
  };

  const filterCounts: Record<string, number> = {
    all: webhooks.length,
    matched: matchedCount,
    unmatched: unmatchedCount
  };

  const filteredWebhooks = webhooks.filter((wh) => {
    if (filter === "matched") return !!wh.orderId;
    if (filter === "unmatched") return !wh.orderId;
    return true;
  });

  // Component phụ render bộ lọc giống OrderTable
  const FilterSection = ({ icon: Icon, title, options, current, setter, counts, labels }: any) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2 text-slate-400 w-28 shrink-0">
        <Icon size={16} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {options.map((st: string) => (
          <button
            key={st}
            onClick={() => setter(st as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${current === st
              ? "bg-slate-800 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
          >
            {labels[st]} <span className="opacity-70">({counts[st] || 0})</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* CỘT THỐNG KÊ NHANH THU NHẬP THỰC TẾ (Đồng bộ rounded-2xl) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng nhận (SePay)</p>
            <h4 className="text-xl font-bold text-slate-800 mt-1">{totalRevenue.toLocaleString("vi-VN")} đ</h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
            <Wallet size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hệ thống tự động khớp</p>
            <h4 className="text-xl font-bold text-emerald-600 mt-1">{matchedCount} <span className="text-xs text-slate-400 font-medium">giao dịch</span></h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giao dịch treo (Lỗi)</p>
            <h4 className="text-xl font-bold text-amber-600 mt-1">{unmatchedCount} <span className="text-xs text-slate-400 font-medium">giao dịch</span></h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertCircle size={20} />
          </div>
        </div>
      </div>

      {/* MAIN TABLE CONTAINER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header & Filter Section */}
        <div className="p-5 border-b border-slate-100 md:flex md:items-center md:justify-between gap-6">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-slate-800">Nhật ký SePay</h3>
            <p className="text-sm text-slate-500">Lịch sử nhận tiền thời gian thực từ API Webhook</p>
          </div>

          <div className="flex flex-col gap-3">
            <FilterSection
              icon={Link2}
              title="Đối soát"
              options={["all", "matched", "unmatched"]}
              current={filter}
              setter={setFilter}
              counts={filterCounts}
              labels={filterLabels}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="overflow-hidden">
          {filteredWebhooks.length === 0 ? (
            <div className="text-center py-20 text-slate-400">Không có giao dịch nào khớp với bộ lọc.</div>
          ) : (
            <>
              {/* Table View (Hidden on mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Thông tin GD</th>
                      <th className="py-4 px-6">Nguồn tiền</th>
                      <th className="py-4 px-6 text-right">Số tiền</th>
                      <th className="py-4 px-6">Nội dung chuyển khoản</th>
                      <th className="py-4 px-6 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWebhooks.map((wh) => (
                      <tr key={wh.firestoreDocId} className="hover:bg-slate-50/50 transition-colors">

                        {/* Cột 1: Thông tin GD */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Mã GD:</span>
                              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1 rounded truncate max-w-[120px]">
                                {wh.transactionId}
                              </span>
                            </div>
                            <div className="text-[12px] text-slate-400 font-medium">
                              {formatDate(wh.transactionDate)}
                            </div>
                          </div>
                        </td>

                        {/* Cột 2: Nguồn tiền */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-xs">
                              <CreditCard size={14} className="text-slate-400" />
                              <span className="font-mono font-bold text-slate-600">{wh.accountNumber}</span>
                            </div>
                            <div className="w-fit px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase bg-blue-50 text-blue-600 border border-blue-100">
                              {wh.gateway}
                            </div>
                          </div>
                        </td>

                        {/* Cột 3: Số tiền */}
                        <td className="py-4 px-6 text-right font-bold text-emerald-600">
                          +{wh.transferAmount.toLocaleString("vi-VN")} đ
                        </td>

                        {/* Cột 4: Nội dung */}
                        <td className="py-4 px-6">
                          <div className="text-slate-700 bg-slate-50 p-2 border border-slate-200 rounded-lg text-[11px] font-mono leading-relaxed max-w-[220px] break-words">
                            {wh.content}
                          </div>
                        </td>

                        {/* Cột 5: Trạng thái */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex flex-col gap-1 items-center">
                            {wh.orderId ? (
                              <>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  <CheckCircle2 size={12} /> Đã khớp đơn
                                </span>

                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Liên kết tới mã đơn:</span>
                                    <span className="font-mono text-xs text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded truncate">{formatShortId(wh.orderId)}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Mã GD:</span>
                                    <span className="font-mono text-xs text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded truncate">{wh.transactionId}</span>
                                  </div>
                                </div>

                              </>
                            ) : (
                              <>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100 mb-1">
                                  <AlertCircle size={12} /> Giao dịch treo
                                </span>
                                <button
                                  disabled={processingId === wh.firestoreDocId}
                                  onClick={() => handleManualMatch(wh.firestoreDocId, wh)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${processingId === wh.firestoreDocId
                                    ? "bg-slate-100 text-slate-400 cursor-wait"
                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100"
                                    }`}
                                >
                                  {processingId === wh.firestoreDocId ? "Đang xử lý..." : "Khớp thủ công"}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card View (Visible on mobile only - Đồng bộ OrderTable) */}
              <div className="md:hidden p-4 space-y-3 bg-slate-50">
                {filteredWebhooks.map((wh) => (
                  <div key={wh.firestoreDocId} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    {/* Header Card: Mã GD & Trạng thái */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Mã GD:</span>
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1 rounded truncate">
                            {wh.transactionId}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {formatDate(wh.transactionDate)}
                        </div>
                      </div>

                      {/* Trạng thái ở góc phải */}
                      {wh.orderId ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 size={10} /> Đã khớp
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-50 text-orange-700 border border-orange-100">
                          <AlertCircle size={10} /> Treo
                        </span>
                      )}
                    </div>

                    {/* Body Card: Thông tin thanh toán */}
                    <div className="mb-3 space-y-1.5 border-t pt-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-slate-500">
                          <CreditCard size={14} />
                          <span className="font-mono">{wh.accountNumber}</span>
                          <span className="text-[8px] uppercase font-bold bg-blue-50 text-blue-600 px-1 rounded ml-1 border border-blue-100">{wh.gateway}</span>
                        </div>
                        <span className="font-bold text-emerald-600">+{wh.transferAmount.toLocaleString("vi-VN")} đ</span>
                      </div>

                      {/* Nội dung */}
                      <div className="mt-2 text-slate-600 bg-slate-50 p-2 border border-slate-100 rounded text-[11px] font-mono break-words">
                        {wh.content}
                      </div>
                    </div>

                    {/* Footer Card: Hành động */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                      {wh.orderId ? (
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Liên kết tới mã đơn:</span>
                            <span className="font-mono text-xs text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded truncate">{formatShortId(wh.orderId)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Mã GD:</span>
                            <span className="font-mono text-xs text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded truncate">{wh.transactionId}</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          disabled={processingId === wh.firestoreDocId}
                          onClick={() => handleManualMatch(wh.firestoreDocId, wh)}
                          className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${processingId === wh.firestoreDocId
                            ? "bg-slate-100 text-slate-400 cursor-wait"
                            : "bg-blue-50 text-blue-600 border border-blue-100 active:bg-blue-100"
                            }`}
                        >
                          {processingId === wh.firestoreDocId ? "Đang xử lý..." : "Khớp thủ công"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}