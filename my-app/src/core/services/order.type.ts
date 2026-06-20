export interface Order {
    id: number
    amount: number
    status: "pending" | "completed" | "cancelled"
    items: []
    paidAt: string | null
    transactionId: string | null
    createdAt: string
    updatedAt: string
}