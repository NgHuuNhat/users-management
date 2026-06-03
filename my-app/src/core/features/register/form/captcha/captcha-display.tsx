"use client"

import { memo } from "react"

type CaptchaDisplayProps = {
    captchaText: string
    onRefresh: () => void
}

function CaptchaDisplay({ captchaText, onRefresh }: CaptchaDisplayProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between rounded-md border bg-gray-100 p-4">
                <span className="select-none text-xl font-bold tracking-[6px]"> {captchaText} </span>
                <button type="button" onClick={onRefresh} className="rounded border px-3 py-1 text-sm" > Refresh </button>
            </div>
        </div>)
}
export default memo(CaptchaDisplay)