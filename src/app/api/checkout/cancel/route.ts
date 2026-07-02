import { NextRequest, NextResponse } from 'next/server';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '@/core/services/firebase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Thiếu Order ID.' }, { status: 400 });
    }

    await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await transaction.get(orderRef);

      if (!orderSnap.exists()) {
        throw new Error('Đơn hàng không tồn tại.');
      }

      const orderData = orderSnap.data();

      // Chỉ hoàn kho nếu đơn hàng đang ở trạng thái chờ (pending) và chưa thanh toán
      if (orderData.status !== 'pending' || orderData.paymentStatus === 'paid') {
        throw new Error('Đơn hàng không ở trạng thái có thể hủy hoặc đã được thanh toán.');
      }

      // BƯỚC 1: Đọc kho hiện tại của tất cả sản phẩm có trong đơn hàng
      const productDocsToRestore = [];
      for (const item of orderData.items) {
        const productRef = doc(db, 'products', item.productId);
        const productSnap = await transaction.get(productRef);

        if (productSnap.exists()) {
          const currentQuantity = productSnap.data().quantity || 0;
          productDocsToRestore.push({
            ref: productRef,
            newQuantity: currentQuantity + item.quantity, // Cộng trả lại số lượng
          });
        }
      }

      // BƯỚC 2: Cập nhật lại kho cho sản phẩm
      for (const p of productDocsToRestore) {
        transaction.update(p.ref, { quantity: p.newQuantity });
      }

      // BƯỚC 3: Cập nhật trạng thái đơn hàng thành 'cancelled' (Đã hủy)
      transaction.update(orderRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true, message: 'Hủy đơn hàng và hoàn kho thành công.' });

  } catch (error: any) {
    console.error("Cancel Order Error:", error);
    return NextResponse.json({ success: false, message: error.message || 'Lỗi hệ thống khi hủy đơn.' }, { status: 500 });
  }
}