import { seedAdmin } from './admin';

/**
 * Run all seeders
 */
export async function runSeeders() {
  console.log('🌱 Running database seeders...');
  
  try {
    // Run all seeders sequentially
    await seedAdmin();
    
    console.log('✅ All seeders completed successfully');
  } catch (error) {
    console.error('❌ Error running seeders:', error);
  }
}
