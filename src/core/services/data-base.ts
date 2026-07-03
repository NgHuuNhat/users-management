// export interface Product {
//     id: string                      // PK
//     name: string                    // Tên sản phẩm
//     price: number | null            // Giá bán
//     image: string                   // Ảnh sản phẩm
//     description: string             // Mô tả sản phẩm
//     [key: string]: any              // Thuộc tính mở rộng
//     createdAt: string               // Thời điểm tạo sản phẩm
// }

// export interface OrderItem {
//     productId: Product['id']        // FK -> Product.id
//     quantity: number                // Số lượng mua
//     name: Product['name']           // Snapshot tên sản phẩm tại thời điểm mua
//     price: Product['price']         // Snapshot giá tại thời điểm mua
//     image: Product['image']         // Snapshot ảnh tại thời điểm mua
//     [key: string]: any              // Thuộc tính mở rộng
// }

export interface Category {
    id: string;
    name: string;
    image: string;
}

export interface Product {
    id: string;                       // Mã định danh duy nhất của sản phẩm
    categoryId: string;               // Thuộc danh mục nào
    name: string;                     // Tên sản phẩm (Ví dụ: "Áo Polo Classic - Đen - Size L")
    price: number;                    // Giá bán thực tế
    initialQuantity?: number;          // Số lượng nhập kho ban đầu
    quantity: number;                 // Số lượng tồn kho hiện tại
    image: string;                    // Ảnh đại diện chính
    description: string;              // Mô tả sản phẩm
    attributes: Record<string, string>; // Object chứa các Key-Value tự do (VD: { "Màu sắc": "Đen", "Size": "L", "Chất liệu": "Cotton" })
    createdAt: string;                // Thời điểm tạo
}

export interface OrderItem {
    productId: Product['id'];         // FK -> ID của sản phẩm đại diện
    quantity: number;                 // Số lượng mua của biến thể này
    name: Product['name'];            // Snapshot - Tên sản phẩm đại diện tại thời điểm mua
    price: Product['price'];
    image: Product['image'];          // Snapshot - Ảnh đại diện sản phẩm lúc mua
    propertiesDetail?: string;        // Snapshot - Lưu nhanh cấu hình lúc mua (Ví dụ: "Màu: Vàng, Size: XL") để xem lại hóa đơn
}

export interface Order {
    id: string                      // PK
    items: OrderItem[]              // Danh sách sản phẩm
    amount: number                  // Tổng tiền đơn hàng
    status: 'pending' | 'processing' | 'completed' | 'cancelled' // Trạng thái đơn hàng
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'     // Trạng thái thanh toán
    customer: {                     // Thông tin khách hàng
        name: string                // Họ tên
        phone: string               // Số điện thoại
        address: string             // Địa chỉ
        email: string               // Email
    }
    bank: {                         // Thông tin chuyển khoản
        transferAmount: number      // Số tiền chuyển khoản
        transactionId: number       // ID giao dịch ngân hàng
        transactionDate: string     // Thời gian giao dịch
        content: string             // Nội dung chuyển khoản
    }
    createdAt: any                  // Thời điểm tạo đơn
    debtAmount?: number             // Số tiền còn nợ
    cashReceivedManual?: number     // Tiền mặt đã nhận
    historyDebtAmount?: number      // Tổng số tiền từng nợ
}

export interface User {
    id: string                      // PK
    email: string                   // Email
    name: string                    // Họ tên
    phone: string                   // Số điện thoại
    address: string                 // Địa chỉ
    role: 'user' | 'admin'          // Vai trò
    isActive: boolean               // Trạng thái hoạt động
}

export interface Webhook {
    id: number                      // PK
    gateway: string                 // Cổng thanh toán
    transactionDate: string         // Thời gian giao dịch
    accountNumber: string           // Số tài khoản
    subAccount: any                 // Tài khoản phụ
    code: any                       // Mã giao dịch từ gateway
    content: string                 // Nội dung chuyển khoản
    transferType: string            // Loại giao dịch (IN/OUT)
    description: string             // Mô tả giao dịch
    transferAmount: number          // Số tiền giao dịch
    referenceCode: string           // Mã tham chiếu
    accumulated: number             // Số dư sau giao dịch
    transactionId: number           // ID giao dịch ngân hàng
    orderId?: Order['id']           // FK -> Order.id
}