"use client"

import CaptchaInput from "./captcha-input";

interface CaptchaSectionProps {
    captchaText: string;
    onRefresh: () => void;
}

export function CaptchaSection({ captchaText, onRefresh }: CaptchaSectionProps) {
    return (
        <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
            <CaptchaInput
                label="Mã xác nhận"
                name="captcha"
                captchaText={captchaText}
                onRefresh={onRefresh}
                placeholder="Nhập mã bên trên"
            />
        </div>
    )
}