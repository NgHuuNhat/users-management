"use client";

import { Order } from "@/core/services/data-base";

type Props = {
    order: Order;
};

export default function OrderHistoryItem({ order }: Props) {
    const createdAt =
        order.createdAt?.toDate?.()?.toLocaleString("vi-VN") ?? "N/A";

    return (
        <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">

            {/* HEADER */}
            <header className="flex flex-col gap-3 border-b border-zinc-100 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5">

                <div className="min-w-0">
                    <h2 className="truncate text-lg sm:text-xl font-semibold tracking-tight">
                        Mã đơn: {order.id}
                    </h2>

                    <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                        Ngày đặt: {createdAt}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs sm:text-sm font-medium text-zinc-700">
                        {order.paymentStatus}
                    </span>

                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs sm:text-sm font-medium text-zinc-700">
                        {order.status}
                    </span>
                </div>
            </header>

            <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">

                {/* CUSTOMER */}
                <section className="rounded-2xl bg-zinc-50 p-4 sm:rounded-3xl sm:p-5">

                    <h3 className="mb-3 text-sm sm:text-base font-semibold">
                        Thông tin người nhận
                    </h3>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 text-sm">
                        <Row label="Tên" value={order.customer.name} />
                        <Row label="SĐT" value={order.customer.phone} />
                        <Row label="Email" value={order.customer.email} />
                        <Row label="Địa chỉ" value={order.customer.address} />
                    </div>
                </section>

                {/* PRODUCTS */}
                <section className="rounded-2xl bg-zinc-50 p-4 sm:rounded-3xl sm:p-5">

                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm sm:text-base font-semibold">
                            Sản phẩm
                        </h3>

                        <span className="rounded-full bg-white px-2 py-1 text-xs text-zinc-500">
                            {order.items.length}
                        </span>
                    </div>

                    <div className="space-y-2">
                        {order.items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2"
                            >
                                {/* LEFT */}
                                <div className="flex min-w-0 flex-1 items-center gap-3">

                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg object-cover bg-zinc-100"
                                    />

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-zinc-900">
                                            {item.name}
                                        </p>

                                        <p className="text-xs text-zinc-400">
                                            ×{item.quantity}
                                        </p>
                                    </div>
                                </div>

                                {/* PRICE */}
                                <p className="shrink-0 text-sm font-semibold whitespace-nowrap">
                                    {(item.price! * item.quantity).toLocaleString()}₫
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* TOTAL */}
                    <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 sm:mt-5 sm:pt-5">

                        <span className="text-sm text-zinc-500">
                            Tổng
                        </span>

                        <span className="text-xl sm:text-2xl font-semibold tracking-tight">
                            {order.amount.toLocaleString()}₫
                        </span>
                    </div>
                </section>

            </div>
        </article>
    );
}

/* ROW */
function Row({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2">
            <span className="text-xs sm:text-sm text-zinc-500">
                {label}
            </span>

            <span className="max-w-[60%] text-right text-xs sm:text-sm font-medium text-zinc-900 break-words">
                {value}
            </span>
        </div>
    );
}