"use client"

import { useFormContext } from "react-hook-form"

interface FormInputProps {
    label: string
    name: string
    placeholder?: string
    type?: string
}

export function FormInput({ label, name, placeholder, type = "text" }: FormInputProps) {
    const { register, formState: { errors } } = useFormContext()

    // Lấy lỗi cụ thể của field này
    const error = errors[name]?.message as string | undefined

    return (
        <div className="flex flex-col space-y-1">
            <label htmlFor={name} className="text-sm font-medium text-gray-700">
                {label}
            </label>
            <input
                id={name}
                type={type}
                placeholder={placeholder}
                {...register(name)}
                className={`px-3 py-2 border rounded-md outline-none transition ${error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-black"
                    }`}
            />
            {/* {error && <span className="text-xs text-red-500">{error}</span>} */}
            <span className="text-xs text-red-500 min-h-[16px] block mt-1">
                {error || " "} {/* Render khoảng trắng nếu không có lỗi để giữ layout */}
            </span>
        </div>
    )
}