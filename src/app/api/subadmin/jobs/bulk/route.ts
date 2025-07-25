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
      visibility: z.enum(["public", "private"]).optional(),
      featured: z.boolean().optional(),
      isTemplate: z.boolean().optional(),
      reason: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get session to verify authentication and role
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure only SubAdmins can access this endpoint
    if (session.user.role !== "subadmin") {
      return NextResponse.json(
        { error: "Forbidden. Only SubAdmins can access this endpoint." },
        { status: 403 }
      );
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

    // Verify that all jobs exist and are assigned to this SubAdmin
    const jobs = await Job.find({
      _id: { $in: objectIds },
      assignedTo: new mongoose.Types.ObjectId(session.user.id),
    });

    if (jobs.length !== jobIds.length) {
      return NextResponse.json(
        { error: "One or more jobs not found or not assigned to you" },
        { status: 404 }
      );
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
          {
            _id: { $in: objectIds },
            assignedTo: new mongoose.Types.ObjectId(session.user.id),
          },
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
          {
            _id: { $in: objectIds },
            assignedTo: new mongoose.Types.ObjectId(session.user.id),
          },
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
          {
            _id: { $in: objectIds },
            assignedTo: new mongoose.Types.ObjectId(session.user.id),
          },
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
          {
            _id: { $in: objectIds },
            assignedTo: new mongoose.Types.ObjectId(session.user.id),
          },
          { $set: updateData }
        );
        break;

      case "archive":
        updateData = {
          status: "archived",
          updatedAt: new Date(),
        };

        result = await Job.updateMany(
          {
            _id: { $in: objectIds },
            assignedTo: new mongoose.Types.ObjectId(session.user.id),
          },
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
          {
            _id: { $in: objectIds },
            assignedTo: new mongoose.Types.ObjectId(session.user.id),
          },
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
