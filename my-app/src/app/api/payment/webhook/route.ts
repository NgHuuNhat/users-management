import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/core/services/firebase';

// Lấy Secret Key từ biến môi trường
const SEPAY_SECRET = process.env.SEPAY_WEBHOOK_SECRET!;

if (!SEPAY_SECRET) {
    throw new Error("Missing SEPAY_WEBHOOK_SECRET in environment variables.");
}

/**
 * Hàm xác thực chữ ký (Hỗ trợ cả Secure Webhook và Standard Webhook)
 */
function verifySignature(rawBody: string, signature: string | null, timestamp: string | null) {
    if (!signature) return false;

    // Loại bỏ tiền tố 'sha256=' và khoảng trắng dư thừa
    const received = signature.replace(/^sha256=/i, "").trim();

    // CHUẨN HÓA: Chuyển body về dạng minified JSON để loại bỏ khoảng trắng/xuống dòng 
    // do NextJS sinh ra, đảm bảo cấu trúc giống 100% bản gốc từ SePay.
    let minifiedBody = rawBody;
    try {
        minifiedBody = JSON.stringify(JSON.parse(rawBody));
    } catch (e) {
        console.warn("Không thể parse rawBody thành JSON. Sử dụng rawBody gốc.");
    }

    // KỊCH BẢN A: Webhook Bảo mật (Có nối thêm timestamp vào chuỗi băm)
    let payloadToSign = minifiedBody;
    if (timestamp) {
        payloadToSign = `${timestamp}.${minifiedBody}`;
    }

    const expected = crypto
        .createHmac("sha256", SEPAY_SECRET)
        .update(payloadToSign)
        .digest("hex");

    // Nếu khớp với Kịch bản A -> Hợp lệ
    if (expected === received) {
        return true;
    }

    // KỊCH BẢN B (Dự phòng): Webhook thường (Chỉ hash nội dung body)
    const expectedFallback = crypto
        .createHmac("sha256", SEPAY_SECRET)
        .update(minifiedBody)
        .digest("hex");
        
    return expectedFallback === received;
}

/**
 * API Route Handler
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Đọc nội dung thô (Raw Body)
        const rawBody = await req.text();

        // 2. Lấy Headers
        const signature = req.headers.get('x-sepay-signature');
        const timestamp = req.headers.get('x-sepay-timestamp');

        // 3. Chống tấn công phát lại (Replay Attack) - chặn các request trễ hơn 5 phút (300 giây)
        if (timestamp && Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
            return NextResponse.json(
                { ok: false, message: 'Request expired' },
                { status: 401 }
            );
        }

        // 4. Kiểm tra chữ ký
        if (!verifySignature(rawBody, signature, timestamp)) {
            return NextResponse.json(
                { ok: false, message: 'Invalid signature' },
                { status: 401 }
            );
        }

        // 5. Chữ ký hợp lệ -> Parse JSON an toàn
        const body = JSON.parse(rawBody);

        // Chuẩn hóa dữ liệu (Hỗ trợ cấu trúc cũ/mới của SePay)
        const transferContent = body.transferContent || body.content || body.description;
        const transferAmount = Number(body.transferAmount || body.amount);
        const transactionId = body.transactionId || body.id;
        const bankTime = body.bankTime || new Date().toISOString();

        if (!transferContent) {
            return NextResponse.json(
                { ok: false, message: 'Missing content' },
                { status: 400 }
            );
        }

        // 6. Trích xuất Order ID (VD: SEVQR ORDER 12345ABCD)
        const match = transferContent.match(/SEVQR\s*ORDER\s*([A-Za-z0-9]+)/i);

        if (!match) {
            return NextResponse.json({
                ok: false,
                message: 'Invalid order format'
            });
        }

        const orderId = match[1];

        // 7. Lấy dữ liệu đơn hàng từ Firebase
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return NextResponse.json({ ok: false, message: 'Order not found' });
        }

        const order = orderSnap.data();

        // 8. Idempotency Check (Chống ghi đè nếu SePay gửi request nhiều lần)
        if (order.status === 'paid') {
            return NextResponse.json({ success: true, message: 'Already processed' });
        }

        // 9. Xác thực số tiền thanh toán
        if (order.amount !== transferAmount) {
            return NextResponse.json({
                ok: false,
                message: 'Invalid amount'
            });
        }

        // 10. Cập nhật trạng thái Database thành công
        await updateDoc(orderRef, {
            status: 'paid',
            transactionId: String(transactionId),
            amountReceived: transferAmount,
            paidAt: serverTimestamp(),
            bankTime
        });

        // 11. Báo cáo thành công về SePay (Bắt buộc trả về success: true)
        return NextResponse.json({ success: true, ok: true });

    } catch (error: any) {
        console.error("Webhook Error: ", error.message);
        return NextResponse.json(
            { ok: false, message: error.message || 'Server error' },
            { status: 500 }
        );
    }
}