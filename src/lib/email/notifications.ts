import { sendEmail } from "./index";
import { getEmailTemplate, EmailTemplateVariables } from "./templates";
import Notification from "@/models/Notification";
import User from "@/models/User";
import Job from "@/models/Job";
import Application from "@/models/Application";
import Candidate from "@/models/Candidate";
import { getFeatureFlags } from "@/lib/env";
import mongoose from "mongoose";

export interface NotificationData {
  userId: string | mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  link?: string;
  relatedId?: string | mongoose.Types.ObjectId;
  relatedType?: string;
  data?: Record<string, unknown>;
  sendEmail?: boolean;
  emailVariables?: EmailTemplateVariables;
}

/**
 * Create a notification and optionally send an email
 */
export async function createNotification(
  notificationData: NotificationData
): Promise<void> {
  try {
    const { emailEnabled } = getFeatureFlags();

    // Create in-app notification
    const notification = await Notification.create({
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      link: notificationData.link,
      relatedId: notificationData.relatedId,
      relatedType: notificationData.relatedType,
      data: notificationData.data,
      read: false,
      emailSent: false,
    });

    // Send email if requested and email is enabled
    if (
      notificationData.sendEmail &&
      emailEnabled &&
      notificationData.emailVariables
    ) {
      try {
        // Get user email
        const user = await User.findById(notificationData.userId).select(
          "email firstName lastName"
        );

        if (!user || !user.email) {
          console.warn(
            `Cannot send email notification: User not found or no email for user ${notificationData.userId}`
          );
          return;
        }

        // Get email template
        const emailTemplate = getEmailTemplate(
          notificationData.type,
          notificationData.emailVariables
        );

        if (!emailTemplate) {
          console.warn(
            `Email template not found for notification type: ${notificationData.type}`
          );
          return;
        }

        // Send email
        await sendEmail({
          to: user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });

        // Update notification to mark email as sent
        await Notification.findByIdAndUpdate(notification._id, {
          emailSent: true,
          emailSentAt: new Date(),
        });

        console.log(
          `Email notification sent successfully to ${user.email} for type: ${notificationData.type}`
        );
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
        // Don't throw error, just log it - in-app notification should still work
      }
    }
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// =============================================================================
// JOB-RELATED NOTIFICATION FUNCTIONS
// =============================================================================

/**
 * Notify SubAdmin about job assignment
 */
export async function notifyJobAssignment(
  jobId: string,
  assignedToUserId: string,
  assignedByUserId: string,
  appUrl: string
): Promise<void> {
  try {
    const job = await Job.findById(jobId).populate(
      "createdBy",
      "firstName lastName"
    );
    const assignedToUser = await User.findById(assignedToUserId);
    const assignedByUser = await User.findById(assignedByUserId);

    if (!job || !assignedToUser || !assignedByUser) {
      throw new Error(
        "Required data not found for job assignment notification"
      );
    }

    const jobUrl = `${appUrl}/subadmin/jobs/${jobId}`;

    await createNotification({
      userId: assignedToUserId,
      type: "job_assignment",
      title: "New Job Assignment",
      message: `You have been assigned to manage "${job.title}" by ${assignedByUser.firstName} ${assignedByUser.lastName}`,
      link: `/subadmin/jobs/${jobId}`,
      relatedId: jobId,
      relatedType: "job",
      data: {
        jobTitle: job.title,
        assignedBy: `${assignedByUser.firstName} ${assignedByUser.lastName}`,
        assignedAt: new Date(),
      },
      sendEmail: true,
      emailVariables: {
        recipientName: `${assignedToUser.firstName} ${assignedToUser.lastName}`,
        jobTitle: job.title,
        companyName: job.company,
        assignedBy: `${assignedByUser.firstName} ${assignedByUser.lastName}`,
        jobUrl: jobUrl,
        appUrl: appUrl,
      },
    });
  } catch (error) {
    console.error("Error sending job assignment notification:", error);
    throw error;
  }
}

/**
 * Notify recruiters about new job application
 */
export async function notifyNewJobApplication(
  applicationId: string,
  appUrl: string
): Promise<void> {
  try {
    const application = await Application.findById(applicationId)
      .populate("job", "title company assignedTo")
      .populate("candidate", "firstName lastName email");

    if (!application || !application.job || !application.candidate) {
      throw new Error(
        "Required data not found for new application notification"
      );
    }

    const job = application.job as any;
    const candidate = application.candidate as any;

    // Notify assigned recruiter
    if (job.assignedTo) {
      const assignedUser = await User.findById(job.assignedTo);

      if (assignedUser) {
        const applicationUrl = `${appUrl}/subadmin/applications/${applicationId}`;

        await createNotification({
          userId: job.assignedTo,
          type: "job_application_received",
          title: "New Job Application",
          message: `${candidate.firstName} ${candidate.lastName} applied for "${job.title}"`,
          link: `/subadmin/applications/${applicationId}`,
          relatedId: applicationId,
          relatedType: "application",
          data: {
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            candidateEmail: candidate.email,
            jobTitle: job.title,
            appliedAt: application.createdAt,
          },
          sendEmail: true,
          emailVariables: {
            recipientName: `${assignedUser.firstName} ${assignedUser.lastName}`,
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            jobTitle: job.title,
            applicationUrl: applicationUrl,
            candidateEmail: candidate.email,
            applicationDate: new Date(
              application.createdAt
            ).toLocaleDateString(),
          },
        });
      }
    }

    // Also notify admin users
    const adminUsers = await User.find({ role: "admin" });

    for (const admin of adminUsers) {
      const applicationUrl = `${appUrl}/admin/applications/${applicationId}`;

      await createNotification({
        userId: admin._id,
        type: "job_application_received",
        title: "New Job Application",
        message: `${candidate.firstName} ${candidate.lastName} applied for "${job.title}"`,
        link: `/admin/applications/${applicationId}`,
        relatedId: applicationId,
        relatedType: "application",
        data: {
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          candidateEmail: candidate.email,
          jobTitle: job.title,
          appliedAt: application.createdAt,
        },
        sendEmail: false, // Only send email to assigned recruiter
        emailVariables: {
          recipientName: `${admin.firstName} ${admin.lastName}`,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          jobTitle: job.title,
          applicationUrl: applicationUrl,
          candidateEmail: candidate.email,
          applicationDate: new Date(application.createdAt).toLocaleDateString(),
        },
      });
    }
  } catch (error) {
    console.error("Error sending new application notification:", error);
    throw error;
  }
}

/**
 * Notify about job status change
 */
export async function notifyJobStatusChange(
  jobId: string,
  oldStatus: string,
  newStatus: string,
  changedByUserId: string,
  reason?: string,
  appUrl: string = ""
): Promise<void> {
  try {
    const job = await Job.findById(jobId);
    const changedByUser = await User.findById(changedByUserId);

    if (!job || !changedByUser) {
      throw new Error(
        "Required data not found for job status change notification"
      );
    }

    // Notify assigned user if exists and different from the person who made the change
    if (job.assignedTo && job.assignedTo.toString() !== changedByUserId) {
      const assignedUser = await User.findById(job.assignedTo);

      if (assignedUser) {
        const jobUrl = `${appUrl}/subadmin/jobs/${jobId}`;

        await createNotification({
          userId: job.assignedTo,
          type: "job_status_change",
          title: "Job Status Updated",
          message: `"${job.title}" status changed from ${oldStatus} to ${newStatus}`,
          link: `/subadmin/jobs/${jobId}`,
          relatedId: jobId,
          relatedType: "job",
          data: {
            jobTitle: job.title,
            oldStatus,
            newStatus,
            changedBy: `${changedByUser.firstName} ${changedByUser.lastName}`,
            reason,
            changedAt: new Date(),
          },
          sendEmail: true,
          emailVariables: {
            recipientName: `${assignedUser.firstName} ${assignedUser.lastName}`,
            jobTitle: job.title,
            oldStatus,
            newStatus,
            reason,
            jobUrl: jobUrl,
            changedBy: `${changedByUser.firstName} ${changedByUser.lastName}`,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error sending job status change notification:", error);
    throw error;
  }
}

// =============================================================================
// APPLICATION-RELATED NOTIFICATION FUNCTIONS
// =============================================================================

/**
 * Send application confirmation email to candidate
 */
export async function sendApplicationConfirmation(
  applicationId: string,
  trackingToken?: string,
  appUrl: string = ""
): Promise<void> {
  try {
    const application = await Application.findById(applicationId)
      .populate("job", "title company")
      .populate("candidate", "firstName lastName email");

    if (!application || !application.job || !application.candidate) {
      throw new Error("Required data not found for application confirmation");
    }

    const job = application.job as any;
    const candidate = application.candidate as any;

    // This is sent directly to candidate email, not through notification system
    // since candidates might not have user accounts
    const { emailEnabled } = getFeatureFlags();

    if (emailEnabled) {
      const statusUrl = trackingToken
        ? `${appUrl}/application-status?token=${trackingToken}`
        : undefined;

      const emailTemplate = getEmailTemplate("application_confirmation", {
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        jobTitle: job.title,
        companyName: job.company,
        applicationDate: new Date(application.createdAt).toLocaleDateString(),
        trackingToken,
        statusUrl,
      });

      if (emailTemplate) {
        await sendEmail({
          to: candidate.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });

        console.log(
          `Application confirmation sent to ${candidate.email} for job: ${job.title}`
        );
      }
    }
  } catch (error) {
    console.error("Error sending application confirmation:", error);
    throw error;
  }
}

/**
 * Notify candidate about application status change
 */
export async function notifyApplicationStatusChange(
  applicationId: string,
  oldStatus: string,
  newStatus: string,
  message?: string,
  nextSteps?: string,
  interviewDetails?: {
    date: string;
    time: string;
    location?: string;
    interviewers?: string[];
  }
): Promise<void> {
  try {
    const application = await Application.findById(applicationId)
      .populate("job", "title company")
      .populate("candidate", "firstName lastName email user");

    if (!application || !application.job || !application.candidate) {
      throw new Error(
        "Required data not found for application status change notification"
      );
    }

    const job = application.job as any;
    const candidate = application.candidate as any;

    // If candidate has a user account, create in-app notification
    if (candidate.user) {
      await createNotification({
        userId: candidate.user,
        type: "application_status_change",
        title: "Application Status Updated",
        message: `Your application for "${
          job.title
        }" status changed to ${newStatus.replace("_", " ")}`,
        link: `/candidate-portal/applications/${applicationId}`,
        relatedId: applicationId,
        relatedType: "application",
        data: {
          jobTitle: job.title,
          companyName: job.company,
          oldStatus,
          newStatus,
          message,
          nextSteps,
          interviewDetails,
          updatedAt: new Date(),
        },
        sendEmail: true,
        emailVariables: {
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          jobTitle: job.title,
          companyName: job.company,
          oldStatus,
          newStatus,
          message,
          nextSteps,
          interviewDetails,
        },
      });
    } else {
      // Send email directly if candidate doesn't have user account
      const { emailEnabled } = getFeatureFlags();

      if (emailEnabled) {
        const emailTemplate = getEmailTemplate("application_status_change", {
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          jobTitle: job.title,
          companyName: job.company,
          oldStatus,
          newStatus,
          message,
          nextSteps,
          interviewDetails,
        });

        if (emailTemplate) {
          await sendEmail({
            to: candidate.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
          });

          console.log(
            `Application status change notification sent to ${candidate.email} for job: ${job.title}`
          );
        }
      }
    }
  } catch (error) {
    console.error(
      "Error sending application status change notification:",
      error
    );
    throw error;
  }
}

// =============================================================================
// SYSTEM NOTIFICATION FUNCTIONS
// =============================================================================

/**
 * Notify about account creation
 */
export async function notifyAccountCreated(
  userId: string,
  setupUrl: string,
  createdByUserId: string
): Promise<void> {
  try {
    const user = await User.findById(userId);
    const createdByUser = await User.findById(createdByUserId);

    if (!user || !createdByUser) {
      throw new Error(
        "Required data not found for account creation notification"
      );
    }

    await createNotification({
      userId: userId,
      type: "account_created",
      title: "Welcome to Rekrut ATS",
      message: `Your account has been created. Please complete your setup.`,
      link: "/account-setup",
      data: {
        createdBy: `${createdByUser.firstName} ${createdByUser.lastName}`,
        createdAt: new Date(),
      },
      sendEmail: true,
      emailVariables: {
        recipientName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        setupUrl: setupUrl,
        createdBy: `${createdByUser.firstName} ${createdByUser.lastName}`,
      },
    });
  } catch (error) {
    console.error("Error sending account creation notification:", error);
    throw error;
  }
}

/**
 * Notify about bulk operation completion
 */
export async function notifyBulkOperationComplete(
  userId: string,
  operationType: string,
  affectedCount: number,
  entityType: string,
  details?: string
): Promise<void> {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found for bulk operation notification");
    }

    await createNotification({
      userId: userId,
      type: "bulk_operation_complete",
      title: "Bulk Operation Completed",
      message: `${operationType} completed on ${affectedCount} ${entityType}(s)`,
      data: {
        operationType,
        affectedCount,
        entityType,
        details,
        completedAt: new Date(),
      },
      sendEmail: true,
      emailVariables: {
        recipientName: `${user.firstName} ${user.lastName}`,
        operationType,
        affectedCount,
        entityType,
        details,
      },
    });
  } catch (error) {
    console.error("Error sending bulk operation notification:", error);
    throw error;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<void> {
  try {
    await Notification.findOneAndUpdate(
      { _id: notificationId, userId: userId },
      { read: true, readAt: new Date() }
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<void> {
  try {
    await Notification.updateMany(
      { userId: userId, read: false },
      { read: true, readAt: new Date() }
    );
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  try {
    return await Notification.countDocuments({
      userId: userId,
      read: false,
    });
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return 0;
  }
}

/**
 * Get notifications for a user with pagination
 */
export async function getUserNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20,
  type?: string
): Promise<{ notifications: any[]; total: number; pages: number }> {
  try {
    const query: any = { userId: userId };

    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      notifications,
      total,
      pages,
    };
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw error;
  }
}

/**
 * Delete old notifications (cleanup utility)
 */
export async function cleanupOldNotifications(
  daysOld: number = 30
): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      read: true,
    });

    console.log(`Cleaned up ${result.deletedCount} old notifications`);
  } catch (error) {
    console.error("Error cleaning up old notifications:", error);
    throw error;
  }
}
