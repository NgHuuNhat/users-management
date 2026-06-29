import { db } from "@/core/services/firebase";
import { doc, setDoc } from "firebase/firestore";

const OTP_EXPIRE_S = 60;  // Số giây hết hạn OTP

export async function sendOtp(email: string) {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + OTP_EXPIRE_S * 1000;

    await setDoc(doc(db, "otp_sessions", email), {
      email,
      otp,
      expiresAt,
    });

    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: {
          to_email: email,
          otp_code: otp,
        },
      }),
    });

    const textResponse = await res.text();

    if (!res.ok) {
      throw new Error(`EmailJS Error: ${textResponse}`);
    }

    return {
      success: true,
      expiresAt,
    };
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    throw err;
  }
}