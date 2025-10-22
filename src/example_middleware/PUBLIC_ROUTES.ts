import { locales } from "@/config/languages";

export const PUBLIC_ROUTES = [
  "/",
  ...locales.map((locale) => `/${locale}`),
  ...locales.map((locale) => `/${locale}`),
  "/landing",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/contact-support",
  "/privacy-policy",
  "/terms-of-use",
  "/error",
  "/auth/confirm",
  /* API routes */
  "/api/auth/email-signup", // API route for email sign-up
  "/api/auth/signin", // API route for sign-in
  "/api/currency-renew", // API route for get new currency rates
  "/api/get-currency", // API route for get currency
  "/api/utils/phone",
  "/api/auth/callback", // OAuth callback route
  "/api/auth/google-oauth", // Google OAuth route
  "/api/test-mail"
];
