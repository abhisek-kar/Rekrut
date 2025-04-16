/**
 * Validate required environment variables
 */
export function validateEnv() {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }

  // Warn about recommended variables
  const recommendedEnvVars = [
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'ADMIN_FIRST_NAME',
    'ADMIN_LAST_NAME',
  ];

  const missingRecommendedEnvVars = recommendedEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingRecommendedEnvVars.length > 0) {
    console.warn(
      `Warning: Missing recommended environment variables: ${missingRecommendedEnvVars.join(
        ', '
      )}`
    );
  }

  return true;
}
