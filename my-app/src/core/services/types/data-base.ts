export interface Product {
    id: string
    name: string
    price: number | null
    image: string
    description: string
    [key: string]: any
}

export interface OrderItem {
    productId: Product['id'] // FK -> Product.id
    quantity: number
    // lưu giá product tại thời điểm mua -> sau upudate product thì orderItem ko bị ảnh hưởng.
    name: Product['name']
    price: Product['price']
    image: Product['image']
    [key: string]: any
}

export interface Order {
    id: string
    items: OrderItem[]
    amount: number
    status: 'pending' | 'processing' | 'completed' | 'cancelled'
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
    customer: {
        name: string
        phone: string
        address: string
        email: string
    }
    bank: {
        transferAmount: number,
        transactionId: number,
        transactionDate: string,
        content: string,
    },
    createdAt: any,
    debtAmount?: any; // số tiền còn nợ number
    cashReceivedManual?: number; //số tiền mặt đã nhận
    historyDebtAmount?: number;  // nợ từng có
}

export interface User {
    id: string
    email: string
    name: string
    phone: string
    address: string
    role: 'user' | 'admin'
    isActive: boolean
}

export interface Webhook {
    id: number
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
    transactionId: number
    orderId?: Order['id'] // FK -> Order.id
}