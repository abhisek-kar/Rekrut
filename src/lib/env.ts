import { z } from "zod";

/**
 * Specify your environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
const schema = z.object({
  // Database
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // JWT Authentication
  JWT_SECRET: z.string().min(32, "JWT secret should be at least 32 characters long"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // AWS Credentials
  AWS_ACCESS_KEY_ID: z.string().min(1, "AWS access key ID is required"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, "AWS secret access key is required"),
  AWS_REGION: z.string().min(1, "AWS region is required"),
  AWS_S3_BUCKET_NAME: z.string().min(1, "AWS S3 bucket name is required"),

  // Email Settings
  EMAIL_HOST: z.string().min(1, "Email host is required"),
  EMAIL_PORT: z.string().transform((val) => parseInt(val, 10)),
  EMAIL_SECURE: z.string().transform((val) => val === "true"),
  EMAIL_USER: z.string().min(1, "Email user is required"),
  EMAIL_PASSWORD: z.string().min(1, "Email password is required"),
  EMAIL_FROM: z.string().min(1, "Email from address is required"),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

// Validate environment variables
const _env = schema.safeParse({
  // Database
  MONGODB_URI: process.env.MONGODB_URI,

  // JWT Authentication
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

  // AWS Credentials
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,

  // Email Settings
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_SECURE: process.env.EMAIL_SECURE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,

  // Application
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

// Development fallbacks for email and AWS if not configured
if (process.env.NODE_ENV !== "production" && !_env.success) {
  console.warn(
    "⚠️ Environment validation failed. Some features may not work correctly.",
    _env.error.format()
  );
}

// For development fallbacks, use these if env variables are not set
const developmentFallbacks = {
  // Database
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/rekrut",

  // JWT Authentication
  JWT_SECRET: process.env.JWT_SECRET || "development_secret_at_least_32_chars_long",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // AWS Credentials
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "development_key",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "development_secret",
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || "rekrut-development",

  // Email Settings
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.example.com",
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || "587", 10),
  EMAIL_SECURE: process.env.EMAIL_SECURE === "true",
  EMAIL_USER: process.env.EMAIL_USER || "user@example.com",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "password",
  EMAIL_FROM: process.env.EMAIL_FROM || "no-reply@rekrut.com",

  // Application
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

// Export validated env or fallbacks for development
export const env = process.env.NODE_ENV === "production" 
  ? (_env.success ? _env.data : process.env as any)
  : (_env.success ? _env.data : developmentFallbacks);
