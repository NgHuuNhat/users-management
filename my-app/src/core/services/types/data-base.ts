export interface Product {
    id: string
    name: string
    price: number
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
        bankTime: string,
        content: string,
    },
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