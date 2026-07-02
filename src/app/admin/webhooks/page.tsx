"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { Webhook } from "@/core/services/data-base";
import { db } from "@/core/services/firebase";
import { formatDate } from "@/core/shared/format-date";
import { Wallet, CheckCircle2, AlertCircle, Link2, CreditCard } from "lucide-react";
import { formatShortId } from "@/core/shared/format-short-id";

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

  // Component phụ render bộ lọc đồng bộ luật < 1440px
  const FilterSection = ({ icon: Icon, title, options, current, setter, counts, labels }: any) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full min-[1440px]:w-auto">
      <div className="flex items-center gap-1.5 text-slate-400 sm:w-24 shrink-0">
        <Icon size={14} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {options.map((st: string) => (
          <button
            key={st}
            onClick={() => setter(st as any)}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${current === st
              ? "bg-slate-800 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
          >
            {labels[st]} <span className="opacity-70 text-[11px]">({counts[st] || 0})</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* CỘT THỐNG KÊ NHANH THU NHẬP THỰC TẾ (Tự động thích ứng Grid theo màn hình) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tổng nhận chuyển khoản
            </p>
            <h4 className="text-xl font-bold text-emerald-600 mt-1">
              {totalRevenue.toLocaleString("vi-VN")} đ
            </h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0">
            <Wallet size={20} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Hệ thống tự động khớp
            </p>
            <h4 className="text-xl font-bold text-emerald-600 mt-1">
              {matchedCount}{" "}
              <span className="text-xs text-slate-400 font-medium">
                giao dịch
              </span>
            </h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="md:col-span-2 xl:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Giao dịch treo (Lỗi)
            </p>
            <h4 className="text-xl font-bold text-amber-600 mt-1">
              {unmatchedCount}{" "}
              <span className="text-xs text-slate-400 font-medium">
                giao dịch
              </span>
            </h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <AlertCircle size={20} />
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full">
        {/* Header & Filter Section: Đảm bảo cân bằng dòng chảy dưới 1440px */}
        <div className="p-5 border-b border-slate-100 flex flex-col min-[1440px]:flex-row min-[1440px]:items-center min-[1440px]:justify-between gap-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Nhật ký SePay</h3>
            <p className="text-sm text-slate-500">Lịch sử nhận tiền thời gian thực từ API Webhook</p>
          </div>

          <div className="flex flex-col gap-3 w-full min-[1440px]:w-auto">
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
              {/* ============================================================== */}
              {/* TABLE VIEW: CHỈ BẬT KHI MÀN HÌNH TỪ 1440PX TRỞ LÊN            */}
              {/* ============================================================== */}
              <div className="hidden min-[1440px]:block overflow-x-auto">
                <table className="w-full text-left text-sm table-fixed">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-4 px-6 w-[20%]">Thông tin GD</th>
                      <th className="py-4 px-6 w-[20%]">Nguồn tiền</th>
                      <th className="py-4 px-6 text-right w-[15%]">Số tiền</th>
                      <th className="py-4 px-6 w-[25%]">Nội dung chuyển khoản</th>
                      <th className="py-4 px-6 text-center w-[20%]">Trạng thái đối soát</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWebhooks.map((wh) => (
                      <tr key={wh.firestoreDocId} className="hover:bg-slate-50/50 transition-colors">

                        {/* Cột 1: Thông tin GD */}
                        <td className="py-4 px-6 align-top">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Mã GD:</span>
                              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1 rounded truncate max-w-[130px]">
                                {wh.transactionId}
                              </span>
                            </div>
                            <div className="text-[12px] text-slate-400 font-medium">
                              {formatDate(wh.transactionDate)}
                            </div>
                          </div>
                        </td>

                        {/* Cột 2: Nguồn tiền */}
                        <td className="py-4 px-6 align-top">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1 text-xs">
                              <CreditCard size={14} className="text-slate-400 shrink-0" />
                              <span className="font-mono font-bold text-slate-600">{wh.accountNumber}</span>
                            </div>
                            <div className="w-fit px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase bg-blue-50 text-blue-600 border border-blue-100">
                              {wh.gateway}
                            </div>
                          </div>
                        </td>

                        {/* Cột 3: Số tiền */}
                        <td className="py-4 px-6 text-right font-bold text-emerald-600 align-top whitespace-nowrap">
                          +{wh.transferAmount.toLocaleString("vi-VN")} đ
                        </td>

                        {/* Cột 4: Nội dung */}
                        <td className="py-4 px-6 align-top">
                          <div className="text-slate-700 bg-slate-50 p-2.5 border border-slate-200 rounded-lg text-[11px] font-mono leading-relaxed break-words max-w-full">
                            {wh.content}
                          </div>
                        </td>

                        {/* Cột 5: Trạng thái đối soát */}
                        <td className="py-4 px-6 text-center align-top">
                          <div className="flex flex-col gap-2 items-center justify-center">
                            {wh.orderId ? (
                              <div className="flex flex-col gap-1.5 items-center">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
                                  <CheckCircle2 size={12} /> Đã khớp đơn
                                </span>
                                <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 p-1.5 rounded-lg w-full max-w-[180px] space-y-0.5 text-left">
                                  <div className="truncate"><span className="text-[9px] font-bold text-slate-400 uppercase">Mã đơn:</span> <span className="font-mono font-bold text-slate-700">{formatShortId(wh.orderId)}</span></div>
                                </div>
                                <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 p-1.5 rounded-lg w-full max-w-[180px] space-y-0.5 text-left">
                                  <div className="truncate"><span className="text-[9px] font-bold text-slate-400 uppercase">Mã GD:</span> <span className="font-mono font-bold text-slate-700">{wh.transactionId}</span></div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1.5 items-center">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100 whitespace-nowrap">
                                  <AlertCircle size={12} /> Giao dịch treo
                                </span>
                                <button
                                  disabled={processingId === wh.firestoreDocId}
                                  onClick={() => handleManualMatch(wh.firestoreDocId, wh)}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${processingId === wh.firestoreDocId
                                    ? "bg-slate-100 text-slate-400 cursor-wait"
                                    : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 cursor-pointer shadow-sm"
                                    }`}
                                >
                                  {processingId === wh.firestoreDocId ? "Đang xử lý..." : "Khớp thủ công"}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ============================================================== */}
              {/* CARD VIEW (MOBILE): TỰ ĐỘNG HIỆN KHI MÀN HÌNH < 1440PX         */}
              {/* ============================================================== */}
              <div className="min-[1440px]:hidden p-4 space-y-3 bg-slate-50/50">
                {filteredWebhooks.map((wh) => (
                  <div key={wh.firestoreDocId} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Khối trái: Chi tiết giao dịch ngân hàng */}
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex flex-col gap-0.5">
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

                        {/* Badge trạng thái thu gọn ở mobile nhỏ */}
                        <div className="md:hidden">
                          {wh.orderId ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Đã khớp
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-50 text-orange-700 border border-orange-100">
                              Treo
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[11px] md:text-xs pt-1.5 border-t border-dashed border-slate-100">
                        <div className="flex items-center gap-2 text-slate-600">
                          <CreditCard size={14} className="text-slate-400 shrink-0" />
                          <span className="font-mono font-medium">{wh.accountNumber}</span>
                          <span className="text-[8px] uppercase font-bold bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">{wh.gateway}</span>
                        </div>
                        {/* Box Nội dung chuyển khoản */}
                        <div className="text-slate-600 bg-slate-50 p-2 border border-slate-100 rounded text-[11px] font-mono break-words leading-normal">
                          <span className="text-[9px] block text-slate-400 uppercase font-sans font-bold mb-0.5">Nội dung CK:</span>
                          {wh.content}
                        </div>
                      </div>
                    </div>

                    {/* Khối phải: Số tiền & Xử lý đối soát (Kích hoạt 2 cột trên iPad/Laptop 13") */}
                    <div className="flex flex-col justify-between items-stretch md:border-l md:pl-4 md:pt-0 pt-3 border-t md:border-t-0 border-slate-100">
                      <div className="flex md:flex-col justify-between items-center md:items-end gap-2">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] block text-slate-400 font-medium">Số tiền nhận</span>
                          <span className="font-bold text-base text-emerald-600">+{wh.transferAmount.toLocaleString("vi-VN")} đ</span>
                        </div>

                        {/* Nhóm Badge trên bản iPad/Tablet/Laptop < 1440px */}
                        <div className="hidden md:block">
                          {wh.orderId ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <CheckCircle2 size={12} /> Đã khớp đơn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100">
                              <AlertCircle size={12} /> Giao dịch treo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Vùng xử lý tương tác cuối Card */}
                      <div className="mt-3 pt-3 border-t border-slate-100 md:border-t-0 md:pt-0">
                        {wh.orderId ? (
                          <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 p-2 rounded-lg space-y-0.5">
                            <div className="flex justify-between"><span className="text-slate-400">Liên kết mã đơn:</span> <span className="font-mono font-bold text-slate-700">{formatShortId(wh.orderId)}</span></div>
                          </div>
                        ) : (
                          <button
                            disabled={processingId === wh.firestoreDocId}
                            onClick={() => handleManualMatch(wh.firestoreDocId, wh)}
                            className={`w-full py-2 rounded-xl text-xs font-bold transition-all border ${processingId === wh.firestoreDocId
                              ? "bg-slate-100 text-slate-400 cursor-wait border-slate-200"
                              : "bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border-blue-100 active:bg-blue-100 cursor-pointer text-center"
                              }`}
                          >
                            {processingId === wh.firestoreDocId ? "Đang xử lý..." : "Khớp đơn thủ công →"}
                          </button>
                        )}
                      </div>
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