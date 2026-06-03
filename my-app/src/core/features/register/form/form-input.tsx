"use client"

import { memo } from "react"
import {
    FieldValues,
    Path,
    useFormContext,
} from "react-hook-form"

type FormInputProps<T extends FieldValues> = {
    label: string
    name: Path<T>
    type?: string
    placeholder?: string
}

function FormInput<T extends FieldValues>({
    label,
    name,
    type = "text",
    placeholder,
}: FormInputProps<T>) {
    const {
        register,
        formState: { errors },
    } = useFormContext<T>()

    const errorMessage =
        errors[name]?.message as string | undefined

    return (
        <div className="space-y-1">
            <label className="text-sm font-medium">
                {label}
            </label>

            <input
                type={type}
                placeholder={placeholder}
                {...register(name)}
                className="w-full rounded-md border p-3 pe-18"
            />

            {/* ERROR SLOT luôn chiếm chỗ */}
            <p className="h-[12px] mt-[2px] text-[10px] leading-none">
                {errorMessage ? (
                    <span className="text-red-500">
                        {errorMessage}
                    </span>
                ) : (
                    <span className="text-transparent">.</span>
                )}
            </p>
        </div>
    )
}

export default memo(FormInput)