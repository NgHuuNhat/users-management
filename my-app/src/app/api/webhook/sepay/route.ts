import { NextResponse } from "next/server";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/core/services/firebase";
// import { db } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    // 1. Lấy dữ liệu SePay bắn về
    const body = await request.json();

    // Khử trùng: Kiểm tra xem transactionId này đã được lưu trước đó chưa
    const qDuplicate = query(
      collection(db, "webhook"), 
      where("transactionId", "==", Number(body.id))
    );
    const duplicateSnap = await getDocs(qDuplicate);
    if (!duplicateSnap.empty) {
      return NextResponse.json({ success: true, message: "Giao dịch đã tồn tại" }, { status: 200 });
    }

    // 2. Map dữ liệu từ SePay sang đúng Interface Webhook của bạn
    const webhookData = {
      id: Number(body.id),                               // ID của SePay
      gateway: body.gateway || "Unknown",
      transactionDate: body.transactionDate || new Date().toISOString(),
      accountNumber: body.accountNumber || "",
      subAccount: body.subAccount || null,
      code: body.code || null,
      content: body.content || "",
      transferType: body.transferType || "in",
      description: body.description || "",
      transferAmount: Number(body.transferAmount) || 0,
      referenceCode: body.referenceCode || "",
      accumulated: Number(body.accumulated) || 0,
      transactionId: Number(body.id),                    // Thường dùng chung với ID giao dịch
      orderId: null                                      // Mặc định ban đầu chưa khớp đơn
    };

    // 3. LOGIC TỰ ĐỘNG KHỚP ĐƠN HÀNG (QUAN TRỌNG)
    // Giả sử nội dung chuyển khoản của bạn có chứa Mã đơn hàng dạng: "DH12345" hoặc "12345"
    // Ta sẽ dùng Regex để trích xuất mã đơn hàng ra từ trường body.content
    const content = body.content || "";
    const orderIdMatch = content.match(/DH\d+|ORDER_\d+/i); // Tìm chữ DH... hoặc ORDER_... tùy bạn quy định
    
    if (orderIdMatch) {
      const extractedOrderId = orderIdMatch[0]; // Ví dụ lấy được "DH12345"

      // Tìm đơn hàng trong collection 'order' có ID trùng với mã vừa trích xuất
      const orderRef = doc(db, "order", extractedOrderId);
      
      // Nếu bạn dùng mã tự sinh của Firebase, có thể tìm theo trường orderCode nếu có, 
      // Hoặc quét query thẳng theo ID document:
      try {
        // Gắn orderId vào Webhook để báo hiệu là "Đã khớp tự động"
        webhookData.orderId = extractedOrderId;

        // Cập nhật trạng thái đơn hàng sang "Đã thanh toán" (paid) luôn
        await updateDoc(orderRef, {
          paymentStatus: "paid",
          status: "processing", // Chuyển sang trạng thái đang xử lý đơn luôn
          "bank.transferAmount": webhookData.transferAmount,
          "bank.transactionId": webhookData.transactionId,
          "bank.bankTime": webhookData.transactionDate,
          "bank.content": webhookData.content,
        });
        console.log(`[SePay] Tự động kích hoạt thành công đơn hàng: ${extractedOrderId}`);
      } catch (e) {
        console.log(`[SePay] Tìm thấy mã đơn nhưng không tồn tại Document ID này trong DB: ${extractedOrderId}`);
      }
    }

    // 4. Lưu lịch sử Webhook này vào Firestore bảng 'webhook'
    await addDoc(collection(db, "webhook"), webhookData);

    // SePay yêu cầu phản hồi lại trạng thái thành công (200) để họ không bắn lại nữa
    return NextResponse.json({ success: true, message: "Ghi nhận Webhook thành công" }, { status: 200 });

  } catch (error: any) {
    console.error("Lỗi xử lý Webhook SePay: ", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}