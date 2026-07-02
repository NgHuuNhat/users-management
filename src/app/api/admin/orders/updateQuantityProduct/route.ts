import { NextRequest, NextResponse } from "next/server";
import { doc, runTransaction } from "firebase/firestore";
import { db } from "@/core/services/firebase";

export async function POST(req: NextRequest) {
  try {
    const { orderId, type } = await req.json();

    if (!orderId || !["increase", "decrease"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Thiếu dữ liệu." },
        { status: 400 }
      );
    }

    await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await transaction.get(orderRef);

      if (!orderSnap.exists()) {
        throw new Error("Đơn hàng không tồn tại.");
      }

      const order = orderSnap.data();

      for (const item of order.items) {
        const productRef = doc(db, "products", item.productId);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(`Sản phẩm ${item.productId} không tồn tại.`);
        }

        const quantity = productSnap.data().quantity ?? 0;

        if (type === "increase") {
          transaction.update(productRef, {
            quantity: quantity + item.quantity,
          });
        } else {
          if (quantity < item.quantity) {
            throw new Error(`Sản phẩm "${item.name}" không đủ tồn kho.`);
          }

          transaction.update(productRef, {
            quantity: quantity - item.quantity,
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật tồn kho thành công.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Có lỗi xảy ra.",
      },
      { status: 500 }
    );
  }
}