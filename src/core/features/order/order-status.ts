export const ORDER_STATUS = {
    pending: {
        label: "Chờ xác nhận",
        color: "text-amber-600",
        icon: "⏳",
    },
    processing: {
        label: "Đang xử lý / Giao",
        color: "text-blue-600",
        icon: "⚙️",
    },
    completed: {
        label: "Đã giao thành công",
        color: "text-emerald-600",
        icon: "✅",
    },
    cancelled: {
        label: "Đã hủy",
        color: "text-red-600",
        icon: "❌",
    },
} as const;

export const PAYMENT_STATUS = {
    pending: {
        label: "Chưa thanh toán",
        color: "text-amber-600",
        icon: "⚠️",
    },
    paid: {
        label: "Đã thanh toán",
        color: "text-emerald-600",
        icon: "✅",
    },
    failed: {
        label: "Thanh toán thất bại",
        color: "text-red-600",
        icon: "❌",
    },
    refunded: {
        label: "Đã hoàn tiền",
        color: "text-zinc-500",
        icon: "↩️",
    },
} as const;