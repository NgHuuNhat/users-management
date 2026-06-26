import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/core/services/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const {
      uid,
      email,
      name,
      phone,
      role,
      isActive,
      password,
    } = await req.json();

    // Tạo object chứa dữ liệu cần update cho Firebase Auth
    const updateData: any = {
      email,
    };

    // Validate password trước
    if (password?.trim() && password.trim().length < 6) {
      throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
    }

    // Chỉ thêm password nếu có nhập
    if (password?.trim()) {
      updateData.password = password.trim();
    }

    await adminAuth.updateUser(uid, updateData);

    // await adminAuth.updateUser(uid, {
    //   email,
    // });

    await adminDb
      .collection("users")
      .doc(uid)
      .update({
        email,
        name,
        phone,
        role,
        isActive,
      });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}