// import { NextRequest, NextResponse } from "next/server";
// import {
//   doc,
//   updateDoc,
// } from "firebase/firestore";
// import { db } from "@/core/services/firebase";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     console.log("Webhook called");
//     console.log(body);

//     const content =
//       body.content ||
//       body.transferContent ||
//       "";

//     const match = content.match(/ORDER_(\w+)/);
//     if (!match) {
//       return NextResponse.json({
//         success: false,
//       });
//     }
//     const orderId = match[1];

//     await updateDoc(
//       doc(db, "orders", orderId),
//       {
//         status: "paid",
//         paidAt: Date.now(),
//         transactionId:
//           body.id ||
//           body.transactionId,
//       }
//     );

//     return NextResponse.json({
//       success: true,
//     });
//   } catch (err: any) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: err.message,
//       },
//       { status: 500 }
//     );
//   }
// }


// export async function POST(req: Request) {
//   try {
//     const raw = await req.text()

//     console.log("🔥 RAW BODY:", raw)

//     let body
//     try {
//       body = JSON.parse(raw)
//     } catch (e) {
//       console.log("❌ NOT JSON")
//     }

//     console.log("🔥 PARSED:", body)

//     return NextResponse.json({ success: true })
//   } catch (err) {
//     console.log("🔥 WEBHOOK ERROR:", err)
//     return NextResponse.json({ success: false })
//   }
// }


import { NextResponse } from "next/server"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/core/services/firebase"

export async function POST(req: Request) {
  try {
    const raw = await req.text()
    console.log("🔥 RAW BODY:", raw)

    const body = JSON.parse(raw)
    console.log("🔥 PARSED:", body)

    // 1. extract content
    const content = body?.content || ""

    // 2. extract orderId
    const match = content.match(/(SEVQR ORDER[A-Za-z0-9]+)/)
    const orderId = match?.[1]

    console.log("🔥 ORDER ID:", orderId)

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: "ORDER_ID_NOT_FOUND",
      })
    }

    // 3. find order in Firestore
    const orderRef = doc(db, "orders", orderId)
    const snap = await getDoc(orderRef)

    if (!snap.exists()) {
      return NextResponse.json({
        success: false,
        error: "ORDER_NOT_FOUND",
      })
    }

    // 4. update paid
    await updateDoc(orderRef, {
      status: "paid",
      paidAt: new Date(),
      transactionId: body?.referenceCode || null,
      amount: body?.transferAmount || 0,
    })

    console.log("✅ ORDER UPDATED PAID")

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.log("🔥 WEBHOOK ERROR:", err)

    return NextResponse.json({
      success: false,
      error: err.message,
    })
  }
}


//code test webhook localhost
// curl -i -X POST http://localhost:3000/api/payment/webhook \
// -H "Content-Type: application/json" \
// -d '{
//   "transferContent": "SEVQR ORDER_Cpr6jqZ0nC3526xaZtCA",
//   "transactionId": "test_123456"
// }'