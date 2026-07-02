import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/core/services/firebase-admin";

export async function POST(req: Request) {
  try {
    const { email, password, name, phone, role, isActive } = await req.json();

    // 1. Tạo user trong Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      disabled: !isActive,
      displayName: name,
    });

    // 2. Lưu thêm thông tin vào Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      name,
      email,
      phone,
      role,
      isActive,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}