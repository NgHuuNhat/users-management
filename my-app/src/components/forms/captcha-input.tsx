"use client"

import {
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form"

type CaptchaInputProps<T extends FieldValues> = {
  label: string
  name: Path<T>
  captchaText: string
  placeholder?: string
}

export default function CaptchaInput<T extends FieldValues>({
  label,
  name,
  captchaText,
  placeholder,
}: CaptchaInputProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>()

  const errorMessage =
    errors[name]?.message as string | undefined

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {label}
      </label>

      {/* Captcha Display */}
      <div className="flex items-center justify-center rounded-md border bg-gray-100 p-4">
        <span className="select-none text-xl font-bold tracking-[6px]">
          {captchaText}
        </span>
      </div>

      {/* Input */}
      <input
        type="text"
        placeholder={placeholder}
        {...register(name)}
        className="w-full rounded-md border p-3"
      />

      {/* ERROR SLOT (giữ chỗ cố định) */}
      <p className="h-[12px] mt-[2px] text-[10px] leading-none">
        {errorMessage ? (
          <span className="text-red-500">
            {errorMessage}
          </span>
        ) : (
          <span className="text-transparent">.</span>
        )}
      </p>
    </div>
  )
}