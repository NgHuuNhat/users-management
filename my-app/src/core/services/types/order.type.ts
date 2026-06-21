interface OrderDatabase {
    id: number
    amount: number;
    amountReceived: number;
    bankTime: string;
    createdAt: Date | null;
    items: unknown[];
    error: {
        step: string;
        message: string;
        body: any;
        at: Date
    } | null;
    paidAt: Date | null;
    status: 'pending' | 'paid' | 'failed';
    transactionId: string;
}