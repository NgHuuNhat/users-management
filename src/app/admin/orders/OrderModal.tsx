import React from "react";
import { Order } from "@/core/services/data-base";
import { NumericFormat } from "react-number-format";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatShortId } from "@/core/shared/format-short-id";
import { toast } from "sonner";

interface OrderModalProps {
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  updatingId: string | null;
  handleUpdateStatus: (orderId: string, fields: Partial<Order>) => void;
  showDebtInput: boolean;
  setShowDebtInput: (show: boolean) => void;
  debtInput: number | null;
  setDebtInput: (val: number | null) => void;
  handleUpdateQuantityProduct: any;
}

export default function OrderModal({
  selectedOrder,
  setSelectedOrder,
  updatingId,
  handleUpdateStatus,
  showDebtInput,
  setShowDebtInput,
  debtInput,
  setDebtInput,
  handleUpdateQuantityProduct,
}: OrderModalProps) {

  if (!selectedOrder) return null;

  // CHẾ ĐỘ NỢ (isDebtMode): Bật khi đang ở trạng thái pending HOẶC kích hoạt form nhập nợ
  const isDebtMode = selectedOrder.paymentStatus === "pending" || showDebtInput;

  // Lấy các thông số gốc của đơn hàng
  const totalAmount = selectedOrder.amount || 0;
  const bankAmount = selectedOrder.bank?.transferAmount || 0;
  const previousDebt = selectedOrder.debtAmount || 0;

  // TÍNH TOÁN LIVE THEO THỜI GIAN THỰC KHI USER ĐANG GÕ NHẬP LIỆU
  const isUserTyping = debtInput !== null;
  const liveDebt = isUserTyping ? debtInput : previousDebt;
  const liveCashReceived = totalAmount - bankAmount - liveDebt;

  // Số tiền mặt thực tế thu thêm được trong lượt bấm này (nếu có)
  const newlyCollectedCash = isUserTyping ? (previousDebt - debtInput) : 0;

  const handleSaveDebt = () => {
    if (debtInput === null || debtInput < 0) return alert("Vui lòng nhập số nợ hợp lệ!");
    if (debtInput > (totalAmount - bankAmount)) {
      return alert("Số nợ không được vượt quá số tiền còn lại của đơn hàng!");
    }

    handleUpdateStatus(selectedOrder.id, {
      debtAmount: debtInput,
      paymentStatus: debtInput > 0 ? "pending" : "paid",
      cashReceivedManual: totalAmount - debtInput - bankAmount,
      historyDebtAmount: previousDebt,
    });
    setShowDebtInput(false);
    setDebtInput(null);
  };

  return (
    <Dialog
      open={!!selectedOrder}
      onOpenChange={(open) => {
        if (!open) setSelectedOrder(null);
      }}
    >
      <DialogContent className="[&>button]:cursor-pointer [&>button]:bg-gray-100 bg-white rounded-2xl w-[92vw] sm:w-full max-w-xl xl:max-w-2xl shadow-xl border border-neutral-200/50 max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden p-0 gap-0">

        {/* Modal Header */}
        <DialogHeader className="px-4 py-4 md:px-6 border-b border-neutral-100 flex flex-col justify-center space-y-0 text-left pr-12">
          <DialogTitle className="text-sm md:text-base font-semibold text-neutral-900">
            Chi tiết đơn hàng
          </DialogTitle>
          <DialogDescription className="text-[11px] md:text-xs text-neutral-400 mt-0.5 select-all font-mono truncate flex flex-col">
            <span>Mã đơn: <span className="font-bold text-black">{formatShortId(selectedOrder.id)}</span></span>
            <span>Mã GD: <span className="font-bold text-black">{selectedOrder?.bank?.transactionId || '---'}</span></span>
          </DialogDescription>
        </DialogHeader>

        {/* Modal Body */}
        <div className="p-4 md:p-6 space-y-5 md:space-y-6 flex-1 overflow-y-auto content-slate">

          {/* Thông tin khách hàng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-neutral-100 text-sm">
            <div className="space-y-1">
              <span className="text-[11px] md:text-xs font-medium text-neutral-400 block">Người nhận</span>
              <p className="font-semibold text-neutral-800">{selectedOrder.customer?.name}</p>
              <p className="text-neutral-500 text-xs">{selectedOrder.customer?.phone}</p>
              <p className="text-neutral-500 text-xs truncate">{selectedOrder.customer?.email}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] md:text-xs font-medium text-neutral-400 block">Địa chỉ bàn giao</span>
              <p className="text-neutral-600 text-xs leading-relaxed">{selectedOrder.customer?.address}</p>
            </div>
          </div>

          {/* Giỏ hàng sản phẩm */}
          <div className="space-y-3">
            <span className="text-[11px] md:text-xs font-semibold text-neutral-400 tracking-wide block uppercase">Sản phẩm</span>
            <div className="space-y-3 max-h-[150px] md:max-h-[180px] overflow-y-auto pr-1">
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm py-1 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={item.image} alt={item.name} className="w-9 h-9 md:w-10 md:h-10 object-cover rounded-lg bg-neutral-50 border border-neutral-100 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-800 truncate">{item.name}</p>
                      <p className="text-[10px] md:text-[11px] text-neutral-400 font-mono">SKU: {item.productId}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-neutral-800 text-xs md:text-sm">{item.price?.toLocaleString("vi-VN")}đ</p>
                    <p className="text-[11px] md:text-xs text-neutral-400">x{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-neutral-100 flex justify-between items-center font-medium">
              <span className="text-xs text-neutral-400">Tổng thanh toán</span>
              <span className="text-sm md:text-base font-semibold text-neutral-900">{totalAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>

          {/* Đối soát ngân hàng (SePay) */}
          {selectedOrder.bank && selectedOrder.bank.transactionId ? (
            <div className="space-y-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 md:p-3.5 text-[11px] md:text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-emerald-700 truncate">Dữ liệu đối soát tự động</span>
                <span className="font-mono font-bold text-emerald-600 flex-shrink-0">
                  +{bankAmount.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 border-t border-emerald-200 pt-1.5 font-mono text-[10px] md:text-[11px] text-emerald-700/80">
                <div>
                  Mã GD: <span className="font-semibold text-emerald-900 select-all">{selectedOrder.bank.transactionId}</span>
                </div>
                <div className="sm:text-right">{selectedOrder.bank.transactionDate}</div>
                <div className="sm:col-span-2 mt-0.5 truncate">Nội dung: "{selectedOrder.bank.content}"</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] md:text-xs font-medium text-amber-700">
              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
              Chưa có bản ghi khớp tiền tự động hệ thống.
            </div>
          )}

          {/* Bảng điều khiển trạng thái */}
          <div className="pt-4 border-t border-neutral-100 space-y-4 md:space-y-5">

            {/* Vận chuyển */}
            <div className="space-y-2">
              <span className="text-[10px] md:text-xs font-semibold text-neutral-400 block tracking-wider">TRẠNG THÁI VẬN CHUYỂN</span>
              <div className="p-1 bg-neutral-100 rounded-xl grid grid-cols-2 gap-1 md:flex md:flex-nowrap md:gap-0.5">
                {([
                  { value: "pending", label: "⏳ Chờ duyệt" },
                  { value: "processing", label: "🚚 Đang giao" },
                  { value: "completed", label: "✅ Đã giao" },
                  { value: "cancelled", label: "❌ Huỷ đơn" },
                ] as const).map((item) => (
                  <button
                    key={item.value}
                    disabled={updatingId !== null}
                    // onClick={() => {
                    //   if (item.value === "cancelled" && !confirm("Bạn có chắc muốn huỷ đơn hàng này?")) return;
                    //   handleUpdateStatus(selectedOrder.id, { status: item.value });
                    // }}

                    onClick={async () => {
                      const newStatus = item.value;
                      if (
                        newStatus === "cancelled" &&
                        !confirm("Bạn có chắc muốn huỷ đơn hàng này?")
                      ) {
                        return;
                      }
                      const res: any = await handleUpdateQuantityProduct(
                        selectedOrder.id,
                        selectedOrder.status,
                        newStatus
                      );
                      if (!res.success) return;
                      await handleUpdateStatus(selectedOrder.id, {
                        status: newStatus,
                      });
                    }}

                    className={`cursor-pointer w-full py-2 md:py-1.5 text-[11px] md:text-xs font-medium rounded-lg md:rounded-md transition-all duration-150 ${selectedOrder.status === item.value
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
              <span className="text-[10px] md:text-xs font-semibold text-neutral-400 block tracking-wider">TRẠNG THÁI THANH TOÁN</span>
              <div className="p-1 bg-neutral-100 rounded-xl grid grid-cols-2 gap-1 md:flex md:flex-nowrap md:gap-0.5">
                {([
                  { value: "pending", label: "⏳ Nhập nợ" },
                  { value: "paid", label: "💰 Đã thu tiền" },
                  { value: "refunded", label: "🔄 Hoàn tiền" },
                  { value: "failed", label: "❌ Lỗi/Bại" },
                ] as const).map((item) => {

                  const isActive = item.value === "pending"
                    ? isDebtMode
                    : (!isDebtMode && selectedOrder.paymentStatus === item.value);

                  return (
                    <button
                      key={item.value}
                      disabled={updatingId !== null}
                      onClick={() => {
                        if (item.value === "pending") {
                          setShowDebtInput(true);
                          return;
                        }

                        setShowDebtInput(false);

                        if (item.value === "paid") {
                          handleUpdateStatus(selectedOrder.id, {
                            paymentStatus: item.value,
                            cashReceivedManual: totalAmount - bankAmount,
                            debtAmount: 0,
                            historyDebtAmount: previousDebt,
                          });
                          return;
                        }
                        handleUpdateStatus(selectedOrder.id, { paymentStatus: item.value });
                      }}
                      className={`cursor-pointer w-full py-2 md:py-1.5 text-[11px] md:text-xs font-medium rounded-lg md:rounded-md transition-all duration-150 ${isActive
                        ? "bg-white text-neutral-900 shadow-sm font-semibold"
                        : "text-neutral-500 hover:text-neutral-800"
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* BẢNG ĐỐI SOÁT DÒNG TIỀN CHI TIẾT (Tự động cập nhật theo thời gian thực) */}
              {isDebtMode && (
                <div className="p-3 bg-neutral-100 rounded-xl space-y-1.5 text-[11px] font-medium text-neutral-600 animate-in fade-in duration-150">
                  <div className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">
                    Đối soát dòng tiền đơn hàng
                  </div>

                  <div className="flex justify-between py-0.5 border-b border-neutral-200/40">
                    <span className="text-neutral-500">Tổng giá trị đơn hàng:</span>
                    <span className="font-mono text-neutral-800">{totalAmount.toLocaleString("vi-VN")}đ</span>
                  </div>

                  <div className="flex justify-between py-0.5 border-b border-neutral-200/40">
                    <span className="text-neutral-500">Đã nhận qua Ngân hàng (Auto):</span>
                    <span className="font-mono text-emerald-600 font-semibold">+{bankAmount.toLocaleString("vi-VN")}đ</span>
                  </div>

                  <div className="flex justify-between py-0.5 border-b border-neutral-200/40">
                    <span className="text-neutral-500">Đã nhận bằng Tiền mặt (Thủ công):</span>
                    <span className="font-mono text-blue-600 font-semibold">
                      +{liveCashReceived.toLocaleString("vi-VN")}đ
                      {isUserTyping && (
                        <span className="text-[10px] text-amber-600 font-sans font-medium ml-1 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                          (Thu thêm: +{newlyCollectedCash > 0 ? newlyCollectedCash.toLocaleString("vi-VN") : 0}đ)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between pt-1 font-semibold text-xs">
                    <span className="text-neutral-700">Khách hiện tại còn nợ lại:</span>
                    <span className={`font-mono text-sm ${liveDebt > 0 ? "text-red-600 font-bold" : "text-emerald-600"}`}>
                      {liveDebt.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              )}

              {/* Ô NHẬP NỢ (Không bao giờ ẩn khi đang ở trạng thái nợ) */}
              {isDebtMode && (
                <div className="p-3 bg-neutral-100 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] md:text-[11px] font-semibold text-neutral-500 block uppercase tracking-wider">
                      Cập nhật số nợ mới của khách
                    </label>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Nợ cũ hệ thống: {previousDebt.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <NumericFormat
                      value={debtInput === null ? "" : debtInput}
                      onValueChange={(values) => setDebtInput(values.floatValue ?? null)}
                      thousandSeparator="."
                      decimalSeparator=","
                      suffix=" đ"
                      placeholder="Nhập số nợ còn lại (ví dụ: 200.000)..."
                      className="w-full px-3 py-1.5 bg-white border border-neutral-200/80 rounded-lg text-xs font-medium focus:outline-none focus:border-neutral-400 transition shadow-sm"
                    />
                    <button
                      onClick={handleSaveDebt}
                      className="cursor-pointer bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 flex-shrink-0 text-center"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-400 italic">
                    *Mẹo: Khách trả bớt bao nhiêu tiền, bạn chỉ cần gõ số tiền nợ còn lại, hệ thống sẽ tự tính tiền mặt thu thêm. Nhập số <span className="font-mono font-bold">0</span> nếu khách trả hết nợ.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}