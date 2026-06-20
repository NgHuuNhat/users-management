import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/core/services/firebase';

const BANK = 'ICB';
const ACCOUNT = '106885114966';
const NAME = 'NGUYEN HUU NHAT';

export async function POST(req: NextRequest) {
  try {
    const { amount = 2000, items = [] } = await req.json();

    const orderRef = await addDoc(collection(db, 'orders'), {
      items,
      amount,
      status: 'pending',
      transactionId: null,
      paidAt: null,
      amountReceived: null,
      createdAt: serverTimestamp(),
    });

    const orderId = orderRef.id;

    const qrUrl =
      `https://img.vietqr.io/image/${BANK}-${ACCOUNT}-compact2.png` +
      `?amount=${amount}` +
      `&addInfo=${encodeURIComponent(`SEVQR ORDER_${orderId}`)}` +
      `&accountName=${encodeURIComponent(NAME)}`;

    return NextResponse.json({ orderId, qrUrl });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}