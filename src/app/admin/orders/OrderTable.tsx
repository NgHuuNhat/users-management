import React from "react";
import { Order } from "@/core/services/data-base";
import { formatDate } from "@/core/shared/format-date";
import { getStatusBadge, getPaymentBadge } from "./OrderTableStatusBadge";
import { Truck, CreditCard } from "lucide-react";
import { formatShortId } from "@/core/shared/format-short-id";

interface OrderTableProps {
    filteredOrders: Order[];
    filterStatus: string;
    setFilterStatus: (val: string) => void;
    filterPaymentStatus: string;
    setFilterPaymentStatus: (val: string) => void;
    statusCount: any;
    statusLabel: any;
    paymentStatusCount: any;
    paymentLabel: any;
    setSelectedOrder: (order: Order) => void;
}

export default function OrderTable({
    filteredOrders, filterStatus, setFilterStatus, filterPaymentStatus, setFilterPaymentStatus,
    statusCount, statusLabel, paymentStatusCount, paymentLabel, setSelectedOrder
}: OrderTableProps) {

    // Component phụ để render bộ lọc gọn gàng hơn
    const FilterSection = ({ icon: Icon, title, options, current, setter, counts, labels }: any) => (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Title với Icon */}
            <div className="flex items-center gap-2 text-slate-400 w-28 shrink-0">
                <Icon size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
            </div>

            {/* Nút lọc */}
            <div className="flex flex-wrap gap-1">
                {options.map((st: string) => (
                    <button
                        key={st}
                        onClick={() => setter(st)}
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header & Filter Section */}
            <div className="p-5 border-b border-slate-100 md:flex md:items-center md:justify-between gap-6">
                {/* Phần Tiêu đề - Bên trái */}
                <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-bold text-slate-800">Quản lý đơn hàng</h3>
                    <p className="text-sm text-slate-500">Tổng quan tình trạng vận chuyển và thanh toán</p>
                </div>

                {/* Phần Bộ lọc - Bên phải */}
                <div className="flex flex-col gap-3">
                    <FilterSection
                        icon={Truck}
                        title="Vận chuyển"
                        options={["all", "pending", "processing", "completed", "cancelled"]}
                        current={filterStatus}
                        setter={setFilterStatus}
                        counts={statusCount}
                        labels={statusLabel}
                    />
                    <FilterSection
                        icon={CreditCard}
                        title="Thanh toán"
                        options={["all", "pending", "paid", "failed", "refunded"]}
                        current={filterPaymentStatus}
                        setter={setFilterPaymentStatus}
                        counts={paymentStatusCount}
                        labels={paymentLabel}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">Không có đơn hàng nào khớp với bộ lọc.</div>
                ) : (
                    <>
                        {/* Table View (Hidden on mobile) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="py-4 px-6">Thông tin</th>
                                        <th className="py-4 px-6">Khách hàng</th>
                                        <th className="py-4 px-6 text-right">Số tiền hoá đơn</th>
                                        <th className="py-4 px-6 text-center">Trạng thái</th>
                                        <th className="py-4 px-6 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-1.5">
                                                    {/* Khối định danh: Mã đơn & Mã giao dịch */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Mã đơn:</span>
                                                            <span className="font-mono text-m font-bold text-slate-800">{formatShortId(order.id)}</span>
                                                        </div>

                                                        <div className="h-3 w-[1px] bg-slate-200"></div> {/* Thanh kẻ đứng phân cách */}

                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Mã GD:</span>
                                                            <span className="font-mono text-m font-bold text-slate-800 bg-slate-100 px-1 rounded">
                                                                {order.bank?.transactionId || "---"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Ngày tạo - Riêng ở hàng dưới */}
                                                    <div className="text-[12px] text-slate-400 font-medium">
                                                        {formatDate(order.createdAt)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 min-w-[200px]">
                                                <div className="flex flex-col gap-1">
                                                    {/* Tên khách hàng */}
                                                    {/* <div className="font-bold text-slate-800 text-sm">{order.customer?.name || "Khách ẩn danh"}</div> */}
                                                    {/* Tên khách hàng */}
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <span className="text-slate-400">Tên:</span>
                                                        <span className="text-slate-600 font-bold">{order.customer?.name || "Khách ẩn danh"}</span>
                                                    </div>

                                                    {/* Số điện thoại */}
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <span className="text-slate-400">SĐT:</span>
                                                        <span className="text-slate-600 font-bold">{order.customer?.phone || "N/A"}</span>
                                                    </div>

                                                    {/* Email */}
                                                    {order.customer?.email && (
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <span className="text-slate-400">Mail:</span>
                                                            <span className="text-slate-600">{order.customer.email}</span>
                                                        </div>
                                                    )}

                                                    {/* Địa chỉ - Dùng line-clamp để giới hạn 1 dòng nếu quá dài */}
                                                    <div className="flex items-start gap-1 text-xs">
                                                        <span className="text-slate-400">Địa chỉ:</span>
                                                        <span className="text-slate-500">{order.customer?.address || "Chưa cập nhật"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right font-bold text-blue-600">
                                                {order.amount?.toLocaleString("vi-VN")} đ
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex flex-col gap-1 items-center">
                                                    <div className="flex gap-1">
                                                        {/* Badge Vận chuyển */}
                                                        {getStatusBadge(order.status)}

                                                        {/* Badge Thanh toán */}
                                                        {getPaymentBadge(order.paymentStatus)}
                                                    </div>

                                                    {/* Số tiền nợ (Luôn hiện nếu trạng thái thanh toán là 'pending') */}
                                                    {order.paymentStatus === 'pending' && (
                                                        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border mt-1 whitespace-nowrap ${(order.debtAmount ?? 0) > 0
                                                            ? "text-orange-600 bg-orange-50 border-orange-100"
                                                            : "text-slate-400 bg-slate-50 border-slate-100"
                                                            }`}>
                                                            Đang nợ: {(order.debtAmount ?? 0).toLocaleString("vi-VN")}đ
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button onClick={() => setSelectedOrder(order)} className="p-1 px-2 cursor-pointer bg-gray-100 rounded-2xl text-blue-600 font-semibold text-xs hover:text-blue-800">
                                                    Xem →
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Card View (Visible on mobile only) */}
                        <div className="md:hidden p-4 space-y-3 bg-slate-50">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">

                                    {/* Header: Mã đơn, Mã GD & Ngày */}
                                    <div className="flex flex-col gap-2 mb-3">
                                        <div className="flex justify-between items-center gap-2">
                                            {/* Nhóm Mã */}
                                            <div className="flex flex-col gap-1 overflow-hidden">
                                                {/* Hàng 1: Mã đơn */}
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase w-10">Mã đơn:</span>
                                                    <span className="font-mono text-xs font-bold text-slate-800 truncate">{order.id}</span>
                                                </div>

                                                {/* Hàng 2: Mã GD */}
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase w-10">Mã GD:</span>
                                                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1 rounded truncate">
                                                        {order.bank?.transactionId || "---"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Nút Xem */}
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold shrink-0"
                                            >
                                                Xem →
                                            </button>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            {formatDate(order.createdAt)}
                                        </div>
                                    </div>

                                    {/* Thông tin khách hàng */}
                                    <div className="mb-4 space-y-1 border-t pt-3">
                                        <div className="grid grid-cols-1 gap-0.5 text-[11px]">
                                            <div className="flex items-center text-slate-600">
                                                <span className="w-12 text-slate-400">Tên:</span>
                                                <span className="font-bold">{order.customer?.name || "Khách ẩn danh"}</span>
                                            </div>
                                            <div className="flex items-center text-slate-600">
                                                <span className="w-12 text-slate-400">SĐT:</span>
                                                <span className="font-bold">{order.customer?.phone || "Chưa cập nhật"}</span>
                                            </div>
                                            <div className="flex items-start text-slate-600">
                                                <span className="w-12 text-slate-400">Email:</span>
                                                <span className="text-slate-500">{order.customer?.email || "Chưa cập nhật"}</span>
                                            </div>
                                            <div className="flex items-start text-slate-600">
                                                <span className="w-12 text-slate-400">ĐC:</span>
                                                <span className="text-slate-500">{order.customer?.address || "Chưa cập nhật"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer: Số tiền & Trạng thái */}
                                    <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-900">{order.amount?.toLocaleString("vi-VN")} đ</span>
                                            <div className="flex gap-1">
                                                {getStatusBadge(order.status)}
                                                {getPaymentBadge(order.paymentStatus)}
                                            </div>
                                        </div>
                                        {/* Số tiền nợ */}
                                        {order.paymentStatus === 'pending' && (
                                            <div className={`text-[10px] font-bold px-2 py-1 rounded border text-center ${(order.debtAmount ?? 0) > 0
                                                ? "text-orange-600 bg-orange-50 border-orange-100"
                                                : "text-slate-400 bg-slate-50 border-slate-100"
                                                }`}>
                                                Đang nợ: {(order.debtAmount ?? 0).toLocaleString("vi-VN")} đ
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </>
                )}
            </div>
        </div>
    );
}