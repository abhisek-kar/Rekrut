import { NextRequest, NextResponse } from "next/server";

import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import { auth } from "@/auth";
import Job from "@/models/Job";
import Activity from "@/models/Activity";
import { notifyJobStatusChange } from "@/lib/email/notifications";

// PUT: Update job status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Get session to verify authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate the job ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    // Parse status data from request
    const { status, reason } = await request.json();

    // Get current job to compare status
    const currentJob = await Job.findById(params.id);
    if (!currentJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const oldStatus = currentJob.status;

    // Validate status
    const validStatuses = ["draft", "active", "closed", "archived"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Find job and update status
    const job = await Job.findByIdAndUpdate(
      params.id,
      {
        status,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Log the activity
    await Activity.create({
      userId: session.user.id,
      action: "status_update",
      entityType: "job",
      entityId: job._id,
      details: {
        jobTitle: job.title,
        newStatus: status,
        reason: reason || "Status updated by user",
      },
      ipAddress: request.headers.get("x-forwarded-for") || request.ip,
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    // Send notification about status change if status actually changed
    if (oldStatus !== status) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      try {
        await notifyJobStatusChange(
          (job._id as mongoose.Types.ObjectId).toString(),
          oldStatus,
          status,
          session.user.id,
          reason,
          appUrl
        );
      } catch (notificationError) {
        console.error(
          "Failed to send status change notification:",
          notificationError
        );
        // Don't fail the status update if notification fails
      }
    }

    return NextResponse.json(
      { job, message: `Job status updated to ${status}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating job status:", error);
    return NextResponse.json(
      { error: "Failed to update job status" },
      { status: 500 }
    );
  }
}
