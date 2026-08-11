import { z } from "zod"

/** Optional URL field: empty string is valid, anything else must be a real URL. */
export const urlOrEmpty = z
  .string()
  .trim()
  .refine((value) => value === "" || z.string().url().safeParse(value).success, {
    message: "Enter a valid URL",
  })

/** Optional email field: empty string is valid, anything else must be a real email address. */
export const emailOrEmpty = z
  .string()
  .trim()
  .refine((value) => value === "" || z.string().email().safeParse(value).success, {
    message: "Enter a valid email",
  })
