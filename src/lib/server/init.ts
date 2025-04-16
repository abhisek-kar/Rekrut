import { runSeeders } from '../seed';
import { validateEnv } from '../env';

let initialized = false;

export async function initializeServer() {
  // Ensure we only run this once
  if (initialized) return;

  // Validate environment variables
  try {
    validateEnv();
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    return;
  }

  // Run database seeders
  await runSeeders();

  // Mark as initialized
  initialized = true;
  console.log('🚀 Server initialization complete');
}
