interface WebhookRequest {
    gateway: string
    transactionDate: string
    accountNumber: string
    subAccount: any
    code: any
    content: string
    transferType: string
    description: string
    transferAmount: number
    referenceCode: string
    accumulated: number
    id: number
}