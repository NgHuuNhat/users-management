import crypto from 'crypto';
import { NextRequest } from 'next/server';

const WEBHOOK_SECRET = process.env.SEPAY_WEBHOOK_SECRET!;

export async function verifySignature(req: NextRequest, rawBody: string) {
  try {
    const signature = req.headers.get('x-sepay-signature');
    const timestamp = req.headers.get('x-sepay-timestamp');

    // Không có chữ ký thì bỏ qua để hỗ trợ test bằng Postman
    if (!signature || !timestamp) return;

    // Tạo chữ ký mong đợi từ secret và raw body
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex');

    const receivedSignature = signature.replace(/^sha256=/i, '').trim();

    // So sánh chữ ký nhận được với chữ ký mong đợi
    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(receivedSignature)))
      throw { status: 401, message: 'Chữ ký webhook không hợp lệ' };
  } catch (error) {
    throw error;
  }
}