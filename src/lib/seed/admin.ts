import User from '@/models/User';
import dbConnect from '@/lib/db/connect';

/**
 * Seeds the admin user if it doesn't exist
 */
export async function seedAdmin() {
  try {
    await dbConnect();
    console.log('🌱 Checking for admin user...');

    // Check if environment variables are set
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminFirstName = process.env.ADMIN_FIRST_NAME;
    const adminLastName = process.env.ADMIN_LAST_NAME;

    if (!adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
      console.warn('❌ Admin credentials not found in environment variables, skipping admin seed');
      return;
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = new User({
      email: adminEmail,
      password: adminPassword,
      firstName: adminFirstName,
      lastName: adminLastName,
      role: 'admin',
      status: 'active',
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  }
}
