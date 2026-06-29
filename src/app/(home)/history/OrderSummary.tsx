"use client";

import { Order } from "@/core/services/data-base";

type Props = {
    orders: Order[];
};

export default function OrderSummary({ orders }: Props) {
    const totalOrders = orders.length;

    const totalAmount = orders.reduce(
        (sum, o) => sum + (o.amount ?? 0),
        0
    );

    if (!totalOrders) return null;

    return (
        <div className="rounded-3xl border bg-white p-6 space-y-5">
            <div>
                <p className="text-sm text-zinc-500">Tổng đơn đã mua</p>
                <p className="text-3xl font-semibold">{totalOrders}</p>
            </div>

            <div className="border-t pt-4">
                <p className="text-sm text-zinc-500">Tổng tiền đã mua</p>
                <p className="text-xl font-semibold">
                    {totalAmount.toLocaleString()}₫
                </p>
            </div>
        </div>
    );
}