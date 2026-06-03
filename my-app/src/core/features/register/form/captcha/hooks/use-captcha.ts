"use client"

import { useEffect, useState } from "react"

import { generateCaptcha }
from "../utils/generate-captcha"

export function useCaptcha() {
  const [captchaText, setCaptchaText] =
    useState("")

  const refreshCaptcha = () => {
    setCaptchaText(generateCaptcha())
  }

  useEffect(() => {
    refreshCaptcha()
  }, [])

  return {
    captchaText,
    refreshCaptcha,
  }
}