import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    TACHLES_OFFICE_POSTGRES_URL: z.string(),
    TACHLES_OFFICE_PRISMA_DATABASE_URL: z.string(),
    PAYPLUS_PAGE_UID: z.string(),
    PAYPLUS_API_KEY: z.string(),
    PAYPLUS_SECRET_KEY: z.string(),
    RESEND_API_KEY: z.string(),
    FROM_EMAIL: z.string().email(),
  },
  runtimeEnv: {
    TACHLES_OFFICE_POSTGRES_URL: process.env.TACHLES_OFFICE_POSTGRES_URL,
    TACHLES_OFFICE_PRISMA_DATABASE_URL:
      process.env.TACHLES_OFFICE_PRISMA_DATABASE_URL,
    PAYPLUS_PAGE_UID: process.env.PAYPLUS_PAGE_UID,
    PAYPLUS_API_KEY: process.env.PAYPLUS_API_KEY,
    PAYPLUS_SECRET_KEY: process.env.PAYPLUS_SECRET_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL,
  },
  skipValidation:
    process.env.NODE_ENV === "production" && !process.env.SERVICE_KEY,
});
