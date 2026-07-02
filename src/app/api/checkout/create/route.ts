import { NextRequest, NextResponse } from 'next/server';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
// LƯU Ý: Đảm bảo import đúng đường dẫn db của bạn
import { db } from '@/core/services/firebase';

const BANK = 'vietinbank'; 
const ACCOUNT = '106885114966';
const NAME = 'NGUYEN HUU NHAT';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, items, customer } = body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!amount || !items || items.length === 0 || !customer) {
      return NextResponse.json(
        { success: false, message: 'Dữ liệu đơn hàng không đầy đủ hoặc không hợp lệ.' },
        { status: 400 }
      );
    }

    let orderId = '';

    // 2. Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu
    await runTransaction(db, async (transaction) => {
      const productDocsToUpdate = [];

      // BƯỚC 2.1: ĐỌC dữ liệu kho của tất cả sản phẩm trong giỏ hàng
      // (Bắt buộc phải thực hiện tất cả các thao tác READ trước khi WRITE trong transaction)
      for (const item of items) {
        // Giả sử item truyền lên có chứa trường productId
        const productRef = doc(db, 'products', item.productId);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(`Sản phẩm "${item.name}" không còn tồn tại trên hệ thống.`);
        }

        const productData = productSnap.data();
        const currentQuantity = productData.quantity || 0;

        // Kiểm tra xem kho còn đủ hàng không
        if (currentQuantity < item.quantity) {
          throw new Error(`Sản phẩm "${item.name}" không đủ số lượng. Kho chỉ còn ${currentQuantity}.`);
        }

        // Lưu lại tham chiếu và số lượng mới để update sau
        productDocsToUpdate.push({
          ref: productRef,
          newQuantity: currentQuantity - item.quantity,
        });
      }

      // BƯỚC 2.2: GHI (Update) lại số lượng kho mới cho các sản phẩm
      for (const p of productDocsToUpdate) {
        transaction.update(p.ref, { quantity: p.newQuantity });
      }

      // BƯỚC 2.3: Tạo document Đơn hàng (Order)
      const ordersRef = collection(db, 'orders');
      const newOrderRef = doc(ordersRef); // Khởi tạo một document ID tự động
      orderId = newOrderRef.id;

      transaction.set(newOrderRef, {
        items: items, 
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
    });

    // 3. Tạo đường dẫn QR Code thực tế
    const qrUrl = `https://img.vietqr.io/image/${BANK}-${ACCOUNT}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(`SEVQR ORDER ${orderId}`)}&accountName=${encodeURIComponent(NAME)}`;

    // Trả về kết quả thành công
    return NextResponse.json({ 
      success: true, 
      orderId, 
      qrUrl 
    });

  } catch (error: any) {
    console.error("API Error:", error);
    // Trả về thông báo lỗi chi tiết (VD: lỗi thiếu số lượng) để Client hiển thị cho user
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi hệ thống khi tạo đơn hàng.' },
      { status: 500 }
    );
  }
}