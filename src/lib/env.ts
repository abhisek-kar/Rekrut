import { z } from "zod";

/**
 * Specify your environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
const schema = z.object({
  // Database
  MONGODB_URI: z.string().default("mongodb://localhost:27017/rekrut"),

  // JWT Authentication
  JWT_SECRET: z.string().default("development_secret_at_least_32_chars_long"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // AWS Credentials
  AWS_ACCESS_KEY_ID: z.string().default("development_key"),
  AWS_SECRET_ACCESS_KEY: z.string().default("development_secret"),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_S3_BUCKET_NAME: z.string().default("development-bucket"),

  // Email Settings
  EMAIL_HOST: z.string().default("smtp.example.com"),
  EMAIL_PORT: z.string().transform((val) => parseInt(val, 10)).default("587"),
  EMAIL_SECURE: z.string().transform((val) => val === "true").default("false"),
  EMAIL_USER: z.string().default("user@example.com"),
  EMAIL_PASSWORD: z.string().default("password"),
  EMAIL_FROM: z.string().default("no-reply@rekrut.com"),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
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

// Log validation errors but don't fail in development
if (!_env.success) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "⚠️ Environment validation failed. Using fallback values for development.",
      _env.error.format()
    );
  } else {
    console.error(
      "❌ Environment validation failed in production. Please check your environment variables.",
      _env.error.format()
    );
  }
}

export const env = _env.success ? _env.data : schema.parse({});
