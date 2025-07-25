import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import { authOptions } from "@/lib/auth/nextauth";
import { bulkStatusUpdateSchema } from "@/lib/validators/application";
import Application from "@/models/Application";
import Candidate from "@/models/Candidate";
import Job from "@/models/Job";
import Notification from "@/models/Notification";
import Activity from "@/models/Activity";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request data
    const data = await request.json();

    // Validate request data
    try {
      bulkStatusUpdateSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: error.errors.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const { ids, status, reason, notify } = data;

    // Validate that all IDs are valid ObjectIds
    const validIds = ids.filter((id:any) => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length !== ids.length) {
      return NextResponse.json(
        {
          error: "One or more invalid application IDs",
          invalidIds: ids.filter((id:any) => !mongoose.Types.ObjectId.isValid(id)),
        },
        { status: 400 }
      );
    }

    // Verify that all applications exist
    const applicationsCount = await Application.countDocuments({
      _id: { $in: validIds },
    });

    if (applicationsCount !== validIds.length) {
      return NextResponse.json(
        { error: "One or more applications not found" },
        { status: 404 }
      );
    }

    // Check permission (in a real app, would check if user has permission to update these applications)

    // Get current date for status change
    const now = new Date();

    // Update applications
    const result = await Application.updateMany(
      { _id: { $in: validIds } },
      {
        $set: {
          status,
          updatedAt: now,
        },
        $push: {
          statusHistory: {
            status,
            changedBy: new mongoose.Types.ObjectId(session.user.id),
            changedAt: now,
            reason: reason || `Bulk update to ${status}`,
          },
        },
      }
    );

    // Log activity for each application
    const applications = await Application.find({
      _id: { $in: validIds },
    }).populate("job", "title company");

    if (applications.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No applications were updated",
        },
        { status: 404 }
      );
    }

    // Create activity logs and notifications
    const activityPromises = applications.map((app) => {
      const job = app.job as any;
      return Activity.create({
        userId: session.user.id,
        action: "update_status",
        entityType: "application",
        entityId: app._id,
        details: {
          jobTitle: job.title,
          candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
          status,
          reason: reason || `Bulk update to ${status}`,
        },
        ipAddress:
          request.headers.get("x-forwarded-for") || request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      });
    });

    await Promise.all(activityPromises);

    // Create notifications for candidates if requested
    if (notify) {
      // This would typically involve sending emails
      // For now, we'll just create in-app notifications for demo purposes
      const notificationPromises = applications.map((app) => {
        const job = app.job as any;
        return Notification.create({
          // Note: In MVP, we don't have separate candidate user accounts
          // so we'll skip notifications for now or implement email notifications
          type: "application_status",
          title: "Application Status Update",
          message: `Your application for ${job.title} at ${job.company} has been updated to: ${status}`,
          read: false,
          link: `/candidate-portal/applications/${app._id}`,
          relatedId: app._id,
          email: app.candidate.email, // Store email for future email notification
        });
      });

      await Promise.all(notificationPromises);
    }

    return NextResponse.json({
      success: true,
      count: result.modifiedCount,
      message: `${result.modifiedCount} applications updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating application statuses:", error);
    return NextResponse.json(
      {
        error: "Failed to update application statuses",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
