"use client"

interface PasswordStrengthProps {
    password?: string
}

export default function PasswordStrength({ password = "" }: PasswordStrengthProps) {
    // Đánh giá điểm (0-4)
    let score = 0
    if (password.length > 7) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1

    const getStrengthLabel = () => {
        if (!password) return "Chưa nhập"
        if (score <= 1) return "Yếu"
        if (score === 2) return "Trung bình"
        if (score === 3) return "Khá"
        return "Mạnh"
    }

    const getColor = (index: number) => {
        if (!password) return "bg-gray-200"
        if (score <= 1) return index === 0 ? "bg-red-500" : "bg-gray-200"
        if (score === 2) return index < 2 ? "bg-orange-400" : "bg-gray-200"
        if (score === 3) return index < 3 ? "bg-blue-500" : "bg-gray-200"
        return "bg-green-500"
    }

    return (
        <div className="mt-2 flex items-center justify-between">
            <div className="flex space-x-1 w-full mr-2">
                {[0, 1, 2, 3].map((index) => (
                    <div
                        key={index}
                        className={`h-1 w-1/4 rounded-full transition-colors ${getColor(index)}`}
                    />
                ))}
            </div>
            <span className="text-[10px] whitespace-nowrap text-gray-500 font-medium">
                {getStrengthLabel()}
            </span>
        </div>
    )
}