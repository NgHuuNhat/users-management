"use client"

import { memo } from "react"
import { useFormContext, useWatch } from "react-hook-form"

function PasswordMatch() {
    const { control } = useFormContext()

    const password = useWatch({
        control,
        name: "password",
    })

    const confirmPassword = useWatch({
        control,
        name: "confirmPassword",
    })

    const isEmpty = !confirmPassword
    const isMatch = password === confirmPassword

    return (
        <p className="absolute left-0 bottom-0 h-[12px] mt-1 text-[10px] leading-none">
            <span
                className={
                    isEmpty
                        ? "text-transparent"
                        : isMatch
                        ? "text-green-600"
                        : "text-red-500"
                }
            >
                {isEmpty
                    ? "."
                    : isMatch
                    ? "Passwords match"
                    : "Passwords do not match"}
            </span>
        </p>
    )
}

export default memo(PasswordMatch)