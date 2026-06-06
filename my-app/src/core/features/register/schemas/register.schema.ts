import { z } from "zod"

export const registerSchema = (expectedCaptcha: string) => 
    z.object({
        email: z.string().email("Email không hợp lệ"),
        password: z
            .string()
            .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
            .regex(/[a-z]/, "Phải chứa chữ thường")
            .regex(/[A-Z]/, "Phải chứa chữ hoa")
            .regex(/[0-9]/, "Phải chứa số"),
        confirmPassword: z.string(),
        captcha: z.string().min(1, "Vui lòng nhập mã xác nhận"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
    })
    .refine((data) => data.captcha === expectedCaptcha, {
        message: "Mã xác nhận không chính xác",
        path: ["captcha"],
    })

export type RegisterSchemaType = z.infer<ReturnType<typeof registerSchema>>