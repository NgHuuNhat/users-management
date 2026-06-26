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
    } = await req.json();

    await adminAuth.updateUser(uid, {
      email,
    });

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