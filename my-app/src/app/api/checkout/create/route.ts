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
      items: ['item1', 'item2', 'item3', ...items],
      amount,
      status: 'pending',
      paymentStatus: 'pending',
      customer: {
        name: 'Nguyễn Hữu Nhật',
        phone: '0985627061',
        address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
        email: 'nhat200901@gmail.com'
      },
      createdAt: serverTimestamp(),
    });

    const orderId = orderRef.id;

    const qrUrl =
      `https://img.vietqr.io/image/${BANK}-${ACCOUNT}-compact2.png` +
      `?amount=${amount}` +
      `&addInfo=${encodeURIComponent(`SEVQR ORDER ${orderId}`)}` +
      `&accountName=${encodeURIComponent(NAME)}`;

    return NextResponse.json({ orderId, qrUrl });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}