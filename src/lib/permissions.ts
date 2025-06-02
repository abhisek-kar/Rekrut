import { Session } from "next-auth";
import Job from "@/models/Job";
import Application from "@/models/Application";

/**
 * Check if the current user has permission to access a job
 */
export async function canAccessJob(
  jobId: string,
  session: Session | null
): Promise<boolean> {
  if (!session?.user) return false;

  try {
    // Admin has access to all jobs
    if (session.user.role === "admin") return true;

    // Check if job exists and user has permission
    const job = await Job.findById(jobId);

    if (!job) return false;

    // SubAdmin can access jobs assigned to them or created by them
    if (session.user.role === "subadmin") {
      return (
        job.assignedTo?.toString() === session.user.id ||
        job.createdBy.toString() === session.user.id
      );
    }

    return false;
  } catch (error) {
    console.error("Error checking job permissions:", error);
    return false;
  }
}

/**
 * Check if the current user has permission to access an application
 */
export async function canAccessApplication(
  applicationId: string,
  session: Session | null
): Promise<boolean> {
  if (!session?.user) return false;

  try {
    // Admin has access to all applications
    if (session.user.role === "admin") return true;

    // Check if application exists
    const application = await Application.findById(applicationId).populate(
      "jobId"
    );

    if (!application) return false;

    // SubAdmin can access applications for jobs assigned to them
    if (session.user.role === "subadmin") {
      const job = application.jobId;
      if (!job) return false;

      return (
        job.assignedTo?.toString() === session.user.id ||
        job.createdBy.toString() === session.user.id
      );
    }

    // Candidate can access their own applications
    if (session.user.role === "candidate") {
      return application.candidateId.toString() === session.user.id;
    }

    return false;
  } catch (error) {
    console.error("Error checking application permissions:", error);
    return false;
  }
}

/**
 * Check if the current user can modify a job
 */
export async function canModifyJob(
  jobId: string,
  session: Session | null
): Promise<boolean> {
  if (!session?.user) return false;

  try {
    // Admin can modify any job
    if (session.user.role === "admin") return true;

    // Check if job exists
    const job = await Job.findById(jobId);

    if (!job) return false;

    // SubAdmin can modify jobs assigned to them or created by them
    if (session.user.role === "subadmin") {
      return (
        job.assignedTo?.toString() === session.user.id ||
        job.createdBy.toString() === session.user.id
      );
    }

    return false;
  } catch (error) {
    console.error("Error checking job modification permissions:", error);
    return false;
  }
}

/**
 * Check if the current user can assign a job
 */
export async function canAssignJob(
  jobId: string,
  session: Session | null
): Promise<boolean> {
  if (!session?.user) return false;

  // Only admins can assign jobs
  return session.user.role === "admin";
}

/**
 * Check if the current user can modify an application
 */
export async function canModifyApplication(
  applicationId: string,
  session: Session | null
): Promise<boolean> {
  if (!session?.user) return false;

  try {
    // Admin can modify any application
    if (session.user.role === "admin") return true;

    // Check if application exists
    const application = await Application.findById(applicationId).populate(
      "jobId"
    );

    if (!application) return false;

    // SubAdmin can modify applications for jobs assigned to them
    if (session.user.role === "subadmin") {
      const job = application.jobId;
      if (!job) return false;

      return (
        job.assignedTo?.toString() === session.user.id ||
        job.createdBy.toString() === session.user.id
      );
    }

    return false;
  } catch (error) {
    console.error(
      "Error checking application modification permissions:",
      error
    );
    return false;
  }
}
