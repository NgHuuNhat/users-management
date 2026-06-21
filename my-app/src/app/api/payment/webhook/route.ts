import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from './verify-signature';
import { updateOrder } from './update-order';
import { sendErrorToClient } from '../../../../core/libs/pusher';

export async function POST(req: NextRequest) {
  try {
    // Đọc raw body để phục vụ xác thực chữ ký và xử lý dữ liệu
    const rawBody = await req.text();

    // Kiểm tra chữ ký webhook (nếu có)
    await verifySignature(req, rawBody);

    // Xử lý thanh toán và cập nhật đơn hàng
    const result = await updateOrder(rawBody);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Lỗi webhook:', error);
    await sendErrorToClient(error.message || 'Đã xảy ra lỗi hệ thống');

    return NextResponse.json(
      { success: false, message: error.message || 'Đã xảy ra lỗi hệ thống' },
      { status: error.status || 500 }
    );
  }
}