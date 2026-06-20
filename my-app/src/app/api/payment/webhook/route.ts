import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/core/services/firebase';

const SECRET = process.env.SEPAY_WEBHOOK_SECRET!;
if (!SECRET) throw new Error('Thiếu SEPAY_WEBHOOK_SECRET');

const ORDER_REGEX = /SEVQR\s*ORDER\s*([A-Za-z0-9]+)/i;

/** log lỗi dạng FULL OBJECT */
async function logError(orderId: string, error: any) {
  const ref = doc(db, 'orders', orderId);
  await updateDoc(ref, {
    lastError: error,
    lastErrorAt: serverTimestamp(),
  });
}

/** verify webhook */
function verify(raw: string, sig?: string | null, ts?: string | null) {
  if (!sig || !ts) return false;

  const payload = `${ts}.${JSON.stringify(JSON.parse(raw))}`;

  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');

  const received = sig.replace(/^sha256=/i, '').trim();

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export async function POST(req: NextRequest) {
  let orderId = '';

  try {
    const raw = await req.text();
    const sig = req.headers.get('x-sepay-signature');
    const ts = req.headers.get('x-sepay-timestamp');

    // 1. verify signature
    if (!verify(raw, sig, ts)) {
      return NextResponse.json({ success: false, message: 'Chữ ký không hợp lệ' }, { status: 401 });
    }

    const body = JSON.parse(raw);

    const content = body.transferContent || body.content || body.description;
    const amount = Number(body.transferAmount || body.amount || 0);
    const transactionId = String(body.transactionId || body.id || '');
    const bankTime = body.bankTime || new Date().toISOString();

    // 2. extract orderId
    orderId = content?.match(ORDER_REGEX)?.[1] || '';

    if (!orderId) {
      await logError('unknown', {
        step: 'PARSE_ORDER',
        message: 'Sai định dạng mã đơn hàng',
        raw: body,
      });

      return NextResponse.json({ success: false, message: 'Sai mã đơn hàng' }, { status: 400 });
    }

    const ref = doc(db, 'orders', orderId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await logError(orderId, {
        step: 'ORDER_NOT_FOUND',
        message: 'Không tìm thấy đơn hàng',
        raw: body,
      });

      return NextResponse.json({ success: false, message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    const order = snap.data();

    // 3. idempotency
    if (order.status === 'paid') {
      return NextResponse.json({ success: true, message: 'Đã xử lý' });
    }

    // 4. check amount
    if (order.amount !== amount) {
      await logError(orderId, {
        step: 'AMOUNT_MISMATCH',
        message: 'Số tiền không khớp',
        expected: order.amount,
        received: amount,
        raw: body,
      });

      return NextResponse.json({ success: false, message: 'Sai số tiền' }, { status: 400 });
    }

    // 5. success update
    await updateDoc(ref, {
      status: 'paid',
      transactionId,
      amountReceived: amount,
      bankTime,
      paidAt: serverTimestamp(),
      lastError: null,
    });

    return NextResponse.json({
      success: true,
      message: 'Thanh toán thành công',
    });

  } catch (e: any) {
    if (orderId) {
      await logError(orderId, {
        step: 'SYSTEM_ERROR',
        message: 'Lỗi hệ thống webhook',
        error: e?.message || e,
      });
    }

    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 });
  }
}