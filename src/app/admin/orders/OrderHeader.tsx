import React from "react";

interface OrderHeaderProps {
  metrics: { total: number; pending: number; processing: number; completed: number };
  moneyMetrics: { totalOrderAmount: number; totalSePayReceived: number; totalCashReceived: number; totalDebt: number };
}

export default function OrderHeader({ metrics, moneyMetrics }: OrderHeaderProps) {
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

      {/* KHỐI THỐNG KÊ TIỀN */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs text-slate-400 uppercase">Tổng số tiền hoá đơn (Order)</p>
          <h4 className="text-lg font-bold text-blue-600">
            {moneyMetrics.totalOrderAmount.toLocaleString("vi-VN")} đ
          </h4>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs text-slate-400 uppercase">Tổng Nhận chuyển khoản</p>
          <h4 className="text-lg font-bold text-emerald-600">
            {moneyMetrics.totalSePayReceived.toLocaleString("vi-VN")} đ
          </h4>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs text-slate-400 uppercase">Tổng Nhận Tiền mặt</p>
          <h4 className="text-lg font-bold text-purple-600">
            {moneyMetrics.totalCashReceived.toLocaleString("vi-VN")} đ
          </h4>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs text-slate-400 uppercase">Tổng đang nợ</p>
          <h4 className="text-lg font-bold text-orange-600">
            {moneyMetrics.totalDebt.toLocaleString("vi-VN")} đ
          </h4>
        </div>
      </div>
    </div>
  );
}