"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"

interface PasswordInputProps {
    label: string
    name: string
    placeholder?: string
}

export default function PasswordInput({ label, name, placeholder }: PasswordInputProps) {
    const { register, formState: { errors } } = useFormContext()
    const [showPassword, setShowPassword] = useState(false)
    const error = errors[name]?.message as string | undefined

    return (
        <div className="flex flex-col space-y-1">
            <label htmlFor={name} className="text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="relative">
                <input
                    id={name}
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    {...register(name)}
                    className={`w-full px-3 py-2 border rounded-md outline-none transition pr-10 ${error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-black"
                        }`}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-black"
                >
                    {showPassword ? "Ẩn" : "Hiện"}
                </button>
            </div>
            {/* {error && <span className="text-xs text-red-500">{error}</span>} */}
            <span className="text-xs text-red-500 min-h-[16px] block mt-1">
                {error || " "} {/* Render khoảng trắng nếu không có lỗi để giữ layout */}
            </span>
        </div>
    )
}