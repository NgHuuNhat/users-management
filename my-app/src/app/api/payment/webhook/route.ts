import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/core/services/firebase";
import crypto from "crypto"; // Thư viện mã hóa có sẵn của Node.js

const SEPAY_WEBHOOK_SECRET = process.env.SEPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    // 1. Lấy chữ ký từ Header do SePay gửi sang
    const sepaySignature = req.headers.get("x-sepay-signature");

    // 2. Đọc toàn bộ Body dưới dạng TEXT thuần (Bắt buộc để tính toán HMAC)
    const rawBody = await req.text();

    console.log("========== SePay HMAC Webhook Called ==========");

    // 🛡️ BẢO MẬT: Kiểm tra HMAC-SHA256 (Chỉ chạy khi đã cấu hình SECRET)
    if (SEPAY_WEBHOOK_SECRET) {
      if (!sepaySignature) {
        console.error("❌ Cảnh báo: Request thiếu chữ ký bảo mật!");
        return NextResponse.json({ success: false, message: "Missing signature" }, { status: 401 });
      }

      // Tự tính toán lại chữ ký bằng Secret Key của bạn
      const computedSignature = crypto
        .createHmac("sha256", SEPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex"); // SePay trả về chuỗi mã hóa dạng Hex

      // So khớp chữ ký của hệ thống và chữ ký SePay gửi sang
      if (sepaySignature !== computedSignature) {
        console.error("❌ Cảnh báo: Chữ ký không trùng khớp! Payload có thể đã bị giả mạo.");
        return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
      }
      console.log("🔒 Xác thực HMAC thành công! Dữ liệu an toàn.");
    }

    // 3. Sau khi xác thực an toàn, tiến hành parse TEXT thành JSON để xử lý tiếp
    const body = JSON.parse(rawBody);
    const content = body.content || body.transferContent || "";

    // Tách mã đơn hàng
    const match = content.match(/ORDER_?(\w+)/i);
    if (!match) {
      return NextResponse.json({ success: false, message: "Invalid order code" });
    }
    const orderId = match[1];

    // Lọc giao dịch tiền vào
    if (body.transferType && body.transferType !== "in") {
      return NextResponse.json({ success: true, message: "Ignored outgoing transaction" });
    }

    // Kiểm tra đơn hàng trong Firestore
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json({ success: false, message: "Order not found" });
    }

    const orderData = orderSnap.data();
    const transferAmount = Number(body.transferAmount);

    // Kiểm tra số tiền khách chuyển
    if (transferAmount < orderData.totalPrice) {
      console.log(`⚠️ Đơn ${orderId} thiếu tiền. Cần: ${orderData.totalPrice}, Nhận: ${transferAmount}`);
      return NextResponse.json({ success: true, message: "Underpaid" });
    }

    const txId = body.referenceCode || String(body.id) || body.transactionId;

    // Tiến hành gạch nợ đơn hàng
    await updateDoc(orderRef, {
      status: "paid",
      paidAt: Date.now(),
      transactionId: txId,
      amountReceived: transferAmount,
      gateway: body.gateway || "Manual",
      rawContent: content,
    });

    return NextResponse.json({ success: true });
    
  } catch (err: any) {
    console.error("❌ Lỗi hệ thống:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}