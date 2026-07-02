import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '@/core/services/firebase';

export async function GET(req: NextRequest) {
  // Bảo mật: Chỉ cho phép Vercel Cron hoặc môi trường Development gọi API này
  const authHeader = req.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    // Định nghĩa thời gian hết hạn (Ví dụ: Quá 15 phút trước)
    const expirationTime = new Date(now.getTime() - 15 * 60 * 1000);

    // Tìm các đơn hàng chưa thanh toán và được tạo trước thời điểm expirationTime
    const q = query(
      collection(db, 'orders'),
      where('status', '==', 'pending'),
      where('createdAt', '<=', expirationTime)
    );

    const querySnapshot = await getDocs(q);
    const expiredOrderIds: string[] = [];

    querySnapshot.forEach((doc) => {
      expiredOrderIds.push(doc.id);
    });

    if (expiredOrderIds.length === 0) {
      return NextResponse.json({ success: true, message: 'Không có đơn hàng nào hết hạn.' });
    }

    // Duyệt qua từng đơn hàng hết hạn và chạy transaction hoàn kho
    for (const orderId of expiredOrderIds) {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await transaction.get(orderRef);
        const orderData = orderSnap.data();

        if (orderData && orderData.status === 'pending') {
          const productDocsToRestore = [];
          
          for (const item of orderData.items) {
            const productRef = doc(db, 'products', item.productId);
            const productSnap = await transaction.get(productRef);
            
            if (productSnap.exists()) {
              const currentQuantity = productSnap.data().quantity || 0;
              productDocsToRestore.push({
                ref: productRef,
                newQuantity: currentQuantity + item.quantity
              });
            }
          }

          // Hoàn kho
          for (const p of productDocsToRestore) {
            transaction.update(p.ref, { quantity: p.newQuantity });
          }

          // Đổi trạng thái sang hết hạn (expired)
          transaction.update(orderRef, {
            status: 'expired',
            updatedAt: serverTimestamp()
          });
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Đã tự động xử lý hủy và hoàn kho cho ${expiredOrderIds.length} đơn hàng hết hạn.` 
    });

  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}