import { NextRequest, NextResponse } from "next/server";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/core/services/firebase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("========== SePay Webhook Called ==========");
    console.log("Payload:", body);

    // 1. Lấy nội dung chuyển khoản: Ưu tiên 'content' (SePay Prod), fallback về 'transferContent' (Local test)
    const content = body.content || body.transferContent || "";

    // 2. Tách mã đơn hàng bằng Regex linh hoạt (bỏ qua khoảng trắng/gạch dưới, không phân biệt hoa thường)
    const match = content.match(/ORDER_?(\w+)/i);

    if (!match) {
      console.log("❌ Không tìm thấy mã đơn hàng trong nội dung:", content);
      return NextResponse.json({ success: false, message: "Invalid order code" });
    }

    const orderId = match[1];
    console.log("✅ Order ID bóc tách được:", orderId);

    // 3. Lọc Giao dịch: Đảm bảo đây là giao dịch tiền vào (transferType = "in")
    // Tránh trường hợp tiền ra (out) hệ thống cũng nhầm là thanh toán đơn hàng
    if (body.transferType && body.transferType !== "in") {
      return NextResponse.json({ success: true, message: "Ignored outgoing transaction" });
    }

    // 4. Lấy Mã giao dịch (Transaction ID)
    // Ưu tiên referenceCode (Mã của VietinBank) -> id (Của SePay) -> transactionId (Local Test)
    const txId = body.referenceCode || String(body.id) || body.transactionId;

    // 5. Cập nhật vào Firestore
    await updateDoc(
      doc(db, "orders", orderId),
      {
        status: "paid",
        paidAt: Date.now(),
        transactionId: txId,
        amountReceived: body.transferAmount, // Rất nên lưu lại số tiền thực tế khách đã chuyển
        gateway: body.gateway || "Manual",   // Lưu lại ngân hàng/cổng thanh toán (VietinBank)
        rawContent: content,                 // 🌟 LƯU THÊM: Nội dung chuyển khoản gốc từ ngân hàng
      }
    );

    console.log("✅ Đã cập nhật đơn hàng thành công!");
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("❌ Lỗi Webhook:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}