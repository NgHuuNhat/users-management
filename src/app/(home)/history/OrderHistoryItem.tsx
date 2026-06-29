"use client";

import { Order } from "@/core/services/data-base";

type Props = {
    order: Order;
};

export default function OrderHistoryItem({ order }: Props) {
    const createdAt =
        order.createdAt?.toDate?.()?.toLocaleString("vi-VN") ?? "N/A";

    return (
        <article className="overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">

            {/* HEADER */}
            <header className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-5">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                        Mã đơn: {order.id}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                        Ngày đặt: {createdAt}
                    </p>
                </div>

                <div className="flex gap-2">
                    <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
                        Thanh toán: {order.paymentStatus}
                    </span>

                    <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
                        Vận chuyển: {order.status}
                    </span>
                </div>
            </header>

            <div className="space-y-5 p-6">

                {/* CUSTOMER */}
                <section className="rounded-3xl bg-zinc-50 p-5">
                    <h3 className="mb-4 text-base font-semibold">
                        Thông tin người nhận
                    </h3>

                    <div className="grid gap-3 text-sm md:grid-cols-2">
                        <Row label="Tên" value={order.customer.name} />
                        <Row label="SĐT" value={order.customer.phone} />
                        <Row label="Email" value={order.customer.email} />
                        <Row label="Địa chỉ" value={order.customer.address} />
                    </div>
                </section>

                {/* PRODUCTS */}
                <section className="rounded-3xl bg-zinc-50 p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-base font-semibold">
                            Sản phẩm
                        </h3>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500">
                            {order.items.length} món
                        </span>
                    </div>

                    <div className="space-y-2">
                        {order.items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-2xl bg-white px-4 py-4"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {item.name}
                                    </p>

                                    <p className="text-xs text-zinc-500">
                                        × {item.quantity}
                                    </p>
                                </div>

                                <p className="ml-4 shrink-0 text-sm font-semibold">
                                    {(item.price! * item.quantity).toLocaleString()}₫
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* TOTAL */}
                    <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-5">
                        <span className="text-sm text-zinc-500">
                            Tổng thanh toán
                        </span>

                        <span className="text-2xl font-semibold tracking-tight">
                            {order.amount.toLocaleString()}₫
                        </span>
                    </div>
                </section>

            </div>
        </article>
    );
}

function Row({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
            <span className="text-sm text-zinc-500">
                {label}
            </span>

            <span className="max-w-[60%] text-right text-sm font-medium break-words text-zinc-900">
                {value}
            </span>
        </div>
    );
}