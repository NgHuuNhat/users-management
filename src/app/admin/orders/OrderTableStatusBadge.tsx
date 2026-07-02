import { CreditCard, Truck } from "lucide-react";
import React from "react";

export const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    pending: "bg-slate-100 text-slate-700 border-slate-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  const labels: Record<string, string> = {
    pending: "Chờ duyệt",
    processing: "Đang xử lý/giao",
    completed: "Đã hoàn thành",
    cancelled: "Đã hủy"
  };
  return (
    <span className={`flex gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border ${badges[status]}`}>
      <Truck size={14} className="text-slate-400 shrink-0" />{labels[status]}
    </span>
  );
};

export const getPaymentBadge = (status: string) => {
  const badges: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    refunded: "bg-purple-50 text-purple-700 border-purple-200",
  };
  const labels: Record<string, string> = {
    pending: "Chưa trả tiền",
    paid: "Đã thu tiền",
    failed: "Thanh toán thất bại",
    refunded: "Đã hoàn tiền"
  };
  return (
    <span className={`flex gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border ${badges[status]}`}>
      <CreditCard size={14} className="text-slate-400 shrink-0" />{labels[status]}
    </span>
  );
};