import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/core/services/firebase';

const SEPAY_SECRET = process.env.SEPAY_WEBHOOK_SECRET!;

function verifySignature(rawBody: string, signature: string | null) {
    if (!signature) return false;

    const received = signature.replace(/^sha256=/i, "");

    const expected = crypto
        .createHmac("sha256", process.env.SEPAY_SECRET!)
        .update(rawBody)
        .digest("hex");

    return expected === received;
}

export async function POST(req: NextRequest) {
    try {
        // 1. RAW BODY (quan trọng)
        const rawBody = await req.text();

        // 2. verify HMAC signature
        const signature = req.headers.get('x-sepay-signature');

        if (!verifySignature(rawBody, signature)) {
            return NextResponse.json(
                { ok: false, message: 'Invalid signature' },
                { status: 401 }
            );
        }

        // 3. parse JSON sau khi verify
        const body = JSON.parse(rawBody);

        // 4. normalize data
        const transferContent =
            body.transferContent || body.content || body.description;

        const transferAmount = Number(body.transferAmount || body.amount);
        const transactionId = body.transactionId || body.id;
        const bankTime = body.bankTime || new Date().toISOString();

        if (!transferContent) {
            return NextResponse.json(
                { ok: false, message: 'Missing content' },
                { status: 400 }
            );
        }

        // 5. extract orderId
        const match = transferContent.match(/SEVQR\s*ORDER\s*([A-Za-z0-9]+)/i);

        if (!match) {
            return NextResponse.json({
                ok: false,
                message: 'Invalid order format'
            });
        }

        const orderId = match[1];

        // 6. find order
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return NextResponse.json({ ok: false, message: 'Order not found' });
        }

        const order = orderSnap.data();

        // 7. idempotent
        if (order.status === 'paid') {
            return NextResponse.json({ ok: true, message: 'Already processed' });
        }

        // 8. validate amount
        if (order.amount !== transferAmount) {
            return NextResponse.json({
                ok: false,
                message: 'Invalid amount'
            });
        }

        // 9. update paid
        await updateDoc(orderRef, {
            status: 'paid',
            transactionId,
            amountReceived: transferAmount,
            paidAt: serverTimestamp(),
            bankTime
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        return NextResponse.json(
            { ok: false, message: error.message || 'Server error' },
            { status: 500 }
        );
    }
}