"use client";

import { ORDER_STATUS, PAYMENT_STATUS } from "@/core/features/order/order-status";
import { Order } from "@/core/services/data-base";

type PropsMiniTag = {
    status: { label: string; color: string; icon: string };
};

function MiniTag({ status }: PropsMiniTag) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-[2px] text-[11px] ${status.color}`}>
            <span>{status.icon}</span>
            <span>{status.label}</span>
        </span>
    );
}

export default function OrderHistoryItem({ order, index }: { order: Order, index: any }) {
    const createdAt = order.createdAt?.toDate?.()?.toLocaleString("vi-VN") ?? "N/A";

    return (
        <article className="rounded-2xl border bg-white p-4 sm:p-5 space-y-4">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-100 pb-3">
                <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">STT: {index + 1}</p>
                    <p className="text-sm font-semibold truncate">Mã đơn: {order.id}</p>
                    <p className="text-[11px] text-zinc-400">Ngày tạo: {createdAt}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <MiniTag status={ORDER_STATUS[order.status]} />
                </div>
            </div>

            {/* ITEMS */}
            <div className="space-y-3">
                {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <img
                                src={item.image}
                                className="h-10 w-10 sm:h-9 sm:w-9 rounded-lg object-cover bg-zinc-100"
                            />
                            <div className="min-w-0">
                                <p className="text-sm truncate">{item.name}</p>
                                <p className="text-[11px] text-zinc-400">{item.price} ×{item.quantity}</p>
                            </div>
                        </div>

                        <p className="text-sm font-medium whitespace-nowrap">
                            {(item.price! * item.quantity).toLocaleString()}₫
                        </p>
                    </div>
                ))}
            </div>

            {/* RECEIVER */}
            {/* <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs">
                {[
                    ["Họ tên", order.customer.name],
                    ["SĐT", order.customer.phone],
                    ["Email", order.customer.email],
                    ["Địa chỉ", order.customer.address],
                ].map(([label, value]) => (
                    <div key={label} className="flex gap-3">
                        <span className="text-zinc-400 shrink-0">{label}</span>
                        <span className="text-zinc-900 text-right break-words max-w-[70%]">
                            {value}
                        </span>
                    </div>
                ))}
            </div> */}
            <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs">
                {[
                    ["Họ tên", order.customer.name],
                    ["SĐT", order.customer.phone],
                    ["Email", order.customer.email],
                    ["Địa chỉ", order.customer.address],
                ].map(([label, value]) => (
                    <div key={label} className="flex items-start gap-3">

                        {/* LABEL: cố định width */}
                        <span className="bg-zinc-100 rounded-full w-12 px-1 shrink-0 text-zinc-400">
                            {label}
                        </span>

                        {/* VALUE: chiếm phần còn lại */}
                        <span className="flex-1 text-zinc-900 break-words">
                            {value}
                        </span>

                    </div>
                ))}
            </div>

            {/* FOOTER */}
            <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div className="text-[11px] text-zinc-500 space-y-1">
                    <div className="flex items-center gap-2">
                        <MiniTag status={PAYMENT_STATUS[order.paymentStatus]} />
                    </div>
                </div>

                <div className="text-left sm:text-right">
                    <p className="text-[11px] text-zinc-400">Total</p>
                    <p className="text-base font-semibold">
                        {order.amount.toLocaleString()}₫
                    </p>
                </div>

            </div>

        </article>
    );
}