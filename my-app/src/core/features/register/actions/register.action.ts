'use server'

import { registerSchema, RegisterSchemaType } from "../schemas/register.schema"

export async function registerUserAction(data: RegisterSchemaType, expectedCaptcha: string) {
    // Validate lại dữ liệu ở phía Server để chống can thiệp từ Client
    const validatedFields = registerSchema(expectedCaptcha).safeParse(data)

    if (!validatedFields.success) {
        return { 
            error: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
            details: validatedFields.error.flatten().fieldErrors 
        }
    }

    try {
        // Giả lập delay gọi Database
        await new Promise((resolve) => setTimeout(resolve, 1500))
        
        // Gọi DB ở đây: await db.user.create({...})

        return { success: true, message: "Tạo tài khoản thành công!" }
    } catch (error) {
        return { error: "Lỗi hệ thống, vui lòng thử lại sau." }
    }
}