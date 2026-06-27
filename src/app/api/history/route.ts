import { sendOtp } from "../../../core/features/history/send-otp";
import { verifyOtp } from "../../../core/features/history/verify-otp";

export async function POST(req: Request) {
    try {
        const { type, email, otp } = await req.json();

        if (type === "send") {
            await sendOtp(email);
            return Response.json({ success: true });
        }

        if (type === "verify") {
            const ok = await verifyOtp(email, otp);

            return Response.json({ success: ok }, {
                status: ok ? 200 : 400,
            });
        }

        // Bắt trường hợp request body truyền sai type
        return Response.json({ success: false, message: "Invalid type" }, { status: 400 });

    } catch (error: any) {
        // BẮT LỖI TẠI ĐÂY: Nếu có lỗi gì xảy ra, trả về status 500 và log ra server để dễ debug
        console.error("API /api/history ERROR:", error);
        return Response.json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        }, { status: 500 });
    }
}