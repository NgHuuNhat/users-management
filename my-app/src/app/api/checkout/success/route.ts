import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/core/services/firebase';
import crypto from 'crypto';

const SECRET = process.env.SEPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    console.log("========== SePay HMAC Webhook Called ==========");
    
    // 1. Lấy chữ ký từ header do SePay gửi sang
    const signature = req.headers.get('x-sepay-signature') || '';

    // 2. [QUAN TRỌNG] Đọc raw body an toàn bằng req.text() để không làm hỏng dữ liệu khi băm
    const rawBody = await req.text();

    // 3. Xác thực chữ ký HMAC-SHA256
    if (SECRET) {
      if (!signature) {
         console.error("❌ Request thiếu chữ ký!");
         return NextResponse.json({ success: false, reason: 'missing signature' }, { status: 401 });
      }

      const hash = crypto
        .createHmac('sha256', SECRET)
        .update(rawBody)
        .digest('hex');

      const cleanSignature = signature.replace('sha256=', '');

      if (cleanSignature !== hash) {
        console.error('❌ Chữ ký không khớp! Có thể dữ liệu đã bị can thiệp.');
        return NextResponse.json(
          { success: false, reason: 'invalid signature' },
          { status: 401 }
        );
      }
      console.log("🔒 Xác thực chữ ký thành công!");
    }

    // 4. Parse dữ liệu sau khi đã an toàn
    const body = JSON.parse(rawBody);
    const content = body.content || body.transferContent || '';

    // 5. [ĐÃ FIX] Tìm Order ID bằng Regex chuẩn
    const match = content.match(/ORDER_?(\w+)/i);

    if (!match) {
      console.log("⚠️ Không tìm thấy mã đơn hàng trong nội dung CK.");
      return NextResponse.json({ success: false, reason: 'no orderId' });
    }

    const orderId = match[1];

    // Lọc bỏ giao dịch tiền ra (nếu có)
    if (body.transferType && body.transferType !== "in") {
      return NextResponse.json({ success: true, message: "Ignored outgoing transaction" });
    }

    // 6. Xử lý logic Firestore
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      console.log(`⚠️ Đơn hàng ${orderId} không tồn tại trên hệ thống.`);
      return NextResponse.json({ success: false, reason: 'order not found' });
    }

    const order = orderSnap.data();
    const amount = Number(body.transferAmount);

    // Kiểm tra xem khách có chuyển thiếu tiền không
    if (amount < order.amount) {
      console.log(`⚠️ Đơn ${orderId} thiếu tiền. Cần: ${order.amount}, Nhận: ${amount}`);
      return NextResponse.json({
        success: true,
        message: 'Underpaid',
      });
    }

    // 7. Cập nhật trạng thái thanh toán thành công
    await updateDoc(orderRef, {
      status: 'paid',
      paidAt: Date.now(),
      transactionId: body.referenceCode || String(body.id),
      amountReceived: amount,
    });

    console.log(`✅ Đã gạch nợ thành công đơn hàng: ${orderId}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("❌ Lỗi hệ thống:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}