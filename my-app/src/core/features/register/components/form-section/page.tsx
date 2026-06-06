"use client"

import { useTransition } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PasswordSection } from "../password-section/page"
import { CaptchaSection } from "../captcha-section/page"
import { useCaptcha } from "../captcha-section/hooks/use-captcha"
import { registerSchema, RegisterSchemaType } from "../../schemas/register.schema"
import { registerUserAction } from "../../actions/register.action"
import { FormInput } from "./form-input"
import { toast } from "sonner"

export function FormSection() {
    const { captchaText, refreshCaptcha } = useCaptcha()
    const [isPending, startTransition] = useTransition()

    const methods = useForm<RegisterSchemaType>({
        resolver: zodResolver(registerSchema(captchaText)),
        defaultValues: { email: "", password: "", confirmPassword: "", captcha: "" },
    })

    const onSubmit = (data: RegisterSchemaType) => {
        // Tùy chọn: Thêm toast loading trong lúc chờ Server Action
        const toastId = toast.loading("Đang xử lý đăng ký...")

        startTransition(async () => {
            const res = await registerUserAction(data, captchaText)
            // if (res?.error) alert(res.error)
            // else {
            //     alert("Đăng ký thành công!")
            //     console.log(data)
            // }
            if (res?.error) {
                // Hiển thị toast lỗi và tắt toast loading
                toast.error(res.error, { id: toastId })
            } else {
                // Hiển thị toast thành công, tắt loading, và reset form
                toast.success("Đăng ký thành công!", { id: toastId })
                console.log(data)
                methods.reset() // Xóa sạch form sau khi đăng ký thành công
                refreshCaptcha() // Đổi mã captcha mới
            }
        })
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5">

                {/* 1. Field Email độc lập */}
                <div>
                    <FormInput label="Email" name="email" placeholder="Enter email" />
                    <p className="mt-1 text-[10px] text-gray-400">Ví dụ: example@gmail.com</p>
                </div>

                {/* 2. Đóng gói toàn bộ logic Password vào 1 Component duy nhất */}
                <PasswordSection />

                {/* 3. Đóng gói logic Captcha */}
                <CaptchaSection
                    captchaText={captchaText}
                    onRefresh={refreshCaptcha}
                />

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full rounded bg-black py-2 text-white hover:bg-gray-800 transition disabled:opacity-50"
                >
                    {isPending ? "Đang xử lý..." : "Register"}
                </button>
            </form>
        </FormProvider>
    )
}