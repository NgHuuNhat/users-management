import { NextRequest, NextResponse } from "next/server";
import {
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/core/services/firebase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Webhook called");
    console.log(body);

    const content =
      body.content ||
      body.transferContent ||
      "";

    const match = content.match(/ORDER_(\w+)/);
    if (!match) {
      return NextResponse.json({
        success: false,
      });
    }
    const orderId = match[1];

    await updateDoc(
      doc(db, "orders", orderId),
      {
        status: "paid",
        paidAt: Date.now(),
        transactionId:
          body.id ||
          body.transactionId,
      }
    );

    return NextResponse.json({
      success: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      { status: 500 }
    );
  }
}


//code test webhook localhost
// curl -i -X POST http://localhost:3000/api/payment/webhook \
// -H "Content-Type: application/json" \
// -d '{
//   "transferContent": "SEVQR ORDER_Cpr6jqZ0nC3526xaZtCA",
//   "transactionId": "test_123456"
// }'