import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/core/services/firebase';

const SEPAY_SECRET = process.env.SEPAY_WEBHOOK_SECRET!;

if (!SEPAY_SECRET) {
    throw new Error("Missing SEPAY_WEBHOOK_SECRET");
}

// 1. Pass the timestamp into your verifier
function verifySignature(rawBody: string, signature: string | null, timestamp: string | null) {
    if (!signature || !timestamp) return false;

    const received = signature.replace(/^sha256=/i, "");

    // 2. Concatenate timestamp and raw body separated by a dot
    const payloadToSign = `${timestamp}.${rawBody}`;

    const expected = crypto
        .createHmac("sha256", SEPAY_SECRET)
        .update(payloadToSign)
        .digest("hex");


    console.log("RAW:", rawBody);
    console.log("EXPECTED:", expected);
    console.log("RECEIVED:", received);

    return expected === received;
}

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();

        // 3. Extract both signature and timestamp headers
        const signature = req.headers.get('x-sepay-signature');
        const timestamp = req.headers.get('x-sepay-timestamp');

        // 4. (Recommended) Block replay attacks by rejecting payloads older than 5 minutes
        if (timestamp && Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
            return NextResponse.json(
                { ok: false, message: 'Request expired' },
                { status: 401 }
            );
        }

        // 5. Verify the signature with the timestamp included
        if (!verifySignature(rawBody, signature, timestamp)) {
            return NextResponse.json(
                { ok: false, message: 'Invalid signature' },
                { status: 401 }
            );
        }

        const body = JSON.parse(rawBody);

        const transferContent = body.transferContent || body.content || body.description;
        const transferAmount = Number(body.transferAmount || body.amount);
        const transactionId = body.transactionId || body.id;
        const bankTime = body.bankTime || new Date().toISOString();

        if (!transferContent) {
            return NextResponse.json(
                { ok: false, message: 'Missing content' },
                { status: 400 }
            );
        }

        const match = transferContent.match(/SEVQR\s*ORDER\s*([A-Za-z0-9]+)/i);

        if (!match) {
            return NextResponse.json({
                ok: false,
                message: 'Invalid order format'
            });
        }

        const orderId = match[1];

        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return NextResponse.json({ ok: false, message: 'Order not found' });
        }

        const order = orderSnap.data();

        if (order.status === 'paid') {
            return NextResponse.json({ ok: true, message: 'Already processed' });
        }

        if (order.amount !== transferAmount) {
            return NextResponse.json({
                ok: false,
                message: 'Invalid amount'
            });
        }

        await updateDoc(orderRef, {
            status: 'paid',
            transactionId,
            amountReceived: transferAmount,
            paidAt: serverTimestamp(),
            bankTime
        });

        // Ensure you return exact {"success": true} as SePay sometimes expects it over "ok: true"
        return NextResponse.json({ success: true, ok: true });
    } catch (error: any) {
        return NextResponse.json(
            { ok: false, message: error.message || 'Server error' },
            { status: 500 }
        );
    }
}