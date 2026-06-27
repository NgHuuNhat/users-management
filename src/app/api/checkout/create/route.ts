import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/core/services/firebase';

const BANK = 'vietinbank'; // Dùng Short Name viết thường chuẩn VietQR
const ACCOUNT = '106885114966';
const NAME = 'NGUYEN HUU NHAT';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, items, customer } = body;

    // 1. Kiểm tra dữ liệu đầu vào (Validation)
    if (!amount || !items || items.length === 0 || !customer) {
      return NextResponse.json(
        { success: false, message: 'Dữ liệu đơn hàng không đầy đủ hoặc không hợp lệ.' },
        { status: 400 }
      );
    }

    // 2. Lưu đơn hàng vào Firestore
    const orderRef = await addDoc(collection(db, 'orders'), {
      items: items, // Mảng các sản phẩm thực tế từ giỏ hàng
      amount: Number(amount),
      status: 'pending',
      paymentStatus: 'pending',
      customer: {
        name: customer.name || 'Khách hàng',
        phone: customer.phone || '',
        address: customer.address || '',
        email: customer.email || ''
      },
      createdAt: serverTimestamp(),
    });

    const orderId = orderRef.id;

    if (!orderId) {
      throw new Error('Không thể tạo Order ID từ hệ thống.');
    }

    // 3. Tạo đường dẫn QR Code thực tế bằng VietQR nhanh
    const qrUrl = `https://img.vietqr.io/image/${BANK}-${ACCOUNT}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(`SEVQR ORDER ${orderId}`)}&accountName=${encodeURIComponent(NAME)}`;

    // Trả về kết quả thành công
    return NextResponse.json({ 
      success: true, 
      orderId, 
      qrUrl 
    });

  } catch (error: any) {
    console.error("API Error:", error);
    // Trả về success: false nếu có bất kỳ lỗi nào xảy ra
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi hệ thống khi tạo đơn hàng.' },
      { status: 500 }
    );
  }
}