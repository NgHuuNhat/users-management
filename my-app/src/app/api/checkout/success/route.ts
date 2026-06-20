import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/core/services/firebase';
import crypto from 'crypto';

const SECRET = process.env.SEPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-sepay-signature');
    const rawBody = await req.text();

    if (SECRET) {
      const hash = crypto
        .createHmac('sha256', SECRET)
        .update(rawBody)
        .digest('hex');

      if (!signature || signature !== hash) {
        return NextResponse.json(
          { success: false },
          { status: 401 }
        );
      }
    }

    const body = JSON.parse(rawBody);
    const content = body.content || body.transferContent || '';
    const match = content.match(/ORDER_?(\w+)/i);

    if (!match) {
      return NextResponse.json({ success: false });
    }

    const orderId = match[1];
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json({ success: false });
    }

    const order = orderSnap.data();
    const amount = Number(body.transferAmount);

    if (amount < order.amount) {
      return NextResponse.json({
        success: true,
        message: 'Underpaid',
      });
    }

    await updateDoc(orderRef, {
      status: 'paid',
      paidAt: Date.now(),
      transactionId:
        body.referenceCode ||
        String(body.id) ||
        body.transactionId,
      amountReceived: amount,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}