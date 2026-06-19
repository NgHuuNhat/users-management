import { NextRequest, NextResponse } from "next/server";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/core/services/firebase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const orderRef = await addDoc(
      collection(db, "orders"),
      {
        items: body.items,
        amount: body.amount,
        status: "pending",
        createdAt: serverTimestamp(),
        paidAt: null,
        transactionId: null,
      }
    );

    const orderId = orderRef.id;

    //techcombank
    // const qrUrl =
    //   "https://img.vietqr.io/image/TCB-5678200901-compact2.png" +
    //   `?amount=${body.amount}` +
    //   `&addInfo=ORDER_${orderId}` +
    //   `&accountName=NGUYEN%20HUU%20NHAT`;

    //vietinbank
    const qrUrl =
      `https://img.vietqr.io/image/ICB-106885114966-compact2.png` +
      `?amount=${body.amount}` +
      `&addInfo=SEVQR ORDER_${orderId}` +
      `&accountName=NGUYEN%20HUU%20NHAT`;

    return NextResponse.json({
      orderId,
      qrUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}