"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, doc, updateDoc, orderBy } from "firebase/firestore";
import { Order } from "@/core/services/types/data-base";
import { db } from "@/core/services/firebase";
import { formatDate } from "@/core/features/lib/format-date";
// import { formatDate } from "@/core/features/orders/format-date";
// import { db } from "@/lib/firebase";
// import { Order } from "@/types";

export default function OrdersPage() {
  // Lưu ý: Đổi tên collection thành "order" (số ít) nếu database của bạn đặt tên dạng số ít
  const COLLECTION_NAME = "orders";

  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [debtInput, setDebtInput] = useState<number>(0);
  const [showDebtInput, setShowDebtInput] = useState(false);

  // 1. Lắng nghe danh sách đơn hàng real-time từ Firestore
  useEffect(() => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      // Sắp xếp đơn hàng mới nhất lên đầu (nếu có trường tạo, hoặc tạm thời render theo mảng)
      setOrders(list);
    }, (err) => {
      console.error("Lỗi lấy danh sách đơn hàng: ", err);
    });
    return () => unsubscribe();
  }, []);

  // 2. Hàm cập nhật trạng thái đơn hàng nhanh (Hành động của Admin)
  const handleUpdateStatus = async (orderId: string, fieldsToUpdate: Partial<Order>) => {
    setUpdatingId(orderId);
    try {
      const orderRef = doc(db, COLLECTION_NAME, orderId);
      await updateDoc(orderRef, fieldsToUpdate);

      // Cập nhật lại state của modal chi tiết nếu đang mở chính đơn hàng đó
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, ...fieldsToUpdate } : null);
      }
    } catch (error: any) {
      alert(`Lỗi cập nhật trạng thái: ${error.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // 3. Phân loại màu sắc hiển thị cho Trạng thái giao hàng
  const getStatusBadge = (status: Order["status"]) => {
    const badges = {
      pending: "bg-slate-100 text-slate-700 border-slate-200",
      processing: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    const labels = { pending: "Chờ duyệt", processing: "Đang giao", completed: "Đã hoàn thành", cancelled: "Đã hủy" };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badges[status]}`}>{labels[status]}</span>;
  };

  // 4. Phân loại màu sắc hiển thị cho Trạng thái thanh toán
  const getPaymentBadge = (status: Order["paymentStatus"]) => {
    const badges = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
      failed: "bg-red-50 text-red-700 border-red-200",
      refunded: "bg-purple-50 text-purple-700 border-purple-200",
    };
    const labels = { pending: "Chưa trả tiền", paid: "Đã thu tiền", failed: "Thất bại", refunded: "Đã hoàn tiền" };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badges[status]}`}>{labels[status]}</span>;
  };

  // 5. Thống kê và lọc dữ liệu đơn hàng
  const metrics = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    completed: orders.filter(o => o.status === "completed").length,
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "all") return true;
    return order.status === filterStatus;
  });

  //6. loc tab
  const statusCount = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    completed: orders.filter(o => o.status === "completed").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  const statusLabel = {
    all: "Tất cả",
    pending: "Chờ duyệt",
    processing: "Đang xử lý",
    completed: "Đã hoàn thành",
    cancelled: "Đã huỷ",
  };

  const statusLabelPayment = {
    pending: "Chưa thanh toán",
    paid: "Đã thanh toán",
    failed: "Thanh toán thất bại",
    refunded: "Đã hoàn tiền",
  }

  return (
    <div className="space-y-6">
      {/* KHỐI MINI STATS THỐNG KÊ ĐƠN HÀNG */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng số đơn", count: metrics.total, color: "text-slate-800", icon: "📋" },
          { label: "Chờ duyệt tay", count: metrics.pending, color: "text-amber-600", icon: "⏳" },
          { label: "Đang xử lý/Giao", count: metrics.processing, color: "text-blue-600", icon: "🚚" },
          { label: "Đã giao thành công", count: metrics.completed, color: "text-emerald-600", icon: "📦" },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">{item.label}</p>
              <h4 className={`text-xl font-bold mt-1 ${item.color}`}>{item.count} đơn</h4>
            </div>
            <span className="text-xl bg-slate-50 p-2 rounded-lg">{item.icon}</span>
          </div>
        ))}
      </div>

      {/* DANH SÁCH ĐƠN HÀNG CHÍNH */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Bộ lọc Tab điều hướng trạng thái */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">Hệ thống xử lý đơn hàng</h3>
            <p className="text-xs text-slate-400 mt-0.5">Theo dõi lịch trình đóng gói, vận chuyển và dòng tiền thu hộ</p>
          </div>

          {/* <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit text-xs font-medium select-none">
            {["all", "pending", "processing", "completed", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-md transition-all capitalize ${filterStatus === st ? "bg-white text-slate-800 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                {st === "all" ? "Tất cả" : st === "pending" ? "Chờ duyệt" : st === "processing" ? "Đang xử lý" : st === "completed" ? "Đã xong" : "Đã huỷ"}
              </button>
            ))}
          </div> */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit text-xs font-medium select-none">
            {(
              ["all", "pending", "processing", "completed", "cancelled"] as const
            ).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-md transition-all ${filterStatus === st
                  ? "bg-white text-slate-800 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                {statusLabel[st]} ({statusCount[st]})
              </button>
            ))}
          </div>
        </div>

        {/* Bảng hiển thị danh sách */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">Không tìm thấy đơn hàng nào ở trạng thái này.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-medium bg-slate-50/50 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Mã Đơn Hàng (ID)</th>
                  <th className="py-3 px-4">Khách Hàng</th>
                  <th className="py-3 px-4 text-right">Tổng Tiền Đơn</th>
                  <th className="py-3 px-4 text-center">Vận Chuyển</th>
                  <th className="py-3 px-4 text-center">Thanh Toán</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/40 transition-colors">
                    {/* Cột 0: Thời gian */}
                    <td className="py-4 px-4 font-mono text-xs text-slate-800 font-semibold select-all">
                      {/* {order.createdAt} */}
                      {/* {order.createdAt?.toDate().toLocaleString("vi-VN")} */}
                      {formatDate(order.createdAt)}
                    </td>

                    {/* Cột 1: Mã Đơn */}
                    <td className="py-4 px-4 font-mono text-xs text-slate-800 font-semibold select-all">
                      {order.id}
                    </td>

                    {/* Cột 2: Thông tin Khách hàng */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">{order.customer?.name || "Ẩn danh"}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{order.customer?.phone}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{order.customer?.address}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{order.customer?.email}</div>
                      {/* <div className="text-xs text-slate-400 mt-0.5">{order.customer?.email}</div> */}
                    </td>

                    {/* Cột 3: Tổng số tiền */}
                    <td className="py-4 px-4 text-right font-bold text-blue-600">
                      {order.amount?.toLocaleString("vi-VN")} đ
                    </td>

                    {/* Cột 4: Trạng thái Đơn hàng */}
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>

                    {/* Cột 5: Trạng thái Thanh toán */}
                    <td className="py-4 px-4 text-center">
                      {getPaymentBadge(order.paymentStatus)}
                      {order.paymentStatus === "pending" && (
                        <div className="text-xs text-orange-600 font-semibold mt-1">
                          Còn thiếu: {order.debtAmount?.toLocaleString("vi-VN")} đ
                        </div>
                      )}
                    </td>

                    {/* Cột 6: Nút tương tác nhanh */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold text-slate-600 transition-colors"
                      >
                        🔎 Xem & Xử lý
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP MODAL: CHI TIẾT ĐƠN HÀNG & THAY ĐỔI TRẠNG THÁI GIAO/NHẬN */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto flex flex-col">

            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <h4 className="text-sm font-mono font-bold text-slate-400">CHI TIẾT ĐƠN: <span className="text-slate-800 text-xs select-all bg-white px-2 py-0.5 border border-slate-200 rounded">{selectedOrder.id}</span></h4>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-200/60 text-slate-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
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

              {/* Phần B: Giỏ hàng sản phẩm (Chốt giá thời điểm mua) */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Giỏ hàng chi tiết</span>
                <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-sm bg-white hover:bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border bg-slate-50" />
                        <div>
                          <p className="font-semibold text-slate-800 text-xs sm:text-sm">{item.name}</p>
                          <p className="text-xs text-slate-400 font-mono">Mã SP: {item.productId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">{item.price?.toLocaleString("vi-VN")} đ</p>
                        <p className="text-xs text-slate-400 font-medium">Số lượng: x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-slate-50/80 flex justify-between items-center font-bold text-slate-800">
                    <span className="text-xs uppercase text-slate-400 tracking-wider">Thành tiền toàn bộ:</span>
                    <span className="text-base text-blue-600">{selectedOrder.amount?.toLocaleString("vi-VN")} đ</span>
                  </div>
                </div>
              </div>

              {/* Phần C: Dữ liệu Sao kê Ngân hàng Auto-Bank (Nếu có) */}
              {selectedOrder.bank && selectedOrder.bank.transactionId ? (
                <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block mb-1">Dữ liệu đối soát tài chính ngân hàng</span>
                  <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600 font-mono mt-2">
                    <div>Mã giao dịch: <span className="font-bold text-slate-800">{selectedOrder.bank.transactionId}</span></div>
                    <div>Số tiền nhận: <span className="font-bold text-emerald-600">+{selectedOrder.bank.transferAmount?.toLocaleString("vi-VN")} đ</span></div>
                    <div className="col-span-2">Thời gian: {selectedOrder.bank.transactionDate}</div>
                    <div className="col-span-2 truncate">Nội dung chuyển: "{selectedOrder.bank.content}"</div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50/40 border border-amber-100 text-xs text-amber-700 font-medium">
                  ⚠️ Chưa có bản ghi khớp tiền tự động từ SePay cho đơn hàng này.
                </div>
              )}

              {/* Phần D: THANH ĐIỀU KHIỂN HÀNH ĐỘNG DÀNH CHO ADMIN */}
              <div className="border-t border-slate-100 pt-4 space-y-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Bảng điều khiển trạng thái (Admin Action)
                </span>

                {/* ================= VẬN CHUYỂN ================= */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600">
                    🚚 Trạng thái vận chuyển
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: "pending", label: "⏳ Chờ duyệt" },
                        { value: "processing", label: "🚚 Đang giao" },
                        { value: "completed", label: "✅ Hoàn thành" },
                        { value: "cancelled", label: "❌ Đã huỷ" },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.value}
                        disabled={updatingId !== null}
                        onClick={() => {
                          if (
                            item.value === "cancelled" &&
                            !confirm("Bạn có chắc chắn muốn huỷ đơn hàng này?")
                          ) {
                            return;
                          }

                          handleUpdateStatus(selectedOrder.id, {
                            status: item.value,
                          });
                        }}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors border
            ${selectedOrder.status === item.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ================= THANH TOÁN ================= */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600">
                    💳 Trạng thái thanh toán
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: "pending", label: "⏳ Chưa trả tiền / Nhập số tiền còn thiếu" },
                        { value: "paid", label: "💰 Đã thu tiền" },
                        { value: "refunded", label: "🔄 Đã hoàn tiền" },
                        { value: "failed", label: "❌ Thanh toán thất bại" },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.value}
                        disabled={updatingId !== null}
                        onClick={() => {
                          if (item.value === "pending") {
                            setShowDebtInput(true);
                            setDebtInput(selectedOrder.debtAmount || 0);
                            return;
                          }

                          handleUpdateStatus(selectedOrder.id, {
                            paymentStatus: item.value,
                          });
                        }}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors border
                          ${selectedOrder.paymentStatus === item.value
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                      >
                        {item.label}
                        {item.value === "pending" && selectedOrder.debtAmount > 0 && (
                          <div className="text-xs text-white-600 font-semibold mt-1">
                            ⚠️ Khách còn thiếu: {selectedOrder.debtAmount.toLocaleString("vi-VN")} đ
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {showDebtInput && (
                    <div className="mt-3 p-3 border border-orange-200 bg-orange-50 rounded-lg space-y-2">
                      <p className="text-xs font-semibold text-orange-700">
                        Nhập số tiền còn thiếu
                      </p>

                      <input
                        type="number"
                        value={debtInput}
                        onChange={(e) => setDebtInput(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDebtInput(false)}
                          className="px-3 py-1 text-xs border rounded-md"
                        >
                          Huỷ
                        </button>

                        <button
                          onClick={() => {
                            handleUpdateStatus(selectedOrder.id, {
                              paymentStatus: "pending",
                              debtAmount: debtInput,
                            });

                            setShowDebtInput(false);
                          }}
                          className="px-3 py-1 text-xs bg-orange-600 text-white rounded-md"
                        >
                          Xác nhận
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}