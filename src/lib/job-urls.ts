/**
 * URL utilities for job-related routes
 * Handles slug-based and fallback URL generation
 */

export interface JobUrlParams {
  slug?: string;
  publicId?: string;
  _id?: string;
}

/**
 * Generate a job detail URL using slug as primary, publicId as fallback
 */
export function getJobUrl(job: JobUrlParams): string {
  if (job.slug) {
    return `/jobs/${job.slug}`;
  } else if (job.publicId) {
    return `/jobs/${job.publicId}`;
  } else if (job._id) {
    // Legacy fallback
    return `/jobs/${job._id}`;
  }
  throw new Error(
    "Job must have at least one identifier (slug, publicId, or _id)"
  );
}

/**
 * Generate a job application URL using slug as primary, publicId as fallback
 */
export function getJobApplyUrl(job: JobUrlParams): string {
  if (job.slug) {
    return `/apply/${job.slug}`;
  } else if (job.publicId) {
    return `/apply/${job.publicId}`;
  } else if (job._id) {
    // Legacy fallback
    return `/apply/${job._id}`;
  }
  throw new Error(
    "Job must have at least one identifier (slug, publicId, or _id)"
  );
}

/**
 * Generate a shareable job URL for social media, emails, etc.
 */
export function getShareableJobUrl(
  job: JobUrlParams,
  baseUrl?: string
): string {
  const base =
    baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${getJobUrl(job)}`;
}

/**
 * Utility to generate slug from title (for preview/testing)
 */
export function generateSlugPreview(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim() // Remove leading/trailing spaces
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  // Add random string for preview
  const randomString = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomString}`;
}
