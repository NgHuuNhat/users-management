import { sendOtp } from "../../../core/features/history/send-otp";
import { verifyOtp } from "../../../core/features/history/verify-otp";

export async function POST(req: Request) {
    try {
        const { type, email, otp } = await req.json();

        if (type === "send") {
            const result = await sendOtp(email);
            return Response.json(result);
        }

        if (type === "verify") {
            const result = await verifyOtp(email, otp);

            return Response.json(result, {
                status: result.success ? 200 : 400,
            });
        }

        return Response.json(
            {
                success: false,
                message: "Invalid type",
            },
            { status: 400 }
        );
    } catch (error: any) {
        console.error("API /api/history ERROR:", error);

        return Response.json(
            {
                success: false,
                message: "Internal Server Error",
                error: error.message,
            },
            { status: 500 }
        );
    }
}