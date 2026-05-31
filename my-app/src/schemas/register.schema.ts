import { z } from "zod"

export const registerSchema = z
  .object({
    email: z
      .email("Invalid email"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain uppercase, lowercase and number"
      ),

    confirmPassword: z.string(),

    captcha: z
      .string()
      .length(8, "Captcha must be 8 characters"),
  })
  // .refine(
  //   (data) => data.password === data.confirmPassword,
  //   {
  //     message: "Passwords do not match",
  //     path: ["confirmPassword"],
  //   }
  // )

export type RegisterSchemaType =
  z.infer<typeof registerSchema>