import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/core/services/firebase-admin"; // Đảm bảo bạn đã cấu hình Firebase Admin SDK

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ success: false, message: "Thiếu UID" }, { status: 400 });
    }

    // 1. Xóa user trong Firebase Authentication
    await adminAuth.deleteUser(uid);

    // 2. Xóa user trong Firestore (Collection 'users')
    await adminDb.collection("users").doc(uid).delete();

    return NextResponse.json({ success: true, message: "Đã xóa thành công" });
  } catch (error: any) {
    console.error("Lỗi xóa user:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}