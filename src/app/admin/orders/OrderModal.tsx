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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl border border-neutral-200/50 max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">Chi tiết đơn hàng</h3>
            <p className="text-xs text-neutral-400 mt-0.5 select-all font-mono">ID: {selectedOrder.id}</p>
          </div>
          <button
            onClick={() => setSelectedOrder(null)}
            className="cursor-pointer  w-7 h-7 rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 active:scale-95 transition flex items-center justify-center"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto content-slate">

          {/* Thông tin khách hàng & Giao hàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-neutral-100 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-medium text-neutral-400 block">Người nhận</span>
              <p className="font-semibold text-neutral-800">{selectedOrder.customer?.name}</p>
              <p className="text-neutral-500 text-xs">{selectedOrder.customer?.phone}</p>
              <p className="text-neutral-500 text-xs truncate">{selectedOrder.customer?.email}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-neutral-400 block">Địa chỉ bàn giao</span>
              <p className="text-neutral-600 text-xs leading-relaxed">{selectedOrder.customer?.address}</p>
            </div>
          </div>

          {/* Giỏ hàng */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-neutral-400 tracking-wide block uppercase">Sản phẩm</span>
            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-neutral-50 border border-neutral-100" />
                    <div>
                      <p className="font-medium text-neutral-800 line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-neutral-400 font-mono">SKU: {item.productId}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-neutral-800">{item.price?.toLocaleString("vi-VN")}đ</p>
                    <p className="text-xs text-neutral-400">x{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng tính tiền */}
            <div className="pt-3 border-t border-neutral-100 flex justify-between items-center font-medium">
              <span className="text-xs text-neutral-400">Tổng thanh toán</span>
              <span className="text-base font-semibold text-neutral-900">{selectedOrder.amount?.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>

          {/* Đối soát ngân hàng (SePay) */}
          {/* {selectedOrder.bank && selectedOrder.bank.transactionId ? (
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/60 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-neutral-500">Dữ liệu đối soát tự động</span>
                <span className="font-semibold text-emerald-600 font-mono">+{selectedOrder.bank.transferAmount?.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-neutral-400 font-mono text-[11px] pt-1.5 border-t border-neutral-200/40">
                <div>Mã GD: <span className="text-neutral-700 font-medium">{selectedOrder.bank.transactionId}</span></div>
                <div className="text-right">{selectedOrder.bank.transactionDate}</div>
                <div className="col-span-2 truncate mt-0.5">Nội dung: "{selectedOrder.bank.content}"</div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/40 text-xs text-neutral-500 font-medium flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              Chưa có bản ghi khớp tiền tự động hệ thống.
            </div>
          )} */}
          {/* Đối soát ngân hàng (SePay) */}
          {selectedOrder.bank && selectedOrder.bank.transactionId ? (
            <div className="space-y-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-emerald-700">
                  Dữ liệu đối soát tự động
                </span>

                <span className="font-mono font-bold text-emerald-600">
                  +{selectedOrder.bank.transferAmount?.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 border-t border-emerald-200 pt-1.5 font-mono text-[11px] text-emerald-700/80">
                <div>
                  Mã GD:{" "}
                  <span className="font-semibold text-emerald-900">
                    {selectedOrder.bank.transactionId}
                  </span>
                </div>

                <div className="text-right">
                  {selectedOrder.bank.transactionDate}
                </div>

                <div className="col-span-2 mt-0.5 truncate">
                  Nội dung: "{selectedOrder.bank.content}"
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-700">
              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
              Chưa có bản ghi khớp tiền tự động hệ thống.
            </div>
          )}

          {/* Bảng điều khiển trạng thái (Admin Action) */}
          <div className="pt-4 border-t border-neutral-100 space-y-5">

            {/* Vận chuyển */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-400 block">TRẠNG THÁI VẬN CHUYỂN</span>
              <div className="p-1 bg-neutral-100 rounded-lg flex flex-wrap sm:flex-nowrap gap-0.5">
                {([
                  { value: "pending", label: "⏳Chờ duyệt" },
                  { value: "processing", label: "🚚Đang giao" },
                  { value: "completed", label: "✅Đã giao" },
                  { value: "cancelled", label: "❌Huỷ đơn" },
                ] as const).map((item) => (
                  <button
                    key={item.value}
                    disabled={updatingId !== null}
                    onClick={() => {
                      if (item.value === "cancelled" && !confirm("Bạn có chắc muốn huỷ đơn hàng này?")) return;
                      handleUpdateStatus(selectedOrder.id, { status: item.value });
                    }}
                    className={`cursor-pointer w-full py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${selectedOrder.status === item.value
                      ? "bg-white text-neutral-900 shadow-sm font-semibold"
                      : "text-neutral-500 hover:text-neutral-800"
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Thanh toán */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-400 block">TRẠNG THÁI THANH TOÁN</span>

              <div className="p-1 bg-neutral-100 rounded-lg flex flex-wrap sm:flex-nowrap gap-0.5">
                {([
                  { value: "pending", label: "⏳Nhập nợ" },
                  { value: "paid", label: "💰Đã thu tiền" },
                  { value: "refunded", label: "🔄Đã Hoàn tiền" },
                  { value: "failed", label: "❌Lỗi/Bại" },
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
                    className={`cursor-pointer w-full py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${selectedOrder.paymentStatus === item.value
                      ? "bg-white text-neutral-900 shadow-sm font-semibold"
                      : "text-neutral-500 hover:text-neutral-800"
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Tách phần hiển thị log nợ ra khỏi button giúp UI sạch sẽ hơn */}
              {selectedOrder.paymentStatus === "pending" && (
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-neutral-50 rounded-lg border border-neutral-200/40 text-[11px] font-mono text-neutral-500 mb-2">
                  <div>Nợ cũ: <span className="text-neutral-700 block font-sans font-medium mt-0.5">{selectedOrder.historyDebtAmount?.toLocaleString("vi-VN")}đ</span></div>
                  <div>Đã nhận: <span className="text-neutral-700 block font-sans font-medium mt-0.5">{selectedOrder.cashReceivedManual?.toLocaleString("vi-VN")}đ</span></div>
                  <div>Nợ mới: <span className="text-red-600 block font-sans font-semibold mt-0.5">{selectedOrder.debtAmount?.toLocaleString("vi-VN")}đ</span></div>
                </div>
              )}

              {/* KHU VỰC NHẬP NỢ CHUẨN APPLE INPUT */}
              {showDebtInput && (
                <div className="mt-2 p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <label className="text-[11px] font-medium text-neutral-500 block">Số tiền khách còn nợ lại</label>
                  <div className="flex gap-2">
                    <NumericFormat
                      value={debtInput === null ? "" : debtInput}
                      onValueChange={(values) => setDebtInput(values.floatValue || 0)}
                      thousandSeparator="."
                      decimalSeparator=","
                      suffix=" đ"
                      placeholder="Nhập số tiền..."
                      className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-inner"
                    />
                    <button
                      onClick={handleSaveDebt}
                      className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition active:scale-95 flex-shrink-0 shadow-sm"
                    >
                      Lưu thay đổi
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