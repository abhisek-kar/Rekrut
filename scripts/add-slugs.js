const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ats";

// Job Schema (simplified for migration)
const JobSchema = new mongoose.Schema(
  {
    publicId: String,
    slug: String,
    title: String,
    company: String,
    // ... other fields
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", JobSchema);

// Utility functions
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim() // Remove leading/trailing spaces
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

function generateRandomString(length = 4) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function addSlugsToExistingJobs() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all jobs without slugs or publicIds
    const jobs = await Job.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: "" },
        { publicId: { $exists: false } },
        { publicId: null },
        { publicId: "" },
      ],
    });

    console.log(`Found ${jobs.length} jobs to update`);

    for (const job of jobs) {
      // Add publicId if missing
      if (!job.publicId) {
        job.publicId = uuidv4();
      }

      // Add slug if missing
      if (!job.slug) {
        const baseSlug = generateSlug(job.title);
        const randomString = generateRandomString();
        let newSlug = `${baseSlug}-${randomString}`;

        // Ensure uniqueness
        let counter = 1;
        while (await Job.findOne({ slug: newSlug, _id: { $ne: job._id } })) {
          newSlug = `${baseSlug}-${randomString}-${counter}`;
          counter++;
        }

        job.slug = newSlug;
      }

      await job.save();
      console.log(`Updated job: ${job.title} -> ${job.slug}`);
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the migration
if (require.main === module) {
  addSlugsToExistingJobs();
}

module.exports = { addSlugsToExistingJobs };
