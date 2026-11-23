import { createNeonAuth } from "@neon/auth/next/server";

const cookieSecret =
  process.env.NEON_AUTH_COOKIE_SECRET ||
  "CNgm1q9ctTS2cLsHLqfy+ZECAf+mBMNJN/wkkIXAjSU=";

const baseUrl =
  process.env.NEON_AUTH_BASE_URL ||
  "https://ep-tiny-haze-b9s192u1.neonauth.c-7.eu-central-1.aws.neon.tech/neondb/auth";

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
  },
  logLevel: "warn",
});
