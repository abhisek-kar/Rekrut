import { NextRequest, NextResponse } from "next/server";

import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import { auth } from "@/auth";
import Job from "@/models/Job";
import User from "@/models/User";
import Activity from "@/models/Activity";
import Notification from "@/models/Notification";
import { ZodError } from "zod";
import { z } from "zod";

// Validation schema for bulk operations
const bulkJobActionSchema = z.object({
  action: z.enum([
    "change-status",
    "assign",
    "set-visibility",
    "set-featured",
    "set-template",
    "archive",
    "delete",
  ]),
  jobIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID"))
    .min(1),
  data: z
    .object({
      status: z
        .enum(["draft", "active", "paused", "closed", "archived"])
        .optional(),
      assignedTo: z.string().optional(),
      assigneeName: z.string().optional(),
      visibility: z.enum(["public", "private"]).optional(),
      featured: z.boolean().optional(),
      isTemplate: z.boolean().optional(),
      reason: z.string().optional(),
      notify: z.boolean().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get session to verify authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request data
    const requestData = await request.json();

    // Validate request data
    try {
      bulkJobActionSchema.parse(requestData);
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

    const { action, jobIds, data = {} } = requestData;

    // Convert job IDs to ObjectIds
    const objectIds = jobIds.map(
      (id: string) => new mongoose.Types.ObjectId(id)
    );

    // Verify that all jobs exist and user has permission to modify them
    const jobs = await Job.find({ _id: { $in: objectIds } });

    if (jobs.length !== jobIds.length) {
      return NextResponse.json(
        { error: "One or more jobs not found" },
        { status: 404 }
      );
    }

    // Check permissions based on user role
    if (session.user.role === "subadmin") {
      // SubAdmins can only modify jobs assigned to them
      const unauthorizedJobs = jobs.filter(
        (job) => job.assignedTo?.toString() !== session.user.id
      );

      if (unauthorizedJobs.length > 0) {
        return NextResponse.json(
          { error: "You do not have permission to modify some of these jobs" },
          { status: 403 }
        );
      }
    }

    let updateData: any = {};
    let result: any;

    switch (action) {
      case "change-status":
        if (!data.status) {
          return NextResponse.json(
            { error: "Status is required for status change action" },
            { status: 400 }
          );
        }

        updateData = {
          status: data.status,
          updatedAt: new Date(),
        };

        result = await Job.updateMany(
          { _id: { $in: objectIds } },
          { $set: updateData }
        );
        break;

      case "assign":
        if (!data.assignedTo) {
          return NextResponse.json(
            { error: "Assigned user ID is required for assignment action" },
            { status: 400 }
          );
        }

        // Verify the assignee exists and is a subadmin
        const assignee = await User.findById(data.assignedTo);
        if (!assignee || assignee.role !== "subadmin") {
          return NextResponse.json(
            { error: "Invalid assignee" },
            { status: 400 }
          );
        }

        updateData = {
          assignedTo: data.assignedTo,
          updatedAt: new Date(),
        };

        result = await Job.updateMany(
          { _id: { $in: objectIds } },
          { $set: updateData }
        );
        break;

      case "set-visibility":
        if (data.visibility === undefined) {
          return NextResponse.json(
            { error: "Visibility is required for visibility action" },
            { status: 400 }
          );
        }

        updateData = {
          visibility: data.visibility,
          updatedAt: new Date(),
        };

        result = await Job.updateMany(
          { _id: { $in: objectIds } },
          { $set: updateData }
        );
        break;

      case "set-featured":
        if (data.featured === undefined) {
          return NextResponse.json(
            { error: "Featured status is required for featured action" },
            { status: 400 }
          );
        }

        updateData = {
          featured: data.featured,
          updatedAt: new Date(),
        };

        result = await Job.updateMany(
          { _id: { $in: objectIds } },
          { $set: updateData }
        );
        break;

      case "set-template":
        if (data.isTemplate === undefined) {
          return NextResponse.json(
            { error: "Template status is required for template action" },
            { status: 400 }
          );
        }

        updateData = {
          isTemplate: data.isTemplate,
          updatedAt: new Date(),
        };

        result = await Job.updateMany(
          { _id: { $in: objectIds } },
          { $set: updateData }
        );
        break;

      case "archive":
        updateData = {
          status: "archived",
          updatedAt: new Date(),
        };

        result = await Job.updateMany(
          { _id: { $in: objectIds } },
          { $set: updateData }
        );
        break;

      case "delete":
        // Soft delete - archive instead of actual deletion
        updateData = {
          status: "archived",
          updatedAt: new Date(),
        };

        result = await Job.updateMany(
          { _id: { $in: objectIds } },
          { $set: updateData }
        );
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Log activities for each job
    const activityPromises = jobs.map((job) =>
      Activity.create({
        userId: session.user.id,
        action: `bulk_${action.replace("-", "_")}`,
        entityType: "job",
        entityId: job._id,
        details: {
          jobTitle: job.title,
          bulkAction: action,
          updatedFields: updateData,
          reason: data.reason || `Bulk ${action} operation`,
        },
        ipAddress:
          request.headers.get("x-forwarded-for") || request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      })
    );

    await Promise.all(activityPromises);

    // Create notifications for assignment actions
    if (action === "assign" && data.assignedTo && data.notify) {
      const notificationPromises = jobs.map((job) =>
        Notification.create({
          userId: data.assignedTo,
          type: "job_assignment",
          title: "New Job Assignment",
          message: `You have been assigned to job: ${job.title}`,
          read: false,
          link: `/subadmin/jobs/${job._id}`,
          relatedId: job._id,
        })
      );

      await Promise.all(notificationPromises);
    }

    return NextResponse.json({
      success: true,
      count: result.modifiedCount,
      message: `${result.modifiedCount} jobs updated successfully`,
    });
  } catch (error) {
    console.error("Error performing bulk job action:", error);
    return NextResponse.json(
      {
        error: "Failed to perform bulk action",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
