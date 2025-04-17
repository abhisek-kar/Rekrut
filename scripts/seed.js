// This script runs the database seeders directly
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

// Validate environment variables
function validateEnv() {
  const requiredEnvVars = ["MONGODB_URI"];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`
    );
  }

  // Warn about recommended variables
  const recommendedEnvVars = [
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "ADMIN_FIRST_NAME",
    "ADMIN_LAST_NAME",
  ];

  const missingRecommendedEnvVars = recommendedEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingRecommendedEnvVars.length > 0) {
    console.warn(
      `Warning: Missing recommended environment variables: ${missingRecommendedEnvVars.join(
        ", "
      )}`
    );
  }

  return true;
}

// Define MongoDB connection URL
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/rekrut";

// Define the User schema for seeding the admin
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ["admin", "subadmin"], default: "subadmin" },
    profilePhoto: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Create the User model
const User = mongoose.model("User", userSchema);

// Seed the admin user
async function seedAdmin() {
  console.log("🌱 Checking for admin user...");

  // Check if environment variables are set
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFirstName = process.env.ADMIN_FIRST_NAME;
  const adminLastName = process.env.ADMIN_LAST_NAME;

  if (!adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
    console.warn(
      "❌ Admin credentials not found in environment variables, skipping admin seed"
    );
    return;
  }

  console.log(`👤 Checking for admin user with email: ${adminEmail}`);

  // Check if admin already exists
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log(
      `✅ Admin user already exists: ${existingAdmin.firstName} ${existingAdmin.lastName}`
    );
    return;
  }

  console.log("➕ Creating new admin user...");

  // Create admin user
  const adminUser = new User({
    email: adminEmail,
    password: adminPassword,
    firstName: adminFirstName,
    lastName: adminLastName,
    role: "admin",
    status: "active",
    permissions: ["all"],
  });

  await adminUser.save();
  console.log(
    `✅ Admin user created successfully: ${adminFirstName} ${adminLastName} (${adminEmail})`
  );
}

// Main function to run seeders
async function runSeeders() {
  try {
    // Validate environment variables
    validateEnv();

    console.log(`🔌 Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Run seeders
    await seedAdmin();

    console.log("✅ All seeders completed successfully");
  } catch (error) {
    console.error("❌ Seeding error:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  }
}

// Run the seeders
runSeeders();
