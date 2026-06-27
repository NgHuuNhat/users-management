import { db } from "@/core/services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function verifyOtp(email: string, otp: string) {
    const q = query(
        collection(db, "otp_sessions"),
        where("email", "==", email),
        where("otp", "==", otp)
    );

    const snap = await getDocs(q);

    if (snap.empty) return false;

    const data = snap.docs[0].data();

    // check hết hạn
    if (data.expiresAt < Date.now()) return false;

    return true;
}