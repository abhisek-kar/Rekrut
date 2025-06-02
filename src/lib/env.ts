import { z } from "zod";

/**
 * Environment variable validation schema
 * This ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Database
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // Authentication
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().optional().default("7d"),

  // Admin credentials (for seeding)
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email").optional(),
  ADMIN_PASSWORD: z
    .string()
    .min(8, "ADMIN_PASSWORD must be at least 8 characters")
    .optional(),
  ADMIN_FIRST_NAME: z.string().optional(),
  ADMIN_LAST_NAME: z.string().optional(),

  // Application
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "fatal"]).optional(),

  // Database connection tuning (optional)
  DB_CONNECTION_TIMEOUT: z
    .string()
    .regex(/^\d+$/, "Must be a number")
    .optional(),
  DB_SOCKET_TIMEOUT: z.string().regex(/^\d+$/, "Must be a number").optional(),
  DB_MAX_POOL_SIZE: z.string().regex(/^\d+$/, "Must be a number").optional(),

  // Email settings (optional)
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z
    .string()
    .regex(/^\d+$/, "EMAIL_PORT must be a number")
    .optional(),
  EMAIL_SECURE: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  // EMAIL_FROM: z.string().email("EMAIL_FROM must be a valid email").optional(),

  // AWS S3 settings (optional)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().optional(),
});

/**
 * Validate environment variables
 * This function should be called at application startup
 */
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);

    // Additional custom validations
    if (env.MONGODB_URI) {
      if (
        !env.MONGODB_URI.startsWith("mongodb://") &&
        !env.MONGODB_URI.startsWith("mongodb+srv://")
      ) {
        throw new Error(
          "MONGODB_URI must start with 'mongodb://' or 'mongodb+srv://'"
        );
      }
    }

    // Check if admin credentials are provided for seeding
    const hasAdminCredentials = !!(
      env.ADMIN_EMAIL &&
      env.ADMIN_PASSWORD &&
      env.ADMIN_FIRST_NAME &&
      env.ADMIN_LAST_NAME
    );

    if (env.NODE_ENV === "development" && !hasAdminCredentials) {
      console.warn(
        "⚠️  Admin credentials not provided. Database seeding may not work."
      );
    }

    // Check email configuration completeness
    const emailFields = [
      env.EMAIL_HOST,
      env.EMAIL_PORT,
      env.EMAIL_USER,
      env.EMAIL_PASSWORD,
    ];
    const hasEmailConfig = emailFields.every((field) => !!field);
    const hasPartialEmailConfig = emailFields.some((field) => !!field);

    if (hasPartialEmailConfig && !hasEmailConfig) {
      console.warn(
        "⚠️  Incomplete email configuration. All email fields are required for email functionality."
      );
    }

    // Check AWS configuration completeness
    const awsFields = [
      env.AWS_ACCESS_KEY_ID,
      env.AWS_SECRET_ACCESS_KEY,
      env.AWS_REGION,
      env.AWS_S3_BUCKET_NAME,
    ];
    const hasAwsConfig = awsFields.every((field) => !!field);
    const hasPartialAwsConfig = awsFields.some((field) => !!field);

    if (hasPartialAwsConfig && !hasAwsConfig) {
      console.warn(
        "⚠️  Incomplete AWS configuration. All AWS fields are required for file upload functionality."
      );
    }

    console.log("✅ Environment variables validated successfully");
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment variable validation failed:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    } else {
      console.error("❌ Environment validation error:", error);
    }

    process.exit(1);
  }
}

/**
 * Get validated environment variables
 * This should only be called after validateEnv()
 */
export function getEnv() {
  return envSchema.parse(process.env);
}

/**
 * Check if specific features are configured
 */
export function getFeatureFlags() {
  const env = getEnv();

  return {
    emailEnabled: !!(
      env.EMAIL_HOST &&
      env.EMAIL_PORT &&
      env.EMAIL_USER &&
      env.EMAIL_PASSWORD
    ),
    s3Enabled: !!(
      env.AWS_ACCESS_KEY_ID &&
      env.AWS_SECRET_ACCESS_KEY &&
      env.AWS_REGION &&
      env.AWS_S3_BUCKET_NAME
    ),
    adminSeedingEnabled: !!(
      env.ADMIN_EMAIL &&
      env.ADMIN_PASSWORD &&
      env.ADMIN_FIRST_NAME &&
      env.ADMIN_LAST_NAME
    ),
  };
}

// Export the schema for use in other files if needed
export { envSchema };
