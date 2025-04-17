import { validateEnv } from "../env";

let initialized = false;

export async function initializeServer() {
  // Ensure we only run this once
  if (initialized) return;

  // Validate environment variables
  try {
    validateEnv();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Environment validation failed:", errorMessage);
    return;
  }

  // Mark as initialized
  initialized = true;
  console.log("🚀 Server initialization complete");
}
