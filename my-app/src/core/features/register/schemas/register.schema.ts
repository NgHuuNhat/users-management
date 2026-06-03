import { z } from "zod"

const registerBaseSchema = z.object({
  email: z
    .email("Invalid email"),

  password: z
    .string()
    .min(
      8,
      "Password must be at least 8 characters"
    )
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain uppercase, lowercase and number"
    ),

  confirmPassword: z.string(),

  captcha: z
    .string()
    .length(
      8,
      "Captcha must be 8 characters"
    ),
})

export type RegisterSchemaType =
  z.infer<typeof registerBaseSchema>

export const registerSchema = (captchaText: string) => registerBaseSchema
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    }
  )

  .refine(
    (data) => data.captcha === captchaText,
    {
      path: ["captcha"],
      message: "Invalid captcha",
    }
  )