import React from "react";
import { Order } from "@/core/services/data-base";
import { NumericFormat } from "react-number-format";

interface OrderModalProps {
  selectedOrder: Order;
  setSelectedOrder: (order: Order | null) => void;
  updatingId: string | null;
  handleUpdateStatus: (orderId: string, fields: Partial<Order>) => void;
  showDebtInput: boolean;
  setShowDebtInput: (show: boolean) => void;
  debtInput: number | null;
  setDebtInput: (val: number | null) => void;
}

export default function OrderModal({
  selectedOrder, setSelectedOrder, updatingId, handleUpdateStatus,
  showDebtInput, setShowDebtInput, debtInput, setDebtInput
}: OrderModalProps) {
  
  const handleSaveDebt = () => {
    if (debtInput === null || debtInput < 0) return alert("Vui lòng nhập số nợ hợp lệ!");
    
    handleUpdateStatus(selectedOrder.id, {
      debtAmount: debtInput,
      paymentStatus: debtInput > 0 ? "pending" : "paid",
      cashReceivedManual: (selectedOrder.amount || 0) - debtInput - (selectedOrder.bank?.transferAmount || 0),
      historyDebtAmount: selectedOrder.debtAmount || 0,
    });
    
    setShowDebtInput(false);
    setDebtInput(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div>
            <h4 className="text-sm font-mono font-bold text-slate-400">
              CHI TIẾT ĐƠN: <span className="text-slate-800 text-xs select-all bg-white px-2 py-0.5 border border-slate-200 rounded">{selectedOrder.id}</span>
            </h4>
          </div>
          <button
            onClick={() => setSelectedOrder(null)}
            className="w-8 h-8 rounded-full bg-slate-200/60 text-slate-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center text-sm font-bold"
          >✕</button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Phần A: Thông tin giao hàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Người nhận hàng</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedOrder.customer?.name}</p>
              <p className="text-xs text-slate-500 mt-1">📞 {selectedOrder.customer?.phone}</p>
              <p className="text-xs text-slate-500">✉️ {selectedOrder.customer?.email}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Địa chỉ bàn giao</span>
              <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">{selectedOrder.customer?.address}</p>
            </div>
          </div>

          {/* Phần B: Giỏ hàng */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Giỏ hàng chi tiết</span>
            <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-sm bg-white hover:bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border bg-slate-50" />
                    <div>
                      <p className="font-semibold text-slate-800 text-xs sm:text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400 font-mono">Mã SP: {item.productId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{item.price?.toLocaleString("vi-VN")} đ</p>
                    <p className="text-xs text-slate-400 font-medium">SL: x{item.quantity}</p>
                  </div>
                </div>
              ))}
              <div className="p-3 bg-slate-50/80 flex justify-between items-center font-bold text-slate-800">
                <span className="text-xs uppercase text-slate-400 tracking-wider">Thành tiền:</span>
                <span className="text-base text-blue-600">{selectedOrder.amount?.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>
          </div>

          {/* Phần C: Sao kê */}
          {selectedOrder.bank && selectedOrder.bank.transactionId ? (
            <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block mb-1">Dữ liệu đối soát</span>
              <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600 font-mono mt-2">
                <div>Mã GD: <span className="font-bold text-slate-800">{selectedOrder.bank.transactionId}</span></div>
                <div>Nhận: <span className="font-bold text-emerald-600">+{selectedOrder.bank.transferAmount?.toLocaleString("vi-VN")} đ</span></div>
                <div className="col-span-2">Thời gian: {selectedOrder.bank.transactionDate}</div>
                <div className="col-span-2">Nội dung: "{selectedOrder.bank.content}"</div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50/40 border border-amber-100 text-xs text-amber-700 font-medium">
              ⚠️ Chưa có bản ghi khớp tiền tự động từ SePay.
            </div>
          )}

          {/* Phần D: Admin Action */}
          <div className="border-t border-slate-100 pt-4 space-y-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Bảng điều khiển trạng thái</span>
            
            {/* Vận chuyển */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">🚚 Trạng thái vận chuyển</p>
              <div className="flex flex-wrap gap-2">
                {([ 
                  { value: "pending", label: "⏳ Chờ duyệt" },
                  { value: "processing", label: "🚚 Đang xử lý/giao" },
                  { value: "completed", label: "✅ Đã giao" },
                  { value: "cancelled", label: "❌ Đã huỷ" },
                ] as const).map((item) => (
                  <button
                    key={item.value}
                    disabled={updatingId !== null}
                    onClick={() => {
                      if (item.value === "cancelled" && !confirm("Bạn có chắc muốn huỷ?")) return;
                      handleUpdateStatus(selectedOrder.id, { status: item.value });
                    }}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                      selectedOrder.status === item.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Thanh toán */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">💳 Trạng thái thanh toán</p>
              <div className="flex flex-wrap gap-2">
                {([ 
                  { value: "pending", label: "⏳ Chưa trả tiền / Nhập nợ" },
                  { value: "paid", label: "💰 Đã thu tiền" },
                  { value: "refunded", label: "🔄 Đã hoàn tiền" },
                  { value: "failed", label: "❌ Lỗi thanh toán" },
                ] as const).map((item) => (
                  <button
                    key={item.value}
                    disabled={updatingId !== null}
                    onClick={() => {
                      if (item.value === "pending") {
                        setShowDebtInput(!showDebtInput);
                        return;
                      }
                      if (item.value === "paid") {
                        handleUpdateStatus(selectedOrder.id, {
                          paymentStatus: item.value,
                          cashReceivedManual: selectedOrder.debtAmount || 0,
                          debtAmount: 0,
                          historyDebtAmount: selectedOrder.debtAmount || 0,
                        });
                        return;
                      }
                      handleUpdateStatus(selectedOrder.id, { paymentStatus: item.value });
                    }}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                      selectedOrder.paymentStatus === item.value ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                    {item.value === "pending" && (
                      <div className="text-left mt-1">
                        <div className="text-[10px] opacity-90">⚠️ Nợ cũ: {selectedOrder.historyDebtAmount?.toLocaleString("vi-VN")} đ</div>
                        <div className="text-[10px] opacity-90">⚠️ Đã nhận: {selectedOrder.cashReceivedManual?.toLocaleString("vi-VN")} đ</div>
                        <div className="text-[10px] opacity-90">⚠️ Nợ mới: {selectedOrder.debtAmount?.toLocaleString("vi-VN")} đ</div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* KHU VỰC NHẬP NỢ */}
              {showDebtInput && (
                <div className="mt-3 p-4 border border-orange-200 bg-orange-50 rounded-lg space-y-3">
                  <p className="text-xs font-semibold text-orange-700">Nhập số tiền khách còn nợ lại</p>
                  <div className="flex gap-2">
                    <NumericFormat
                      value={debtInput === null ? "" : debtInput}
                      onValueChange={(values) => setDebtInput(values.floatValue || 0)}
                      thousandSeparator="."
                      decimalSeparator=","
                      suffix=" đ"
                      placeholder="Nhập số tiền nợ..."
                      className="w-full px-3 py-2 border border-orange-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button 
                      onClick={handleSaveDebt}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap"
                    >
                      Lưu Nợ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}