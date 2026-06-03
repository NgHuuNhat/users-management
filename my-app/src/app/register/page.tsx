"use client"

import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
    registerSchema,
    RegisterSchemaType,
} from "@/core/features/register/schemas/register.schema"

import { useCaptcha } from "@/core/features/register/form/captcha/hooks/use-captcha"
import FormInput from "@/core/features/register/form/form-input"
import CaptchaInput from "@/core/features/register/form/captcha/captcha-input"
import PasswordInput from "@/core/features/register/form/password/password-input"
import PasswordStrength from "@/core/features/register/form/password/password-strength"
import PasswordMatch from "@/core/features/register/form/password/password-match"

export default function RegisterPage() {
    // const captchaText = "ABCD1234"
    const { captchaText, refreshCaptcha, } = useCaptcha()

    const methods = useForm<RegisterSchemaType>({
        resolver: zodResolver(
            registerSchema(captchaText)
        ),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            captcha: "",
        },
    })

    const { handleSubmit } = methods

    const onSubmit = (data: RegisterSchemaType) => {
        console.log(data)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-xl shadow-md">
                <FormProvider {...methods}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4 md:space-y-5"
                    >
                        <h1 className="text-xl font-semibold text-center">
                            Register
                        </h1>

                        <div>
                            <FormInput
                                label="Email"
                                name="email"
                                placeholder="Enter email"
                            />
                            <p className="mt-1 text-[10px] leading-none text-gray-400">
                                Example: example@gmail.com
                            </p>
                        </div>

                        <div className="relative">
                            <PasswordInput
                                label="Password"
                                name="password"
                                placeholder="Enter password"
                            />
                            <PasswordStrength />
                            <p className="mt-1 text-[10px] leading-none text-gray-400">
                                8+ characters, uppercase, lowercase and number
                            </p>
                        </div>

                        <div className="relative">
                            <PasswordInput
                                label="Confirm Password"
                                name="confirmPassword"
                                placeholder="Confirm password"
                            />
                            <PasswordMatch />
                        </div>

                        <CaptchaInput
                            label="Captcha"
                            name="captcha"
                            captchaText={captchaText}
                            onRefresh={refreshCaptcha}
                            placeholder="Enter captcha"
                        />

                        <button
                            type="submit"
                            className="w-full rounded bg-black py-2 text-white hover:bg-gray-800 transition"
                        >
                            Register
                        </button>
                    </form>
                </FormProvider>
            </div>
        </div>
    )
}