interface OrderDatabase {
    id: string;
    amount: number;
    amountReceived: number;
    bankTime: string;
    createdAt: Date | null;
    error: {
        step: string;
        message: string;
        body: any;
        at: Date
    } | null;
    items: unknown[];
    paidAt: Date | null;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    transactionId: string;
    orderCode: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    customer: {
        name: string;
        phone: string;
        address: string;
    }
}