"use client"

interface PasswordMatchProps {
    password?: string
    confirmPassword?: string
}

export default function PasswordMatch({ password, confirmPassword }: PasswordMatchProps) {
    if (!confirmPassword) return null

    const isMatch = password === confirmPassword

    return (
        <div className="absolute right-0 -bottom-5 text-[10px] font-medium">
            {isMatch ? (
                <span className="text-green-600">✓ Mật khẩu khớp</span>
            ) : (
                <span className="text-red-500">✗ Mật khẩu không khớp</span>
            )}
        </div>
    )
}