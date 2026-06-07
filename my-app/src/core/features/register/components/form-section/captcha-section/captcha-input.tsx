"use client"

import { useFormContext } from "react-hook-form"

interface CaptchaInputProps {
    label: string
    name: string
    captchaText: string
    onRefresh: () => void
    placeholder?: string
}

export default function CaptchaInput({ label, name, captchaText, onRefresh, placeholder }: CaptchaInputProps) {
    const { register, formState: { errors } } = useFormContext()
    const error = errors[name]?.message as string | undefined

    return (
        <div className="flex flex-col space-y-2">
            <label htmlFor={name} className="text-sm font-medium text-gray-700">
                {label}
            </label>

            <div className="flex space-x-3 items-center">
                <div className="relative flex-1">
                    <input
                        id={name}
                        type="text"
                        placeholder={placeholder}
                        {...register(name)}
                        className={`w-full px-3 py-2 border rounded-md outline-none transition ${error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-black"
                            }`}
                        autoComplete="off"
                    />
                </div>

                {/* Khu vực hiển thị text Captcha giả lập */}
                <div className="flex items-center space-x-2">
                    <div className="bg-gradient-to-r from-gray-200 to-gray-300 px-4 py-2 rounded font-mono text-lg font-bold tracking-widest text-gray-700 line-through decoration-gray-400 select-none">
                        {captchaText || "..."}
                    </div>
                    <button
                        type="button"
                        onClick={onRefresh}
                        className="text-xs text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
                    >
                        Đổi mã
                    </button>
                </div>
            </div>

            {/* {error && <span className="text-xs text-red-500">{error}</span>} */}
            <span className="text-xs text-red-500 min-h-[16px] block mt-1">
                {error || " "} {/* Render khoảng trắng nếu không có lỗi để giữ layout */}
            </span>
        </div>
    )
}