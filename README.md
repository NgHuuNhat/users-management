# Chức năng nổi bật

### 1. Quy trình mua hàng tối ưu chuyển đổi
- Toàn bộ thao tác mua hàng diễn ra trên một màn hình, không cần chuyển trang.
- Thêm vào giỏ hàng, nhập thông tin, xác minh OTP và thanh toán được thực hiện liên tục với ít thao tác nhất.
- Giúp rút ngắn quy trình đặt hàng và tăng tỷ lệ chuyển đổi.

### 2. Tra cứu đơn hàng an toàn
- Không cần đăng nhập hoặc tạo tài khoản.
- Khách hàng tra cứu đơn hàng bằng email và mã OTP.
- Đảm bảo chỉ chủ sở hữu mới có thể xem thông tin đơn hàng.

### 3. Thanh toán linh hoạt, đối soát tự động
- Hỗ trợ thanh toán tiền mặt hoặc chuyển khoản QR.
- Tự động đối soát giao dịch ngân hàng và khớp đúng đơn hàng theo thời gian thực.
- Cập nhật trạng thái thanh toán mà không cần thao tác thủ công.

### 4. Quản lý tồn kho theo thời gian thực
- Tự động tăng hoặc giảm số lượng tồn kho theo trạng thái đơn hàng.
- Đồng bộ tồn kho khi đặt hàng, hủy đơn, hoàn đơn hoặc cập nhật trạng thái giao hàng.
- Giảm sai lệch tồn kho và hạn chế bán vượt số lượng.

### 5. Cấu trúc sản phẩm linh hoạt
- Cho phép thêm không giới hạn các thuộc tính sản phẩm (ví dụ: Màu sắc, Size, Chất liệu, Dung lượng...).
- Phù hợp với nhiều loại sản phẩm khác nhau mà không cần thay đổi cấu trúc cơ sở dữ liệu.
- Dễ mở rộng khi phát sinh các yêu cầu mới.

Khách hàng
    │
    ▼
Product
    │
    ▼
OrderItem (Snapshot)
    │
    ▼
Order
    │
    ├───────────────┐
    ▼               ▼
Tiền mặt       QR Banking
                    │
                    ▼
                Webhook
                    │
                    ▼
         paymentStatus = paid
                    │
                    ▼
            Admin xử lý đơn
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
     Hoàn thành             Hủy đơn
         │                     │
         └────── Cập nhật Quantity ──────┘