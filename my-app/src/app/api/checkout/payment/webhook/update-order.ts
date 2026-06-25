import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/core/services/firebase';
import { sendErrorToClient } from '../../../../../core/features/checkout/pusher';

const ORDER_REGEX = /SEVQR\s*ORDER\s*([A-Za-z0-9]+)/i;

export async function updateOrder(rawBody: string) {
  try {
    // Đọc dữ liệu webhook
    const body = JSON.parse(rawBody);

    // Lấy nội dung chuyển khoản và tách mã đơn hàng
    const content = body.transferContent || body.content || body.description || '';
    const orderId = content.match(ORDER_REGEX)?.[1];

    if (!orderId)
      throw { status: 400, message: 'Không tìm thấy mã đơn hàng' };

    // Chuẩn hóa dữ liệu thanh toán
    const amount = Number(body.transferAmount || body.amount || 0);
    const transactionId = String(body.transactionId || body.id || '');
    const bankTime = body.bankTime || serverTimestamp();

    // Tìm đơn hàng trong Firestore
    const orderRef = doc(db, 'orders', orderId);
    const orderSnapshot = await getDoc(orderRef);

    if (!orderSnapshot.exists())
      throw { status: 404, message: 'Đơn hàng không tồn tại' };

    const order = orderSnapshot.data();

    // Chống xử lý trùng khi webhook được gửi lại
    if (order.paymentStatus === 'paid') {
      const msg = 'Đơn hàng đã được thanh toán trước đó';
      await sendErrorToClient(msg);
      return { success: true, message: msg };
    }

    // Kiểm tra số tiền chuyển khoản
    if (order.amount !== amount)
      throw { status: 400, message: 'Số tiền thanh toán không khớp' };

    // Cập nhật trạng thái thanh toán thành công
    await updateDoc(orderRef, {
      bank: {
        transferAmount: amount,
        transactionId: transactionId,
        bankTime: bankTime,
      },
      paymentStatus: 'paid',
      paidAt: serverTimestamp(),
    });

    return { success: true, message: 'Thanh toán thành công' };
  } catch (error) {
    throw error;
  }
}