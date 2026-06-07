import { useState, useEffect, useCallback } from "react"

export function useCaptcha(length = 6) {
    const [captchaText, setCaptchaText] = useState("")

    const generateCaptcha = useCallback(() => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
        let result = ""
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setCaptchaText(result)
    }, [length])

    // Generate mã khi lần đầu render (chỉ chạy ở Client)
    useEffect(() => {
        generateCaptcha()
    }, [generateCaptcha])

    return {
        captchaText,
        refreshCaptcha: generateCaptcha,
    }
}