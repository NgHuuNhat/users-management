"use client"

import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
    registerSchema,
    RegisterSchemaType,
} from "@/schemas/register.schema"

import FormInput from "@/components/forms/form-input"
import PasswordInput from "@/components/forms/password-input"
import CaptchaInput from "@/components/forms/captcha-input"
import PasswordStrength from "@/components/forms/password-strength"
import PasswordMatch from "@/components/forms/password-match"

export default function RegisterPage() {
    const methods = useForm<RegisterSchemaType>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            captcha: "",
        },
    })

    const { handleSubmit } = methods

    const captchaText = "ABCD1234"

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

                        <FormInput
                            label="Email"
                            name="email"
                            placeholder="Enter email"
                        />

                        <div className="relative">
                            <PasswordInput
                                label="Password"
                                name="password"
                                placeholder="Enter password"
                            />
                            <PasswordStrength />
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