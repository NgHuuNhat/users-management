"use client"

import { memo } from "react"
import { useFormContext, useWatch } from "react-hook-form"

function PasswordStrength() {
    const { control } = useFormContext()

    const password = useWatch({
        control,
        name: "password",
    })

    const isEmpty = !password
    const isStrong = (password?.length ?? 0) >= 8

    return (
        <p className="absolute right-9 top-[46%] -translate-y-1/2 text-[10px] leading-none">
            {!isEmpty && (
                <span className={isStrong ? "text-green-600 pt-1" : "text-red-500 pt-1"}>
                    {isStrong ? "Strong" : "Weak"}
                </span>
            )}
        </p>
    )
}

export default memo(PasswordStrength)