import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/core/services/firebase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Normalize SePay payload (có thể khác nhau tùy provider)
    const transferContent = body.transferContent || body.content;
    const transferAmount = Number(body.transferAmount || body.amount);
    const transactionId = body.transactionId || body.id;
    const bankTime = body.bankTime || new Date().toISOString();

    if (!transferContent) {
      return NextResponse.json({ ok: false, message: 'Missing content' }, { status: 400 });
    }

    // 2. Extract orderId
    const match = transferContent.match(/ORDER_(.+)/);

    if (!match) {
      return NextResponse.json({ ok: false, message: 'Invalid order format' });
    }

    const orderId = match[1];

    // 3. Find order in Firestore
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json({ ok: false, message: 'Order not found' });
    }

    const order = orderSnap.data();

    // 4. Idempotent check (tránh update 2 lần)
    if (order.status === 'paid') {
      return NextResponse.json({ ok: true, message: 'Already processed' });
    }

    // 5. Validate amount (cực quan trọng)
    if (order.amount !== transferAmount) {
      return NextResponse.json({
        ok: false,
        message: 'Invalid amount'
      });
    }

    // 6. Update order → PAID
    await updateDoc(orderRef, {
      status: 'paid',
      transactionId,
      amountReceived: transferAmount,
      paidAt: serverTimestamp(),
      bankTime
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message || 'Server error'
      },
      { status: 500 }
    );
  }
}