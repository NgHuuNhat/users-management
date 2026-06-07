"use client"

import { useFormContext } from "react-hook-form"
import PasswordInput from "./password-input"
import PasswordStrength from "./password-strength"
import PasswordMatch from "./password-match"

export function PasswordSection() {
    // Tự động lấy context từ FormProvider bọc bên ngoài, form cha không cần truyền props!
    const { watch } = useFormContext()
    
    // Chỉ watch field cần thiết cho logic nội bộ
    const password = watch("password")
    const confirmPassword = watch("confirmPassword")

    return (
        <div className="space-y-4">
            <div className="relative">
                <PasswordInput
                    label="Password"
                    name="password"
                    placeholder="Enter password"
                />
                {/* Truyền value trực tiếp vào strength, component strength không cần chọc vào form nữa */}
                <PasswordStrength password={password} />
                <p className="mt-1 text-[10px] text-gray-400">
                    8+ characters, uppercase, lowercase and number
                </p>
            </div>

            <div className="relative">
                <PasswordInput
                    label="Confirm Password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                />
                {/* Logic tự so sánh nằm gọn ở đây */}
                <PasswordMatch
                    password={password} 
                    confirmPassword={confirmPassword} 
                />
            </div>
        </div>
    )
}