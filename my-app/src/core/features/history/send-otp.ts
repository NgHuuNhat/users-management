import { db } from "@/core/services/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function sendOtp(email: string) {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await addDoc(collection(db, "otp_sessions"), {
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY, // <--- ĐỔI TÊN Ở ĐÂY (Từ private_key thành accessToken)
        template_params: {
          to_email: email,
          otp_code: otp,
        },
      }),
    });

    // SỬA Ở ĐÂY: EmailJS API trả về text ("OK" nếu thành công), KHÔNG phải JSON.
    const textResponse = await res.text();
    console.log("EMAILJS RESPONSE:", textResponse);

    if (!res.ok) {
      throw new Error(`EmailJS Error: ${textResponse}`);
    }

    return true;
  } catch (err: any) {
    console.error("SEND OTP ERROR:", err);
    throw err; // Ném lỗi này lên cho API route xử lý
  }
}