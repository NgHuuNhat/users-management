import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/core/services/firebase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ success: false, message: 'Thiếu orderId' }, { status: 400 });
  }

  const snap = await getDoc(doc(db, 'orders', orderId));

  if (!snap.exists()) {
    return NextResponse.json({ success: false, message: 'Không tìm thấy đơn hàng' }, { status: 404 });
  }

  const data = snap.data();

  return NextResponse.json({
    success: true,
    orderId,
    status: data.status,
    error: data.lastError || null, // 👈 FULL RAW ERROR
  });
}