import { db } from "@/core/services/firebase";
import { deleteDoc, doc, getDoc } from "firebase/firestore";

export async function verifyOtp(email: string, otp: string) {
    try {
        const snap = await getDoc(doc(db, "otp_sessions", email));

        if (!snap.exists()) {
            return {
                success: false,
                message: "Không tìm thấy OTP.",
            };
        }

        const data = snap.data();

        if (data.expiresAt < Date.now()) {
            return {
                success: false,
                message: "OTP đã hết hạn.",
            };
        }

        if (data.otp !== otp) {
            return {
                success: false,
                message: "OTP không đúng.",
            };
        }

        await deleteDoc(doc(db, "otp_sessions", email));

        return {
            success: true,
            message: "Xác thực thành công.",
        };
    } catch (err) {
        console.error("VERIFY OTP ERROR:", err);
        throw err;
    }
}