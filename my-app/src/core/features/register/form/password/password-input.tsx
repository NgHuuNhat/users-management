"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import FormInput from "../form-input"

export default function PasswordInput(props: any) {
    const [show, setShow] = useState(false)

    return (
        <div className="relative">
            <FormInput {...props} type={show ? "text" : "password"} />

            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-[52%] -translate-y-1/2 text-gray-500"
            >
                {show ? <EyeOff className="w-5 h-5 pt-1" /> : <Eye className="w-5 h-5 pt-1" />}
            </button>
        </div>
    )
}